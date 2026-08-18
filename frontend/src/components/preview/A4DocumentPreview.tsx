import { useState } from 'react';

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
  readOnly?: boolean;
}

function paginateHtmlContent(html: string, maxPageHeightPx: number = 700): string[] {
  if (!html) return [''];

  const explicitDelimiter = /<div[^>]*class="[^"]*page-break[^"]*"[^>]*>.*?<\/div>|<div[^>]*style="[^"]*page-break[^"]*"[^>]*>.*?<\/div>|<hr[^>]*class="[^"]*page-break[^"]*"[^>]*\/?>/gi;

  const hasManualPageBreaks = explicitDelimiter.test(html);

  if (hasManualPageBreaks) {
    // If manual page break is given, end content on that page and continue on next page.
    // Automatic page separation ONLY works if manual page break is NOT given.
    const manualPages = html.split(explicitDelimiter).map((c) => c.trim()).filter((c) => c.length > 0);
    return manualPages.length > 0 ? manualPages : [html];
  }

  // Automatic height-based page separation (ONLY used if manual page break is NOT given)
  const blockRegex = /<(p|h[1-6]|table|ul|ol|blockquote|div)\b[^>]*>[\s\S]*?<\/\1>/gi;
  const blocks: string[] = [];
  let match: RegExpExecArray | null;
  let lastIndex = 0;

  while ((match = blockRegex.exec(html)) !== null) {
    if (match.index > lastIndex) {
      const text = html.substring(lastIndex, match.index).trim();
      if (text) blocks.push(text);
    }
    blocks.push(match[0]);
    lastIndex = blockRegex.lastIndex;
  }

  if (lastIndex < html.length) {
    const remaining = html.substring(lastIndex).trim();
    if (remaining) blocks.push(remaining);
  }

  if (blocks.length === 0) {
    return [html];
  }

  const finalPages: string[] = [];
  let currentPageHtml = '';
  let currentEstHeight = 0;

  for (const block of blocks) {
    let blockHeight = 28;
    if (/<img/i.test(block)) {
      const hMatch = block.match(/height=["']?(\d+)["']?/i);
      blockHeight += hMatch ? parseInt(hMatch[1], 10) : 150;
    }
    if (/<table/i.test(block)) {
      const trCount = (block.match(/<tr/gi) || []).length;
      blockHeight += Math.max(trCount * 36, 60);
    }
    const textLen = block.replace(/<[^>]+>/g, '').length;
    const estimatedLines = Math.ceil(textLen / 70);
    blockHeight += Math.max(0, (estimatedLines - 1) * 22);

    if (currentEstHeight > 0 && currentEstHeight + blockHeight > maxPageHeightPx) {
      finalPages.push(currentPageHtml);
      currentPageHtml = block;
      currentEstHeight = blockHeight;
    } else {
      currentPageHtml += (currentPageHtml ? '\n' : '') + block;
      currentEstHeight += blockHeight;
    }
  }

  if (currentPageHtml.trim()) {
    finalPages.push(currentPageHtml);
  }

  return finalPages.length > 0 ? finalPages : [html];
}

export function A4DocumentPreview({
  bodyHtml,
  headerHtml,
  footerHtml,
  marginTop = 5.4 / 2.54,
  marginBottom = 0.63 / 2.54,
  marginLeft = 2.16 / 2.54,
  marginRight = 1.27 / 2.54,
  readOnly = false,
}: Props) {
  const [headerHeight, setHeaderHeight] = useState(240);
  const [footerHeight, setFooterHeight] = useState(215);
  const [headerFit, setHeaderFit] = useState<'contain' | 'cover' | 'fill'>('contain');
  const [footerFit, setFooterFit] = useState<'contain' | 'cover' | 'fill'>('contain');
  const [selectedTarget, setSelectedTarget] = useState<'header' | 'footer' | null>(null);

  const autoTopMarginPx = headerHtml ? headerHeight + 12 : Math.round(marginTop * 96);
  const extraBottomGapPx = Math.round((2 / 2.54) * 96); // 2cm = ~76px
  const autoBottomMarginPx = (footerHtml ? footerHeight + 12 : Math.round(marginBottom * 96)) + extraBottomGapPx;
  const marginLeftPx = Math.round(marginLeft * 96);
  const marginRightPx = Math.round(marginRight * 96);

  const availableMaxBodyHeight = 1123 - autoTopMarginPx - autoBottomMarginPx;
  const pageChunks = paginateHtmlContent(bodyHtml || '', Math.max(300, availableMaxBodyHeight - 20));

  const actionBtnStyle: React.CSSProperties = {
    padding: '4px 10px',
    borderRadius: 4,
    border: 'none',
    background: '#4f46e5',
    color: '#ffffff',
    fontWeight: 700,
    fontSize: 12,
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  };

  const closeBtnStyle: React.CSSProperties = {
    padding: '4px 8px',
    borderRadius: 4,
    border: '1px solid #475569',
    background: 'transparent',
    color: '#cbd5e1',
    fontWeight: 600,
    fontSize: 12,
    cursor: 'pointer',
  };

  return (
    <div
      onClick={() => !readOnly && setSelectedTarget(null)}
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', gap: 32, padding: '16px 0' }}
    >
      {/* Interactive Header & Footer Manual Resizer Control Toolbar */}
      {!readOnly && (headerHtml || footerHtml) && (
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            maxWidth: 794,
            width: '100%',
            background: '#ffffff',
            borderRadius: 8,
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.06)',
            padding: '14px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            boxSizing: 'border-box',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', display: 'flex', alignItems: 'center', gap: 6 }}>
              📐 Header & Footer Size Controls (Click Image to Select & Resize)
            </span>
            <span style={{ fontSize: 11, color: '#64748b' }}>
              {selectedTarget ? `Selected: ${selectedTarget.toUpperCase()}` : 'Click Header or Footer to Select'}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: headerHtml && footerHtml ? '1fr 1fr' : '1fr', gap: 24 }}>
            {/* Header Controls */}
            {headerHtml && (
              <div
                onClick={() => setSelectedTarget('header')}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6,
                  padding: '8px 12px',
                  borderRadius: 6,
                  border: selectedTarget === 'header' ? '2px solid #4f46e5' : '1px solid #e2e8f0',
                  background: selectedTarget === 'header' ? '#f5f3ff' : '#ffffff',
                  cursor: 'pointer',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, fontWeight: 600, color: '#334155' }}>
                  <span>Header Height: <strong>{headerHeight}px</strong></span>
                  <select
                    value={headerFit}
                    onChange={(e) => setHeaderFit(e.target.value as any)}
                    style={{ fontSize: 11, padding: '2px 8px', borderRadius: 4, border: '1px solid #cbd5e1', outline: 'none', background: '#f8fafc' }}
                  >
                    <option value="contain">Contain (Ratio)</option>
                    <option value="cover">Cover (Full)</option>
                    <option value="fill">Fill (Stretch)</option>
                  </select>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setHeaderHeight((h) => Math.max(30, h - 10)); }}
                    style={actionBtnStyle}
                  >
                    - 10px
                  </button>
                  <input
                    type="range"
                    min={40}
                    max={450}
                    value={headerHeight}
                    onChange={(e) => setHeaderHeight(Number(e.target.value))}
                    style={{ flex: 1, accentColor: '#4f46e5', cursor: 'pointer' }}
                  />
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setHeaderHeight((h) => Math.min(450, h + 10)); }}
                    style={actionBtnStyle}
                  >
                    + 10px
                  </button>
                </div>
              </div>
            )}

            {/* Footer Controls */}
            {footerHtml && (
              <div
                onClick={() => setSelectedTarget('footer')}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6,
                  padding: '8px 12px',
                  borderRadius: 6,
                  border: selectedTarget === 'footer' ? '2px solid #4f46e5' : '1px solid #e2e8f0',
                  background: selectedTarget === 'footer' ? '#f5f3ff' : '#ffffff',
                  cursor: 'pointer',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, fontWeight: 600, color: '#334155' }}>
                  <span>Footer Height: <strong>{footerHeight}px</strong></span>
                  <select
                    value={footerFit}
                    onChange={(e) => setFooterFit(e.target.value as any)}
                    style={{ fontSize: 11, padding: '2px 8px', borderRadius: 4, border: '1px solid #cbd5e1', outline: 'none', background: '#f8fafc' }}
                  >
                    <option value="contain">Contain (Ratio)</option>
                    <option value="cover">Cover (Full)</option>
                    <option value="fill">Fill (Stretch)</option>
                  </select>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setFooterHeight((f) => Math.max(20, f - 10)); }}
                    style={actionBtnStyle}
                  >
                    - 10px
                  </button>
                  <input
                    type="range"
                    min={30}
                    max={350}
                    value={footerHeight}
                    onChange={(e) => setFooterHeight(Number(e.target.value))}
                    style={{ flex: 1, accentColor: '#4f46e5', cursor: 'pointer' }}
                  />
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setFooterHeight((f) => Math.min(350, f + 10)); }}
                    style={actionBtnStyle}
                  >
                    + 10px
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Render Each Page Sheet in Page-Wise View */}
      {pageChunks.map((chunkHtml, pageIdx) => (
        <div key={pageIdx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          {/* Page Wise Banner Header */}
          <div
            style={{
              width: 794,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '6px 14px',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: 6,
              fontSize: 12,
              fontWeight: 700,
              color: '#475569',
              boxSizing: 'border-box',
            }}
          >
            <span>PAGE {pageIdx + 1} OF {pageChunks.length}</span>
            <span>A4 Document Canvas</span>
          </div>

          <div
            className="a4-preview-page"
            onClick={(e) => e.stopPropagation()}
            style={{
              width: 794,
              height: 1123,
              minHeight: 1123,
              maxHeight: 1123,
              aspectRatio: '210 / 297',
              background: '#ffffff',
              borderRadius: 4,
              boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)',
              position: 'relative',
              overflow: 'hidden',
              boxSizing: 'border-box',
            }}
          >
            {/* Dynamic Styles for Manual Image Resizing & Full-Width Fitting */}
            <style>
              {`
                .a4-preview-page .editor-header-overlay img.full-width,
                .a4-preview-page .editor-header-overlay p > img[style*="width:100%"],
                .a4-preview-page .editor-header-overlay p > img[style*="width: 100%"] {
                  width: 100% !important;
                  max-height: ${headerHeight}px !important;
                  object-fit: ${headerFit} !important;
                }
                .a4-preview-page .editor-header-overlay img {
                  max-width: 100% !important;
                  max-height: ${headerHeight}px !important;
                  object-fit: ${headerFit} !important;
                }
                .a4-preview-page .editor-footer-overlay img.full-width,
                .a4-preview-page .editor-footer-overlay p > img[style*="width:100%"],
                .a4-preview-page .editor-footer-overlay p > img[style*="width: 100%"] {
                  width: 100% !important;
                  max-height: ${footerHeight}px !important;
                  object-fit: ${footerFit} !important;
                }
                .a4-preview-page .editor-footer-overlay img {
                  max-width: 100% !important;
                  max-height: ${footerHeight}px !important;
                  object-fit: ${footerFit} !important;
                }
              `}
            </style>

            {/* Header Overlay — Click to select & resize */}
            {headerHtml && (
              <div
                className="editor-header-overlay"
                onClick={(e) => {
                  if (readOnly) return;
                  e.stopPropagation();
                  setSelectedTarget('header');
                }}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  width: '100%',
                  margin: 0,
                  padding: 0,
                  lineHeight: 0,
                  fontSize: 0,
                  border: !readOnly && selectedTarget === 'header' ? '2px dashed #4f46e5' : 'none',
                  boxShadow: !readOnly && selectedTarget === 'header' ? '0 0 0 4px rgba(79, 70, 229, 0.15)' : 'none',
                  cursor: readOnly ? 'default' : 'pointer',
                  pointerEvents: readOnly ? 'none' : 'auto',
                  zIndex: 20,
                  boxSizing: 'border-box',
                  transition: 'all 0.15s ease',
                }}
              >
                <div dangerouslySetInnerHTML={{ __html: headerHtml }} />
                {!readOnly && selectedTarget === 'header' && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 10,
                      right: 12,
                      zIndex: 30,
                      background: 'rgba(15, 23, 42, 0.9)',
                      backdropFilter: 'blur(8px)',
                      color: '#ffffff',
                      padding: '6px 12px',
                      borderRadius: 6,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      fontSize: 12,
                      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
                    }}
                  >
                    <span style={{ fontWeight: 700 }}>Header: {headerHeight}px</span>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setHeaderHeight((h) => Math.max(30, h - 10)); }}
                      style={actionBtnStyle}
                    >
                      - Smaller
                    </button>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setHeaderHeight((h) => Math.min(350, h + 10)); }}
                      style={actionBtnStyle}
                    >
                      + Larger
                    </button>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setSelectedTarget(null); }}
                      style={closeBtnStyle}
                    >
                      ✕ Done
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Footer Overlay — Click to select & resize */}
            {footerHtml && (
              <div
                className="editor-footer-overlay"
                onClick={(e) => {
                  if (readOnly) return;
                  e.stopPropagation();
                  setSelectedTarget('footer');
                }}
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  width: '100%',
                  margin: 0,
                  padding: 0,
                  lineHeight: 0,
                  fontSize: 0,
                  border: !readOnly && selectedTarget === 'footer' ? '2px dashed #4f46e5' : 'none',
                  boxShadow: !readOnly && selectedTarget === 'footer' ? '0 0 0 4px rgba(79, 70, 229, 0.15)' : 'none',
                  cursor: readOnly ? 'default' : 'pointer',
                  pointerEvents: readOnly ? 'none' : 'auto',
                  zIndex: 20,
                  boxSizing: 'border-box',
                  transition: 'all 0.15s ease',
                }}
              >
                <div dangerouslySetInnerHTML={{ __html: footerHtml }} />
                {!readOnly && selectedTarget === 'footer' && (
                  <div
                    style={{
                      position: 'absolute',
                      bottom: 10,
                      right: 12,
                      zIndex: 30,
                      background: 'rgba(15, 23, 42, 0.9)',
                      backdropFilter: 'blur(8px)',
                      color: '#ffffff',
                      padding: '6px 12px',
                      borderRadius: 6,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      fontSize: 12,
                      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
                    }}
                  >
                    <span style={{ fontWeight: 700 }}>Footer: {footerHeight}px</span>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setFooterHeight((f) => Math.max(20, f - 10)); }}
                      style={actionBtnStyle}
                    >
                      - Smaller
                    </button>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setFooterHeight((f) => Math.min(250, f + 10)); }}
                      style={actionBtnStyle}
                    >
                      + Larger
                    </button>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setSelectedTarget(null); }}
                      style={closeBtnStyle}
                    >
                      ✕ Done
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Content Body — controlled by content margins */}
            <div
              style={{
                padding: `${autoTopMarginPx}px ${marginRightPx}px ${autoBottomMarginPx}px ${marginLeftPx}px`,
                minHeight: '100%',
                boxSizing: 'border-box',
              }}
            >
              <div
                className="tiptap prose"
                style={{ minHeight: '100%' }}
                dangerouslySetInnerHTML={{ __html: chunkHtml || '' }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
