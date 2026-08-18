import { create } from 'zustand';
import type { TemplateRecord } from '../types/template';

const STORAGE_KEY = 'shine_craft_active_template';

function getInitialActiveTemplate(): TemplateRecord | null {
  try {
    const cached = localStorage.getItem(STORAGE_KEY);
    return cached ? JSON.parse(cached) : null;
  } catch {
    return null;
  }
}

interface TemplateStore {
  templates: TemplateRecord[];
  activeTemplate: TemplateRecord | null;
  setTemplates: (templates: TemplateRecord[]) => void;
  setActiveTemplate: (template: TemplateRecord | null) => void;
  upsertTemplate: (template: TemplateRecord) => void;
}

export const useTemplateStore = create<TemplateStore>((set) => ({
  templates: [],
  activeTemplate: getInitialActiveTemplate(),
  setTemplates: (templates) => set({ templates }),
  setActiveTemplate: (template) => {
    try {
      if (template) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(template));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      // fallback
    }
    set({ activeTemplate: template });
  },
  upsertTemplate: (template) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(template));
    } catch {
      // fallback
    }
    set((state) => ({
      activeTemplate: template,
      templates: [template, ...state.templates.filter((t) => t.id !== template.id)],
    }));
  },
}));
