import { type NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { sanitizeInput } from '@/lib/security';
import { updateFaqInQdrant } from '@/lib/qdrant';

export const dynamic = 'force-dynamic';

// Helper to check super admin authentication
async function isSuperAdmin(): Promise<boolean> {
  const cookieStore = await cookies();
  const adminToken = cookieStore.get('admin_token');
  const adminRole = cookieStore.get('admin_role');
  return !!(
    adminToken?.value === 'authenticated' &&
    adminRole?.value === 'super_admin'
  );
}

// GET /api/admin/vector-faqs — fetch all FAQs that are synced with the vector DB
export async function GET() {
  try {
    if (!(await isSuperAdmin())) {
      return Response.json({ error: 'Unauthorized — super admin access required' }, { status: 403 });
    }

    const db = await getDb();

    // Fetch all FAQs that have a qdrantId (i.e., are embedded in the vector DB)
    const faqs = await db
      .collection('faqs')
      .find({ qdrantId: { $exists: true, $nin: [null, ''] } })
      .sort({ updatedAt: -1, createdAt: -1 })
      .toArray();

    return Response.json({
      faqs: faqs.map((faq) => ({
        _id: faq._id.toString(),
        question: faq.question || '',
        answer: faq.answer || '',
        category: faq.category || '',
        subcategory: faq.subcategory || '',
        qdrantId: faq.qdrantId,
        createdAt: faq.createdAt,
        updatedAt: faq.updatedAt,
      })),
    });
  } catch (error) {
    console.error('GET /api/admin/vector-faqs error:', error);
    return Response.json({ error: 'Failed to fetch vector FAQs' }, { status: 500 });
  }
}

// PUT /api/admin/vector-faqs — update a FAQ and re-embed it in Qdrant
export async function PUT(request: NextRequest) {
  try {
    if (!(await isSuperAdmin())) {
      return Response.json({ error: 'Unauthorized — super admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { id, question, answer, category, subcategory } = body;

    // Validate required fields
    if (!id || !/^[a-f0-9]{24}$/.test(id)) {
      return Response.json({ error: 'Valid FAQ ID is required' }, { status: 400 });
    }

    const sanitizedQuestion = sanitizeInput(question || '');
    const sanitizedAnswer = sanitizeInput(answer || '');

    if (!sanitizedQuestion.trim() || !sanitizedAnswer.trim()) {
      return Response.json({ error: 'Question and answer are required' }, { status: 400 });
    }

    const sanitizedCategory = sanitizeInput(category || '');
    const sanitizedSubcategory = sanitizeInput(subcategory || '');

    const db = await getDb();

    // Find the existing FAQ
    const existingFaq = await db.collection('faqs').findOne({ _id: new ObjectId(id) });
    if (!existingFaq) {
      return Response.json({ error: 'FAQ not found' }, { status: 404 });
    }

    if (!existingFaq.qdrantId) {
      return Response.json({ error: 'This FAQ has no vector embedding to update' }, { status: 400 });
    }

    // Update the vector in Qdrant (delete old, create new with fresh embedding)
    let newQdrantId: string;
    try {
      newQdrantId = await updateFaqInQdrant(
        existingFaq.qdrantId,
        sanitizedQuestion.trim(),
        sanitizedAnswer.trim(),
        sanitizedCategory.trim(),
        sanitizedSubcategory.trim()
      );
    } catch (error) {
      console.error('Failed to update FAQ in Qdrant:', error);
      return Response.json({ error: 'Failed to update vector embeddings in Qdrant' }, { status: 500 });
    }

    // Update the FAQ document in MongoDB with the new qdrantId
    await db.collection('faqs').updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          question: sanitizedQuestion.trim(),
          answer: sanitizedAnswer.trim(),
          category: sanitizedCategory.trim(),
          subcategory: sanitizedSubcategory.trim(),
          qdrantId: newQdrantId,
          updatedAt: new Date(),
        },
      }
    );

    return Response.json({
      success: true,
      message: 'FAQ updated and re-embedded successfully',
      newQdrantId,
    });
  } catch (error) {
    console.error('PUT /api/admin/vector-faqs error:', error);
    return Response.json({ error: 'Failed to update FAQ' }, { status: 500 });
  }
}
