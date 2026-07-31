import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { TemplateCreatorEditor } from '../components/editor/TemplateCreatorEditor';
import type { TemplateCreatorEditorHandle } from '../components/editor/TemplateCreatorEditor';
import { A4DocumentPreview } from '../components/preview/A4DocumentPreview';
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

  const DEFAULT_TOP = 5.4 / 2.54;
  const DEFAULT_BOTTOM = 0.63 / 2.54;
  const DEFAULT_LEFT = 2.16 / 2.54;
  const DEFAULT_RIGHT = 1.27 / 2.54;

  // Margin states in inches
  const [marginTop, setMarginTop] = useState(DEFAULT_TOP);
  const [marginBottom, setMarginBottom] = useState(DEFAULT_BOTTOM);
  const [marginLeft, setMarginLeft] = useState(DEFAULT_LEFT);
  const [marginRight, setMarginRight] = useState(DEFAULT_RIGHT);
  const [marginUnit, setMarginUnit] = useState<'in' | 'cm'>('in');

  useEffect(() => {
    if (!templateId) return;
    api.getTemplate(templateId).then((t) => {
      setTemplate(t);
      setNameDraft(t.templateName);
      lastSavedHtml.current = t.bodyHtml ?? t.html;

      setMarginTop(t.marginTop ?? DEFAULT_TOP);
      setMarginBottom(t.marginBottom ?? DEFAULT_BOTTOM);
      setMarginLeft(t.marginLeft ?? DEFAULT_LEFT);
      setMarginRight(t.marginRight ?? DEFAULT_RIGHT);

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
      .updateTemplateContent(
        templateId,
        debouncedHtml,
        undefined,
        undefined,
        marginTop,
        marginBottom,
        marginLeft,
        marginRight
      )
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
  }, [debouncedHtml, templateId, marginTop, marginBottom, marginLeft, marginRight]);

  if (!template || !templateId) {
    return <p style={{ padding: '2rem' }}>Loading…</p>;
  }

  const handleEditorChange = (html: string) => {
    setDraftHtml(html);
    setStatus('typing');
  };

  const handleSaveMargins = async (top: number, bottom: number, left: number, right: number) => {
    if (!templateId || !template) return;
    setStatus('saving');
    try {
      const currentBodyHtml = editorRef.current?.getHTML() ?? template.bodyHtml ?? template.html;
      const headerToSend = hasHeader
        ? (headerEditType === 'image' && headerImgVal
            ? `<p style="text-align:center; margin:0;"><img src="${headerImgVal}" width="${headerW}" height="${headerH}" /></p>`
            : headerVal)
        : '';
      const footerToSend = hasFooter
        ? (footerEditType === 'image' && footerImgVal
            ? `<p style="text-align:center; margin:0;"><img src="${footerImgVal}" width="${footerW}" height="${footerH}" /></p>`
            : footerVal)
        : '';

      const updated = await api.updateTemplateContent(
        templateId,
        currentBodyHtml,
        headerToSend,
        footerToSend,
        top,
        bottom,
        left,
        right
      );
      setTemplate(updated);
      setMarginTop(updated.marginTop ?? 1.0);
      setMarginBottom(updated.marginBottom ?? 1.0);
      setMarginLeft(updated.marginLeft ?? 1.0);
      setMarginRight(updated.marginRight ?? 1.0);
      setStatus('saved');
      setPreviewNonce((n) => n + 1);
    } catch (err) {
      setStatus('error');
    }
  };

  const handleMarginInputChange = (field: 'top' | 'bottom' | 'left' | 'right', rawVal: string) => {
    const numeric = parseFloat(rawVal) || 0.1;
    const inchesVal = marginUnit === 'cm' ? numeric / 2.54 : numeric;
    if (field === 'top') setMarginTop(inchesVal);
    else if (field === 'bottom') setMarginBottom(inchesVal);
    else if (field === 'left') setMarginLeft(inchesVal);
    else if (field === 'right') setMarginRight(inchesVal);
  };

  const triggerSaveMargins = () => {
    const clamp = (val: number) => Math.max(0.2, Math.min(2.5, val));
    handleSaveMargins(clamp(marginTop), clamp(marginBottom), clamp(marginLeft), clamp(marginRight));
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
                ? `<p style="text-align:center; margin:0; padding:0; width:100%;"><img src="${headerImgVal}" style="width:100%; display:block; margin:0; padding:0;" /></p>`
                : headerVal)
            : '');

      const footerToSend = forcedFooterHtml !== undefined
        ? forcedFooterHtml
        : (hasFooter
            ? (footerEditType === 'image' && footerImgVal
                ? `<p style="text-align:center; margin:0; padding:0; width:100%;"><img src="${footerImgVal}" style="width:100%; display:block; margin:0; padding:0;" /></p>`
                : footerVal)
            : '');

      const currentBodyHtml = editorRef.current?.getHTML() ?? template.bodyHtml ?? template.html;

      const updated = await api.updateTemplateContent(
        templateId,
        currentBodyHtml,
        headerToSend,
        footerToSend,
        marginTop,
        marginBottom,
        marginLeft,
        marginRight
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
          const finalHeader = `<p style="text-align:center; margin:0; padding:0; width:100%;"><img src="${base64}" style="width:100%; display:block; margin:0; padding:0;" /></p>`;
          handleSaveHeaderFooter(finalHeader, undefined);
        } else {
          setFooterImgVal(base64);
          setFooterW(width);
          setFooterH(height);
          const finalFooter = `<p style="text-align:center; margin:0; padding:0; width:100%;"><img src="${base64}" style="width:100%; display:block; margin:0; padding:0;" /></p>`;
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
    <div style={{ maxWidth: 1550, width: '100%', margin: '0 auto', padding: '2rem 1.5rem', boxSizing: 'border-box' }}>
      <div style={{ marginBottom: 16 }}>
        <Link to="/templates" style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          &larr; Back to Templates
        </Link>
      </div>

      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
        flexWrap: 'wrap',
        gap: 16,
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: 'var(--bg-primary)',
        backdropFilter: 'blur(8px)',
        paddingTop: 12,
        paddingBottom: 16,
        borderBottom: '1px solid var(--border-color)',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.04)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
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
          <TemplateInfoPanel
            templateId={template.id}
            templateName={template.templateName}
            fieldCount={template.placeholders.length}
            placeholders={template.placeholders}
            createdAt={template.createdAt}
            source={template.source}
          />
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button onClick={() => editorRef.current?.insertSeal()} style={outlineBtn} title="Put Seal image (Round seal.png) at cursor">
            🏵️ Put Seal
          </button>
          <button onClick={() => editorRef.current?.insertSign()} style={outlineBtn} title="Place Sign image (sign.PNG) at cursor">
            ✍️ Place Sign
          </button>
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
          <div className="app-card" style={{ padding: 20, position: 'sticky', top: 90, alignSelf: 'flex-start' }}>
            <PlaceholdersPanel
              placeholders={template.placeholders}
              onInsert={(name) => editorRef.current?.insertPlaceholder(name)}
            />
          </div>
        )}

        <div style={{ flex: 1, minWidth: 0 }}>
          {showPreview ? (
            <A4DocumentPreview
              pdfUrl={previewUrl}
              bodyHtml={template.bodyHtml ?? template.html}
              headerHtml={template.headerHtml}
              footerHtml={template.footerHtml}
              marginTop={marginTop}
              marginBottom={marginBottom}
              marginLeft={marginLeft}
              marginRight={marginRight}
              nonce={previewNonce}
            />
          ) : (
            <>
               <TemplateCreatorEditor
                ref={editorRef}
                initialHtml={template.bodyHtml ?? template.html}
                headerHtml={template.headerHtml}
                footerHtml={template.footerHtml}
                marginTop={marginTop}
                marginBottom={marginBottom}
                marginLeft={marginLeft}
                marginRight={marginRight}
                onChange={handleEditorChange}
              />

              {/* Page Margin Setup Panel */}
              <div className="app-card" style={{ marginTop: 24, padding: 24 }}>
                <h3 style={{ marginTop: 0, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8, fontFamily: "'Outfit', sans-serif" }}>
                  📐 Page Margin Setup (Microsoft Word Style)
                </h3>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, alignItems: 'flex-end' }}>
                  <div style={{ flex: '1 1 180px' }}>
                    <label style={{ display: 'block', fontWeight: 700, fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>
                      Margins Preset
                    </label>
                    <select
                      value={
                        Math.abs(marginTop - DEFAULT_TOP) < 0.02 && Math.abs(marginBottom - DEFAULT_BOTTOM) < 0.02 && Math.abs(marginLeft - DEFAULT_LEFT) < 0.02 && Math.abs(marginRight - DEFAULT_RIGHT) < 0.02
                          ? 'default_letterhead'
                          : Math.abs(marginTop - 1.0) < 0.01 && Math.abs(marginBottom - 1.0) < 0.01 && Math.abs(marginLeft - 1.0) < 0.01 && Math.abs(marginRight - 1.0) < 0.01
                          ? 'normal'
                          : Math.abs(marginTop - 0.5) < 0.01 && Math.abs(marginBottom - 0.5) < 0.01 && Math.abs(marginLeft - 0.5) < 0.01 && Math.abs(marginRight - 0.5) < 0.01
                          ? 'narrow'
                          : Math.abs(marginTop - 1.5) < 0.01 && Math.abs(marginBottom - 1.5) < 0.01 && Math.abs(marginLeft - 1.5) < 0.01 && Math.abs(marginRight - 1.5) < 0.01
                          ? 'wide'
                          : 'custom'
                      }
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === 'default_letterhead') {
                          handleSaveMargins(DEFAULT_TOP, DEFAULT_BOTTOM, DEFAULT_LEFT, DEFAULT_RIGHT);
                        } else if (val === 'normal') {
                          handleSaveMargins(1.0, 1.0, 1.0, 1.0);
                        } else if (val === 'narrow') {
                          handleSaveMargins(0.5, 0.5, 0.5, 0.5);
                        } else if (val === 'wide') {
                          handleSaveMargins(1.5, 1.5, 1.5, 1.5);
                        }
                      }}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-sm)',
                        background: 'var(--bg-surface)',
                        color: 'var(--text-primary)',
                        fontSize: 14,
                        fontFamily: "'Outfit', sans-serif",
                        outline: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      <option value="default_letterhead">Default Letterhead (T: 5.4cm, B: 0.63cm, L: 2.16cm, R: 1.27cm)</option>
                      <option value="normal">Normal (1.0 in / 2.54 cm)</option>
                      <option value="narrow">Narrow (0.5 in / 1.27 cm)</option>
                      <option value="wide">Wide (1.5 in / 3.81 cm)</option>
                      <option value="custom">Custom margins...</option>
                    </select>
                  </div>

                  <div style={{ flex: '1 1 180px' }}>
                    <label style={{ display: 'block', fontWeight: 700, fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>
                      Margin Unit
                    </label>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button
                        type="button"
                        onClick={() => setMarginUnit('in')}
                        style={{
                          flex: 1,
                          padding: '10px 12px',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--border-color)',
                          background: marginUnit === 'in' ? 'var(--primary)' : 'var(--bg-surface)',
                          color: marginUnit === 'in' ? '#ffffff' : 'var(--text-primary)',
                          fontWeight: 700,
                          fontSize: 13,
                          cursor: 'pointer',
                          transition: 'var(--transition)',
                        }}
                      >
                        Inches (in)
                      </button>
                      <button
                        type="button"
                        onClick={() => setMarginUnit('cm')}
                        style={{
                          flex: 1,
                          padding: '10px 12px',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--border-color)',
                          background: marginUnit === 'cm' ? 'var(--primary)' : 'var(--bg-surface)',
                          color: marginUnit === 'cm' ? '#ffffff' : 'var(--text-primary)',
                          fontWeight: 700,
                          fontSize: 13,
                          cursor: 'pointer',
                          transition: 'var(--transition)',
                        }}
                      >
                        Centimeters (cm)
                      </button>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', flex: '2 1 400px' }}>
                    <div>
                      <label style={{ display: 'block', fontWeight: 600, fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6 }}>
                        Top ({marginUnit})
                      </label>
                      <input
                        id="margin-input-top"
                        type="number"
                        min={marginUnit === 'in' ? 0.2 : 0.5}
                        max={marginUnit === 'in' ? 2.5 : 6.3}
                        step={0.1}
                        value={marginUnit === 'in' ? marginTop : parseFloat((marginTop * 2.54).toFixed(2))}
                        onChange={(e) => handleMarginInputChange('top', e.target.value)}
                        onBlur={triggerSaveMargins}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            document.getElementById('margin-input-bottom')?.focus();
                          }
                        }}
                        style={{
                          width: 80,
                          padding: '8px 10px',
                          border: '1px solid var(--border-color)',
                          borderRadius: 'var(--radius-sm)',
                          background: 'var(--bg-surface)',
                          color: 'var(--text-primary)',
                          textAlign: 'center',
                          fontFamily: "'Outfit', sans-serif",
                          outline: 'none',
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontWeight: 600, fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6 }}>
                        Bottom ({marginUnit})
                      </label>
                      <input
                        id="margin-input-bottom"
                        type="number"
                        min={marginUnit === 'in' ? 0.2 : 0.5}
                        max={marginUnit === 'in' ? 2.5 : 6.3}
                        step={0.1}
                        value={marginUnit === 'in' ? marginBottom : parseFloat((marginBottom * 2.54).toFixed(2))}
                        onChange={(e) => handleMarginInputChange('bottom', e.target.value)}
                        onBlur={triggerSaveMargins}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            document.getElementById('margin-input-left')?.focus();
                          }
                        }}
                        style={{
                          width: 80,
                          padding: '8px 10px',
                          border: '1px solid var(--border-color)',
                          borderRadius: 'var(--radius-sm)',
                          background: 'var(--bg-surface)',
                          color: 'var(--text-primary)',
                          textAlign: 'center',
                          fontFamily: "'Outfit', sans-serif",
                          outline: 'none',
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontWeight: 600, fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6 }}>
                        Left ({marginUnit})
                      </label>
                      <input
                        id="margin-input-left"
                        type="number"
                        min={marginUnit === 'in' ? 0.2 : 0.5}
                        max={marginUnit === 'in' ? 2.5 : 6.3}
                        step={0.1}
                        value={marginUnit === 'in' ? marginLeft : parseFloat((marginLeft * 2.54).toFixed(2))}
                        onChange={(e) => handleMarginInputChange('left', e.target.value)}
                        onBlur={triggerSaveMargins}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            document.getElementById('margin-input-right')?.focus();
                          }
                        }}
                        style={{
                          width: 80,
                          padding: '8px 10px',
                          border: '1px solid var(--border-color)',
                          borderRadius: 'var(--radius-sm)',
                          background: 'var(--bg-surface)',
                          color: 'var(--text-primary)',
                          textAlign: 'center',
                          fontFamily: "'Outfit', sans-serif",
                          outline: 'none',
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontWeight: 600, fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6 }}>
                        Right ({marginUnit})
                      </label>
                      <input
                        id="margin-input-right"
                        type="number"
                        min={marginUnit === 'in' ? 0.2 : 0.5}
                        max={marginUnit === 'in' ? 2.5 : 6.3}
                        step={0.1}
                        value={marginUnit === 'in' ? marginRight : parseFloat((marginRight * 2.54).toFixed(2))}
                        onChange={(e) => handleMarginInputChange('right', e.target.value)}
                        onBlur={triggerSaveMargins}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            triggerSaveMargins();
                            (e.target as HTMLInputElement).blur();
                          }
                        }}
                        style={{
                          width: 80,
                          padding: '8px 10px',
                          border: '1px solid var(--border-color)',
                          borderRadius: 'var(--radius-sm)',
                          background: 'var(--bg-surface)',
                          color: 'var(--text-primary)',
                          textAlign: 'center',
                          fontFamily: "'Outfit', sans-serif",
                          outline: 'none',
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

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
