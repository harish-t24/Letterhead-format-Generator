import { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

interface Props {
  pdfUrl: string;
  scale?: number;
  /** Called once every page has finished rendering. */
  onLoaded?: (pageCount: number) => void;
}

/**
 * Renders EVERY page of a PDF (not just page 1) as a vertical stack of
 * canvases, the way a real document viewer (or Word/Acrobat) shows a
 * multi-page document — scroll down to see page 2, 3, etc.
 */
export function PdfDocumentView({ pdfUrl, scale = 1.3, onLoaded }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [pageCount, setPageCount] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    setPageCount(null);

    if (containerRef.current) containerRef.current.innerHTML = '';

    pdfjsLib
      .getDocument({ url: pdfUrl })
      .promise.then(async (pdf) => {
        if (cancelled) return;
        setPageCount(pdf.numPages);

        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
          if (cancelled) return;
          const page = await pdf.getPage(pageNum);
          const viewport = page.getViewport({ scale });

          const canvas = document.createElement('canvas');
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          canvas.style.display = 'block';
          canvas.style.width = '100%';
          canvas.style.maxWidth = '794px';
          canvas.style.height = 'auto';
          canvas.style.border = '1px solid #e5e7eb';
          canvas.style.marginBottom = '20px';
          canvas.style.marginLeft = 'auto';
          canvas.style.marginRight = 'auto';
          canvas.style.background = 'white';

          const ctx = canvas.getContext('2d')!;
          await page.render({ canvasContext: ctx, viewport, canvas }).promise;

          if (cancelled) return;
          containerRef.current?.appendChild(canvas);
        }

        if (!cancelled) onLoaded?.(pdf.numPages);
      })
      .catch((err) => {
        if (!cancelled) {
          setError('Could not render PDF. Is Gotenberg running? (docker compose up -d)');
          console.error(err);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [pdfUrl, scale]);

  if (error) return <p style={{ color: '#dc2626' }}>{error}</p>;

  return (
    <div>
      {loading && (
        <p style={{ color: '#9ca3af', fontSize: 13 }}>
          Rendering{pageCount ? ` (${pageCount} page${pageCount === 1 ? '' : 's'})` : '…'}
        </p>
      )}
      <div ref={containerRef} />
    </div>
  );
}
