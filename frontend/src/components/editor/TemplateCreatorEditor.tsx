import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { ResizableImage } from './extensions/ResizableImage';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import { TextStyle } from '@tiptap/extension-text-style';
import FontFamily from '@tiptap/extension-font-family';
import { Color } from '@tiptap/extension-color';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { Extension } from '@tiptap/core';
import { useEffect, useImperativeHandle, forwardRef, useState, useRef } from 'react';
import { EditorToolbar } from './EditorToolbar';
import { PageBreak } from './PageBreak';

import Bold from '@tiptap/extension-bold';

export const CustomBold = Bold.extend({
  parseHTML() {
    return [
      { tag: 'strong' },
      { tag: 'b', getAttrs: (node) => (node as HTMLElement).style?.fontWeight !== 'normal' && null },
      {
        style: 'font-weight',
        getAttrs: (value) => /^(bold|bolder|[5-9]\d{2})$/i.test(value as string) && null,
      },
    ];
  },
});

export const LineHeight = Extension.create({
  name: 'lineHeight',

  addOptions() {
    return {
      types: ['paragraph', 'heading', 'listItem', 'textStyle'],
    };
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          lineHeight: {
            default: null,
            parseHTML: (element) => element.style.lineHeight || null,
            renderHTML: (attributes) => {
              if (!attributes.lineHeight) {
                return {};
              }
              return {
                style: `line-height: ${attributes.lineHeight}`,
              };
            },
          },
        },
      },
    ];
  },

  addCommands(): any {
    return {
      setLineHeight: (lineHeight: string) => ({ chain }: any) => {
        return chain()
          .setNode('paragraph', { lineHeight })
          .run();
      },
      unsetLineHeight: () => ({ chain }: any) => {
        return chain()
          .setNode('paragraph', { lineHeight: null })
          .run();
      },
    };
  },
});

export const FontSize = Extension.create({
  name: 'fontSize',

  addOptions() {
    return {
      types: ['textStyle', 'paragraph', 'heading'],
    };
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontSize: {
            default: null,
            parseHTML: (element) => element.style.fontSize || element.getAttribute('size') || null,
            renderHTML: (attributes) => {
              if (!attributes.fontSize) {
                return {};
              }
              return {
                style: `font-size: ${attributes.fontSize}`,
              };
            },
          },
        },
      },
    ];
  },

  addCommands(): any {
    return {
      setFontSize: (fontSize: string) => ({ chain }: any) => {
        return chain()
          .setMark('textStyle', { fontSize })
          .run();
      },
      unsetFontSize: () => ({ chain }: any) => {
        return chain()
          .setMark('textStyle', { fontSize: null })
          .run();
      },
    };
  },
});

export const HighlightStyle = Extension.create({
  name: 'highlightStyle',

  addOptions() {
    return {
      types: ['textStyle'],
    };
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          backgroundColor: {
            default: null,
            parseHTML: (element) => element.style.backgroundColor || element.style.background,
            renderHTML: (attributes) => {
              if (!attributes.backgroundColor) {
                return {};
              }
              return {
                style: `background-color: ${attributes.backgroundColor}`,
              };
            },
          },
        },
      },
    ];
  },

  addCommands(): any {
    return {
      setHighlightColor: (color: string) => ({ chain }: any) => {
        return chain()
          .setMark('textStyle', { backgroundColor: color })
          .run();
      },
      unsetHighlightColor: () => ({ chain }: any) => {
        return chain()
          .setMark('textStyle', { backgroundColor: null })
          .run();
      },
    };
  },
});

export const CustomTableCell = TableCell.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      style: {
        default: null,
        parseHTML: (element) => element.getAttribute('style'),
        renderHTML: (attributes) => {
          if (!attributes.style) return {};
          return { style: attributes.style };
        },
      },
    };
  },
});

export const CustomTableHeader = TableHeader.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      style: {
        default: null,
        parseHTML: (element) => element.getAttribute('style'),
        renderHTML: (attributes) => {
          if (!attributes.style) return {};
          return { style: attributes.style };
        },
      },
    };
  },
});

export const CustomTable = Table.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      style: {
        default: null,
        parseHTML: (element) => element.getAttribute('style'),
        renderHTML: (attributes) => {
          if (!attributes.style) return {};
          return { style: attributes.style };
        },
      },
    };
  },
});

export const CustomStyleExtension = Extension.create({
  name: 'customStyleExtension',
  addGlobalAttributes() {
    return [
      {
        types: ['textStyle', 'paragraph', 'heading', 'listItem'],
        attributes: {
          style: {
            default: null,
            parseHTML: (element) => element.getAttribute('style'),
            renderHTML: (attributes) => {
              if (!attributes.style) return {};
              return { style: attributes.style };
            },
          },
        },
      },
    ];
  },
});

export interface TemplateCreatorEditorHandle {
  getHTML: () => string;
  /** Inserts `{name}` at the current cursor position (click-to-insert
   *  from the Placeholders panel). */
  insertPlaceholder: (name: string) => void;
  insertSeal: () => void;
  insertSign: () => void;
}

interface Props {
  initialHtml: string;
  headerHtml?: string;
  footerHtml?: string;
  marginTop?: number;
  marginBottom?: number;
  marginLeft?: number;
  marginRight?: number;
  /** Fires on every content change (typing, pasting, formatting, etc.)
   *  with the current HTML — lets the parent debounce and auto-save so
   *  the preview updates dynamically without a manual Save click. */
  onChange?: (html: string) => void;
}

/**
 * The actual "type your letter" editor for the New Template flow.
 *
 * Deliberately does NOT render any header/footer -- those only appear
 * in the PDF Preview. This is a plain body-content editor, the same way
 * Word's page body is what you type in while the header/footer stay
 * fixed at the top/bottom of the printed page.
 *
 * Paste handling preserves exact source formatting (text fonts, colors,
 * highlight backgrounds, tables, borders, cell padding, and images).
 */
export const TemplateCreatorEditor = forwardRef<TemplateCreatorEditorHandle, Props>(
  ({ initialHtml, headerHtml, footerHtml, marginTop = 5.4 / 2.54, marginBottom = 0.63 / 2.54, marginLeft = 2.16 / 2.54, marginRight = 1.27 / 2.54, onChange }, ref) => {
    const editor = useEditor({
      extensions: [
        StarterKit.configure({ bold: false }),
        CustomBold,
        Underline,
        TextStyle,
        FontFamily,
        Color,
        FontSize,
        LineHeight,
        HighlightStyle,
        Subscript,
        Superscript,
        PageBreak,
        ResizableImage,
        CustomStyleExtension,
        TextAlign.configure({ types: ['heading', 'paragraph'] }),
        CustomTable.configure({
          HTMLAttributes: {
            class: 'editor-table',
          },
        }),
        TableRow,
        CustomTableHeader,
        CustomTableCell,
      ],
      content: initialHtml,
      editable: true,
      parseOptions: {
        preserveWhitespace: 'full',
      },
      editorProps: {
        transformPastedHTML: (html) => {
          if (!html) return '';

          let cleaned = html;

          // 1. Clean MSO conditional comments and Word XML junk
          cleaned = cleaned.replace(/<!--\[if[\s\S]*?<!\[endif\]-->/gi, '');
          cleaned = cleaned.replace(/<xml>[\s\S]*?<\/xml>/gi, '');

          // 2. Convert Word / CSS page breaks to standard <div class="page-break"></div>
          cleaned = cleaned.replace(/<(div|p|br|hr)[^>]*style=["'][^"']*(page-break-before\s*:\s*always|break-before\s*:\s*page)[^"']*["'][^>]*\/?>/gi, '<div class="page-break"></div>');

          // 3. Convert bold/italic/underline style spans and tags to semantic HTML
          cleaned = cleaned.replace(/<span([^>]*?style=["'][^"']*font-weight\s*:\s*(bold|[5-9]\d{2})[^"']*["'][^>]*)>(.*?)<\/span>/gi, '<strong>$3</strong>');
          cleaned = cleaned.replace(/<b\b([^>]*)>(.*?)<\/b>/gi, '<strong>$2</strong>');
          cleaned = cleaned.replace(/<i\b([^>]*)>(.*?)<\/i>/gi, '<em>$2</em>');
          cleaned = cleaned.replace(/<u\b([^>]*)>(.*?)<\/u>/gi, '<u>$2</u>');

          // 4. Convert legacy <font face="..." color="..." size="..."> to <span style="...">
          cleaned = cleaned.replace(/<font([^>]*?)>(.*?)<\/font>/gi, (_match, attrs, inner) => {
            const faceMatch = attrs.match(/face=["']([^"']+)["']/i);
            const colorMatch = attrs.match(/color=["']([^"']+)["']/i);
            const sizeMatch = attrs.match(/size=["']([^"']+)["']/i);

            const styles: string[] = [];
            if (faceMatch) styles.push(`font-family: ${faceMatch[1]}`);
            if (colorMatch) styles.push(`color: ${colorMatch[1]}`);
            if (sizeMatch) {
              const sizeMap: Record<string, string> = {
                '1': '10px',
                '2': '13px',
                '3': '16px',
                '4': '18px',
                '5': '24px',
                '6': '32px',
                '7': '48px',
              };
              styles.push(`font-size: ${sizeMap[sizeMatch[1]] || '16px'}`);
            }

            if (styles.length > 0) {
              return `<span style="${styles.join('; ')}">${inner}</span>`;
            }
            return inner;
          });

          return cleaned;
        },
        transformPastedText: (text) => {
          if (!text) return '';
          // Convert plain text multiline newlines into HTML paragraphs so line breaks are preserved
          return text
            .split(/\r?\n\r?\n/)
            .map((p) => `<p>${p.replace(/\r?\n/g, '<br />')}</p>`)
            .join('');
        },
        handlePaste: (view, event) => {
          const items = Array.from(event.clipboardData?.items || []);
          const imageItem = items.find((item) => item.type.startsWith('image/'));

          if (imageItem) {
            const file = imageItem.getAsFile();
            if (file) {
              event.preventDefault();
              const reader = new FileReader();
              reader.onload = (e) => {
                const base64 = e.target?.result as string;
                if (base64) {
                  const { schema, tr } = view.state;
                  const imageType = schema.nodes.image;
                  if (imageType) {
                    const node = imageType.create({ src: base64, alt: file.name || 'Pasted Image' });
                    const transaction = tr.replaceSelectionWith(node);
                    view.dispatch(transaction);
                  }
                }
              };
              reader.readAsDataURL(file);
              return true;
            }
          }

          const files = Array.from(event.clipboardData?.files || []);
          const imageFile = files.find((f) => f.type.startsWith('image/'));
          if (imageFile) {
            event.preventDefault();
            const reader = new FileReader();
            reader.onload = (e) => {
              const base64 = e.target?.result as string;
              if (base64) {
                const { schema, tr } = view.state;
                const imageType = schema.nodes.image;
                if (imageType) {
                  const node = imageType.create({ src: base64, alt: imageFile.name || 'Pasted Image' });
                  const transaction = tr.replaceSelectionWith(node);
                  view.dispatch(transaction);
                }
              }
            };
            reader.readAsDataURL(imageFile);
            return true;
          }

          return false;
        },
      },
      onUpdate: ({ editor }) => {
        // Fires for typed keystrokes AND pasted content alike, since
        // both go through ProseMirror's transaction pipeline.
        onChange?.(editor.getHTML());
      },
    });

    useImperativeHandle(ref, () => ({
      getHTML: () => editor?.getHTML() ?? '',
      insertPlaceholder: (name: string) => {
        editor?.chain().focus().insertContent(`{${name}}`).run();
      },
      insertSeal: (sealSrc?: string) => {
        if (!editor || !sealSrc) return;
        (editor.chain().focus() as any).setImage({ src: sealSrc, alt: 'Official Seal' }).run();
      },
      insertSign: (signSrc?: string) => {
        if (!editor || !signSrc) return;
        (editor.chain().focus() as any).setImage({ src: signSrc, alt: 'Authorized Signatory' }).run();
      },
    }));

    useEffect(() => {
      return () => editor?.destroy();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const [pageCount, setPageCount] = useState<number>(1);
    const editorPaperRef = useRef<HTMLDivElement>(null);

    // Convert inches to pixels (1 inch = 96px)
    const marginTopPx = marginTop * 96;
    const marginBottomPx = marginBottom * 96;
    const marginLeftPx = marginLeft * 96;
    const marginRightPx = marginRight * 96;

    useEffect(() => {
      const updatePages = () => {
        if (editorPaperRef.current) {
          const contentHeight = editorPaperRef.current.scrollHeight;
          // Count manual page breaks + auto height bounds (1123px per A4 page)
          const manualBreaks = editorPaperRef.current.querySelectorAll('.page-break').length;
          const autoHeightPages = Math.max(1, Math.ceil(contentHeight / 1123));
          setPageCount(Math.max(autoHeightPages, manualBreaks + 1));
        }
      };

      updatePages();
      const observer = new ResizeObserver(updatePages);
      if (editorPaperRef.current) {
        observer.observe(editorPaperRef.current);
      }
      return () => observer.disconnect();
    }, [initialHtml, editor?.getHTML()]);

    return (
      <div style={{ position: 'relative', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
        <div style={{ position: 'sticky', top: 70, zIndex: 90, background: 'var(--bg-surface)', borderBottom: '1px solid var(--border-color)', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)' }}>
          <EditorToolbar editor={editor} />
          <div
            style={{
              background: '#f8fafc',
              padding: '6px 16px',
              borderTop: '1px solid var(--border-color)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 8,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                📄 Page-by-Page Document Canvas
              </span>
              <span
                style={{
                  background: 'var(--primary-light)',
                  color: 'var(--primary)',
                  border: '1px solid #c7d2fe',
                  padding: '2px 10px',
                  borderRadius: 99,
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                {pageCount} {pageCount === 1 ? 'Page (A4)' : 'Pages (A4)'}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 12, color: 'var(--text-secondary)' }}>
              <span>Format: 210 × 297 mm (A4)</span>
              <span>•</span>
              <span>Visual Page Separators Enabled</span>
            </div>
          </div>
        </div>
        <div className="editor-desk" style={{ position: 'relative' }}>
          <div
            ref={editorPaperRef}
            className="template-creator-editor"
            style={{
              position: 'relative',
              maxWidth: '794px',
              width: '100%',
              margin: '0 auto',
              minHeight: '1123px',
              padding: 0,
              boxSizing: 'border-box',
              background: '#ffffff',
              '--editor-margin-top': `${marginTopPx}px`,
              '--editor-margin-bottom': `${marginBottomPx}px`,
              '--editor-margin-left': `${marginLeftPx}px`,
              '--editor-margin-right': `${marginRightPx}px`,
            } as React.CSSProperties}
          >
            {headerHtml && (
              <div
                className="editor-header-overlay"
                style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  width: '100%',
                  zIndex: 1,
                  padding: 0,
                  margin: 0,
                  boxSizing: 'border-box',
                  pointerEvents: 'none',
                }}
                dangerouslySetInnerHTML={{ __html: headerHtml }}
              />
            )}
            {footerHtml && (
              <div
                className="editor-footer-overlay"
                style={{
                  position: 'absolute',
                  left: 0,
                  bottom: 0,
                  width: '100%',
                  zIndex: 1,
                  padding: 0,
                  margin: 0,
                  boxSizing: 'border-box',
                  pointerEvents: 'none',
                }}
                dangerouslySetInnerHTML={{ __html: footerHtml }}
              />
            )}
            <div style={{ padding: `${marginTopPx}px ${marginRightPx}px ${marginBottomPx}px ${marginLeftPx}px`, boxSizing: 'border-box', minHeight: '100%' }}>
              <EditorContent editor={editor} />
            </div>
          </div>
        </div>
      </div>
    );
  },
);

TemplateCreatorEditor.displayName = 'TemplateCreatorEditor';
