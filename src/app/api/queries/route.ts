import { type NextRequest } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { generateTicketId } from '@/lib/ticketId';

export const dynamic = 'force-dynamic';

// GET /api/queries — get query by ticketId or get active queries
export async function GET(request: NextRequest) {
  try {
    const db = await getDb();
    const searchParams = request.nextUrl.searchParams;
    const ticketId = searchParams.get('ticketId');
    const status = searchParams.get('status');

    if (ticketId) {
      const query = await db.collection('queries').findOne({ ticketId });
      if (!query) {
        return Response.json({ error: 'Query not found' }, { status: 404 });
      }
      return Response.json({ query });
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
      return Response.json({ query: activeQueries[randomIndex] });
    }

    // Return all queries
    const queries = await db
      .collection('queries')
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    return Response.json({ queries });
  } catch (error) {
    console.error('GET /api/queries error:', error);
    return Response.json({ error: 'Failed to fetch queries' }, { status: 500 });
  }
}

// POST /api/queries — create a new query
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { question } = body;

    if (!question || !question.trim()) {
      return Response.json({ error: 'Question is required' }, { status: 400 });
    }

    const db = await getDb();
    const ticketId = generateTicketId();

    await db.collection('queries').insertOne({
      ticketId,
      question: question.trim(),
      status: 'active',
      proposedAnswer: null,
      approvals: [],
      requiredApprovals: 3,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return Response.json({ success: true, ticketId }, { status: 201 });
  } catch (error) {
    console.error('POST /api/queries error:', error);
    return Response.json({ error: 'Failed to create query' }, { status: 500 });
  }
}
