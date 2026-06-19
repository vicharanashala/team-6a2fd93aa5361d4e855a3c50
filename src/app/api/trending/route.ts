import { type NextRequest } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { checkRateLimit, getClientIp, rateLimitResponse, RATE_LIMITS } from '@/lib/rateLimit';

export const dynamic = 'force-dynamic';

// GET /api/trending — fetch top 3 most-discussed queries by community engagement (approvals volume)
export async function GET(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const rl = checkRateLimit(ip, 'trending-get', RATE_LIMITS.api);
    if (!rl.allowed) {
      return rateLimitResponse(rl.retryAfterMs!);
    }

    const db = await getDb();

    // Aggregate queries sorted by approval count (community volume), then by recency
    const trending = await db
      .collection('queries')
      .aggregate([
        {
          $addFields: {
            engagementScore: { $size: { $ifNull: ['$approvals', []] } },
          },
        },
        { $sort: { engagementScore: -1, createdAt: -1 } },
        { $limit: 3 },
      ])
      .toArray();

    return Response.json({ trending });
  } catch (error) {
    console.error('GET /api/trending error:', error);
    return Response.json({ error: 'Failed to fetch trending queries' }, { status: 500 });
  }
}
