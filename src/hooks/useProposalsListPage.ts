import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import http from "@/service/http";
import type { AppLanguage } from "@/i18n/resources";
import type {
  ProposalDto,
  ProposalListKpis,
  ProposalListPaginatedResponse,
  ProposalStatusFilter,
} from "@/types/proposal";
import { resolveDriverProfilesFromProposals, type DriverProfile } from "@/utils/driverProfiles";
import { computeProposalListKpis, matchesProposalSearch } from "@/utils/proposal";
import { trataErroAxios } from "@/utils/trataErroAxios";

const PAGE_SIZE = 10;
const DEFAULT_STATUS_FILTER: ProposalStatusFilter = "enviada";

const EMPTY_SUMMARY: ProposalListKpis = {
  totalProposals: 0,
  pendingProposals: 0,
  acceptedProposals: 0,
  uniqueFreights: 0,
};

type UseProposalsListPageOptions = {
  defaultStatusFilter?: ProposalStatusFilter;
  pageSize?: number;
};

export function useProposalsListPage(options: UseProposalsListPageOptions = {}) {
  const { i18n } = useTranslation();
  const lang = i18n.language as AppLanguage;
  const defaultStatusFilter = options.defaultStatusFilter ?? DEFAULT_STATUS_FILTER;
  const pageSize = options.pageSize ?? PAGE_SIZE;
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ProposalStatusFilter>(defaultStatusFilter);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ProposalListPaginatedResponse | null>(null);
  const [searchSourceItems, setSearchSourceItems] = useState<ProposalDto[]>([]);
  const [driverProfilesById, setDriverProfilesById] = useState<Record<number, DriverProfile>>({});

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 300);
    return () => window.clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, statusFilter]);

  const loadPaginatedProposals = useCallback(async () => {
    try {
      setLoading(true);
      const { data: response } = await http.get<ProposalListPaginatedResponse>("/proposal", {
        params: {
          page,
          limit: pageSize,
          proposal_status: statusFilter,
        },
      });
      setData(response);
    } catch (e) {
      toast.error(trataErroAxios(e));
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, statusFilter]);

  const loadSearchProposals = useCallback(async () => {
    try {
      setLoading(true);
      const { data: response } = await http.get<ProposalDto[]>("/proposal", {
        params: {
          proposal_status: statusFilter,
        },
      });
      const list = Array.isArray(response) ? response : [];
      const profiles = await resolveDriverProfilesFromProposals(list);
      setSearchSourceItems(list);
      setDriverProfilesById(profiles);
      setData(null);
    } catch (e) {
      toast.error(trataErroAxios(e));
      setSearchSourceItems([]);
      setDriverProfilesById({});
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    if (debouncedSearch) {
      void loadSearchProposals();
      return;
    }

    setSearchSourceItems([]);
    setDriverProfilesById({});
    void loadPaginatedProposals();
  }, [debouncedSearch, loadPaginatedProposals, loadSearchProposals]);

  const filteredSearchItems = useMemo(() => {
    if (!debouncedSearch) return [];

    return searchSourceItems.filter((proposal) =>
      matchesProposalSearch(
        proposal,
        debouncedSearch,
        driverProfilesById[proposal.driver_id]?.name,
        lang
      )
    );
  }, [debouncedSearch, driverProfilesById, lang, searchSourceItems]);

  const isSearchMode = debouncedSearch.length > 0;
  const items = isSearchMode
    ? filteredSearchItems.slice((page - 1) * pageSize, page * pageSize)
    : (data?.items ?? []);
  const summary = isSearchMode
    ? computeProposalListKpis(filteredSearchItems)
    : (data?.summary ?? EMPTY_SUMMARY);

  const total = isSearchMode ? filteredSearchItems.length : (data?.total ?? 0);
  const hasMore = isSearchMode ? page * pageSize < filteredSearchItems.length : (data?.hasMore ?? false);

  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = total === 0 ? 0 : Math.min(page * pageSize, total);

  const canGoPrev = page > 1;
  const canGoNext = hasMore;

  const goPrev = useCallback(() => {
    setPage((current) => Math.max(1, current - 1));
  }, []);

  const goNext = useCallback(() => {
    if (hasMore) {
      setPage((current) => current + 1);
    }
  }, [hasMore]);

  const activeFilterCount = statusFilter === defaultStatusFilter ? 0 : 1;

  const clearStatusFilter = useCallback(() => {
    setStatusFilter(defaultStatusFilter);
  }, [defaultStatusFilter]);

  return {
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    defaultStatusFilter,
    activeFilterCount,
    clearStatusFilter,
    page,
    pageSize,
    loading,
    items,
    summary,
    total,
    from,
    to,
    canGoPrev,
    canGoNext,
    goPrev,
    goNext,
    driverProfilesById,
    loadProposals: isSearchMode ? loadSearchProposals : loadPaginatedProposals,
  };
}
