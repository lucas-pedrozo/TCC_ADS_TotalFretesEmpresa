import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import http from "@/service/http";
import type { AdminAccountListResponse, AdminAccountType } from "@/types/admin";
import { trataErroAxios } from "@/utils/trataErroAxios";

export function useAdminDashboardStats() {
  const [stats, setStats] = useState({
    users: 0,
    companies: 0,
    freights: 0,
    proposals: 0,
    isLoading: true,
  });

  const load = useCallback(async () => {
    setStats((prev) => ({ ...prev, isLoading: true }));
    try {
      const [usersRes, companiesRes, freightsRes, proposalsRes] = await Promise.all([
        http.get<unknown[]>("/user"),
        http.get<unknown[]>("/company"),
        http.get<unknown[]>("/freight"),
        http.get<unknown[]>("/proposal"),
      ]);

      setStats({
        users: Array.isArray(usersRes.data) ? usersRes.data.length : 0,
        companies: Array.isArray(companiesRes.data) ? companiesRes.data.length : 0,
        freights: Array.isArray(freightsRes.data) ? freightsRes.data.length : 0,
        proposals: Array.isArray(proposalsRes.data) ? proposalsRes.data.length : 0,
        isLoading: false,
      });
    } catch (error) {
      toast.error(trataErroAxios(error));
      setStats((prev) => ({ ...prev, isLoading: false }));
      }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return { ...stats, reload: load };
}

export function useAdminAccountTypes() {
  const [types, setTypes] = useState<AdminAccountType[]>([]);

  useEffect(() => {
    void http.get<AdminAccountType[]>("/account/types").then(({ data }) => {
      setTypes(Array.isArray(data) ? data : []);
    });
  }, []);

  return types;
}

export function useAdminAccountsList() {
  const [items, setItems] = useState<AdminAccountListResponse["items"]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data } = await http.get<AdminAccountListResponse>("/account", {
        params: { page, limit: 20 },
      });
      setItems(data.items ?? []);
      const limit = data.limit ?? 20;
      setTotal(data.total ?? 0);
      setTotalPages(Math.max(1, Math.ceil((data.total ?? 0) / limit)));
    } catch (error) {
      toast.error(trataErroAxios(error));
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  }, [page]);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = items.filter((item) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      item.email.toLowerCase().includes(q) ||
      String(item.subject_id).includes(q) ||
      item.AccountType?.name?.toLowerCase().includes(q)
    );
  });

  return {
    items: filtered,
    isLoading,
    page,
    setPage,
    totalPages,
    total,
    search,
    setSearch,
    reload: load,
  };
}
