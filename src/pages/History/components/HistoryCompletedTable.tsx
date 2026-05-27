import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { FreightStatusSlug } from "@/types/freight";

type HistoryCompletedTableRow = {
  id: number;
  code: string;
  route: string;
  cargo: string;
  value: string;
  statusLabel: string;
  statusSlug: FreightStatusSlug;
  finalizedAt: string;
  statusClassName: string;
};

type HistoryCompletedTableProps = {
  title: string;
  description: string;
  emptyLabel: string;
  columns: {
    code: string;
    route: string;
    cargo: string;
    value: string;
    status: string;
    finalized: string;
  };
  rows: HistoryCompletedTableRow[];
};

export function HistoryCompletedTable({
  title,
  description,
  emptyLabel,
  columns,
  rows,
}: HistoryCompletedTableProps) {
  return (
    <section className="rounded-[28px] border border-border bg-background p-5 shadow-sm md:p-6">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold tracking-tight text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
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
                <TableHead>{columns.status}</TableHead>
                <TableHead>{columns.finalized}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-medium text-foreground">{row.code}</TableCell>
                  <TableCell className="max-w-[18rem]">
                    <span className="block truncate text-muted-foreground">{row.route}</span>
                  </TableCell>
                  <TableCell>{row.cargo}</TableCell>
                  <TableCell className="text-right font-medium tabular-nums text-foreground">
                    {row.value}
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
    </section>
  );
}
