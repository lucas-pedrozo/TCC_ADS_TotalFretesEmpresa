import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import http from "@/service/http";
import { trataErroAxios } from "@/utils/trataErroAxios";

type PaginatedResponse<T> = {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore?: boolean;
};

type UseAdminPaginatedListOptions<T> = {
  path: string;
  pageSize?: number;
  search?: string;
  /** When true, sends `search` query param to the API (proposals). */
  serverSearch?: boolean;
  /** Client-side filter when API has no search (freights). */
  clientFilter?: (item: T, query: string) => boolean;
  /** Extra query params always sent with paginated requests. */
  queryParams?: Record<string, string | number>;
};

export function useAdminPaginatedList<T>({
  path,
  pageSize = 10,
  search = "",
  serverSearch = false,
  clientFilter,
  queryParams,
}: UseAdminPaginatedListOptions<T>) {
  const [items, setItems] = useState<T[]>([]);
  const [allItems, setAllItems] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [debouncedSearch, setDebouncedSearch] = useState(search);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(search), 300);
    return () => window.clearTimeout(timer);
  }, [search]);

  const queryParamsKey = JSON.stringify(queryParams ?? {});

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, queryParamsKey]);

  const useClientMode = Boolean(
    debouncedSearch.trim() && !serverSearch && clientFilter
  );

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      if (useClientMode) {
        const { data } = await http.get<T[] | PaginatedResponse<T>>(path);
        const list = Array.isArray(data) ? data : (data.items ?? []);
        setAllItems(list);
        const q = debouncedSearch.trim().toLowerCase();
        const filtered = list.filter((item) => clientFilter!(item, q));
        const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
        const safePage = Math.min(page, pages);
        const start = (safePage - 1) * pageSize;
        setItems(filtered.slice(start, start + pageSize));
        setTotal(filtered.length);
        setTotalPages(pages);
        if (safePage !== page) setPage(safePage);
        return;
      }

      const extraParams = queryParamsKey
        ? (JSON.parse(queryParamsKey) as Record<string, string | number>)
        : {};

      const params: Record<string, string | number> = {
        page,
        limit: pageSize,
        ...extraParams,
      };
      if (serverSearch && debouncedSearch.trim()) {
        params.search = debouncedSearch.trim();
      }

      const { data } = await http.get<T[] | PaginatedResponse<T>>(path, { params });
      if (Array.isArray(data)) {
        const totalItems = data.length;
        const pages = Math.max(1, Math.ceil(totalItems / pageSize));
        const safePage = Math.min(page, pages);
        const start = (safePage - 1) * pageSize;
        setItems(data.slice(start, start + pageSize));
        setTotal(totalItems);
        setTotalPages(pages);
        if (safePage !== page) setPage(safePage);
        return;
      }

      setItems(data.items ?? []);
      setTotal(data.total ?? 0);
      setTotalPages(Math.max(1, Math.ceil((data.total ?? 0) / pageSize)));
    } catch (error) {
      toast.error(trataErroAxios(error));
      setItems([]);
      setTotal(0);
      setTotalPages(1);
    } finally {
      setIsLoading(false);
    }
  }, [
    path,
    page,
    pageSize,
    debouncedSearch,
    serverSearch,
    clientFilter,
    useClientMode,
    queryParamsKey,
  ]);

  useEffect(() => {
    void load();
  }, [load]);

  const reload = load;

  const isInitialLoading = isLoading && items.length === 0;

  return useMemo(
    () => ({
      items,
      allItems,
      isLoading,
      isInitialLoading,
      page,
      setPage,
      pageSize,
      total,
      totalPages,
      reload,
    }),
    [items, allItems, isLoading, isInitialLoading, page, pageSize, total, totalPages, reload]
  );
}
