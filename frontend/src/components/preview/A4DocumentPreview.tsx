import { PdfDocumentView } from './PdfDocumentView';

interface Props {
  pdfUrl?: string | null;
  bodyHtml?: string;
  headerHtml?: string;
  footerHtml?: string;
  marginTop?: number;
  marginBottom?: number;
  marginLeft?: number;
  marginRight?: number;
  nonce?: number;
}

export function A4DocumentPreview({
  pdfUrl,
  bodyHtml,
  headerHtml,
  footerHtml,
  marginTop = 2.126,
  marginBottom = 0.248,
  marginLeft = 0.85,
  marginRight = 0.5,
  nonce = 0,
}: Props) {
  const marginTopPx = Math.round(marginTop * 96);
  const marginBottomPx = Math.round(marginBottom * 96);
  const marginLeftPx = Math.round(marginLeft * 96);
  const marginRightPx = Math.round(marginRight * 96);

  if (pdfUrl) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', padding: '16px 0' }}>
        <PdfDocumentView pdfUrl={pdfUrl} key={nonce} />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', gap: 32, padding: '16px 0' }}>
      <div
        className="a4-preview-page"
        style={{
          width: 794,
          minHeight: 1123,
          background: '#ffffff',
          borderRadius: 4,
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)',
          position: 'relative',
          overflow: 'hidden',
          boxSizing: 'border-box',
        }}
      >
        {/* Header Overlay */}
        {headerHtml && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              pointerEvents: 'none',
              zIndex: 10,
            }}
            dangerouslySetInnerHTML={{ __html: headerHtml }}
          />
        )}

        {/* Footer Overlay */}
        {footerHtml && (
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              width: '100%',
              pointerEvents: 'none',
              zIndex: 10,
            }}
            dangerouslySetInnerHTML={{ __html: footerHtml }}
          />
        )}

        {/* Content Body */}
        <div
          style={{
            padding: `${marginTopPx}px ${marginRightPx}px ${marginBottomPx}px ${marginLeftPx}px`,
            minHeight: '100%',
            boxSizing: 'border-box',
          }}
        >
          <div
            className="tiptap prose"
            style={{ minHeight: '100%' }}
            dangerouslySetInnerHTML={{ __html: bodyHtml || '' }}
          />
        </div>
      </div>
    </div>
  );
}
