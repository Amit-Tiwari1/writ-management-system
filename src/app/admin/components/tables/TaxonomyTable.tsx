"use client";

import React from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Pagination,
  Spinner,
} from "@nextui-org/react";

interface TaxonomyColumn {
  key: string;
  label: string;
}

interface TaxonomyTableProps<T extends { _id: string }> {
  ariaLabel: string;
  columns: TaxonomyColumn[];
  items: T[];
  loading: boolean;
  emptyText: string;
  page: number;
  totalPages: number;
  totalCount: number;
  rowsPerPage?: number;
  onPageChange: (page: number) => void;
  renderCell: (item: T, columnKey: string, index: number) => React.ReactNode;
}

export default function TaxonomyTable<T extends { _id: string }>({
  ariaLabel,
  columns,
  items,
  loading,
  emptyText,
  page,
  totalPages,
  totalCount,
  rowsPerPage = 5,
  onPageChange,
  renderCell,
}: TaxonomyTableProps<T>) {
  const startRecord = totalCount === 0 ? 0 : (page - 1) * rowsPerPage + 1;
  const endRecord = Math.min(page * rowsPerPage, totalCount);

  return (
    <Table
      removeWrapper
      aria-label={ariaLabel}
      className="min-w-full"
      bottomContent={
        totalPages > 1 ? (
          <div className="flex w-full justify-between items-center p-3 border-t border-slate-100">
            <span className="text-xs text-slate-500">
              Showing {startRecord} to {endRecord} of {totalCount}
            </span>

            <Pagination
              isCompact
              showControls
              color="primary"
              page={page}
              total={totalPages}
              onChange={onPageChange}
            />
          </div>
        ) : null
      }
    >
      <TableHeader columns={columns}>
        {(column) => (
          <TableColumn
            key={column.key}
            className={`bg-transparent text-[10px] font-bold uppercase tracking-wider text-slate-400 ${
              column.key === "actions" ? "text-center" : ""
            }`}
          >
            {column.label}
          </TableColumn>
        )}
      </TableHeader>

      <TableBody
        items={items}
        emptyContent={
          loading ? (
            <div className="py-6 flex justify-center items-center gap-2 text-slate-500">
              <Spinner size="sm" />
              Loading...
            </div>
          ) : (
            emptyText
          )
        }
      >
        {(item) => {
          const index = items.findIndex((record) => record._id === item._id);

          return (
            <TableRow
              key={item._id}
              className="border-b border-slate-100 hover:bg-slate-50/70"
            >
              {(columnKey) => (
                <TableCell>
                  {renderCell(
                    item,
                    String(columnKey),
                    (page - 1) * rowsPerPage + index + 1,
                  )}
                </TableCell>
              )}
            </TableRow>
          );
        }}
      </TableBody>
    </Table>
  );
}