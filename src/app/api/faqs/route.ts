import { type NextRequest } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

// GET /api/faqs — list all FAQs or search
export async function GET(request: NextRequest) {
  try {
    const db = await getDb();
    const searchParams = request.nextUrl.searchParams;
    const q = searchParams.get('q');

    let faqs;
    if (q && q.trim()) {
      // Text search — using regex for simplicity (ChromaDB integration can be added later)
      const regex = new RegExp(q.trim(), 'i');
      faqs = await db
        .collection('faqs')
        .find({
          $or: [
            { question: { $regex: regex } },
            { answer: { $regex: regex } },
          ],
        })
        .sort({ createdAt: -1 })
        .toArray();
    } else {
      faqs = await db
        .collection('faqs')
        .find({})
        .sort({ createdAt: -1 })
        .toArray();
    }

    return Response.json({ faqs });
  } catch (error) {
    console.error('GET /api/faqs error:', error);
    return Response.json({ error: 'Failed to fetch FAQs' }, { status: 500 });
  }
}

// POST /api/faqs — admin only: add a new FAQ
export async function POST(request: NextRequest) {
  try {
    // Check admin auth
    const cookieStore = await cookies();
    const adminToken = cookieStore.get('admin_token');
    if (!adminToken || adminToken.value !== 'authenticated') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { question, answer, category } = body;

    if (!question || !answer) {
      return Response.json({ error: 'Question and answer are required' }, { status: 400 });
    }

    const db = await getDb();
    const result = await db.collection('faqs').insertOne({
      question,
      answer,
      category: category || '',
      createdAt: new Date(),
      updatedAt: new Date(),
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
    // Check admin auth
    const cookieStore = await cookies();
    const adminToken = cookieStore.get('admin_token');
    if (!adminToken || adminToken.value !== 'authenticated') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id } = body;

    if (!id) {
      return Response.json({ error: 'FAQ ID is required' }, { status: 400 });
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
