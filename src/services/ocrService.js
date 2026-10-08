import { createWorker } from 'tesseract.js';

export async function extractTextFromImage(imageFile) {
  const worker = await createWorker('eng');

  try {
    const result = await worker.recognize(imageFile);

    const text = result.data.text
      .replace(/\s+/g, ' ')
      .trim();

    return text;
  } finally {
    await worker.terminate();
  }
}