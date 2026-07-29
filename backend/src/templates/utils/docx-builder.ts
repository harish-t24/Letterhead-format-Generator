import HTMLtoDOCX from 'html-to-docx';
import PizZip from 'pizzip';

/**
 * Builds a DOCX buffer from body/header/footer HTML.
 *
 * Margins are set so body text can never overlap the header or footer:
 * the top/bottom page margins (1440 twips = 1 inch) are comfortably
 * larger than the header/footer distance from the page edge (0 twips
 * = 0 inch), which is standard Word/LibreOffice practice.
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

function makeHeaderFooterXmlMarginless(
  docxBuffer: Buffer,
  marginTopInches: number,
  marginBottomInches: number,
  marginLeftInches: number,
  marginRightInches: number,
): Buffer {
  try {
    const zip = new PizZip(docxBuffer);
    const marginTopDxa = Math.round(marginTopInches * 1440);
    const marginBottomDxa = Math.round(marginBottomInches * 1440);
    const marginLeftDxa = Math.round(marginLeftInches * 1440);
    const marginRightDxa = Math.round(marginRightInches * 1440);
    const fullWidthEmu = 7560310; // A4 full width 210mm in EMUs

    // 1. Process document.xml to apply margins exclusively to content
    if (zip.files['word/document.xml']) {
      let xml = zip.files['word/document.xml'].asText();

      // Ensure section page margins are zero for marginless header and footer
      xml = xml.replace(/<w:pgMar[^>]*\/>/g, '<w:pgMar w:top="0" w:bottom="0" w:left="0" w:right="0" w:header="0" w:footer="0"/>');

      const indXml = `<w:ind w:left="${marginLeftDxa}" w:right="${marginRightDxa}"/>`;
      
      let isFirstPara = true;
      xml = xml.replace(/<w:p>(.*?)<\/w:p>/gs, (match, pInner) => {
        let pPr = '';
        let pContent = pInner;
        if (pInner.includes('<w:pPr>')) {
          const pPrMatch = pInner.match(/<w:pPr>(.*?)<\/w:pPr>/s);
          if (pPrMatch) {
            pPr = pPrMatch[1];
            pContent = pInner.replace(/<w:pPr>.*?<\/w:pPr>/s, '');
          }
        }

        let extraPr = indXml;
        if (isFirstPara) {
          extraPr += `<w:spacing w:before="${marginTopDxa}"/>`;
          isFirstPara = false;
        }

        return `<w:p><w:pPr>${extraPr}${pPr}</w:pPr>${pContent}</w:p>`;
      });

      zip.file('word/document.xml', xml);
    }

    // 2. Process header1.xml and footer1.xml to ensure zero margin and full paper width
    const zeroIndentXml = `<w:ind w:left="0" w:right="0" xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"/>`;

    const fixHfXml = (xmlStr: string) => {
      let xml = xmlStr;
      if (xml.includes('<w:pPr>')) {
        xml = xml.replace(/<w:pPr>/g, `<w:pPr>${zeroIndentXml}`);
      } else {
        xml = xml.replace(/<w:p>/g, `<w:p><w:pPr>${zeroIndentXml}</w:pPr>`);
      }
      xml = xml.replace(/cx="\d+"/g, `cx="${fullWidthEmu}"`);
      return xml;
    };

    if (zip.files['word/header1.xml']) {
      zip.file('word/header1.xml', fixHfXml(zip.files['word/header1.xml'].asText()));
    }

    if (zip.files['word/footer1.xml']) {
      zip.file('word/footer1.xml', fixHfXml(zip.files['word/footer1.xml'].asText()));
    }

    return zip.generate({ type: 'nodebuffer' }) as Buffer;
  } catch (e) {
    // If ZIP post-processing fails, return original buffer
    return docxBuffer;
  }
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

  const DEFAULT_TOP = 5.4 / 2.54;
  const DEFAULT_BOTTOM = 0.63 / 2.54;
  const DEFAULT_LEFT = 2.16 / 2.54;
  const DEFAULT_RIGHT = 1.27 / 2.54;

  const leftMargin = marginLeft !== undefined ? marginLeft : DEFAULT_LEFT;
  const rightMargin = marginRight !== undefined ? marginRight : DEFAULT_RIGHT;
  const topMargin = marginTop !== undefined ? marginTop : DEFAULT_TOP;
  const bottomMargin = marginBottom !== undefined ? marginBottom : DEFAULT_BOTTOM;

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
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        header: 0,
        footer: 0,
      },
      font: 'Calibri',
      fontSize: 24, // 12pt, in half-points
    },
    includeFooter ? processedFooter || '<p></p>' : undefined,
  );

  return makeHeaderFooterXmlMarginless(buffer as Buffer, topMargin, bottomMargin, leftMargin, rightMargin);
}
