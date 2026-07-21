import { Node, mergeAttributes } from '@tiptap/core';

/**
 * Renders {name}-style tokens as a non-editable "chip" inline node
 * instead of raw text, so the user can't accidentally type inside the
 * braces and break the placeholder (e.g. turning {name} into {nam}).
 *
 * The stored/serialized form is still exactly "{name}" -- this only
 * changes how it LOOKS while editing.
 */
export interface PlaceholderOptions {
  HTMLAttributes: Record<string, unknown>;
}

export const PlaceholderNode = Node.create<PlaceholderOptions>({
  name: 'placeholder',
  group: 'inline',
  inline: true,
  atom: true, // can't be entered into / edited character by character
  selectable: true,

  addOptions() {
    return { HTMLAttributes: {} };
  },

  addAttributes() {
    return {
      name: {
        default: '',
        parseHTML: (el) => el.getAttribute('data-placeholder-name'),
        renderHTML: (attrs) => ({ 'data-placeholder-name': attrs.name }),
      },
    };
  },

  parseHTML() {
    return [{ tag: 'span[data-placeholder-name]' }];
  },

  renderHTML({ node, HTMLAttributes }) {
    return [
      'span',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        class: 'placeholder-chip',
      }),
      `{${node.attrs.name}}`,
    ];
  },
});

/** Scans plain text/html for {token} patterns and returns unique names. */
export function findPlaceholderNames(html: string): string[] {
  const matches = html.match(/\{([a-zA-Z0-9_]+)\}/g) || [];
  return Array.from(new Set(matches.map((m) => m.slice(1, -1))));
}
