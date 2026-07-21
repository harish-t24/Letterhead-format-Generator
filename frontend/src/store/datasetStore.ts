import { create } from 'zustand';
import type { DatasetRow } from '../types/dataset';

interface DatasetStore {
  rows: DatasetRow[];
  activeRowId: string | null;
  setRows: (rows: DatasetRow[]) => void;
  setActiveRowId: (id: string | null) => void;
  upsertRow: (row: DatasetRow) => void;
  removeRow: (id: string) => void;
}

export const useDatasetStore = create<DatasetStore>((set) => ({
  rows: [],
  activeRowId: null,
  setRows: (rows) => set({ rows }),
  setActiveRowId: (id) => set({ activeRowId: id }),
  upsertRow: (row) =>
    set((state) => {
      const exists = state.rows.some((r) => r.id === row.id);
      return {
        rows: exists
          ? state.rows.map((r) => (r.id === row.id ? row : r))
          : [...state.rows, row],
      };
    }),
  removeRow: (id) =>
    set((state) => ({
      rows: state.rows.filter((r) => r.id !== id),
      activeRowId: state.activeRowId === id ? null : state.activeRowId,
    })),
}));
