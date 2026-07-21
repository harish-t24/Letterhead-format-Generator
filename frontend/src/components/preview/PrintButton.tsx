interface Props {
  pdfUrl: string | null;
}

/** Opens the merged PDF in a new tab and immediately triggers the
 * browser's native print dialog on it. */
export function PrintButton({ pdfUrl }: Props) {
  const handlePrint = () => {
    if (!pdfUrl) return;
    const win = window.open(pdfUrl, '_blank');
    win?.addEventListener('load', () => win.print());
  };

  return (
    <button
      onClick={handlePrint}
      disabled={!pdfUrl}
      style={{
        padding: '6px 14px',
        borderRadius: 6,
        border: '1px solid #374151',
        background: 'white',
        cursor: pdfUrl ? 'pointer' : 'not-allowed',
        opacity: pdfUrl ? 1 : 0.5,
      }}
    >
      Print
    </button>
  );
}
