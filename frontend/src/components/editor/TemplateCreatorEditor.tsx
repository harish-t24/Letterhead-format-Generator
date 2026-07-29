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
import { useEffect, useImperativeHandle, forwardRef } from 'react';
import { EditorToolbar } from './EditorToolbar';
import { PageBreak } from './PageBreak';

export const FontSize = Extension.create({
  name: 'fontSize',

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
          fontSize: {
            default: null,
            parseHTML: (element) => element.style.fontSize,
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

export interface TemplateCreatorEditorHandle {
  getHTML: () => string;
  /** Inserts `{name}` at the current cursor position (click-to-insert
   *  from the Placeholders panel). */
  insertPlaceholder: (name: string) => void;
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
 * Paste handling is left to TipTap/ProseMirror's default HTML parsing
 * (no custom paste rules), which is what preserves bullet/numbered
 * lists and inline formatting when pasting from Word/Google Docs/etc.
 * StarterKit's List/Bold/Italic nodes are exactly what those pasted
 * HTML tags (<ul>, <ol>, <strong>, <em>) map onto.
 */
export const TemplateCreatorEditor = forwardRef<TemplateCreatorEditorHandle, Props>(
  ({ initialHtml, headerHtml, footerHtml, marginTop = 5.4 / 2.54, marginBottom = 0.63 / 2.54, marginLeft = 2.16 / 2.54, marginRight = 1.27 / 2.54, onChange }, ref) => {
    const editor = useEditor({
      extensions: [
        StarterKit,
        Underline,
        TextStyle,
        FontFamily,
        Color,
        FontSize,
        HighlightStyle,
        Subscript,
        Superscript,
        PageBreak,
        ResizableImage,
        TextAlign.configure({ types: ['heading', 'paragraph'] }),
        Table.configure({
          HTMLAttributes: {
            class: 'editor-table',
          },
        }),
        TableRow,
        TableHeader,
        TableCell,
      ],
      content: initialHtml,
      editable: true,
      parseOptions: {
        preserveWhitespace: 'full',
      },
      editorProps: {
        transformPastedHTML: (html) => {
          return html;
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
    }));

    useEffect(() => {
      return () => editor?.destroy();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Convert inches to pixels (1 inch = 96px)
    const marginTopPx = marginTop * 96;
    const marginBottomPx = marginBottom * 96;
    const marginLeftPx = marginLeft * 96;
    const marginRightPx = marginRight * 96;

    return (
      <div style={{ position: 'relative', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
        <div style={{ position: 'sticky', top: 0, zIndex: 10, background: 'var(--bg-surface)', borderBottom: '1px solid var(--border-color)' }}>
          <EditorToolbar editor={editor} />
        </div>
        <div className="editor-desk" style={{ position: 'relative' }}>
          <div
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
            }}
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
