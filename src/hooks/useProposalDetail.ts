import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import http from "@/service/http";
import type {
  ProposalAcceptResponse,
  ProposalDto,
  ProposalRejectResponse,
} from "@/types/proposal";
import type { UserDto } from "@/types/user";
import { getFreightFromProposal, isPendingProposalStatus } from "@/utils/proposal";
import { traduzMensagemApi, trataErroAxios } from "@/utils/trataErroAxios";

type UseProposalDetailParams = {
  proposalId?: string;
};

export function useProposalDetail({ proposalId }: UseProposalDetailParams) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [proposal, setProposal] = useState<ProposalDto | null>(null);
  const [driverProfile, setDriverProfile] = useState<{
    name: string | null;
    vehicle: string | null;
    imageUrl: string | null;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const freight = useMemo(
    () => (proposal ? getFreightFromProposal(proposal) : null),
    [proposal]
  );

  const canActOnProposal = useMemo(() => {
    if (!proposal) return false;
    return isPendingProposalStatus(proposal.ProposalStatusType?.name);
  }, [proposal]);

  const loadProposal = useCallback(async () => {
    if (!proposalId) return;
    try {
      setLoading(true);
      const { data } = await http.get<ProposalDto>(`/proposal/${proposalId}`);
      setProposal(data);
    } catch (e) {
      toast.error(trataErroAxios(e));
      setProposal(null);
    } finally {
      setLoading(false);
    }
  }, [proposalId]);

  useEffect(() => {
    void loadProposal();
  }, [loadProposal]);

  useEffect(() => {
    const driverId = proposal?.driver_id;
    if (!driverId) {
      setDriverProfile(null);
      return;
    }

    const driverFromProposal = proposal?.Driver;
    const proposalImageUrl = driverFromProposal?.UserImage?.url?.trim() || null;
    const proposalName = driverFromProposal?.name?.trim() || null;

    let cancelled = false;

    async function loadDriverProfile() {
      try {
        const { data } = await http.get<UserDto>(`/user/${driverId}`);
        const vehicleTypeName = data.Vehicle?.VehicleType?.nome ?? data.Vehicle?.VehicleType?.name;
        const markModel = [data.Vehicle?.mark, data.Vehicle?.model].filter(Boolean).join(" ");
        const vehicle = vehicleTypeName || markModel || null;
        const imageUrl = proposalImageUrl || data.UserImage?.url?.trim() || null;
        if (!cancelled) {
          setDriverProfile({
            name: proposalName || data.name?.trim() || null,
            vehicle,
            imageUrl,
          });
        }
      } catch {
        if (!cancelled) {
          setDriverProfile({
            name: proposalName,
            vehicle: null,
            imageUrl: proposalImageUrl,
          });
        }
      }
    }

    void loadDriverProfile();

    return () => {
      cancelled = true;
    };
  }, [proposal?.driver_id, proposal?.Driver]);

  const handleAccept = useCallback(async () => {
    if (!proposal?.id) return false;
    try {
      setActionLoading(true);
      const { data } = await http.patch<ProposalAcceptResponse>(`/proposal/${proposal.id}/accept`, {});
      toast.success(
        traduzMensagemApi(data.message) ?? t("pages.freightDetail.acceptProposalSuccess")
      );
      setProposal(data.proposal);
      await loadProposal();
      return true;
    } catch (e) {
      toast.error(trataErroAxios(e));
      return false;
    } finally {
      setActionLoading(false);
    }
  }, [loadProposal, proposal?.id, t]);

  const handleReject = useCallback(async () => {
    if (!proposal?.id) return false;
    try {
      setActionLoading(true);
      const { data } = await http.patch<ProposalRejectResponse>(`/proposal/${proposal.id}/reject`, {});
      toast.success(
        traduzMensagemApi(data.message) ?? t("pages.freightDetail.rejectProposalSuccess")
      );
      setProposal(data.proposal);
      await loadProposal();
      return true;
    } catch (e) {
      toast.error(trataErroAxios(e));
      return false;
    } finally {
      setActionLoading(false);
    }
  }, [loadProposal, proposal?.id, t]);

  const goBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  const openFreight = useCallback(() => {
    if (!freight?.id) return;
    void navigate(`/Freights/${freight.id}`);
  }, [freight?.id, navigate]);

  return {
    proposal,
    freight,
    driverProfile,
    loading,
    actionLoading,
    canActOnProposal,
    loadProposal,
    handleAccept,
    handleReject,
    goBack,
    openFreight,
  };
}
