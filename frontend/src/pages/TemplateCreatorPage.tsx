import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { TemplateCreatorEditor } from '../components/editor/TemplateCreatorEditor';
import type { TemplateCreatorEditorHandle } from '../components/editor/TemplateCreatorEditor';
import { PdfDocumentView } from '../components/preview/PdfDocumentView';
import { PlaceholdersPanel } from '../components/editor/PlaceholdersPanel';
import { TemplateInfoPanel } from '../components/editor/TemplateInfoPanel';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import * as api from '../services/api';
import type { TemplateRecord } from '../types/template';

type SaveStatus = 'idle' | 'typing' | 'saving' | 'saved' | 'error';

export function TemplateCreatorPage() {
  const { templateId } = useParams<{ templateId: string }>();
  const navigate = useNavigate();
  const editorRef = useRef<TemplateCreatorEditorHandle>(null);

  const [template, setTemplate] = useState<TemplateRecord | null>(null);
  const [nameDraft, setNameDraft] = useState('');
  const [status, setStatus] = useState<SaveStatus>('idle');
  const [previewNonce, setPreviewNonce] = useState(0);
  const [showPreview, setShowPreview] = useState(false);

  const [draftHtml, setDraftHtml] = useState<string | null>(null);
  const debouncedHtml = useDebouncedValue(draftHtml, 700);
  const lastSavedHtml = useRef<string | null>(null);

  // Header & Footer states
  const [hasHeader, setHasHeader] = useState(false);
  const [hasFooter, setHasFooter] = useState(false);
  const [headerEditType, setHeaderEditType] = useState<'html' | 'image'>('html');
  const [footerEditType, setFooterEditType] = useState<'html' | 'image'>('html');
  const [headerVal, setHeaderVal] = useState('');
  const [footerVal, setFooterVal] = useState('');
  const [headerImgVal, setHeaderImgVal] = useState('');
  const [footerImgVal, setFooterImgVal] = useState('');
  const [headerW, setHeaderW] = useState(0);
  const [headerH, setHeaderH] = useState(0);
  const [footerW, setFooterW] = useState(0);
  const [footerH, setFooterH] = useState(0);

  useEffect(() => {
    if (!templateId) return;
    api.getTemplate(templateId).then((t) => {
      setTemplate(t);
      setNameDraft(t.templateName);
      lastSavedHtml.current = t.bodyHtml ?? t.html;

      // Extract header state
      if (t.headerHtml) {
        setHasHeader(true);
        const imgMatch = t.headerHtml.match(/<img[^>]+src=["'](data:image\/[^"']+)["']/i);
        if (imgMatch) {
          setHeaderEditType('image');
          setHeaderImgVal(imgMatch[1]);
          const wMatch = t.headerHtml.match(/width=["'](\d+)["']/i);
          const hMatch = t.headerHtml.match(/height=["'](\d+)["']/i);
          if (wMatch) setHeaderW(parseInt(wMatch[1], 10));
          if (hMatch) setHeaderH(parseInt(hMatch[1], 10));
        } else {
          setHeaderEditType('html');
          setHeaderVal(t.headerHtml);
        }
      } else {
        setHasHeader(false);
        setHeaderEditType('html');
        setHeaderVal('');
      }

      // Extract footer state
      if (t.footerHtml) {
        setHasFooter(true);
        const imgMatch = t.footerHtml.match(/<img[^>]+src=["'](data:image\/[^"']+)["']/i);
        if (imgMatch) {
          setFooterEditType('image');
          setFooterImgVal(imgMatch[1]);
          const wMatch = t.footerHtml.match(/width=["'](\d+)["']/i);
          const hMatch = t.footerHtml.match(/height=["'](\d+)["']/i);
          if (wMatch) setFooterW(parseInt(wMatch[1], 10));
          if (hMatch) setFooterH(parseInt(hMatch[1], 10));
        } else {
          setFooterEditType('html');
          setFooterVal(t.footerHtml);
        }
      } else {
        setHasFooter(false);
        setFooterEditType('html');
        setFooterVal('');
      }
    });
  }, [templateId]);

  useEffect(() => {
    if (!templateId) return;
    if (debouncedHtml === null) return;
    if (debouncedHtml === lastSavedHtml.current) return;

    let cancelled = false;
    setStatus('saving');

    api
      .updateTemplateContent(templateId, debouncedHtml)
      .then((updated) => {
        if (cancelled) return;
        lastSavedHtml.current = debouncedHtml;
        setTemplate(updated);
        setStatus('saved');
        setPreviewNonce((n) => n + 1);
      })
      .catch(() => {
        if (!cancelled) setStatus('error');
      });

    return () => {
      cancelled = true;
    };
  }, [debouncedHtml, templateId]);

  if (!template || !templateId) {
    return <p style={{ padding: '2rem' }}>Loading…</p>;
  }

  const handleEditorChange = (html: string) => {
    setDraftHtml(html);
    setStatus('typing');
  };

  const handleSaveHeaderFooter = async (
    forcedHeaderHtml?: string,
    forcedFooterHtml?: string
  ) => {
    if (!templateId || !template) return;
    setStatus('saving');
    try {
      const headerToSend = forcedHeaderHtml !== undefined
        ? forcedHeaderHtml
        : (hasHeader
            ? (headerEditType === 'image' && headerImgVal
                ? `<p style="text-align:center; margin:0;"><img src="${headerImgVal}" width="${headerW}" height="${headerH}" /></p>`
                : headerVal)
            : '');

      const footerToSend = forcedFooterHtml !== undefined
        ? forcedFooterHtml
        : (hasFooter
            ? (footerEditType === 'image' && footerImgVal
                ? `<p style="text-align:center; margin:0;"><img src="${footerImgVal}" width="${footerW}" height="${footerH}" /></p>`
                : footerVal)
            : '');

      const currentBodyHtml = editorRef.current?.getHTML() ?? template.bodyHtml ?? template.html;

      const updated = await api.updateTemplateContent(
        templateId,
        currentBodyHtml,
        headerToSend,
        footerToSend
      );
      setTemplate(updated);
      setStatus('saved');
      setPreviewNonce((n) => n + 1);
    } catch (err) {
      setStatus('error');
    }
  };

  const handleHeaderToggle = (checked: boolean) => {
    setHasHeader(checked);
    if (!checked) {
      handleSaveHeaderFooter('', undefined);
    } else {
      setTimeout(() => handleSaveHeaderFooter(), 0);
    }
  };

  const handleFooterToggle = (checked: boolean) => {
    setHasFooter(checked);
    if (!checked) {
      handleSaveHeaderFooter(undefined, '');
    } else {
      setTimeout(() => handleSaveHeaderFooter(), 0);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'header' | 'footer') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        const maxHeight = type === 'header' ? 60 : 30;

        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }

        if (type === 'header') {
          setHeaderImgVal(base64);
          setHeaderW(width);
          setHeaderH(height);
          const finalHeader = `<p style="text-align:center; margin:0;"><img src="${base64}" width="${width}" height="${height}" /></p>`;
          handleSaveHeaderFooter(finalHeader, undefined);
        } else {
          setFooterImgVal(base64);
          setFooterW(width);
          setFooterH(height);
          const finalFooter = `<p style="text-align:center; margin:0;"><img src="${base64}" width="${width}" height="${height}" /></p>`;
          handleSaveHeaderFooter(undefined, finalFooter);
        }
      };
      img.src = base64;
    };
    reader.readAsDataURL(file);
  };

  const handleHeaderImageClear = () => {
    setHeaderImgVal('');
    setHeaderW(0);
    setHeaderH(0);
    handleSaveHeaderFooter('', undefined);
  };

  const handleFooterImageClear = () => {
    setFooterImgVal('');
    setFooterW(0);
    setFooterH(0);
    handleSaveHeaderFooter(undefined, '');
  };

  const handleRename = async () => {
    if (!nameDraft.trim() || nameDraft === template.templateName) return;
    const updated = await api.renameTemplate(templateId, nameDraft.trim());
    setTemplate(updated);
  };

  const flushAndRefreshPreview = async () => {
    const html = editorRef.current?.getHTML();
    if (html !== undefined && html !== lastSavedHtml.current) {
      setStatus('saving');
      const updated = await api.updateTemplateContent(templateId, html);
      lastSavedHtml.current = html;
      setTemplate(updated);
      setStatus('saved');
      setPreviewNonce((n) => n + 1);
    }
  };

  const handlePreviewToggle = async () => {
    if (!showPreview) await flushAndRefreshPreview();
    setShowPreview((s) => !s);
  };

  const handleDownloadPdf = async () => {
    await flushAndRefreshPreview();
    window.open(`${api.templateExportPdfUrl(templateId)}?t=${Date.now()}`, '_blank');
  };

  const previewUrl = `${api.templateExportPdfUrl(templateId)}?t=${previewNonce}`;

  const statusLabel: Record<SaveStatus, string> = {
    idle: '',
    typing: 'Typing…',
    saving: 'Updating…',
    saved: 'Saved',
    error: 'Could not save',
  };
  const statusColor: Record<SaveStatus, string> = {
    idle: '#9ca3af',
    typing: '#9ca3af',
    saving: '#d97706',
    saved: '#16a34a',
    error: '#dc2626',
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem' }}>
      <div style={{ marginBottom: 16 }}>
        <Link to="/templates" style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          &larr; Back to Templates
        </Link>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ color: 'var(--text-muted)', fontSize: 14, fontWeight: 500 }}>Template —</span>
          <input
            value={nameDraft}
            onChange={(e) => setNameDraft(e.target.value)}
            onBlur={handleRename}
            style={{
              fontSize: '1.5rem',
              fontWeight: 800,
              fontFamily: "'Outfit', sans-serif",
              border: 'none',
              borderBottom: '2px solid transparent',
              background: 'transparent',
              color: 'var(--text-primary)',
              outline: 'none',
              padding: '2px 4px',
              transition: 'var(--transition)',
              width: 'auto',
              maxWidth: 320,
            }}
            onFocus={(e) => (e.target.style.borderBottom = '2px solid var(--primary)')}
            onBlurCapture={(e) => (e.target.style.borderBottom = '2px solid transparent')}
          />
          <span className="badge" style={{ background: statusColor[status] + '15', color: statusColor[status], fontSize: 12, fontWeight: 700 }}>
            {statusLabel[status] || 'Idle'}
          </span>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={handleDownloadPdf} style={outlineBtn}>
            📥 Download PDF
          </button>
          <button onClick={handlePreviewToggle} style={outlineBtn}>
            {showPreview ? '📝 Back to Edit' : '👁️ Preview Layout'}
          </button>
          <button onClick={() => navigate(`/editor/${templateId}`)} style={filledBtn}>
            Continue to Merging &rarr;
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 28, alignItems: 'flex-start' }}>
        {!showPreview && (
          <div className="app-card" style={{ padding: 20, position: 'sticky', top: 20, alignSelf: 'flex-start' }}>
            <PlaceholdersPanel
              placeholders={template.placeholders}
              onInsert={(name) => editorRef.current?.insertPlaceholder(name)}
            />
          </div>
        )}

        <div style={{ flex: 1, minWidth: 0 }}>
          {showPreview ? (
            <div className="app-card" style={{ padding: 20 }}>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 0, marginBottom: 16 }}>
                💡 <strong>Live layout preview:</strong> Showing letterhead layout with header &amp; footer. Literal <code>{'{tags}'}</code> represent dynamic fields that will be replaced during merging.
              </p>
              <div style={{ maxHeight: '70vh', overflowY: 'auto', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', padding: 16 }}>
                <PdfDocumentView pdfUrl={previewUrl} key={previewNonce} />
              </div>
            </div>
          ) : (
            <>
              <TemplateCreatorEditor
                ref={editorRef}
                initialHtml={template.bodyHtml ?? template.html}
                onChange={handleEditorChange}
              />

              {/* Header & Footer Layout Configuration Panel */}
              <div className="app-card" style={{ marginTop: 24, padding: 24 }}>
                <h3 style={{ marginTop: 0, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8, fontFamily: "'Outfit', sans-serif" }}>
                  ✉️ Header &amp; Footer Layout Configuration
                </h3>

                {/* Header Section */}
                <div style={{ marginBottom: 20, borderBottom: '1px solid var(--border-color)', paddingBottom: 20 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, fontSize: 14, color: 'var(--text-primary)', cursor: 'pointer', marginBottom: 12 }}>
                    <input
                      type="checkbox"
                      checked={hasHeader}
                      onChange={(e) => handleHeaderToggle(e.target.checked)}
                      style={{ width: 16, height: 16, accentColor: 'var(--primary)' }}
                    />
                    Enable Header
                  </label>

                  {hasHeader && (
                    <div style={{ marginLeft: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
                      <div style={{ display: 'flex', gap: 16 }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: 'var(--text-primary)', cursor: 'pointer' }}>
                          <input
                            type="radio"
                            name="editorHeaderType"
                            checked={headerEditType === 'html'}
                            onChange={() => setHeaderEditType('html')}
                            style={{ accentColor: 'var(--primary)' }}
                          />
                          Text / HTML Address
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: 'var(--text-primary)', cursor: 'pointer' }}>
                          <input
                            type="radio"
                            name="editorHeaderType"
                            checked={headerEditType === 'image'}
                            onChange={() => setHeaderEditType('image')}
                            style={{ accentColor: 'var(--primary)' }}
                          />
                          Image Logo
                        </label>
                      </div>

                      {headerEditType === 'html' ? (
                        <textarea
                          rows={3}
                          value={headerVal}
                          onChange={(e) => setHeaderVal(e.target.value)}
                          onBlur={() => handleSaveHeaderFooter()}
                          placeholder="Header HTML or address text (e.g. <p>SHINECRAFT</p>)"
                          style={textareaStyle}
                        />
                      ) : (
                        <div style={uploadContainerStyle}>
                          {headerImgVal ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                              <img src={headerImgVal} alt="Header Preview" style={{ maxHeight: 60, borderRadius: 4, border: '1px solid var(--border-color)' }} />
                              <button type="button" onClick={handleHeaderImageClear} style={dangerBtnStyle}>
                                Remove Logo
                              </button>
                            </div>
                          ) : (
                            <label style={uploadBtnStyle}>
                              📤 Upload Header Logo
                              <input type="file" accept="image/*" hidden onChange={(e) => handleImageUpload(e, 'header')} />
                            </label>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Footer Section */}
                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, fontSize: 14, color: 'var(--text-primary)', cursor: 'pointer', marginBottom: 12 }}>
                    <input
                      type="checkbox"
                      checked={hasFooter}
                      onChange={(e) => handleFooterToggle(e.target.checked)}
                      style={{ width: 16, height: 16, accentColor: 'var(--primary)' }}
                    />
                    Enable Footer
                  </label>

                  {hasFooter && (
                    <div style={{ marginLeft: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
                      <div style={{ display: 'flex', gap: 16 }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: 'var(--text-primary)', cursor: 'pointer' }}>
                          <input
                            type="radio"
                            name="editorFooterType"
                            checked={footerEditType === 'html'}
                            onChange={() => setFooterEditType('html')}
                            style={{ accentColor: 'var(--primary)' }}
                          />
                          Text / HTML Footer
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: 'var(--text-primary)', cursor: 'pointer' }}>
                          <input
                            type="radio"
                            name="editorFooterType"
                            checked={footerEditType === 'image'}
                            onChange={() => setFooterEditType('image')}
                            style={{ accentColor: 'var(--primary)' }}
                          />
                          Image Logo
                        </label>
                      </div>

                      {footerEditType === 'html' ? (
                        <textarea
                          rows={3}
                          value={footerVal}
                          onChange={(e) => setFooterVal(e.target.value)}
                          onBlur={() => handleSaveHeaderFooter()}
                          placeholder="Footer HTML or text"
                          style={textareaStyle}
                        />
                      ) : (
                        <div style={uploadContainerStyle}>
                          {footerImgVal ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                              <img src={footerImgVal} alt="Footer Preview" style={{ maxHeight: 30, borderRadius: 4, border: '1px solid var(--border-color)' }} />
                              <button type="button" onClick={handleFooterImageClear} style={dangerBtnStyle}>
                                Remove Logo
                              </button>
                            </div>
                          ) : (
                            <label style={uploadBtnStyle}>
                              📤 Upload Footer Logo
                              <input type="file" accept="image/*" hidden onChange={(e) => handleImageUpload(e, 'footer')} />
                            </label>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {!showPreview && (
          <div className="app-card" style={{ padding: 20, position: 'sticky', top: 20, alignSelf: 'flex-start' }}>
            <TemplateInfoPanel
              templateId={template.id}
              fieldCount={template.placeholders.length}
              createdAt={template.createdAt}
            />
          </div>
        )}
      </div>
    </div>
  );
}

const outlineBtn: React.CSSProperties = {
  padding: '8px 16px',
  borderRadius: 'var(--radius-sm)',
  border: '1px solid var(--border-color)',
  background: 'var(--bg-surface)',
  color: 'var(--text-secondary)',
  cursor: 'pointer',
  fontSize: 13,
  fontWeight: 600,
  transition: 'var(--transition)',
};

const filledBtn: React.CSSProperties = {
  padding: '8px 16px',
  borderRadius: 'var(--radius-sm)',
  border: 'none',
  background: 'var(--primary)',
  color: 'var(--text-on-primary)',
  cursor: 'pointer',
  fontSize: 13,
  fontWeight: 600,
  boxShadow: '0 4px 12px rgba(99, 102, 241, 0.2)',
  transition: 'var(--transition)',
};

const textareaStyle: React.CSSProperties = {
  width: '100%',
  padding: '8px 12px',
  border: '1px solid var(--border-color)',
  borderRadius: 'var(--radius-sm)',
  fontFamily: 'monospace',
  fontSize: 11,
  background: 'var(--bg-surface)',
  color: 'var(--text-primary)',
  resize: 'vertical',
  outline: 'none',
};

const uploadContainerStyle: React.CSSProperties = {
  border: '1px dashed var(--border-color)',
  borderRadius: 'var(--radius-sm)',
  padding: 12,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  gap: 8,
  background: 'var(--bg-secondary)',
};

const uploadBtnStyle: React.CSSProperties = {
  display: 'inline-flex',
  padding: '6px 12px',
  fontSize: 12,
  fontWeight: 600,
  border: '1px solid var(--border-color)',
  background: 'var(--bg-surface)',
  color: 'var(--text-secondary)',
  cursor: 'pointer',
  borderRadius: 'var(--radius-sm)',
};

const dangerBtnStyle: React.CSSProperties = {
  padding: '4px 8px',
  fontSize: 11,
  fontWeight: 600,
  border: '1px solid var(--danger)',
  background: 'transparent',
  color: 'var(--danger)',
  cursor: 'pointer',
  borderRadius: 4,
  transition: 'var(--transition)',
};
