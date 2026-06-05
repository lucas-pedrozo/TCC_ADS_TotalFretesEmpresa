import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ProposalDto } from "@/types/proposal";
import { proposalStatusBadgeClass } from "@/utils/proposal";

type AdminProposalStatusBadgeProps = {
  proposal: ProposalDto;
};

export function AdminProposalStatusBadge({ proposal }: AdminProposalStatusBadgeProps) {
  const statusName = proposal.ProposalStatusType?.name;

  return (
    <Badge
      variant="outline"
      className={cn("font-medium", proposalStatusBadgeClass(statusName))}
    >
      {statusName ?? "—"}
    </Badge>
  );
}
