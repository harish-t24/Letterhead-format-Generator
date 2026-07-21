import { useMemo, useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from '@tanstack/react-table';
import type { DatasetRow } from '../../types/dataset';

interface Props {
  columns: string[]; // placeholder names, in template order
  rows: DatasetRow[];
  activeRowId: string | null;
  onSelectRow: (id: string) => void;
  onCellEdit: (rowId: string, column: string, value: string) => void;
  onDeleteRow: (id: string) => void;
}

const columnHelper = createColumnHelper<DatasetRow>();

function formatShortDate(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export function DataTable({
  columns,
  rows,
  activeRowId,
  onSelectRow,
  onCellEdit,
  onDeleteRow,
}: Props) {
  const [editingCell, setEditingCell] = useState<{ rowId: string; col: string } | null>(null);

  const tableColumns = useMemo(() => {
    const cols = [
      columnHelper.display({
        id: 'rowId',
        header: 'Row ID',
        cell: (ctx) => (
          <code style={{ fontSize: 11, color: '#6b7280' }} title={ctx.row.original.id}>
            {ctx.row.original.id.slice(0, 8)}
          </code>
        ),
      }),
      ...columns.map((placeholder) =>
        columnHelper.display({
          id: placeholder,
          header: placeholder,
          cell: (ctx) => {
            const row = ctx.row.original;
            const isEditing = editingCell?.rowId === row.id && editingCell?.col === placeholder;
            const value = row.data[placeholder] ?? '';

            if (isEditing) {
              return (
                <input
                  autoFocus
                  defaultValue={value}
                  onBlur={(e) => {
                    onCellEdit(row.id, placeholder, e.target.value);
                    setEditingCell(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
                    if (e.key === 'Escape') setEditingCell(null);
                  }}
                  style={{ width: '100%', border: '1px solid #4f46e5', padding: '2px 4px' }}
                />
              );
            }

            return (
              <div
                onClick={() => setEditingCell({ rowId: row.id, col: placeholder })}
                style={{ minHeight: 20, cursor: 'text' }}
                title="Click to edit"
              >
                {value || <span style={{ color: '#c7c7d1' }}>—</span>}
              </div>
            );
          },
        }),
      ),
      columnHelper.display({
        id: 'createdAt',
        header: 'Created',
        cell: (ctx) => (
          <span
            style={{ fontSize: 11, color: '#9ca3af' }}
            title={new Date(ctx.row.original.createdAt).toLocaleString()}
          >
            {formatShortDate(ctx.row.original.createdAt)}
          </span>
        ),
      }),
      columnHelper.display({
        id: 'lastUsedAt',
        header: 'Last used',
        cell: (ctx) => {
          const lastUsed = ctx.row.original.lastUsedAt;
          return (
            <span
              style={{ fontSize: 11, color: lastUsed ? '#16a34a' : '#c7c7d1' }}
              title={lastUsed ? new Date(lastUsed).toLocaleString() : 'Not previewed/exported yet'}
            >
              {formatShortDate(lastUsed)}
            </span>
          );
        },
      }),
      columnHelper.display({
        id: 'actions',
        header: '',
        cell: (ctx) => (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDeleteRow(ctx.row.original.id);
            }}
            style={{ color: '#dc2626', border: 'none', background: 'none', cursor: 'pointer' }}
          >
            Delete
          </button>
        ),
      }),
    ];
    return cols;
  }, [columns, editingCell, onCellEdit, onDeleteRow]);

  const table = useReactTable({
    data: rows,
    columns: tableColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <table style={{ borderCollapse: 'collapse', width: '100%' }}>
      <thead>
        {table.getHeaderGroups().map((hg) => (
          <tr key={hg.id}>
            {hg.headers.map((header) => (
              <th
                key={header.id}
                style={{
                  textAlign: 'left',
                  padding: '6px 8px',
                  borderBottom: '2px solid #e5e7eb',
                  fontSize: 13,
                  textTransform: 'capitalize',
                }}
              >
                {flexRender(header.column.columnDef.header, header.getContext())}
              </th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody>
        {table.getRowModel().rows.map((row) => (
          <tr
            key={row.id}
            onClick={() => onSelectRow(row.original.id)}
            style={{
              background: row.original.id === activeRowId ? '#eef2ff' : undefined,
              cursor: 'pointer',
            }}
          >
            {row.getVisibleCells().map((cell) => (
              <td
                key={cell.id}
                style={{ padding: '6px 8px', borderBottom: '1px solid #f0f0f2', fontSize: 13 }}
              >
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </td>
            ))}
          </tr>
        ))}
        {rows.length === 0 && (
          <tr>
            <td colSpan={columns.length + 4} style={{ padding: 16, color: '#9ca3af' }}>
              No rows yet — click "Add Row" to create your first record.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}
