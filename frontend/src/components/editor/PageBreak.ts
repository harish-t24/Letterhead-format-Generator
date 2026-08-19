import { Node } from '@tiptap/core';

export const PageBreak = Node.create({
  name: 'pageBreak',
  group: 'block',
  atom: true,
  selectable: true,
  draggable: true,
  isolating: true,

  parseHTML() {
    return [
      { tag: 'div.page-break' },
      { tag: 'hr.page-break' },
      {
        tag: 'div',
        getAttrs: (element) => {
          if (typeof element === 'string') return false;
          const el = element as HTMLElement;
          if (el.classList?.contains('page-break') || el.style?.pageBreakBefore === 'always' || el.style?.breakBefore === 'page') {
            return {};
          }
          return false;
        },
      },
    ];
  },

  renderHTML() {
    return ['div', { class: 'page-break', 'data-page-break': 'true' }];
  },

  addCommands(): any {
    return {
      setPageBreak: () => ({ chain }: any) => {
        return chain()
          .insertContent([
            { type: this.name },
            { type: 'paragraph' },
          ])
          .focus()
          .run();
      },
    };
  },
});

