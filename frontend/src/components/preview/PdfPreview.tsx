import { PdfDocumentView } from './PdfDocumentView';

interface Props {
  pdfUrl: string | null;
}

/** Single-row preview: shows every page of the currently selected row's
 * merged PDF, scrollable if it's more than one page. */
export function PdfPreview({ pdfUrl }: Props) {
  if (!pdfUrl) return <p style={{ color: '#9ca3af' }}>Select a row to preview.</p>;

  return (
    <div style={{ maxHeight: '75vh', overflowY: 'auto' }}>
      <PdfDocumentView pdfUrl={pdfUrl} />
    </div>
  );
}
