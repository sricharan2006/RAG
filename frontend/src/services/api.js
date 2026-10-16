/**
 * PaperMind AI - API Service
 * - GET /              (root health check)
 * - GET /papers        (list uploaded papers)
 * - POST /upload       (upload and process PDF)
 * - DELETE /papers/:id (delete paper and its embeddings)
 * - POST /ask          (question answering with RAG)
 * - POST /summarize    (paper summary)
 * - POST /compare      (two-paper comparison)
 */

// Use empty string so relative paths work with Vite dev proxy (avoiding CORS),
// or use VITE_API_URL if explicitly provided in environment.
const BASE_URL = import.meta.env.VITE_API_URL || '';

export const api = {
  /**
   * Check if backend API is running
   */
  async checkHealth() {
    try {
      const res = await fetch(`${BASE_URL}/root-health`);
      if (!res.ok) throw new Error(`Health check failed: ${res.status}`);
      return await res.json();
    } catch {
      // Fallback check on root /
      const fallback = await fetch(`${BASE_URL}/`);
      if (!fallback.ok) throw new Error(`Health check failed: ${fallback.status}`);
      return await fallback.json();
    }
  },

  /**
   * Fetch all uploaded research papers
   * Response: { papers: string[] }
   */
  async getPapers() {
    const res = await fetch(`${BASE_URL}/papers`);
    if (!res.ok) {
      throw new Error(`Failed to fetch papers: ${res.statusText}`);
    }
    return await res.json();
  },

  /**
   * Upload research paper PDF(s)
   * Endpoint: POST /upload
   * Payload: multipart/form-data with files
   */
  async uploadPaper(files) {
    const fileList = Array.isArray(files)
      ? files
      : (files instanceof FileList ? Array.from(files) : [files]);

    if (!fileList || fileList.length === 0) {
      return { error: 'No files provided for upload.' };
    }

    const formData = new FormData();
    for (const file of fileList) {
      formData.append('files', file);
    }

    const res = await fetch(`${BASE_URL}/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      throw new Error(`Upload failed with status ${res.status}`);
    }

    return await res.json();
  },

  /**
   * Delete an uploaded paper
   * Endpoint: DELETE /papers/{filename}
   */
  async deletePaper(filename) {
    const res = await fetch(`${BASE_URL}/papers/${encodeURIComponent(filename)}`, {
      method: 'DELETE',
    });

    if (!res.ok) {
      throw new Error(`Delete failed with status ${res.status}`);
    }

    return await res.json();
  },

  /**
   * Ask question to RAG
   * Endpoint: POST /ask
   * Body: { question: string, source: string | null }
   */
  async askQuestion(question, source = null) {
    const payload = {
      question,
      source: source || null,
    };

    const res = await fetch(`${BASE_URL}/ask`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      throw new Error(`Query failed with status ${res.status}`);
    }

    return await res.json();
  },

  /**
   * Summarize a paper
   * Endpoint: POST /summarize
   * Body: { source: string }
   */
  async summarizePaper(source) {
    const payload = { source };

    const res = await fetch(`${BASE_URL}/summarize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      throw new Error(`Summary failed with status ${res.status}`);
    }

    return await res.json();
  },

  /**
   * Compare two papers
   * Endpoint: POST /compare
   * Body: { source_a: string, source_b: string, comparison_focus: string }
   */
  async comparePapers(sourceA, sourceB, comparisonFocus) {
    const payload = {
      source_a: sourceA,
      source_b: sourceB,
      comparison_focus: comparisonFocus,
    };

    const res = await fetch(`${BASE_URL}/compare`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      throw new Error(`Comparison failed with status ${res.status}`);
    }

    return await res.json();
  },
};
