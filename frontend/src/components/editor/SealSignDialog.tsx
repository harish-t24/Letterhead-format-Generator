import { useState, useEffect } from 'react';

interface Props {
  isOpen: boolean;
  initialTab?: 'seal' | 'sign';
  onClose: () => void;
  onApplySeal: (sealHtml: string) => void;
  onApplySignature: (signHtml: string) => void;
}

export function SealSignDialog({ isOpen, initialTab = 'seal', onClose, onApplySeal, onApplySignature }: Props) {
  const [activeTab, setActiveTab] = useState<'seal' | 'sign'>(initialTab);

  // Seal state — starts empty, requires user upload
  const [sealImg, setSealImg] = useState<string>('');
  const [sealAlign, setSealAlign] = useState<'left' | 'center' | 'right'>('right');
  const [sealWidth, setSealWidth] = useState<number>(130);

  // Sign state — starts empty, requires user upload
  const [signImg, setSignImg] = useState<string>('');
  const [typedName, setTypedName] = useState<string>('');
  const [signTitle, setSignTitle] = useState<string>('');
  const [signAlign, setSignAlign] = useState<'left' | 'center' | 'right'>('right');

  useEffect(() => {
    if (isOpen) {
      if (initialTab) setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  const handleSealFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        if (evt.target?.result) setSealImg(evt.target.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSignFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        if (evt.target?.result) setSignImg(evt.target.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInsertSeal = () => {
    if (!sealImg) return;
    const sealHtml = `<div style="text-align: ${sealAlign}; margin-top: 16px; margin-bottom: 16px; clear: both;"><img src="${sealImg}" style="width: ${sealWidth}px; height: auto; display: inline-block; vertical-align: middle;" alt="Company Seal" data-alignment="${sealAlign}" /></div>`;
    onApplySeal(sealHtml);
    onClose();
  };

  const handleInsertSignature = () => {
    if (!signImg) return;
    const nameBlock = typedName ? `<div style="font-weight: bold; font-size: 13px; color: #1e293b; margin: 0; line-height: 1.4;">${typedName}</div>` : '';
    const titleBlock = signTitle ? `<div style="font-size: 11px; color: #64748b; margin: 0; line-height: 1.3;">${signTitle}</div>` : '';

    const signHtml = `<div style="text-align: ${signAlign}; margin-top: 24px; margin-bottom: 12px; clear: both;">
      <div style="display: inline-block; text-align: center; vertical-align: top;">
        <img src="${signImg}" style="width: 160px; height: auto; display: block; margin: 0 auto 4px auto;" alt="Signature" data-alignment="${signAlign}" />
        ${nameBlock}
        ${titleBlock}
      </div>
    </div>`;

    onApplySignature(signHtml);
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.55)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      backdropFilter: 'blur(4px)',
    }}>
      <div style={{
        background: 'var(--bg-surface)',
        borderRadius: 'var(--radius-lg)',
        width: '90%',
        maxWidth: 520,
        padding: 24,
        boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
        border: '1px solid var(--border-color)',
      }}>
        {/* Header Tabs */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => setActiveTab('seal')}
              style={{
                padding: '8px 16px',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                background: activeTab === 'seal' ? 'var(--primary)' : 'var(--bg-secondary)',
                color: activeTab === 'seal' ? '#ffffff' : 'var(--text-secondary)',
                fontWeight: 700,
                fontSize: 14,
                cursor: 'pointer',
              }}
            >
              🏵️ Upload Seal
            </button>
            <button
              onClick={() => setActiveTab('sign')}
              style={{
                padding: '8px 16px',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                background: activeTab === 'sign' ? 'var(--primary)' : 'var(--bg-secondary)',
                color: activeTab === 'sign' ? '#ffffff' : 'var(--text-secondary)',
                fontWeight: 700,
                fontSize: 14,
                cursor: 'pointer',
              }}
            >
              ✍️ Upload Signature
            </button>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: 'var(--text-secondary)' }}
          >
            ✕
          </button>
        </div>

        {/* SEAL TAB CONTENT */}
        {activeTab === 'seal' && (
          <div>
            <h4 style={{ margin: '0 0 12px 0', fontSize: 15, fontWeight: 700 }}>Upload &amp; Place Your Company Seal</h4>

            <div style={{
              border: '2px dashed #cbd5e1',
              borderRadius: 8,
              padding: '20px 16px',
              textAlign: 'center',
              background: '#f8fafc',
              marginBottom: 16,
            }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--primary)', cursor: 'pointer', marginBottom: 6 }}>
                📁 Select Your Seal Image (PNG / JPG / WebP)
              </label>
              <input type="file" accept="image/*" onChange={handleSealFileUpload} style={{ fontSize: 13 }} />
            </div>

            <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Seal Alignment</label>
                <select
                  value={sealAlign}
                  onChange={(e) => setSealAlign(e.target.value as any)}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid var(--border-color)' }}
                >
                  <option value="right">Right Side</option>
                  <option value="left">Left Side</option>
                  <option value="center">Center</option>
                </select>
              </div>

              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Seal Width ({sealWidth}px)</label>
                <input
                  type="range"
                  min="80"
                  max="250"
                  value={sealWidth}
                  onChange={(e) => setSealWidth(Number(e.target.value))}
                  style={{ width: '100%' }}
                />
              </div>
            </div>

            {/* Seal Preview Box */}
            {sealImg ? (
              <div style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: 8,
                padding: 16,
                textAlign: sealAlign,
                marginBottom: 20,
              }}>
                <img src={sealImg} style={{ width: sealWidth, height: 'auto', display: 'inline-block' }} alt="Uploaded Seal Preview" />
              </div>
            ) : (
              <div style={{ fontSize: 12, color: '#94a3b8', fontStyle: 'italic', textAlign: 'center', marginBottom: 20 }}>
                No seal image uploaded yet. Please select an image file above.
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button onClick={onClose} style={{ padding: '8px 16px', borderRadius: 6, border: '1px solid var(--border-color)', background: 'transparent' }}>
                Cancel
              </button>
              <button
                onClick={handleInsertSeal}
                disabled={!sealImg}
                style={{
                  padding: '8px 20px',
                  borderRadius: 6,
                  border: 'none',
                  background: sealImg ? 'var(--primary)' : '#cbd5e1',
                  color: '#fff',
                  fontWeight: 700,
                  cursor: sealImg ? 'pointer' : 'not-allowed',
                }}
              >
                Apply Seal
              </button>
            </div>
          </div>
        )}

        {/* SIGN TAB CONTENT */}
        {activeTab === 'sign' && (
          <div>
            <h4 style={{ margin: '0 0 12px 0', fontSize: 15, fontWeight: 700 }}>Upload &amp; Place Your Signature</h4>

            <div style={{
              border: '2px dashed #cbd5e1',
              borderRadius: 8,
              padding: '20px 16px',
              textAlign: 'center',
              background: '#f8fafc',
              marginBottom: 16,
            }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--primary)', cursor: 'pointer', marginBottom: 6 }}>
                📁 Select Your Signature Image (PNG / JPG / WebP)
              </label>
              <input type="file" accept="image/*" onChange={handleSignFileUpload} style={{ fontSize: 13 }} />
            </div>

            {/* Optional Signer Details */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Signer Name (Optional)</label>
                <input
                  type="text"
                  value={typedName}
                  onChange={(e) => setTypedName(e.target.value)}
                  placeholder="e.g. John Doe"
                  style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid var(--border-color)' }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Designation / Title (Optional)</label>
                <input
                  type="text"
                  value={signTitle}
                  onChange={(e) => setSignTitle(e.target.value)}
                  placeholder="e.g. Authorized Signatory"
                  style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid var(--border-color)' }}
                />
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Signature Alignment</label>
              <select
                value={signAlign}
                onChange={(e) => setSignAlign(e.target.value as any)}
                style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid var(--border-color)' }}
              >
                <option value="right">Right Side (Standard)</option>
                <option value="left">Left Side</option>
                <option value="center">Center</option>
              </select>
            </div>

            {/* Signature Preview Box */}
            {signImg ? (
              <div style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: 8,
                padding: 16,
                textAlign: signAlign,
                marginBottom: 20,
              }}>
                <div style={{ display: 'inline-block', textAlign: 'center' }}>
                  <img src={signImg} style={{ width: 160, height: 'auto', display: 'block', margin: '0 auto 4px auto' }} alt="Uploaded Signature Preview" />
                  {typedName && <div style={{ fontWeight: 'bold', fontSize: 13, color: '#1e293b' }}>{typedName}</div>}
                  {signTitle && <div style={{ fontSize: 11, color: '#64748b' }}>{signTitle}</div>}
                </div>
              </div>
            ) : (
              <div style={{ fontSize: 12, color: '#94a3b8', fontStyle: 'italic', textAlign: 'center', marginBottom: 20 }}>
                No signature image uploaded yet. Please select an image file above.
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button onClick={onClose} style={{ padding: '8px 16px', borderRadius: 6, border: '1px solid var(--border-color)', background: 'transparent' }}>
                Cancel
              </button>
              <button
                onClick={handleInsertSignature}
                disabled={!signImg}
                style={{
                  padding: '8px 20px',
                  borderRadius: 6,
                  border: 'none',
                  background: signImg ? 'var(--primary)' : '#cbd5e1',
                  color: '#fff',
                  fontWeight: 700,
                  cursor: signImg ? 'pointer' : 'not-allowed',
                }}
              >
                Apply Signature
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
