import { useEffect, useMemo, useState } from 'react';
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
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

  // Search filtering (matches person name, any field value, or formatted Row ID like 001, 002)
  const searchedRows = useMemo(() => {
    if (!searchQuery.trim()) return rows;
    const q = searchQuery.toLowerCase().trim();
    return rows.filter((r, idx) => {
      const rowIdFormatted = String(idx + 1).padStart(3, '0');
      const rowIdNumber = String(idx + 1);
      const matchesRowId =
        rowIdFormatted.includes(q) ||
        rowIdNumber === q ||
        r.id.toLowerCase().includes(q);

      const matchesNameOrFields = Object.values(r.data).some((val) =>
        String(val ?? '').toLowerCase().includes(q)
      );

      return matchesRowId || matchesNameOrFields;
    });
  }, [rows, searchQuery]);

  // Sort feature
  const displayRows = useMemo(() => {
    if (!sortConfig) return searchedRows;
    const { key, direction } = sortConfig;

    return [...searchedRows].sort((a, b) => {
      let valA: any;
      let valB: any;

      if (key === 'rowId') {
        valA = a.id;
        valB = b.id;
      } else if (key === 'createdAt') {
        valA = new Date(a.createdAt).getTime();
        valB = new Date(b.createdAt).getTime();
      } else if (key === 'lastUsedAt') {
        valA = a.lastUsedAt ? new Date(a.lastUsedAt).getTime() : 0;
        valB = b.lastUsedAt ? new Date(b.lastUsedAt).getTime() : 0;
      } else {
        valA = a.data[key] ?? '';
        valB = b.data[key] ?? '';
      }

      if (typeof valA === 'string' && typeof valB === 'string') {
        const cmp = valA.localeCompare(valB, undefined, { numeric: true, sensitivity: 'base' });
        return direction === 'asc' ? cmp : -cmp;
      }

      const cmp = valA > valB ? 1 : valA < valB ? -1 : 0;
      return direction === 'asc' ? cmp : -cmp;
    });
  }, [searchedRows, sortConfig]);

  const PAGE_SIZE = 5;
  const [currentPage, setCurrentPage] = useState(1);

  // Reset page if out of bounds (e.g. after deletion or filtering)
  const totalPages = Math.max(1, Math.ceil(displayRows.length / PAGE_SIZE));
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return displayRows.slice(start, start + PAGE_SIZE);
  }, [displayRows, currentPage]);

  const handleToggleSort = (colId: string) => {
    if (colId === 'actions') return;
    setSortConfig((prev) => {
      if (prev?.key !== colId) {
        return { key: colId, direction: 'asc' };
      }
      if (prev.direction === 'asc') {
        return { key: colId, direction: 'desc' };
      }
      return null;
    });
  };

  const tableColumns = useMemo(() => {
    const cols = [
      columnHelper.display({
        id: 'rowId',
        header: 'Row ID',
        cell: (ctx) => {
          const overallIndex = (currentPage - 1) * PAGE_SIZE + ctx.row.index;
          const rowNumber = String(overallIndex + 1).padStart(3, '0');
          return (
            <code style={{ fontSize: 12, fontWeight: 700, color: 'var(--primary)', fontFamily: 'monospace' }} title={`Row ${overallIndex + 1} (${ctx.row.original.id})`}>
              {rowNumber}
            </code>
          );
        },
      }),
      ...columns.map((placeholder, colIndex) =>
        columnHelper.display({
          id: placeholder,
          header: placeholder,
          cell: (ctx) => {
            const row = ctx.row.original;
            const rowIndex = ctx.row.index;
            const isEditing = editingCell?.rowId === row.id && editingCell?.col === placeholder;
            const value = row.data[placeholder] ?? '';

            const moveToNextCell = (currentVal: string, isBackwards = false) => {
              onCellEdit(row.id, placeholder, currentVal);

              if (!isBackwards) {
                if (colIndex < columns.length - 1) {
                  setEditingCell({ rowId: row.id, col: columns[colIndex + 1] });
                } else if (rowIndex < paginatedRows.length - 1) {
                  setEditingCell({ rowId: paginatedRows[rowIndex + 1].id, col: columns[0] });
                } else {
                  setEditingCell(null);
                }
              } else {
                if (colIndex > 0) {
                  setEditingCell({ rowId: row.id, col: columns[colIndex - 1] });
                } else if (rowIndex > 0) {
                  setEditingCell({ rowId: paginatedRows[rowIndex - 1].id, col: columns[columns.length - 1] });
                } else {
                  setEditingCell(null);
                }
              }
            };

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
                    if (e.key === 'Enter' || e.key === 'Tab') {
                      e.preventDefault();
                      const input = e.currentTarget;
                      input.onblur = null;
                      moveToNextCell(input.value, e.shiftKey);
                    } else if (e.key === 'Escape') {
                      const input = e.currentTarget;
                      input.onblur = null;
                      setEditingCell(null);
                    }
                  }}
                  style={{
                    width: '100%',
                    border: '2px solid var(--primary)',
                    padding: '4px 8px',
                    borderRadius: 'var(--radius-sm)',
                    outline: 'none',
                    background: 'var(--bg-surface)',
                    boxShadow: '0 0 0 3px var(--primary-glow)',
                  }}
                />
              );
            }

            return (
              <div
                onClick={() => setEditingCell({ rowId: row.id, col: placeholder })}
                style={{ minHeight: 22, cursor: 'text', padding: '2px 4px', borderRadius: 4, transition: 'var(--transition)' }}
                title="Click to edit (Press Enter to save & move to next area)"
              >
                {value || <span style={{ color: 'var(--text-muted)' }}>—</span>}
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
  }, [columns, paginatedRows, editingCell, onCellEdit, onDeleteRow, currentPage]);

  const table = useReactTable({
    data: paginatedRows,
    columns: tableColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  const sortableOptions = ['rowId', ...columns, 'createdAt', 'lastUsedAt'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Search Bar & Sort By Controls Toolbar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          flexWrap: 'wrap',
          background: 'var(--bg-secondary)',
          padding: '8px 12px',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border-color)',
        }}
      >
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="🔍 Search by name or Row ID (e.g. 001)..."
            style={{
              paddingLeft: 32,
              paddingRight: searchQuery ? 30 : 12,
              fontSize: 13,
              height: 34,
              border: '1px solid var(--border-color)',
              borderRadius: 6,
              background: '#ffffff',
            }}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              style={{
                position: 'absolute',
                right: 8,
                top: '50%',
                transform: 'translateY(-50%)',
                border: 'none',
                background: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                fontSize: 14,
                padding: 0,
              }}
              title="Clear search"
            >
              ✕
            </button>
          )}
        </div>

        {/* Sort By Dropdown Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>Sort by:</label>
          <select
            value={sortConfig?.key || ''}
            onChange={(e) => {
              const key = e.target.value;
              if (!key) {
                setSortConfig(null);
              } else {
                setSortConfig({ key, direction: sortConfig?.direction || 'asc' });
              }
            }}
            style={{
              fontSize: 12,
              padding: '4px 8px',
              border: '1px solid var(--border-color)',
              borderRadius: 6,
              background: '#ffffff',
              height: 34,
              cursor: 'pointer',
            }}
          >
            <option value="">Default Order</option>
            {sortableOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt === 'rowId' ? 'Row ID' : opt === 'createdAt' ? 'Created Date' : opt === 'lastUsedAt' ? 'Last Used Date' : opt}
              </option>
            ))}
          </select>

          {sortConfig && (
            <button
              type="button"
              onClick={() =>
                setSortConfig((prev) =>
                  prev ? { ...prev, direction: prev.direction === 'asc' ? 'desc' : 'asc' } : null
                )
              }
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: 'var(--primary)',
                border: '1px solid var(--primary-light)',
                background: '#ffffff',
                height: 34,
                padding: '0 10px',
                borderRadius: 6,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
              }}
              title="Toggle Sort Direction"
            >
              {sortConfig.direction === 'asc' ? '▲ Ascending (A-Z)' : '▼ Descending (Z-A)'}
            </button>
          )}

          {sortConfig && (
            <button
              type="button"
              onClick={() => setSortConfig(null)}
              style={{
                fontSize: 12,
                color: 'var(--text-muted)',
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                padding: '4px 6px',
              }}
              title="Reset Sorting"
            >
              Reset ✕
            </button>
          )}
        </div>

        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 'auto', fontWeight: 500 }}>
          Showing {displayRows.length} of {rows.length} rows
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ borderCollapse: 'collapse', width: '100%' }}>
          <thead>
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((header) => {
                  const isSorted = sortConfig?.key === header.id;
                  const canSort = header.id !== 'actions';

                  return (
                    <th
                      key={header.id}
                      onClick={() => canSort && handleToggleSort(header.id)}
                      style={{
                        textAlign: 'left',
                        padding: '8px 10px',
                        borderBottom: '2px solid #e5e7eb',
                        fontSize: 13,
                        textTransform: 'capitalize',
                        cursor: canSort ? 'pointer' : 'default',
                        userSelect: 'none',
                        background: isSorted ? 'var(--primary-light)' : 'transparent',
                        color: isSorted ? 'var(--primary)' : 'var(--text-primary)',
                      }}
                      title={canSort ? `Click to sort by ${header.id}` : undefined}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
                        <span>{flexRender(header.column.columnDef.header, header.getContext())}</span>
                        {canSort && (
                          <span style={{ fontSize: 12, color: isSorted ? 'var(--primary)' : '#9ca3af' }}>
                            {isSorted ? (sortConfig.direction === 'asc' ? '▲' : '▼') : '↕️'}
                          </span>
                        )}
                      </div>
                    </th>
                  );
                })}
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
            {displayRows.length === 0 && (
              <tr>
                <td colSpan={columns.length + 4} style={{ padding: 16, color: '#9ca3af', textAlign: 'center' }}>
                  {rows.length === 0
                    ? 'No rows yet — click "Add Row" to create your first record.'
                    : 'No matching records found for search criteria.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {displayRows.length > 0 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 14px',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-sm)',
            flexWrap: 'wrap',
            gap: 12,
            marginTop: 4,
          }}
        >
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600 }}>
            Showing {(currentPage - 1) * PAGE_SIZE + 1}–
            {Math.min(currentPage * PAGE_SIZE, displayRows.length)} of {displayRows.length} rows (Page {currentPage} of {totalPages})
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <button
              type="button"
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              style={{
                padding: '4px 10px',
                fontSize: 12,
                fontWeight: 600,
                borderRadius: 6,
                border: '1px solid var(--border-color)',
                background: currentPage === 1 ? 'var(--bg-secondary)' : '#ffffff',
                color: currentPage === 1 ? 'var(--text-muted)' : 'var(--text-primary)',
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
              }}
              title="First Page"
            >
              ⏮ First
            </button>

            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              style={{
                padding: '4px 10px',
                fontSize: 12,
                fontWeight: 600,
                borderRadius: 6,
                border: '1px solid var(--border-color)',
                background: currentPage === 1 ? 'var(--bg-secondary)' : '#ffffff',
                color: currentPage === 1 ? 'var(--text-muted)' : 'var(--text-primary)',
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
              }}
            >
              ‹ Prev
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                type="button"
                onClick={() => setCurrentPage(pageNum)}
                style={{
                  padding: '4px 10px',
                  fontSize: 12,
                  fontWeight: 700,
                  borderRadius: 6,
                  border: pageNum === currentPage ? 'none' : '1px solid var(--border-color)',
                  background: pageNum === currentPage ? 'var(--primary)' : '#ffffff',
                  color: pageNum === currentPage ? 'var(--text-on-primary)' : 'var(--text-primary)',
                  cursor: 'pointer',
                }}
              >
                {pageNum}
              </button>
            ))}

            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              style={{
                padding: '4px 10px',
                fontSize: 12,
                fontWeight: 600,
                borderRadius: 6,
                border: '1px solid var(--border-color)',
                background: currentPage === totalPages ? 'var(--bg-secondary)' : '#ffffff',
                color: currentPage === totalPages ? 'var(--text-muted)' : 'var(--text-primary)',
                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
              }}
            >
              Next ›
            </button>

            <button
              type="button"
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              style={{
                padding: '4px 10px',
                fontSize: 12,
                fontWeight: 600,
                borderRadius: 6,
                border: '1px solid var(--border-color)',
                background: currentPage === totalPages ? 'var(--bg-secondary)' : '#ffffff',
                color: currentPage === totalPages ? 'var(--text-muted)' : 'var(--text-primary)',
                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
              }}
              title="Last Page"
            >
              ⏭ Last
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
