import { useTranslation } from "react-i18next";

import { Badge } from "@/components/ui/badge";
import {
  FREIGHT_STATUS_LABEL_KEY,
  resolveFreightStatusSlug,
  statusBadgeClass,
} from "@/components/ui/freightStatusUi";
import { cn } from "@/lib/utils";
import type { FreightDto } from "@/types/freight";

type AdminFreightStatusBadgeProps = {
  freight: FreightDto;
};

export function AdminFreightStatusBadge({ freight }: AdminFreightStatusBadgeProps) {
  const { t } = useTranslation();
  const slug = resolveFreightStatusSlug({
    statusId: freight.status_id,
    statusName: freight.FreightStatusType?.name ?? freight.status?.name,
  });

  return (
    <Badge variant="outline" className={cn("font-medium", statusBadgeClass(slug))}>
      {t(FREIGHT_STATUS_LABEL_KEY[slug])}
    </Badge>
  );
}
