import { create } from 'zustand';
import type { TemplateRecord } from '../types/template';

interface TemplateStore {
  templates: TemplateRecord[];
  activeTemplate: TemplateRecord | null;
  setTemplates: (templates: TemplateRecord[]) => void;
  setActiveTemplate: (template: TemplateRecord | null) => void;
  upsertTemplate: (template: TemplateRecord) => void;
}

export const useTemplateStore = create<TemplateStore>((set) => ({
  templates: [],
  activeTemplate: null,
  setTemplates: (templates) => set({ templates }),
  setActiveTemplate: (template) => set({ activeTemplate: template }),
  upsertTemplate: (template) =>
    set((state) => ({
      templates: [template, ...state.templates.filter((t) => t.id !== template.id)],
    })),
}));
