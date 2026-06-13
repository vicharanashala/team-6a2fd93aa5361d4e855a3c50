import { type NextRequest } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export const dynamic = 'force-dynamic';

// POST /api/queries/solve — submit an answer or approve a solution
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { queryId, action, answer, sessionId } = body;

    if (!queryId) {
      return Response.json({ error: 'Query ID is required' }, { status: 400 });
    }

    const db = await getDb();
    const query = await db.collection('queries').findOne({ _id: new ObjectId(queryId) });

    if (!query) {
      return Response.json({ error: 'Query not found' }, { status: 404 });
    }

    // Action: submit answer
    if (action === 'answer') {
      if (!answer || !answer.trim()) {
        return Response.json({ error: 'Answer is required' }, { status: 400 });
      }

      if (query.status === 'resolved') {
        return Response.json({ error: 'Query is already resolved' }, { status: 400 });
      }

      // Set the proposed answer and change status to in-review
      // The answerer counts as the first approval
      const sId = sessionId || `anon-${Date.now()}`;
      await db.collection('queries').updateOne(
        { _id: new ObjectId(queryId) },
        {
          $set: {
            proposedAnswer: answer.trim(),
            status: 'in-review',
            approvals: [sId],
            updatedAt: new Date(),
          },
        }
      );

      return Response.json({ success: true, message: 'Answer submitted' });
    }

    // Action: approve
    if (action === 'approve') {
      if (query.status !== 'in-review') {
        return Response.json({ error: 'Query is not in review' }, { status: 400 });
      }

      const sId = sessionId || `anon-${Date.now()}`;
      
      // Check if already approved by this session
      if (query.approvals && query.approvals.includes(sId)) {
        return Response.json({ error: 'You have already approved this solution' }, { status: 400 });
      }

      const newApprovals = [...(query.approvals || []), sId];
      const isResolved = newApprovals.length >= (query.requiredApprovals || 3);

      await db.collection('queries').updateOne(
        { _id: new ObjectId(queryId) },
        {
          $set: {
            approvals: newApprovals,
            status: isResolved ? 'resolved' : 'in-review',
            updatedAt: new Date(),
          },
        }
      );

      return Response.json({
        success: true,
        approvals: newApprovals.length,
        resolved: isResolved,
        message: isResolved ? 'Query resolved!' : 'Approval recorded',
      });
    }

    return Response.json({ error: 'Invalid action. Use "answer" or "approve"' }, { status: 400 });
  } catch (error) {
    console.error('POST /api/queries/solve error:', error);
    return Response.json({ error: 'Failed to process solution' }, { status: 500 });
  }
}
