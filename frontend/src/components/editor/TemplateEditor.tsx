import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { TextStyle } from '@tiptap/extension-text-style';
import FontFamily from '@tiptap/extension-font-family';
import { Color } from '@tiptap/extension-color';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import Highlight from '@tiptap/extension-highlight';
import { FontSize } from './TemplateCreatorEditor';
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
      Subscript,
      Superscript,
      Highlight.configure({ multicolor: true }),
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
    <div className="template-editor">
      <EditorContent editor={editor} />
    </div>
  );
}
