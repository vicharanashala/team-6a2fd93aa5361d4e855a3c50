import { type NextRequest } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { generateTicketId } from '@/lib/ticketId';
import { sanitizeInput } from '@/lib/security';
import { checkRateLimit, getClientIp, rateLimitResponse, RATE_LIMITS } from '@/lib/rateLimit';
import { verifySession } from '@/lib/session';
import { ObjectId } from 'mongodb';
import { categorizeQuery, formatQueryPayload } from '@/lib/categorizer';
import type { QueryCategory } from '@/lib/categorizer';

export const dynamic = 'force-dynamic';

// GET /api/queries — get query by ticketId, by userId, or get active queries
export async function GET(request: NextRequest) {
  try {
    // Rate limit
    const ip = getClientIp(request);
    const rl = checkRateLimit(ip, 'queries-get', RATE_LIMITS.api);
    if (!rl.allowed) {
      return rateLimitResponse(rl.retryAfterMs!);
    }

    const db = await getDb();
    const searchParams = request.nextUrl.searchParams;
    const ticketId = searchParams.get('ticketId');
    const status = searchParams.get('status');
    const userId = searchParams.get('userId');
    const category = searchParams.get('category') as QueryCategory | null;

    if (ticketId) {
      const sanitizedTicketId = sanitizeInput(ticketId);
      const doc = await db.collection('queries').findOne({ ticketId: sanitizedTicketId });
      if (!doc) {
        return Response.json({ error: 'Query not found' }, { status: 404 });
      }
      return Response.json({ query: formatQueryPayload(doc) });
    }

    // Fetch queries by userId (user's own queries)
    if (userId) {
      try {
        const docs = await db
          .collection('queries')
          .find({ userId: new ObjectId(userId) })
          .sort({ createdAt: -1 })
          .toArray();
        return Response.json({ queries: docs.map(formatQueryPayload) });
      } catch {
        return Response.json({ queries: [] });
      }
    }

    if (status === 'active') {
      // Get one random active query for solving
      const activeQueries = await db
        .collection('queries')
        .find({ status: { $in: ['active', 'in-review'] } })
        .toArray();

      if (activeQueries.length === 0) {
        return Response.json({ query: null });
      }

      const randomIndex = Math.floor(Math.random() * activeQueries.length);
      return Response.json({ query: formatQueryPayload(activeQueries[randomIndex]) });
    }

    // Build filter — optionally filter by category
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter: Record<string, any> = {};
    if (category) {
      filter.category = category;
    }

    // Return all queries (chronological, newest first)
    const docs = await db
      .collection('queries')
      .find(filter)
      .sort({ createdAt: -1 })
      .toArray();

    return Response.json({ queries: docs.map(formatQueryPayload) });
  } catch (error) {
    console.error('GET /api/queries error:', error);
    return Response.json({ error: 'Failed to fetch queries' }, { status: 500 });
  }
}

// POST /api/queries — create a new query (requires auth)
export async function POST(request: NextRequest) {
  try {
    // Rate limit
    const ip = getClientIp(request);
    const rl = checkRateLimit(ip, 'queries-post', RATE_LIMITS.api);
    if (!rl.allowed) {
      return rateLimitResponse(rl.retryAfterMs!);
    }

    // Require user auth
    const user = await verifySession();
    if (!user) {
      return Response.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();

    // Support both new (title + description) and legacy (question) formats
    const title = sanitizeInput(body.title || body.question || '');
    const description = sanitizeInput(body.description || body.question || '');

    if (!title) {
      return Response.json({ error: 'Query title is required' }, { status: 400 });
    }
    if (!description) {
      return Response.json({ error: 'Query description is required' }, { status: 400 });
    }

    // Auto-categorize using full text of title + description
    const rawCategory = sanitizeInput(body.category || '');
    const category: QueryCategory = rawCategory
      ? (rawCategory as QueryCategory)
      : categorizeQuery(`${title} ${description}`);

    const db = await getDb();
    const ticketId = generateTicketId();

    // Timestamp is committed at exact moment of DB write
    const now = new Date();

    await db.collection('queries').insertOne({
      ticketId,
      title,
      description,
      // Legacy field — kept for backwards compatibility with solve-query page
      question: title,
      category,
      status: 'active',
      proposedAnswer: null,
      approvals: [],
      requiredApprovals: 3,
      userId: new ObjectId(user.userId),
      username: user.username,
      createdAt: now,
      updatedAt: now,
    });

    return Response.json({ success: true, ticketId }, { status: 201 });
  } catch (error) {
    console.error('POST /api/queries error:', error);
    return Response.json({ error: 'Failed to create query' }, { status: 500 });
  }
}
