import { useRef } from 'react';
import type { Editor } from '@tiptap/core';
import { DEFAULT_SEAL_PNG, DEFAULT_SIGN_PNG } from '../../assets/default-seal-sign';

interface Props {
  editor: Editor | null;
}

const btnStyle = (active: boolean): React.CSSProperties => ({
  padding: '4px 9px',
  fontSize: 13,
  border: '1px solid #d1d5db',
  background: active ? '#4f46e5' : 'white',
  color: active ? 'white' : '#111827',
  cursor: 'pointer',
  borderRadius: 4,
  transition: 'transform 0.15s ease, background-color 0.15s ease, box-shadow 0.15s ease',
  boxShadow: active ? '0 2px 8px rgba(79, 70, 229, 0.3)' : 'none',
});

const groupStyle: React.CSSProperties = {
  display: 'flex',
  gap: 4,
  paddingRight: 8,
  marginRight: 8,
  borderRight: '1px solid #e5e7eb',
};

/**
 * A Word-style formatting toolbar: bold/italic/underline, bullet/numbered
 * lists, text alignment, and line spacing. Everything here edits the
 * BODY content only -- header/footer (if any) are fixed and never shown
 * or editable here, only in the rendered Preview.
 */
export function EditorToolbar({ editor }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!editor) return null;

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && editor) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const base64 = ev.target?.result as string;
        if (base64) {
          (editor.chain().focus() as any).setImage({ src: base64, alt: file.name }).run();
        }
      };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: 6,
        padding: '8px 12px',
        border: '1px solid var(--border-color)',
        borderBottom: 'none',
        borderRadius: 'var(--radius-sm) var(--radius-sm) 0 0',
        background: 'var(--bg-surface)',
      }}
    >
      <div style={groupStyle}>
        <select
          onChange={(e) => {
            const val = e.target.value;
            if (val === 'p') editor.chain().focus().setParagraph().run();
            else if (val === 'h1') editor.chain().focus().toggleHeading({ level: 1 }).run();
            else if (val === 'h2') editor.chain().focus().toggleHeading({ level: 2 }).run();
            else if (val === 'h3') editor.chain().focus().toggleHeading({ level: 3 }).run();
          }}
          value={
            editor.isActive('heading', { level: 1 }) ? 'h1' :
            editor.isActive('heading', { level: 2 }) ? 'h2' :
            editor.isActive('heading', { level: 3 }) ? 'h3' : 'p'
          }
          style={{ fontSize: 12, padding: '3px 4px', border: '1px solid #d1d5db', borderRadius: 4, width: 105 }}
          title="Text Styles (Normal, Headings)"
        >
          <option value="p">Normal text</option>
          <option value="h1">Heading 1</option>
          <option value="h2">Heading 2</option>
          <option value="h3">Heading 3</option>
        </select>
        <select
          onChange={(e) => {
            const val = e.target.value;
            if (!val) {
              editor.chain().focus().unsetFontFamily().run();
            } else {
              editor.chain().focus().setFontFamily(val).run();
            }
          }}
          defaultValue=""
          style={{ fontSize: 12, padding: '3px 4px', border: '1px solid #d1d5db', borderRadius: 4, width: 95 }}
          title="Font Family (Select Font to reset)"
        >
          <option value="">Font</option>
          <option value="Arial">Arial</option>
          <option value="Georgia">Georgia</option>
          <option value="Calibri">Calibri</option>
          <option value="'Courier New'">Courier New</option>
          <option value="'Times New Roman'">Times New Roman</option>
          <option value="'Outfit'">Outfit</option>
        </select>
        <select
          onChange={(e) => {
            const val = e.target.value;
            if (!val) {
              (editor.chain().focus() as any).unsetFontSize().run();
            } else {
              (editor.chain().focus() as any).setFontSize(val).run();
            }
          }}
          defaultValue=""
          style={{ fontSize: 12, padding: '3px 4px', border: '1px solid #d1d5db', borderRadius: 4, width: 55 }}
          title="Font Size (Select Size to reset)"
        >
          <option value="">Size</option>
          <option value="10px">10</option>
          <option value="11px">11</option>
          <option value="12px">12</option>
          <option value="14px">14</option>
          <option value="16px">16</option>
          <option value="18px">18</option>
          <option value="20px">20</option>
          <option value="24px">24</option>
          <option value="32px">32</option>
        </select>
      </div>

      <div style={groupStyle}>
        <button
          type="button"
          style={btnStyle(editor.isActive('bold'))}
          onClick={() => editor.chain().focus().toggleBold().run()}
          title="Bold"
        >
          <strong>B</strong>
        </button>
        <button
          type="button"
          style={btnStyle(editor.isActive('italic'))}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          title="Italic"
        >
          <em>I</em>
        </button>
        <button
          type="button"
          style={btnStyle(editor.isActive('underline'))}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          title="Underline"
        >
          <u>U</u>
        </button>
        <button
          type="button"
          style={btnStyle(editor.isActive('strike'))}
          onClick={() => editor.chain().focus().toggleStrike().run()}
          title="Strikethrough"
        >
          <s>S</s>
        </button>
        <button
          type="button"
          style={btnStyle(editor.isActive('subscript'))}
          onClick={() => editor.chain().focus().toggleSubscript().run()}
          title="Subscript"
        >
          X<sub>2</sub>
        </button>
        <button
          type="button"
          style={btnStyle(editor.isActive('superscript'))}
          onClick={() => editor.chain().focus().toggleSuperscript().run()}
          title="Superscript"
        >
          X<sup>2</sup>
        </button>
      </div>

      <div style={groupStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }} title="Text Color">
          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)' }}>A</span>
          <input
            type="color"
            onChange={(e) => editor.chain().focus().setColor(e.target.value).run()}
            value={editor.getAttributes('textStyle').color || '#000000'}
            style={{ width: 24, height: 24, padding: 0, border: '1px solid #d1d5db', borderRadius: 4, cursor: 'pointer', background: 'transparent' }}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }} title="Highlight Color">
          <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>🖌️</span>
          <input
            type="color"
            onChange={(e) => (editor as any).commands.setHighlightColor(e.target.value)}
            value={editor.getAttributes('textStyle').backgroundColor || '#ffff00'}
            style={{ width: 24, height: 24, padding: 0, border: '1px solid #d1d5db', borderRadius: 4, cursor: 'pointer', background: 'transparent' }}
          />
        </div>
        <button
          type="button"
          style={btnStyle(false)}
          onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
          title="Clear Formatting"
        >
          🧹 Clear
        </button>
      </div>

      <div style={groupStyle}>
        <button
          type="button"
          style={btnStyle(editor.isActive('bulletList'))}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          title="Bullet list"
        >
          • List
        </button>
        <button
          type="button"
          style={btnStyle(editor.isActive('orderedList'))}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          title="Numbered list"
        >
          1. List
        </button>
      </div>

      <div style={groupStyle}>
        <button
          type="button"
          style={btnStyle(false)}
          onClick={() => (editor as any).commands.setPageBreak()}
          title="Insert Page Break"
        >
          📄 Page Break
        </button>
      </div>

      {/* Insert Table & Image Buttons */}
      <div style={groupStyle}>
        <button
          type="button"
          style={btnStyle(false)}
          onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
          title="Insert Table (3x3)"
        >
          📅 Table
        </button>
        <button
          type="button"
          style={btnStyle(false)}
          onClick={() => fileInputRef.current?.click()}
          title="Insert Image (Upload image file or paste directly into editor)"
        >
          🖼️ Image
        </button>
        <button
          type="button"
          style={btnStyle(false)}
          onClick={() => (editor.chain().focus() as any).setImage({ src: DEFAULT_SEAL_PNG, alt: 'Official Seal' }).run()}
          title="Put Official Seal Image at cursor"
        >
          🏵️ Put Seal
        </button>
        <button
          type="button"
          style={btnStyle(false)}
          onClick={() => (editor.chain().focus() as any).setImage({ src: DEFAULT_SIGN_PNG, alt: 'Authorized Signatory' }).run()}
          title="Place Signature Image at cursor"
        >
          ✍️ Place Sign
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          hidden
          onChange={handleImageFileChange}
        />
      </div>

      {/* Table Editing Tools (Visible only when inside a table) */}
      {editor.isActive('table') && (
        <div style={{ ...groupStyle, background: 'var(--primary-light)', padding: '2px 8px', borderRadius: 6, border: '1px solid #c7d2fe', display: 'flex', flexWrap: 'wrap', gap: 4, alignItems: 'center' }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--primary)', marginRight: 4, textTransform: 'uppercase' }}>Table:</span>
          <button
            type="button"
            style={{ ...btnStyle(false), fontSize: 11, padding: '2px 6px' }}
            onClick={() => editor.chain().focus().addRowBefore().run()}
            title="Insert Row Above"
          >
            Row ↑
          </button>
          <button
            type="button"
            style={{ ...btnStyle(false), fontSize: 11, padding: '2px 6px' }}
            onClick={() => editor.chain().focus().addRowAfter().run()}
            title="Insert Row Below"
          >
            Row ↓
          </button>
          <button
            type="button"
            style={{ ...btnStyle(false), fontSize: 11, padding: '2px 6px', color: 'var(--danger)' }}
            onClick={() => editor.chain().focus().deleteRow().run()}
            title="Delete Row"
          >
            Del Row ❌
          </button>
          <button
            type="button"
            style={{ ...btnStyle(false), fontSize: 11, padding: '2px 6px' }}
            onClick={() => editor.chain().focus().addColumnBefore().run()}
            title="Insert Column Left"
          >
            Col ←
          </button>
          <button
            type="button"
            style={{ ...btnStyle(false), fontSize: 11, padding: '2px 6px' }}
            onClick={() => editor.chain().focus().addColumnAfter().run()}
            title="Insert Column Right"
          >
            Col →
          </button>
          <button
            type="button"
            style={{ ...btnStyle(false), fontSize: 11, padding: '2px 6px', color: 'var(--danger)' }}
            onClick={() => editor.chain().focus().deleteColumn().run()}
            title="Delete Column"
          >
            Del Col ❌
          </button>
          <button
            type="button"
            style={{ ...btnStyle(false), fontSize: 11, padding: '2px 6px' }}
            onClick={() => editor.chain().focus().mergeCells().run()}
            title="Merge Selected Cells"
          >
            Merge 🔗
          </button>
          <button
            type="button"
            style={{ ...btnStyle(false), fontSize: 11, padding: '2px 6px' }}
            onClick={() => editor.chain().focus().splitCell().run()}
            title="Split Cell"
          >
            Split ✂️
          </button>
          <button
            type="button"
            style={{ ...btnStyle(false), fontSize: 11, padding: '2px 6px', color: '#b91c1c', borderColor: '#fee2e2', background: '#fef2f2' }}
            onClick={() => editor.chain().focus().deleteTable().run()}
            title="Delete Entire Table"
          >
            Del Table 🗑️
          </button>
        </div>
      )}

      <div style={groupStyle}>
        <button
          type="button"
          style={btnStyle(editor.isActive({ textAlign: 'left' }))}
          onClick={() => editor.isActive({ textAlign: 'left' }) ? (editor.chain().focus() as any).unsetTextAlign().run() : editor.chain().focus().setTextAlign('left').run()}
          title="Align left (Click again to reset)"
        >
          ⟸
        </button>
        <button
          type="button"
          style={btnStyle(editor.isActive({ textAlign: 'center' }))}
          onClick={() => editor.isActive({ textAlign: 'center' }) ? (editor.chain().focus() as any).unsetTextAlign().run() : editor.chain().focus().setTextAlign('center').run()}
          title="Align center (Click again to reset)"
        >
          ⟺
        </button>
        <button
          type="button"
          style={btnStyle(editor.isActive({ textAlign: 'right' }))}
          onClick={() => editor.isActive({ textAlign: 'right' }) ? (editor.chain().focus() as any).unsetTextAlign().run() : editor.chain().focus().setTextAlign('right').run()}
          title="Align right (Click again to reset)"
        >
          ⟹
        </button>
        <button
          type="button"
          style={btnStyle(editor.isActive({ textAlign: 'justify' }))}
          onClick={() => editor.isActive({ textAlign: 'justify' }) ? (editor.chain().focus() as any).unsetTextAlign().run() : editor.chain().focus().setTextAlign('justify').run()}
          title="Justify (Click again to reset)"
        >
          ☰
        </button>
      </div>

      <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
        <label style={{ fontSize: 12, color: '#6b7280' }}>Line spacing</label>
        <select
          onChange={(e) => {
            const val = e.target.value;
            const chain = editor.chain().focus() as any;
            if (typeof chain.setLineHeight === 'function') {
              chain.setLineHeight(val).run();
            } else {
              // Fallback: apply line height styling directly
              editor.chain().focus().setMark('textStyle', { style: `line-height: ${val}` }).run();
            }
          }}
          defaultValue="1.5"
          style={{ fontSize: 12, padding: '3px 4px', border: '1px solid #d1d5db', borderRadius: 4 }}
        >
          <option value="1">1.0</option>
          <option value="1.15">1.15</option>
          <option value="1.5">1.5</option>
          <option value="2">2.0</option>
        </select>
      </div>

      <div style={{ marginLeft: 'auto', display: 'flex', gap: 4 }}>
        <button type="button" style={btnStyle(false)} onClick={() => editor.chain().focus().undo().run()}>
          ↶ Undo
        </button>
        <button type="button" style={btnStyle(false)} onClick={() => editor.chain().focus().redo().run()}>
          ↷ Redo
        </button>
      </div>
    </div>
  );
}
