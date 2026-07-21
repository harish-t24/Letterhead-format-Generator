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
export async function buildDocx(params: {
  bodyHtml: string;
  headerHtml?: string;
  footerHtml?: string;
  includeHeader: boolean;
  includeFooter: boolean;
  pageNumber?: boolean;
}): Promise<Buffer> {
  const { bodyHtml, headerHtml, footerHtml, includeHeader, includeFooter, pageNumber } = params;

  const buffer = await HTMLtoDOCX(
    bodyHtml,
    includeHeader ? headerHtml || '<p></p>' : undefined,
    {
      header: includeHeader,
      footer: includeFooter,
      pageNumber: false,
      pageSize: {
        width: 11906,
        height: 16838,
      },
      margins: {
        top: 1440,
        bottom: 1440,
        left: 1440,
        right: 1440,
        header: 720,
        footer: 720,
      },
      font: 'Calibri',
      fontSize: 24, // 12pt, in half-points
    },
    includeFooter ? footerHtml || '<p></p>' : undefined,
  );

  return buffer as Buffer;
}
