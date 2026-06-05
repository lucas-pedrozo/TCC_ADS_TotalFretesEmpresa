import type { KeyboardEvent, ReactNode } from "react";
import { useTranslation } from "react-i18next";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { selectableItemHoverClassName } from "@/utils/ui";

export type AdminTableColumn<T> = {
  key: string;
  header: string;
  cell: (row: T) => ReactNode;
  className?: string;
};

type AdminDataTableProps<T> = {
  columns: AdminTableColumn<T>[];
  rows: T[];
  rowKey: (row: T) => string | number;
  isLoading?: boolean;
  emptyMessage: string;
  page?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  totalPages?: number;
  totalCount?: number;
  onRowClick?: (row: T) => void;
  isRowClickable?: (row: T) => boolean;
  stopRowClickKeys?: string[];
};

export function AdminDataTable<T>({
  columns,
  rows,
  rowKey,
  isLoading,
  emptyMessage,
  page = 1,
  pageSize,
  onPageChange,
  totalPages,
  totalCount,
  onRowClick,
  isRowClickable,
  stopRowClickKeys = ["actions"],
}: AdminDataTableProps<T>) {
  const { t } = useTranslation();
  const isServerMode = totalPages != null;

  const pagedRows =
    pageSize && !isServerMode
      ? rows.slice((page - 1) * pageSize, page * pageSize)
      : rows;

  const computedTotalPages =
    totalPages ?? (pageSize ? Math.max(1, Math.ceil(rows.length / pageSize)) : 1);

  const showPagination = Boolean(
    onPageChange &&
      pageSize &&
      rows.length > 0 &&
      (isServerMode || computedTotalPages > 1)
  );

  const handleRowClick = (row: T) => {
    if (!onRowClick) return;
    if (isRowClickable && !isRowClickable(row)) return;
    onRowClick(row);
  };

  const handleRowKeyDown = (event: KeyboardEvent<HTMLTableRowElement>, row: T) => {
    if (!onRowClick) return;
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    handleRowClick(row);
  };

  if (isLoading && rows.length === 0) {
    return (
      <div className="space-y-2 rounded-lg border bg-card p-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} className="h-10 w-full" />
        ))}
      </div>
    );
  }

  if (rows.length === 0 && !isLoading) {
    return (
      <div className="rounded-lg border bg-card p-8 text-center text-sm text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }

  const effectivePageSize = pageSize ?? (isServerMode ? Math.max(pagedRows.length, 1) : rows.length);
  const total = totalCount ?? rows.length;
  const rangeStart = (page - 1) * effectivePageSize + 1;
  const rangeEnd = isServerMode
    ? Math.min(page * effectivePageSize, total)
    : Math.min(page * effectivePageSize, rows.length);

  return (
    <div className="space-y-3">
      <div
        className={cn(
          "overflow-x-auto rounded-lg border bg-card",
          isLoading && rows.length > 0 && "pointer-events-none opacity-60"
        )}
      >
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead key={column.key} className={column.className}>
                  {column.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {pagedRows.map((row) => {
              const clickable = Boolean(onRowClick && (!isRowClickable || isRowClickable(row)));
              return (
                <TableRow
                  key={rowKey(row)}
                  tabIndex={clickable ? 0 : undefined}
                  role={clickable ? "button" : undefined}
                  className={cn(clickable && "cursor-pointer", clickable && selectableItemHoverClassName)}
                  onClick={clickable ? () => handleRowClick(row) : undefined}
                  onKeyDown={clickable ? (event) => handleRowKeyDown(event, row) : undefined}
                >
                  {columns.map((column) => (
                    <TableCell
                      key={column.key}
                      className={column.className}
                      onClick={
                        stopRowClickKeys.includes(column.key)
                          ? (event) => event.stopPropagation()
                          : undefined
                      }
                    >
                      {column.cell(row)}
                    </TableCell>
                  ))}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {showPagination ? (
        <div className="flex flex-wrap items-center justify-end gap-2">
          {totalCount != null ? (
            <span className="mr-auto text-sm text-muted-foreground">
              {t("pages.admin.common.paginationRange", {
                start: rangeStart,
                end: rangeEnd,
                total,
              })}
            </span>
          ) : (
            <span className="text-sm text-muted-foreground">
              {t("pages.admin.common.paginationPage", {
                page,
                total: computedTotalPages,
              })}
            </span>
          )}
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => onPageChange?.(page - 1)}
          >
            {t("pages.admin.common.paginationPrevious")}
          </Button>
          {totalCount == null ? null : (
            <span className="text-sm text-muted-foreground">
              {t("pages.admin.common.paginationPage", {
                page,
                total: computedTotalPages,
              })}
            </span>
          )}
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={page >= computedTotalPages}
            onClick={() => onPageChange?.(page + 1)}
          >
            {t("pages.admin.common.paginationNext")}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
