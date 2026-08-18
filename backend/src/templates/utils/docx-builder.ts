import HTMLtoDOCX from 'html-to-docx';

/**
 * Preprocesses HTML tables to ensure clean border rendering.
 */
function preprocessHtmlTables(html: string | undefined): string {
  if (!html) return '';

  let processed = html;

  // Preserve custom table styles if present, inject default table border fallback only if no style exists
  processed = processed.replace(/<table([^>]*)/gi, (match, contents) => {
    if (/style=/i.test(contents)) {
      return match;
    }
    return `<table border="1" cellspacing="0" cellpadding="6" style="border-collapse:collapse; width:100%; border:1px solid #cbd5e1;"${contents}`;
  });

  return processed;
}

/**
 * Preprocesses HTML image tags (seals, stamps, signatures, logos) so html-to-docx
 * converts them into valid OpenXML drawing objects in the generated DOCX.
 */
function preprocessHtmlImages(html: string | undefined, isHeaderFooter: boolean = false): string {
  if (!html) return '';

  let processed = html;

  // 1. Unwrap TipTap span.image-node-wrap while preserving text-align & alignment attributes
  processed = processed.replace(
    /<span\b([^>]*class="[^"]*image-node-wrap[^"]*"[^>]*)>(<img\b[^>]+>)<\/span>/gi,
    (_full, spanAttrs, imgTag) => {
      const alignMatch = spanAttrs.match(/data-alignment=["']([^"']+)["']/i) || spanAttrs.match(/text-align:\s*(left|center|right)/i);
      const align = alignMatch ? alignMatch[1] : 'center';

      const wrapMatch = spanAttrs.match(/data-text-wrap=["']([^"']+)["']/i);
      const wrap = wrapMatch ? wrapMatch[1] : 'inline';

      if (wrap === 'left' || wrap === 'right' || wrap === 'tight') {
        return `<p style="text-align:${wrap === 'right' ? 'right' : 'left'}; margin:6px 0; clear:both;">${imgTag}</p>`;
      }
      return `<p style="text-align:${align}; margin:6px 0; clear:both;">${imgTag}</p>`;
    }
  );

  // 2. Format img tags cleanly for html-to-docx
  processed = processed.replace(/<img\b([^>]*)\/?>/gi, (full, attrs) => {
    const srcMatch = attrs.match(/src=["']([^"']+)["']/i);
    if (!srcMatch) return full;
    const src = srcMatch[1];

    const isFullWidth = /width:\s*100%/i.test(attrs) || /width=["']100%["']/i.test(attrs);

    if (isHeaderFooter && isFullWidth) {
      return `<img src="${src}" width="650" style="width:100%; display:block; margin:0 auto;" />`;
    }

    let width = '';
    const styleWidth = attrs.match(/width:\s*([\d]+)px/i);
    const attrWidth = attrs.match(/width=["']([\d]+)["']/i);
    if (styleWidth) width = styleWidth[1];
    else if (attrWidth) width = attrWidth[1];

    let height = '';
    const styleHeight = attrs.match(/height:\s*([\d]+)px/i);
    const attrHeight = attrs.match(/height=["']([\d]+)["']/i);
    if (styleHeight) height = styleHeight[1];
    else if (attrHeight) height = attrHeight[1];

    const alignMatch = attrs.match(/align=["']([^"']+)["']/i);
    const imgAlign = alignMatch ? alignMatch[1] : undefined;

    const sizeAttrs = width ? `width="${width}" ${height ? `height="${height}"` : ''}` : 'width="160"';
    const alignAttr = imgAlign ? `align="${imgAlign}"` : '';

    return `<img src="${src}" ${sizeAttrs} ${alignAttr} style="display:inline-block; vertical-align:middle; background:transparent;" />`;
  });

  return processed;
}

/**
 * Converts TipTap page breaks into standard html-to-docx page break tags
 * so Word & Gotenberg render content after page breaks on the next page.
 */
function preprocessHtmlPageBreaks(html: string | undefined): string {
  if (!html) return '';

  let processed = html;

  processed = processed.replace(/<div[^>]*class="[^"]*page-break[^"]*"[^>]*>.*?<\/div>/gi, '<div style="page-break-after: always; break-after: page;"><!-- pagebreak --></div>');
  processed = processed.replace(/<hr[^>]*class="[^"]*page-break[^"]*"[^>]*\/?>/gi, '<div style="page-break-after: always; break-after: page;"><!-- pagebreak --></div>');

  return processed;
}

function sanitizeHtmlForDocx(html?: string, isHeaderFooter: boolean = false): string {
  if (!html) return '';
  return preprocessHtmlPageBreaks(preprocessHtmlImages(preprocessHtmlTables(html), isHeaderFooter));
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

  const processedBody = sanitizeHtmlForDocx(bodyHtml, false);
  const processedHeader = sanitizeHtmlForDocx(headerHtml, true);
  const processedFooter = sanitizeHtmlForDocx(footerHtml, true);

  const hasImage = footerHtml && /<img/i.test(footerHtml);
  const enablePageNumber = includeFooter && !hasImage && (!footerHtml || /page/i.test(footerHtml));

  const DEFAULT_TOP = 5.4 / 2.54;
  const DEFAULT_BOTTOM = 0.63 / 2.54;
  const DEFAULT_LEFT = 2.16 / 2.54;
  const DEFAULT_RIGHT = 1.27 / 2.54;

  const leftMargin = marginLeft !== undefined ? marginLeft : DEFAULT_LEFT;
  const rightMargin = marginRight !== undefined ? marginRight : DEFAULT_RIGHT;
  const baseTopMargin = marginTop !== undefined ? marginTop : DEFAULT_TOP;
  const baseBottomMargin = marginBottom !== undefined ? marginBottom : DEFAULT_BOTTOM;

  const extraBottomGapInches = 2 / 2.54; // 2cm in inches
  const topMargin = includeHeader && processedHeader ? Math.max(baseTopMargin, (240 + 12) / 96) : baseTopMargin;
  const bottomMargin = (includeFooter && processedFooter ? Math.max(baseBottomMargin, (215 + 12) / 96) : baseBottomMargin) + extraBottomGapInches;

  const buffer = await HTMLtoDOCX(
    processedBody,
    includeHeader ? processedHeader || '<p></p>' : undefined,
    {
      header: includeHeader,
      footer: includeFooter,
      pageNumber: enablePageNumber,
      pageSize: {
        width: 11906, // A4 Width in twips (210mm)
        height: 16838, // A4 Height in twips (297mm)
      },
      margins: {
        top: Math.round(topMargin * 1440),
        bottom: Math.round(bottomMargin * 1440),
        left: Math.round(leftMargin * 1440),
        right: Math.round(rightMargin * 1440),
        header: 0,
        footer: 0,
      },
      font: 'Calibri',
      fontSize: 24, // 12pt, in half-points
    },
    includeFooter ? processedFooter || '<p></p>' : undefined,
  );

  return buffer as Buffer;
}
