import HTMLtoDOCX from 'html-to-docx';

/**
 * Builds a DOCX buffer from body/header/footer HTML.
 *
 * Margins are set so body text can never overlap the header or footer:
 * the top/bottom page margins (1440 twips = 1 inch) are comfortably
 * larger than the header/footer distance from the page edge (720 twips
 * = 0.5 inch), which is standard Word/LibreOffice practice. Because the
 * output is a real flowing DOCX, once a page's content reaches the
 * bottom margin, Word/LibreOffice automatically starts a new page for
 * the rest — this "push to next page" behavior is handled by the
 * document engine itself, not custom code.
 */
function preprocessHtmlTables(html: string | undefined): string {
  if (!html) return '';

  let processed = html;

  // 1. Process <table>: replace or inject table borders and styles
  processed = processed.replace(/<table([^>]*)/gi, (match, contents) => {
    // Clean up existing attributes we want to enforce
    const clean = contents
      .replace(/\s*border=["'][^"']*["']/gi, '')
      .replace(/\s*cellspacing=["'][^"']*["']/gi, '')
      .replace(/\s*cellpadding=["'][^"']*["']/gi, '')
      .replace(/\s*style=["'][^"']*["']/gi, '');
    
    return `<table border="1" cellspacing="0" cellpadding="6" style="border-collapse:collapse; width:100%; border:1px solid #cbd5e1;"${clean}`;
  });

  // 2. Process <td> and <th>: inject cell border styles
  processed = processed.replace(/<td([^>]*)/gi, (match, contents) => {
    const clean = contents.replace(/\s*style=["'][^"']*["']/gi, '');
    return `<td style="border:1px solid #cbd5e1; padding:8px 12px; vertical-align:top;"${clean}`;
  });

  processed = processed.replace(/<th([^>]*)/gi, (match, contents) => {
    const clean = contents.replace(/\s*style=["'][^"']*["']/gi, '');
    return `<th style="border:1px solid #cbd5e1; padding:8px 12px; vertical-align:top; background-color:#f8fafc; font-weight:bold;"${clean}`;
  });

  return processed;
}

export async function buildDocx(params: {
  bodyHtml: string;
  headerHtml?: string;
  footerHtml?: string;
  includeHeader: boolean;
  includeFooter: boolean;
  pageNumber?: boolean;
  marginTop?: number;
  marginBottom?: number;
  marginLeft?: number;
  marginRight?: number;
}): Promise<Buffer> {
  const { bodyHtml, headerHtml, footerHtml, includeHeader, includeFooter, marginTop, marginBottom, marginLeft, marginRight } = params;

  const processedBody = preprocessHtmlTables(bodyHtml);
  const processedHeader = preprocessHtmlTables(headerHtml);
  const processedFooter = preprocessHtmlTables(footerHtml);

  const hasImage = footerHtml && /<img/i.test(footerHtml);
  const enablePageNumber = includeFooter && !hasImage && (!footerHtml || /page/i.test(footerHtml));

  const buffer = await HTMLtoDOCX(
    processedBody,
    includeHeader ? processedHeader || '<p></p>' : undefined,
    {
      header: includeHeader,
      footer: includeFooter,
      pageNumber: enablePageNumber,
      pageSize: {
        width: 11906,
        height: 16838,
      },
      margins: {
        top: marginTop !== undefined ? Math.round(marginTop * 1440) : 1440,
        bottom: marginBottom !== undefined ? Math.round(marginBottom * 1440) : 1440,
        left: marginLeft !== undefined ? Math.round(marginLeft * 1440) : 1440,
        right: marginRight !== undefined ? Math.round(marginRight * 1440) : 1440,
        header: 720,
        footer: 720,
      },
      font: 'Calibri',
      fontSize: 24, // 12pt, in half-points
    },
    includeFooter ? processedFooter || '<p></p>' : undefined,
  );

  return buffer as Buffer;
}
