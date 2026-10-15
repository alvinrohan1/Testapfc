import * as mammoth from 'mammoth';

export interface ExtractionResult {
  text: string;
  wordCount: number;
  charCount: number;
  pageCount?: number;
  error?: string;
  isScannedPdf?: boolean;
}

/**
 * Extracts plain text from TXT, DOCX, or PDF File objects or raw strings.
 */
export async function extractTextFromFile(file: File): Promise<ExtractionResult> {
  const extension = file.name.split('.').pop()?.toLowerCase();

  try {
    if (extension === 'txt') {
      const text = await file.text();
      return analyzeExtractedText(text);
    }

    if (extension === 'docx') {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      const text = result.value || '';
      if (!text.trim()) {
        return {
          text: '',
          wordCount: 0,
          charCount: 0,
          error: 'DOCX document appears to be empty or contains only non-text media.'
        };
      }
      return analyzeExtractedText(text);
    }

    if (extension === 'pdf') {
      return await extractTextFromPdf(file);
    }

    // Default fallback to text reading
    const text = await file.text();
    return analyzeExtractedText(text);
  } catch (err: any) {
    console.error('File extraction error:', err);
    return {
      text: '',
      wordCount: 0,
      charCount: 0,
      error: `Failed to read ${file.name}: ${err?.message || 'Unsupported or corrupted format'}`
    };
  }
}

/**
 * PDF text extraction using pdfjs-dist with fallback for scanned documents
 */
async function extractTextFromPdf(file: File): Promise<ExtractionResult> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    // Dynamically load pdfjs to ensure clean client bundle execution
    const pdfjs = await import('pdfjs-dist');
    
    // Set standard worker source if available
    if (pdfjs.GlobalWorkerOptions && !pdfjs.GlobalWorkerOptions.workerSrc) {
      pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version || '4.0.379'}/pdf.worker.min.mjs`;
    }

    const loadingTask = pdfjs.getDocument({ data: new Uint8Array(arrayBuffer) });
    const pdfDoc = await loadingTask.promise;
    const numPages = pdfDoc.numPages;

    let fullText = '';
    for (let i = 1; i <= numPages; i++) {
      const page = await pdfDoc.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => ('str' in item ? item.str : ''))
        .join(' ');
      fullText += `\n--- Page ${i} ---\n` + pageText;
    }

    const trimmed = fullText.trim();
    const words = trimmed ? trimmed.split(/\s+/).filter(Boolean).length : 0;

    // Check if scanned PDF without readable OCR text
    if (words < 30 && numPages >= 1) {
      return {
        text: trimmed,
        wordCount: words,
        charCount: trimmed.length,
        pageCount: numPages,
        isScannedPdf: true,
        error: `Scanned PDF detected (${numPages} page(s) found but only ${words} readable words). This PDF requires OCR text processing. Please upload a searchable PDF, DOCX, or paste the study notes directly.`
      };
    }

    return {
      text: fullText,
      wordCount: words,
      charCount: fullText.length,
      pageCount: numPages
    };
  } catch (err: any) {
    console.warn('PDF.js parsing failed, attempting raw stream fallback:', err);
    // Lightweight regex fallback for uncompressed raw PDF streams
    try {
      const arrayBuffer = await file.arrayBuffer();
      const decoder = new TextDecoder('latin1');
      const raw = decoder.decode(arrayBuffer);
      const matches = raw.match(/\(([^()]{3,})\)Tj/g) || [];
      const extracted = matches
        .map(m => m.replace(/^\(|\)Tj$/g, ''))
        .join(' ');

      if (extracted.length > 200) {
        return analyzeExtractedText(extracted);
      }
    } catch {
      // ignore secondary fallback failure
    }

    return {
      text: '',
      wordCount: 0,
      charCount: 0,
      error: `Could not parse PDF text: ${err?.message || 'Encrypted or unsupported PDF format'}. Please try converting to DOCX or pasting the text.`
    };
  }
}

/**
 * Analyzes string text, counting words and characters accurately
 */
export function analyzeExtractedText(text: string): ExtractionResult {
  const clean = text.trim();
  const words = clean ? clean.split(/\s+/).filter(Boolean).length : 0;
  return {
    text: clean,
    wordCount: words,
    charCount: clean.length
  };
}
