import { pipeline, env } from '@xenova/transformers';

// Skip local model caching on Vercel/serverless if needed, but for localhost it's fine.
env.allowLocalModels = false;

// We use the exact same model that the Python backend used
const MODEL_NAME = 'Xenova/all-MiniLM-L6-v2';

class Embedder {
  private static instance: any = null;
  private static initPromise: Promise<any> | null = null;

  static async getInstance() {
    if (this.instance) return this.instance;
    if (this.initPromise) return this.initPromise;

    this.initPromise = pipeline('feature-extraction', MODEL_NAME)
      .then((pipe) => {
        this.instance = pipe;
        return pipe;
      })
      .catch((err) => {
        console.error('Failed to load embedding model:', err);
        throw err;
      });

    return this.initPromise;
  }

  static async embed(text: string): Promise<number[]> {
    const extractor = await this.getInstance();
    // Generate embeddings and normalize (L2) just like the Python backend
    const output = await extractor(text, { pooling: 'mean', normalize: true });
    return Array.from(output.data);
  }
}

export default Embedder;
