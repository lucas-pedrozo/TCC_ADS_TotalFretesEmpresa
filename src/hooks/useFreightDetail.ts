import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import type { FreightStatusTimelineEntry } from "@/components/ui/freightStatusTimeline";
import { parseStatusSlug } from "@/components/ui/freightStatusUi";
import type {
  CargoTypeDto,
  FreightDeleteResponse,
  FreightDto,
  FreightStatusTypeDto,
  FreightUpdateBody,
  FreightUpdateResponse,
} from "@/types/freight";
import http from "@/service/http";
import { getFreightDetailProposalsMock, pickBestProposal } from "@/mocks/freightDetailProposalsMock";
import { traduzMensagemApi, trataErroAxios } from "@/utils/trataErroAxios";

type UseFreightDetailParams = {
  id?: string;
};

export function useFreightDetail({ id }: UseFreightDetailParams) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [freight, setFreight] = useState<FreightDto | null>(null);
  const [cargoTypes, setCargoTypes] = useState<CargoTypeDto[]>([]);
  const [statusTypes, setStatusTypes] = useState<FreightStatusTypeDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const statusTimelineHistory = useMemo((): FreightStatusTimelineEntry[] | undefined => {
    if (!freight) return undefined;
    const rows = freight.FreightStatusHistories;
    if (!Array.isArray(rows) || rows.length === 0) return undefined;
    const mapped = rows
      .map((row) => {
        const iso = row.occurred_at ?? row.occurredAt;
        if (!iso) return null;
        return {
          slug: parseStatusSlug(row.FreightStatusType?.name),
          occurredAt: String(iso),
        };
      })
      .filter((x): x is FreightStatusTimelineEntry => x != null);
    return mapped.length > 0 ? mapped : undefined;
  }, [freight]);

  const proposalsMock = useMemo(() => {
    if (!freight) return null;
    return getFreightDetailProposalsMock(freight);
  }, [freight]);

  const bestProposalRow = useMemo(() => {
    if (!proposalsMock) return undefined;
    return pickBestProposal(proposalsMock);
  }, [proposalsMock]);

  const loadAll = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const [freightRes, cargoRes, statusRes] = await Promise.all([
        http.get<FreightDto>(`/freight/${id}`),
        http.get<CargoTypeDto[]>("/cargo-type"),
        http.get<FreightStatusTypeDto[]>("/freight-status-type"),
      ]);
      setFreight(freightRes.data);
      setCargoTypes(Array.isArray(cargoRes.data) ? cargoRes.data : []);
      setStatusTypes(Array.isArray(statusRes.data) ? statusRes.data : []);
    } catch (e) {
      toast.error(trataErroAxios(e));
      setFreight(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  const handleUpdate = useCallback(
    async (body: FreightUpdateBody) => {
      if (!id) return false;
      try {
        setSaving(true);
        const { data } = await http.put<FreightUpdateResponse>(`/freight/${id}`, body);
        toast.success(traduzMensagemApi(data.message) ?? t("pages.freightDetail.savedOk"));
        setFreight(data.freight);
        return true;
      } catch (e) {
        toast.error(trataErroAxios(e));
        return false;
      } finally {
        setSaving(false);
      }
    },
    [id, t]
  );

  const handleDelete = useCallback(async () => {
    if (!id) return false;
    try {
      setDeleting(true);
      const { data } = await http.delete<FreightDeleteResponse>(`/freight/${id}`);
      toast.success(traduzMensagemApi(data.message) ?? t("pages.freightDetail.deletedOk"));
      navigate("/Freights", { replace: true });
      return true;
    } catch (e) {
      toast.error(trataErroAxios(e));
      return false;
    } finally {
      setDeleting(false);
    }
  }, [id, navigate, t]);

  return {
    freight,
    cargoTypes,
    statusTypes,
    loading,
    saving,
    deleting,
    statusTimelineHistory,
    proposalsMock,
    bestProposalRow,
    loadAll,
    handleUpdate,
    handleDelete,
  };
}
