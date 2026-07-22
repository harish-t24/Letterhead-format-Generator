import { Node } from '@tiptap/core';

export const PageBreak = Node.create({
  name: 'pageBreak',
  group: 'block',
  selectable: true,
  draggable: true,

  parseHTML() {
    return [
      {
        tag: 'div',
        getAttrs: (element) => {
          if (typeof element === 'string') return false;
          return element.classList.contains('page-break') ? {} : false;
        },
      },
    ];
  },

  renderHTML() {
    return ['div', { class: 'page-break', style: 'break-before: column; page-break-before: always; page-break-after: always;' }];
  },

  addCommands(): any {
    return {
      setPageBreak: () => ({ chain }: any) => {
        return chain()
          .insertContent({ type: this.name })
          .run();
      },
    };
  },
});
