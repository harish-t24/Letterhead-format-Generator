import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
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
  ({ initialHtml, headerHtml, footerHtml, marginTop = 1.0, marginBottom = 1.0, marginLeft = 1.0, marginRight = 1.0, onChange }, ref) => {
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
              padding: `${marginTopPx}px ${marginRightPx}px ${marginBottomPx}px ${marginLeftPx}px`,
            }}
          >
            {headerHtml && (
              <div
                className="editor-header-overlay"
                style={{
                  position: 'absolute',
                  left: 0,
                  width: 794,
                  height: marginTopPx,
                  top: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  zIndex: 1,
                  padding: `0 ${marginRightPx}px 0 ${marginLeftPx}px`,
                  boxSizing: 'border-box',
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
                  width: 794,
                  height: marginBottomPx,
                  bottom: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  zIndex: 1,
                  padding: `0 ${marginRightPx}px 0 ${marginLeftPx}px`,
                  boxSizing: 'border-box',
                }}
                dangerouslySetInnerHTML={{ __html: footerHtml }}
              />
            )}
            <EditorContent editor={editor} />
          </div>
        </div>
      </div>
    );
  },
);

TemplateCreatorEditor.displayName = 'TemplateCreatorEditor';
