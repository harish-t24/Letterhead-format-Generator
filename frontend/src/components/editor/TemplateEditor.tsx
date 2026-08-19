import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { ResizableImage } from './extensions/ResizableImage';
import { TextStyle } from '@tiptap/extension-text-style';
import FontFamily from '@tiptap/extension-font-family';
import { Color } from '@tiptap/extension-color';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { FontSize, HighlightStyle } from './TemplateCreatorEditor';
import { PageBreak } from './PageBreak';
import { useEffect } from 'react';

interface Props {
  html: string;
  /** Editing is read-only in this MVP: the imported template's structure
   * is the source of truth, and edits happen at the DOCX level if needed.
   * Flip editable to true once you wire up "save changes back to docx". */
  editable?: boolean;
}

/**
 * Shows the imported template's content (converted from DOCX via mammoth
 * on the backend). Placeholders appear inline as literal {name} text —
 * highlighted with CSS below — matching exactly what will be merged.
 */
export function TemplateEditor({ html, editable = false }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      TextStyle,
      FontFamily,
      Color,
      FontSize,
      HighlightStyle,
      Subscript,
      Superscript,
      PageBreak,
      ResizableImage,
      Table.configure({
        HTMLAttributes: {
          class: 'editor-table',
        },
      }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: html,
    editable,
  });

  useEffect(() => {
    if (editor && html) {
      editor.commands.setContent(html);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [html, editor]);

  if (!editor) return null;

  return (
    <div className="editor-desk">
      <div className="template-editor" style={{ padding: '60px 60px' }}>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
