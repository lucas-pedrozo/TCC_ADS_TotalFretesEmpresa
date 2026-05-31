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
  FreightCompleteResponse,
  FreightStatusTypeDto,
  FreightUpdateBody,
  FreightUpdateResponse,
} from "@/types/freight";
import type { ProposalAcceptResponse, ProposalDto, ProposalRejectResponse } from "@/types/proposal";
import {
  resolveDriverProfilesFromProposals,
  type DriverProfile,
} from "@/utils/driverProfiles";
import http from "@/service/http";
import { pickBestProposal } from "@/utils/proposal";
import { traduzMensagemApi, trataErroAxios } from "@/utils/trataErroAxios";

type UseFreightDetailParams = {
  id?: string;
};

const ACCEPTED_STATUS_NAMES = new Set(["aceita", "accepted", "aceito"]);
const PENDING_STATUS_NAME = "enviada";

export function useFreightDetail({ id }: UseFreightDetailParams) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [freight, setFreight] = useState<FreightDto | null>(null);
  const [cargoTypes, setCargoTypes] = useState<CargoTypeDto[]>([]);
  const [statusTypes, setStatusTypes] = useState<FreightStatusTypeDto[]>([]);
  const [proposals, setProposals] = useState<ProposalDto[]>([]);
  const [driverProfilesById, setDriverProfilesById] = useState<Record<number, DriverProfile>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [proposalActionId, setProposalActionId] = useState<number | null>(null);

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

  const visibleProposals = useMemo(() => {
    if (proposals.length === 0) return [];

    const accepted = proposals.filter((proposal) =>
      ACCEPTED_STATUS_NAMES.has((proposal.ProposalStatusType?.name ?? "").toLowerCase())
    );
    if (accepted.length > 0) return accepted;

    return proposals.filter(
      (proposal) => (proposal.ProposalStatusType?.name ?? "").toLowerCase() === PENDING_STATUS_NAME
    );
  }, [proposals]);

  const bestProposal = useMemo(() => {
    return pickBestProposal(visibleProposals, freight?.originalValue);
  }, [visibleProposals, freight?.originalValue]);

  useEffect(() => {
    if (proposals.length === 0) {
      setDriverProfilesById({});
      return;
    }

    let cancelled = false;

    async function loadDriverProfiles() {
      const profiles = await resolveDriverProfilesFromProposals(proposals);
      if (!cancelled) {
        setDriverProfilesById(profiles);
      }
    }

    void loadDriverProfiles();

    return () => {
      cancelled = true;
    };
  }, [proposals]);

  const featuredDriverName = useMemo(() => {
    if (!bestProposal?.driver_id) return null;
    return driverProfilesById[bestProposal.driver_id]?.name ?? null;
  }, [bestProposal?.driver_id, driverProfilesById]);

  const featuredDriverVehicle = useMemo(() => {
    if (!bestProposal?.driver_id) return null;
    return driverProfilesById[bestProposal.driver_id]?.vehicle ?? null;
  }, [bestProposal?.driver_id, driverProfilesById]);

  const loadAll = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const [freightRes, cargoRes, statusRes, proposalRes] = await Promise.all([
        http.get<FreightDto>(`/freight/${id}`),
        http.get<CargoTypeDto[]>("/cargo-type"),
        http.get<FreightStatusTypeDto[]>("/freight-status-type"),
        http.get<ProposalDto[]>("/proposal", { params: { freight_id: Number(id) } }),
      ]);
      setFreight(freightRes.data);
      setCargoTypes(Array.isArray(cargoRes.data) ? cargoRes.data : []);
      setStatusTypes(Array.isArray(statusRes.data) ? statusRes.data : []);
      setProposals(Array.isArray(proposalRes.data) ? proposalRes.data : []);
    } catch (e) {
      toast.error(trataErroAxios(e));
      setFreight(null);
      setProposals([]);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  useEffect(() => {
    if (!id) return;

    const refreshIntervalMs = 10000;
    const intervalId = window.setInterval(() => {
      void loadAll();
    }, refreshIntervalMs);

    const handleWindowFocus = () => {
      void loadAll();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void loadAll();
      }
    };

    window.addEventListener("focus", handleWindowFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("focus", handleWindowFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [id, loadAll]);

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

  const handleCancelFreight = useCallback(async () => {
    if (!id) return false;
    try {
      setCancelling(true);
      const { data } = await http.patch<FreightUpdateResponse>(`/freight/${id}/cancel`, {});
      toast.success(traduzMensagemApi(data.message) ?? t("pages.freightDetail.cancelledOk"));
      setFreight(data.freight);
      await loadAll();
      return true;
    } catch (e) {
      toast.error(trataErroAxios(e));
      return false;
    } finally {
      setCancelling(false);
    }
  }, [id, loadAll, t]);

  const handleCompleteFreight = useCallback(async () => {
    if (!id) return false;
    try {
      setCompleting(true);
      const { data } = await http.patch<FreightCompleteResponse>(`/freight/${id}/complete`, {});
      toast.success(traduzMensagemApi(data.message) ?? t("pages.freightDetail.completedOk"));
      setFreight(data.freight);
      await loadAll();
      return true;
    } catch (e) {
      toast.error(trataErroAxios(e));
      return false;
    } finally {
      setCompleting(false);
    }
  }, [id, loadAll, t]);

  const handleAcceptProposal = useCallback(
    async (proposalId: number) => {
      try {
        setProposalActionId(proposalId);
        const { data } = await http.patch<ProposalAcceptResponse>(`/proposal/${proposalId}/accept`, {});
        toast.success(
          traduzMensagemApi(data.message) ?? t("pages.freightDetail.acceptProposalSuccess")
        );
        await loadAll();
        return true;
      } catch (e) {
        toast.error(trataErroAxios(e));
        return false;
      } finally {
        setProposalActionId(null);
      }
    },
    [loadAll, t]
  );

  const handleRejectProposal = useCallback(
    async (proposalId: number) => {
      try {
        setProposalActionId(proposalId);
        const { data } = await http.patch<ProposalRejectResponse>(`/proposal/${proposalId}/reject`, {});
        toast.success(
          traduzMensagemApi(data.message) ?? t("pages.freightDetail.rejectProposalSuccess")
        );
        await loadAll();
        return true;
      } catch (e) {
        toast.error(trataErroAxios(e));
        return false;
      } finally {
        setProposalActionId(null);
      }
    },
    [loadAll, t]
  );

  return {
    freight,
    cargoTypes,
    statusTypes,
    loading,
    saving,
    deleting,
    cancelling,
    completing,
    proposalActionId,
    statusTimelineHistory,
    proposals: visibleProposals,
    bestProposal,
    driverProfilesById,
    featuredDriverName,
    featuredDriverVehicle,
    loadAll,
    handleUpdate,
    handleDelete,
    handleCancelFreight,
    handleCompleteFreight,
    handleAcceptProposal,
    handleRejectProposal,
  };
}
