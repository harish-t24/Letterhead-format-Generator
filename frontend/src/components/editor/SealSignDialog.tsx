import { useState, useRef } from 'react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onApplySeal: (sealHtml: string) => void;
  onApplySignature: (signHtml: string) => void;
}

export const DEFAULT_SEAL_BASE64 = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="140" height="140" viewBox="0 0 140 140">
  <circle cx="70" cy="70" r="64" fill="none" stroke="#2563eb" stroke-width="4" stroke-dasharray="6,4"/>
  <circle cx="70" cy="70" r="56" fill="none" stroke="#2563eb" stroke-width="2"/>
  <circle cx="70" cy="70" r="44" fill="none" stroke="#2563eb" stroke-width="1.5"/>
  <path id="curveTop" fill="none" d="M 30 70 A 40 40 0 0 1 110 70" />
  <text fill="#2563eb" font-size="10" font-weight="bold" font-family="Arial" letter-spacing="1.5">
    <textPath href="#curveTop" startOffset="50%" text-anchor="middle">OFFICIAL SEAL</textPath>
  </text>
  <path id="curveBottom" fill="none" d="M 110 70 A 40 40 0 0 1 30 70" />
  <text fill="#2563eb" font-size="9" font-weight="bold" font-family="Arial" letter-spacing="1">
    <textPath href="#curveBottom" startOffset="50%" text-anchor="middle">VERIFIED &amp; APPROVED</textPath>
  </text>
  <polygon points="70,52 74,62 85,62 76,68 80,78 70,72 60,78 64,68 55,62 66,62" fill="#2563eb" opacity="0.85"/>
  <text x="70" y="88" fill="#2563eb" font-size="10" font-weight="bold" font-family="Arial" text-anchor="middle">SHINECRAFT</text>
</svg>
`)}`;

export const DEFAULT_SIGNATURE_BASE64 = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="200" height="70" viewBox="0 0 200 70">
  <path d="M 20 45 C 35 15, 45 60, 60 30 C 70 10, 80 50, 95 35 C 110 20, 120 45, 140 25 C 155 10, 160 55, 185 30" fill="none" stroke="#1e3a8a" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M 15 50 Q 80 40 180 48" fill="none" stroke="#1e3a8a" stroke-width="1.5" stroke-linecap="round"/>
</svg>
`)}`;

async function svgToPngBase64(svgUrl: string, width: number, height: number): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/png'));
      } else {
        resolve(svgUrl);
      }
    };
    img.onerror = () => resolve(svgUrl);
    img.src = svgUrl;
  });
}

export function SealSignDialog({ isOpen, onClose, onApplySeal, onApplySignature }: Props) {
  const [activeTab, setActiveTab] = useState<'seal' | 'sign'>('seal');

  // Seal state
  const [sealImg, setSealImg] = useState<string>(DEFAULT_SEAL_BASE64);
  const [sealAlign, setSealAlign] = useState<'left' | 'center' | 'right'>('right');
  const [sealWidth, setSealWidth] = useState<number>(120);

  // Sign state
  const [signType, setSignType] = useState<'draw' | 'upload' | 'type'>('draw');
  const [signImg, setSignImg] = useState<string>(DEFAULT_SIGNATURE_BASE64);
  const [typedName, setTypedName] = useState<string>('John Doe');
  const [signTitle, setSignTitle] = useState<string>('Authorized Signatory');
  const [signAlign, setSignAlign] = useState<'left' | 'right'>('right');

  // Canvas drawing ref
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawing = useRef(false);

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

  // Canvas drawing functions
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    isDrawing.current = true;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#1e3a8a';
    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    isDrawing.current = false;
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx?.clearRect(0, 0, canvas.width, canvas.height);
  };

  const handleInsertSeal = async () => {
    let finalSealSrc = sealImg;
    if (sealImg.startsWith('data:image/svg+xml')) {
      finalSealSrc = await svgToPngBase64(sealImg, 280, 280);
    }
    const sealHtml = `<div style="text-align: ${sealAlign}; margin-top: 16px; margin-bottom: 16px;"><img src="${finalSealSrc}" style="width: ${sealWidth}px; height: auto; display: inline-block;" alt="Company Seal" /></div>`;
    onApplySeal(sealHtml);
    onClose();
  };

  const handleInsertSignature = async () => {
    let finalSignSrc = signImg;

    if (signType === 'draw' && canvasRef.current) {
      finalSignSrc = canvasRef.current.toDataURL('image/png');
    } else if (signType === 'type') {
      const typeCanvas = document.createElement('canvas');
      typeCanvas.width = 300;
      typeCanvas.height = 80;
      const ctx = typeCanvas.getContext('2d')!;
      ctx.font = 'italic 32px "Brush Script MT", "Caveat", cursive, sans-serif';
      ctx.fillStyle = '#1e3a8a';
      ctx.fillText(typedName || 'Signer', 20, 50);
      finalSignSrc = typeCanvas.toDataURL('image/png');
    } else if (signImg.startsWith('data:image/svg+xml')) {
      finalSignSrc = await svgToPngBase64(signImg, 400, 140);
    }

    const signHtml = `<div style="text-align: ${signAlign}; margin-top: 24px; margin-bottom: 12px; display: flex; flex-direction: column; align-items: ${signAlign === 'right' ? 'flex-end' : signAlign === 'left' ? 'flex-start' : 'center'};">
      <img src="${finalSignSrc}" style="width: 160px; height: auto; display: block; margin-bottom: 4px;" alt="Signature" />
      <div style="font-weight: bold; font-size: 13px; color: #1e293b;">${typedName}</div>
      <div style="font-size: 11px; color: #64748b;">${signTitle}</div>
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
              🏵️ Put Seal
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
              ✍️ Add Signature
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
            <h4 style={{ margin: '0 0 12px 0', fontSize: 15, fontWeight: 700 }}>Configure Company Seal / Stamp</h4>
            
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Upload Seal Image (PNG/JPG)</label>
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
                  max="200"
                  value={sealWidth}
                  onChange={(e) => setSealWidth(Number(e.target.value))}
                  style={{ width: '100%' }}
                />
              </div>
            </div>

            {/* Seal Preview Box */}
            <div style={{
              background: '#f8fafc',
              border: '1px dashed #cbd5e1',
              borderRadius: 8,
              padding: 16,
              textAlign: sealAlign,
              marginBottom: 20,
            }}>
              <img src={sealImg} style={{ width: sealWidth, height: 'auto', display: 'inline-block' }} alt="Seal Preview" />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button onClick={onClose} style={{ padding: '8px 16px', borderRadius: 6, border: '1px solid var(--border-color)', background: 'transparent' }}>
                Cancel
              </button>
              <button onClick={handleInsertSeal} style={{ padding: '8px 20px', borderRadius: 6, border: 'none', background: 'var(--primary)', color: '#fff', fontWeight: 700 }}>
                Apply Seal
              </button>
            </div>
          </div>
        )}

        {/* SIGN TAB CONTENT */}
        {activeTab === 'sign' && (
          <div>
            <h4 style={{ margin: '0 0 12px 0', fontSize: 15, fontWeight: 700 }}>Add Signature &amp; Signer Details</h4>

            {/* Sub-tabs for Signature source */}
            <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
              <button
                onClick={() => setSignType('draw')}
                style={{
                  padding: '6px 12px',
                  borderRadius: 4,
                  fontSize: 12,
                  fontWeight: 600,
                  border: '1px solid var(--border-color)',
                  background: signType === 'draw' ? 'var(--bg-secondary)' : 'transparent',
                }}
              >
                🖊️ Draw
              </button>
              <button
                onClick={() => setSignType('type')}
                style={{
                  padding: '6px 12px',
                  borderRadius: 4,
                  fontSize: 12,
                  fontWeight: 600,
                  border: '1px solid var(--border-color)',
                  background: signType === 'type' ? 'var(--bg-secondary)' : 'transparent',
                }}
              >
                ⌨️ Type Name
              </button>
              <button
                onClick={() => setSignType('upload')}
                style={{
                  padding: '6px 12px',
                  borderRadius: 4,
                  fontSize: 12,
                  fontWeight: 600,
                  border: '1px solid var(--border-color)',
                  background: signType === 'upload' ? 'var(--bg-secondary)' : 'transparent',
                }}
              >
                📁 Upload File
              </button>
            </div>

            {/* Drawing Canvas */}
            {signType === 'draw' && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <label style={{ fontSize: 12, fontWeight: 600 }}>Draw your signature below:</label>
                  <button onClick={clearCanvas} style={{ fontSize: 11, color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer' }}>
                    Clear Canvas
                  </button>
                </div>
                <canvas
                  ref={canvasRef}
                  width={470}
                  height={100}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                  style={{
                    background: '#ffffff',
                    border: '1px solid var(--border-color)',
                    borderRadius: 6,
                    cursor: 'crosshair',
                    touchAction: 'none',
                    width: '100%',
                  }}
                />
              </div>
            )}

            {/* Type Signature */}
            {signType === 'type' && (
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Type Name</label>
                <input
                  type="text"
                  value={typedName}
                  onChange={(e) => setTypedName(e.target.value)}
                  placeholder="Enter Signer Full Name"
                  style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid var(--border-color)', marginBottom: 8 }}
                />
                <div style={{
                  fontFamily: 'italic 28px "Brush Script MT", cursive',
                  color: '#1e3a8a',
                  padding: '12px',
                  background: '#f8fafc',
                  borderRadius: 6,
                  textAlign: 'center',
                }}>
                  {typedName || 'Signer Name'}
                </div>
              </div>
            )}

            {/* Upload Signature */}
            {signType === 'upload' && (
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Upload Signature File</label>
                <input type="file" accept="image/*" onChange={handleSignFileUpload} style={{ fontSize: 13 }} />
              </div>
            )}

            {/* Signer Details */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Signer Name</label>
                <input
                  type="text"
                  value={typedName}
                  onChange={(e) => setTypedName(e.target.value)}
                  placeholder="e.g. John Doe"
                  style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid var(--border-color)' }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Designation / Title</label>
                <input
                  type="text"
                  value={signTitle}
                  onChange={(e) => setSignTitle(e.target.value)}
                  placeholder="e.g. Director / Authorized Signatory"
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
              </select>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button onClick={onClose} style={{ padding: '8px 16px', borderRadius: 6, border: '1px solid var(--border-color)', background: 'transparent' }}>
                Cancel
              </button>
              <button onClick={handleInsertSignature} style={{ padding: '8px 20px', borderRadius: 6, border: 'none', background: 'var(--primary)', color: '#fff', fontWeight: 700 }}>
                Apply Signature
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
