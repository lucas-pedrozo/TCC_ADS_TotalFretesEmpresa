import { Filter, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { HistoryTableRow } from "@/hooks/useHistoryTable";
import { cn } from "@/lib/utils";
import { selectableItemHoverClassName } from "@/utils/ui";

type HistoryCompletedTableProps = {
  title: string;
  description: string;
  emptyLabel: string;
  searchPlaceholder: string;
  filtersLabel: string;
  filterPanelTitle: string;
  filterPanelHint: string;
  filterSectionCargo: string;
  filterAllCargo: string;
  filterActiveLabel: string;
  filterSectionValue: string;
  filterValueHelp: string;
  filterSectionDistance: string;
  filterDistanceHelp: string;
  filterMin: string;
  filterMax: string;
  clearFiltersLabel: string;
  paginationShowing: string;
  paginationOf: string;
  paginationFreights: string;
  paginationPrev: string;
  paginationNext: string;
  columns: {
    code: string;
    route: string;
    cargo: string;
    value: string;
    status: string;
    finalized: string;
    distance: string;
  };
  search: string;
  onSearchChange: (value: string) => void;
  filterCargo: string;
  onFilterCargoChange: (value: string) => void;
  allCargoValue: string;
  cargoOptions: string[];
  filterMinValue: string;
  onFilterMinValueChange: (value: string) => void;
  filterMaxValue: string;
  onFilterMaxValueChange: (value: string) => void;
  filterMinDistance: string;
  onFilterMinDistanceChange: (value: string) => void;
  filterMaxDistance: string;
  onFilterMaxDistanceChange: (value: string) => void;
  activeFilterCount: number;
  onClearFilters: () => void;
  rows: HistoryTableRow[];
  total: number;
  from: number;
  to: number;
  canGoPrev: boolean;
  canGoNext: boolean;
  onPrev: () => void;
  onNext: () => void;
};

export function HistoryCompletedTable({
  title,
  description,
  emptyLabel,
  searchPlaceholder,
  filtersLabel,
  filterPanelTitle,
  filterPanelHint,
  filterSectionCargo,
  filterAllCargo,
  filterActiveLabel,
  filterSectionValue,
  filterValueHelp,
  filterSectionDistance,
  filterDistanceHelp,
  filterMin,
  filterMax,
  clearFiltersLabel,
  paginationShowing,
  paginationOf,
  paginationFreights,
  paginationPrev,
  paginationNext,
  columns,
  search,
  onSearchChange,
  filterCargo,
  onFilterCargoChange,
  allCargoValue,
  cargoOptions,
  filterMinValue,
  onFilterMinValueChange,
  filterMaxValue,
  onFilterMaxValueChange,
  filterMinDistance,
  onFilterMinDistanceChange,
  filterMaxDistance,
  onFilterMaxDistanceChange,
  activeFilterCount,
  onClearFilters,
  rows,
  total,
  from,
  to,
  canGoPrev,
  canGoNext,
  onPrev,
  onNext,
}: HistoryCompletedTableProps) {
  const navigate = useNavigate();

  function openFreight(id: number) {
    void navigate(`/Freights/${id}`);
  }

  return (
    <section className="rounded-[28px] border border-border bg-background p-5 shadow-sm md:p-6">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold tracking-tight text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>

      <div className="mt-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:max-w-md">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder={searchPlaceholder}
            className="min-h-11 rounded-lg border-border pl-9 touch-manipulation md:min-h-9"
            aria-label={searchPlaceholder}
          />
        </div>

        <Popover>
          <PopoverTrigger
            render={
              <Button
                type="button"
                variant="outline"
                className="min-h-11 w-full shrink-0 justify-center gap-2 rounded-lg touch-manipulation sm:min-h-9 lg:w-auto"
                aria-label={filterActiveLabel}
              >
                <Filter className="size-4 shrink-0" aria-hidden />
                {filtersLabel}
                <span className="ml-0.5 max-w-[8rem] truncate rounded-full bg-brand-green-light px-2 py-0.5 text-center text-xs font-semibold text-brand-green-dark">
                  {filterActiveLabel}
                </span>
              </Button>
            }
          />
          <PopoverContent
            className="w-[min(calc(100vw-2rem),22rem)] max-w-none sm:w-96"
            align="end"
            sideOffset={8}
          >
            <PopoverHeader>
              <PopoverTitle>{filterPanelTitle}</PopoverTitle>
              <PopoverDescription>{filterPanelHint}</PopoverDescription>
            </PopoverHeader>
            <div className="scrollbar-brand flex max-h-[min(32rem,calc(100vh-6rem))] flex-col gap-4 overflow-y-auto overscroll-y-contain pr-1">
              <div className="space-y-2">
                <Label className="text-xs font-medium text-foreground" htmlFor="hf-cargo">
                  {filterSectionCargo}
                </Label>
                <select
                  id="hf-cargo"
                  value={filterCargo}
                  onChange={(event) => onFilterCargoChange(event.target.value)}
                  className="flex h-9 w-full min-w-0 cursor-pointer rounded-lg border border-input bg-background px-2.5 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50 disabled:opacity-50 dark:bg-input/30"
                >
                  <option value={allCargoValue}>{filterAllCargo}</option>
                  {cargoOptions.map((cargo) => (
                    <option key={cargo} value={cargo}>
                      {cargo}
                    </option>
                  ))}
                </select>
              </div>

              <Separator />

              <div className="space-y-2">
                <p className="text-xs font-medium text-foreground">{filterSectionValue}</p>
                <p className="text-xs text-muted-foreground">{filterValueHelp}</p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-xs" htmlFor="hf-min-val">
                      {filterMin}
                    </Label>
                    <Input
                      id="hf-min-val"
                      type="number"
                      min={0}
                      step="0.01"
                      inputMode="decimal"
                      className="rounded-lg"
                      value={filterMinValue}
                      onChange={(event) => onFilterMinValueChange(event.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs" htmlFor="hf-max-val">
                      {filterMax}
                    </Label>
                    <Input
                      id="hf-max-val"
                      type="number"
                      min={0}
                      step="0.01"
                      inputMode="decimal"
                      className="rounded-lg"
                      value={filterMaxValue}
                      onChange={(event) => onFilterMaxValueChange(event.target.value)}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <p className="text-xs font-medium text-foreground">{filterSectionDistance}</p>
                <p className="text-xs text-muted-foreground">{filterDistanceHelp}</p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-xs" htmlFor="hf-min-dist">
                      {filterMin}
                    </Label>
                    <Input
                      id="hf-min-dist"
                      type="number"
                      min={0}
                      step="1"
                      inputMode="numeric"
                      className="rounded-lg"
                      value={filterMinDistance}
                      onChange={(event) => onFilterMinDistanceChange(event.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs" htmlFor="hf-max-dist">
                      {filterMax}
                    </Label>
                    <Input
                      id="hf-max-dist"
                      type="number"
                      min={0}
                      step="1"
                      inputMode="numeric"
                      className="rounded-lg"
                      value={filterMaxDistance}
                      onChange={(event) => onFilterMaxDistanceChange(event.target.value)}
                    />
                  </div>
                </div>
              </div>

              {activeFilterCount > 0 ? (
                <>
                  <Separator />
                  <Button type="button" variant="ghost" className="w-full" onClick={onClearFilters}>
                    {clearFiltersLabel}
                  </Button>
                </>
              ) : null}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {rows.length === 0 ? (
        <div className="mt-5 rounded-2xl border border-dashed border-border bg-muted/20 px-4 py-12 text-center">
          <p className="text-sm font-medium text-muted-foreground">{emptyLabel}</p>
        </div>
      ) : (
        <div className="mt-5 rounded-2xl border border-border/70 bg-card">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>{columns.code}</TableHead>
                <TableHead>{columns.route}</TableHead>
                <TableHead>{columns.cargo}</TableHead>
                <TableHead className="text-right">{columns.value}</TableHead>
                <TableHead className="text-right">{columns.distance}</TableHead>
                <TableHead>{columns.status}</TableHead>
                <TableHead>{columns.finalized}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow
                  key={row.id}
                  role="button"
                  tabIndex={0}
                  className={cn("cursor-pointer", selectableItemHoverClassName)}
                  onClick={() => openFreight(row.id)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      openFreight(row.id);
                    }
                  }}
                >
                  <TableCell className="font-medium text-foreground">{row.code}</TableCell>
                  <TableCell className="max-w-[18rem]">
                    <span className="block truncate text-muted-foreground">{row.route}</span>
                  </TableCell>
                  <TableCell>{row.cargo}</TableCell>
                  <TableCell className="text-right font-medium tabular-nums text-foreground">
                    {row.value}
                  </TableCell>
                  <TableCell className="text-right tabular-nums text-muted-foreground">
                    {row.distance}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${row.statusClassName}`}
                      data-status={row.statusSlug}
                    >
                      {row.statusLabel}
                    </span>
                  </TableCell>
                  <TableCell>{row.finalizedAt}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <div className="mt-4 flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-center text-sm text-muted-foreground sm:text-left">
          {paginationShowing}{" "}
          <strong className="font-semibold tabular-nums text-foreground">{from}</strong>
          <span className="text-muted-foreground"> – </span>
          <strong className="font-semibold tabular-nums text-foreground">{to}</strong>{" "}
          {paginationOf}{" "}
          <strong className="font-semibold tabular-nums text-foreground">{total}</strong>{" "}
          {paginationFreights}
        </p>
        <div className="grid grid-cols-2 gap-2 sm:flex sm:justify-end">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="min-h-10 rounded-lg sm:min-h-9"
            disabled={!canGoPrev}
            onClick={onPrev}
          >
            {paginationPrev}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="min-h-10 rounded-lg sm:min-h-9"
            disabled={!canGoNext}
            onClick={onNext}
          >
            {paginationNext}
          </Button>
        </div>
      </div>
    </section>
  );
}
