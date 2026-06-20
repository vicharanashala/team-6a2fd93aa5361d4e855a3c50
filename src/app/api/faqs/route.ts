import { type NextRequest } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { cookies } from 'next/headers';
import { sanitizeInput, escapeRegex } from '@/lib/security';
import { checkRateLimit, getClientIp, rateLimitResponse, RATE_LIMITS } from '@/lib/rateLimit';
import { categorizeQuery, formatFaqPayload } from '@/lib/categorizer';
import type { QueryCategory } from '@/lib/categorizer';

export const dynamic = 'force-dynamic';

// GET /api/faqs — list all FAQs or search; optionally filter by category
export async function GET(request: NextRequest) {
  try {
    // Rate limit
    const ip = getClientIp(request);
    const rl = checkRateLimit(ip, 'faqs-get', RATE_LIMITS.search);
    if (!rl.allowed) {
      return rateLimitResponse(rl.retryAfterMs!);
    }

    const db = await getDb();
    const searchParams = request.nextUrl.searchParams;
    const q = searchParams.get('q');
    const category = searchParams.get('category') as QueryCategory | null;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let filter: Record<string, any> = {};

    if (q && q.trim()) {
      // Sanitize and escape the search query to prevent regex injection
      const sanitized = sanitizeInput(q);
      const escaped = escapeRegex(sanitized);
      const regex = new RegExp(escaped, 'i');
      filter = {
        $or: [
          { question: { $regex: regex } },
          { answer: { $regex: regex } },
        ],
      };
    }

    if (category) {
      filter.category = category;
    }

    const faqs = await db
      .collection('faqs')
      .find(filter)
      .sort({ updatedAt: -1 })
      .toArray();

    return Response.json({ faqs: faqs.map(formatFaqPayload) });
  } catch (error) {
    console.error('GET /api/faqs error:', error);
    return Response.json({ error: 'Failed to fetch FAQs' }, { status: 500 });
  }
}

// POST /api/faqs — admin only: add a new FAQ
export async function POST(request: NextRequest) {
  try {
    // Rate limit
    const ip = getClientIp(request);
    const rl = checkRateLimit(ip, 'faqs-post', RATE_LIMITS.api);
    if (!rl.allowed) {
      return rateLimitResponse(rl.retryAfterMs!);
    }

    // Check admin auth
    const cookieStore = await cookies();
    const adminToken = cookieStore.get('admin_token');
    if (!adminToken || adminToken.value !== 'authenticated') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const question = sanitizeInput(body.question || '');
    const answer = sanitizeInput(body.answer || '');
    const rawCategory = sanitizeInput(body.category || '');

    if (!question || !answer) {
      return Response.json({ error: 'Question and answer are required' }, { status: 400 });
    }

    // Auto-categorize if not explicitly provided
    const category: QueryCategory = rawCategory
      ? (rawCategory as QueryCategory)
      : categorizeQuery(`${question} ${answer}`);

    const now = new Date();
    const db = await getDb();
    const result = await db.collection('faqs').insertOne({
      question,
      answer,
      category,
      createdAt: now,
      updatedAt: now,
    });

    return Response.json({
      success: true,
      id: result.insertedId.toString()
    }, { status: 201 });
  } catch (error) {
    console.error('POST /api/faqs error:', error);
    return Response.json({ error: 'Failed to add FAQ' }, { status: 500 });
  }
}

// DELETE /api/faqs — admin only: delete a FAQ
export async function DELETE(request: NextRequest) {
  try {
    // Rate limit
    const ip = getClientIp(request);
    const rl = checkRateLimit(ip, 'faqs-delete', RATE_LIMITS.api);
    if (!rl.allowed) {
      return rateLimitResponse(rl.retryAfterMs!);
    }

    // Check admin auth
    const cookieStore = await cookies();
    const adminToken = cookieStore.get('admin_token');
    if (!adminToken || adminToken.value !== 'authenticated') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id } = body;

    if (!id || !/^[a-f0-9]{24}$/.test(id)) {
      return Response.json({ error: 'Valid FAQ ID is required' }, { status: 400 });
    }

    const db = await getDb();
    const result = await db.collection('faqs').deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return Response.json({ error: 'FAQ not found' }, { status: 404 });
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/faqs error:', error);
    return Response.json({ error: 'Failed to delete FAQ' }, { status: 500 });
  }
}
