import { useCallback, useEffect } from 'react';
import { useDatasetStore } from '../store/datasetStore';
import * as api from '../services/api';

export function useDataset(templateId: string | null) {
  const { rows, setRows, upsertRow, removeRow, activeRowId, setActiveRowId } = useDatasetStore();

  const refresh = useCallback(async () => {
    if (!templateId) return;
    const list = await api.listRows(templateId);
    setRows(list);
    if (list.length && !activeRowId) setActiveRowId(list[0].id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [templateId, setRows]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addEmptyRow = useCallback(
    async (columns: string[]) => {
      if (!templateId) return;
      const emptyData = Object.fromEntries(columns.map((c) => [c, '']));
      const row = await api.addRow(templateId, emptyData);
      upsertRow(row);
      setActiveRowId(row.id);
    },
    [templateId, upsertRow, setActiveRowId],
  );

  const updateCell = useCallback(
    async (rowId: string, column: string, value: string) => {
      if (!templateId) return;
      const row = await api.updateRow(templateId, rowId, { [column]: value });
      upsertRow(row);
    },
    [templateId, upsertRow],
  );

  const deleteRow = useCallback(
    async (rowId: string) => {
      if (!templateId) return;
      await api.deleteRow(templateId, rowId);
      removeRow(rowId);
      if (activeRowId === rowId) {
        const remaining = rows.filter((r) => r.id !== rowId);
        setActiveRowId(remaining.length ? remaining[0].id : null);
      }
    },
    [templateId, removeRow, activeRowId, rows, setActiveRowId],
  );

  return { rows, activeRowId, setActiveRowId, addEmptyRow, updateCell, deleteRow, refresh };
}
