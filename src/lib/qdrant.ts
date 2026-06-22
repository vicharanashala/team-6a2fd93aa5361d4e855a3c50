import { QdrantClient } from '@qdrant/js-client-rest';
import Embedder from './embeddings';
import { randomUUID } from 'crypto';

const url = process.env.QDRANT_URL;
const apiKey = process.env.QDRANT_API_KEY;
const collectionName = process.env.QDRANT_COLLECTION_NAME || 'faq_vectors';

if (!url || !apiKey) {
  console.error("Qdrant credentials are missing in environment variables!");
}

const client = new QdrantClient({ url, apiKey });

// Helper to perform semantic search
export async function searchFaqs(question: string, topK: number = 5) {
  if (!question.trim()) return [];

  // Generate embedding for the question
  const vector = await Embedder.embed(question);

  // Search in Qdrant
  const searchResults = await client.search(collectionName, {
    vector,
    limit: topK,
    with_payload: true,
  });

  // Filter out low scores (threshold 0.40 just like Python backend)
  const MIN_RELEVANCE_SCORE = 0.40;
  const relevant = searchResults.filter((r) => r.score >= MIN_RELEVANCE_SCORE);

  // Map to FAQ format
  return relevant.map((r, idx) => {
    const payload: any = r.payload || {};
    return {
      _id: `qdrant-${r.id}-${idx}`,
      question: payload.question,
      answer: payload.answer,
      category: payload.category,
      score: r.score,
      tags: payload.tags,
    };
  });
}

/**
 * Add a FAQ to Qdrant vector database.
 * Generates embedding from question+answer text and upserts to collection.
 */
export async function addFaqToQdrant(
  qdrantId: string,
  question: string,
  answer: string,
  category?: string,
  subcategory?: string
) {
  const textToEmbed = `${question} ${answer}`;
  const vector = await Embedder.embed(textToEmbed);

  await client.upsert(collectionName, {
    wait: true,
    points: [
      {
        id: qdrantId,
        vector,
        payload: {
          question,
          answer,
          category: category || '',
          subcategory: subcategory || '',
          tags: [],
          createdAt: new Date().toISOString(),
        },
      },
    ],
  });
}

/**
 * Delete a FAQ from Qdrant vector database by its qdrantId.
 */
export async function deleteFaqFromQdrant(qdrantId: string) {
  await client.delete(collectionName, {
    wait: true,
    points: [qdrantId],
  });
}

/**
 * Generate a UUID for use as Qdrant point IDs
 */
export function generateQdrantId(): string {
  return randomUUID();
}

/**
 * Update a FAQ in Qdrant: deletes the old point and upserts a new one with fresh embeddings.
 * Returns the new qdrantId.
 */
export async function updateFaqInQdrant(
  oldQdrantId: string,
  question: string,
  answer: string,
  category?: string,
  subcategory?: string
): Promise<string> {
  // Delete the old point
  try {
    await client.delete(collectionName, {
      wait: true,
      points: [oldQdrantId],
    });
  } catch (error) {
    console.error('Failed to delete old Qdrant point during update:', error);
    // Continue with upsert even if delete fails
  }

  // Generate new embedding and upsert
  const newQdrantId = randomUUID();
  const textToEmbed = `${question} ${answer}`;
  const vector = await Embedder.embed(textToEmbed);

  await client.upsert(collectionName, {
    wait: true,
    points: [
      {
        id: newQdrantId,
        vector,
        payload: {
          question,
          answer,
          category: category || '',
          subcategory: subcategory || '',
          tags: [],
          updatedAt: new Date().toISOString(),
        },
      },
    ],
  });

  return newQdrantId;
}

/**
 * Retrieve all FAQ points from the Qdrant collection using scroll.
 */
export async function getAllFaqsFromQdrant() {
  const allPoints: any[] = [];
  let nextOffset: string | number | Record<string, unknown> | undefined = undefined;

  // Scroll through all points in batches
  do {
    const response = await client.scroll(collectionName, {
      limit: 100,
      offset: nextOffset as string | number | undefined,
      with_payload: true,
      with_vector: false,
    });

    if (response.points) {
      allPoints.push(...response.points);
    }

    nextOffset = response.next_page_offset ?? undefined;
  } while (nextOffset !== undefined);

  return allPoints.map((point) => ({
    qdrantId: point.id,
    question: point.payload?.question || '',
    answer: point.payload?.answer || '',
    category: point.payload?.category || '',
    subcategory: point.payload?.subcategory || '',
    tags: point.payload?.tags || [],
    createdAt: point.payload?.createdAt || '',
    updatedAt: point.payload?.updatedAt || '',
  }));
}

export default client;
