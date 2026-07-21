import { useCallback, useEffect } from 'react';
import { useTemplateStore } from '../store/templateStore';
import * as api from '../services/api';

export function useTemplates() {
  const { templates, setTemplates, upsertTemplate, activeTemplate, setActiveTemplate } =
    useTemplateStore();

  const refresh = useCallback(async () => {
    const list = await api.listTemplates();
    setTemplates(list);
  }, [setTemplates]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const importFile = useCallback(
    async (file: File) => {
      const record = await api.importTemplate(file);
      upsertTemplate(record);
      setActiveTemplate(record);
      return record;
    },
    [upsertTemplate, setActiveTemplate],
  );

  return { templates, activeTemplate, setActiveTemplate, refresh, importFile };
}
