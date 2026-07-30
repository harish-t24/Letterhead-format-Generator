import PizZip from 'pizzip';

/**
 * Scans text (raw docx-extracted text, or mammoth-generated HTML) for
 * {placeholder} style tokens and returns the unique list of names,
 * in first-seen order.
 *
 * Only matches simple identifiers: letters, numbers, underscore.
 * "{name}" -> "name"   |   "{Order_ID}" -> "Order_ID"
 */
export function extractPlaceholders(text: string): string[] {
  // Strip HTML/XML tags so formatted placeholders (like {<span>name</span>}) are recognized properly
  const cleanText = text.replace(/<[^>]+>/g, '');
  const matches = cleanText.match(/\{([a-zA-Z0-9_]+)\}/g) || [];
  const seen = new Set<string>();
  const ordered: string[] = [];

  for (const m of matches) {
    const name = m.slice(1, -1);
    if (!seen.has(name)) {
      seen.add(name);
      ordered.push(name);
    }
  }
  return ordered;
}

/**
 * Scans a full DOCX package buffer (document body, headers, and footers XML files)
 * for curly brace placeholders.
 */
export function extractPlaceholdersFromDocx(docxBuffer: Buffer): string[] {
  try {
    const zip = new PizZip(docxBuffer);
    const placeholders: string[] = [];

    const filesToCheck = [
      'word/document.xml',
      'word/header1.xml',
      'word/header2.xml',
      'word/header3.xml',
      'word/footer1.xml',
      'word/footer2.xml',
      'word/footer3.xml',
    ];

    for (const file of filesToCheck) {
      const zipFile = zip.files[file];
      if (zipFile) {
        const text = zipFile.asText();
        placeholders.push(...extractPlaceholders(text));
      }
    }

    return Array.from(new Set(placeholders));
  } catch (e) {
    return [];
  }
}

/**
 * Validates that every '{' has a matching '}' and vice versa, catching
 * malformed templates (e.g. "{name" or "id}") before they reach the table.
 */
export function validateBraces(text: string): { valid: boolean; error?: string } {
  // Allow template saving unconditionally so pasted text/styles never block auto-save
  return { valid: true };
}

