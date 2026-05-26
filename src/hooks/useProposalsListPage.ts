import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import http from "@/service/http";
import type {
  ProposalListKpis,
  ProposalListPaginatedResponse,
  ProposalStatusFilter,
} from "@/types/proposal";
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
  const defaultStatusFilter = options.defaultStatusFilter ?? DEFAULT_STATUS_FILTER;
  const pageSize = options.pageSize ?? PAGE_SIZE;
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ProposalStatusFilter>(defaultStatusFilter);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ProposalListPaginatedResponse | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 300);
    return () => window.clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, statusFilter]);

  const loadProposals = useCallback(async () => {
    try {
      setLoading(true);
      const params: Record<string, string | number> = {
        page,
        limit: pageSize,
        proposal_status: statusFilter,
      };
      if (debouncedSearch) {
        params.search = debouncedSearch;
      }

      const { data: response } = await http.get<ProposalListPaginatedResponse>("/proposal", {
        params,
      });
      setData(response);
    } catch (e) {
      toast.error(trataErroAxios(e));
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, statusFilter, debouncedSearch]);

  useEffect(() => {
    void loadProposals();
  }, [loadProposals]);

  const items = data?.items ?? [];
  const summary = data?.summary ?? EMPTY_SUMMARY;

  const total = data?.total ?? 0;
  const hasMore = data?.hasMore ?? false;

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
    loadProposals,
  };
}
