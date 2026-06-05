import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

import http from "@/service/http";
import { trataErroAxios, traduzMensagemApi } from "@/utils/trataErroAxios";

export type AdminCatalogField = {
  name: string;
  label: string;
  type?: "text" | "number";
  required?: boolean;
  placeholder?: string;
};

export type AdminCatalogConfig<T extends { id?: number }> = {
  endpoint: string;
  responseKey?: string;
  fields: AdminCatalogField[];
  getInitialForm: () => Record<string, string>;
  mapEntityToForm: (entity: T) => Record<string, string>;
  mapFormToPayload: (form: Record<string, string>) => Record<string, unknown>;
  searchFilter?: (entity: T, query: string) => boolean;
};

export function useAdminCatalogCrud<T extends { id?: number }>(
  config: AdminCatalogConfig<T>
) {
  const { t } = useTranslation();
  const [items, setItems] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editing, setEditing] = useState<T | null>(null);
  const [deleting, setDeleting] = useState<T | null>(null);
  const [form, setForm] = useState<Record<string, string>>(config.getInitialForm());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const pageSize = 10;

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data } = await http.get<T[] | { items?: T[] }>(config.endpoint);
      const list = Array.isArray(data) ? data : (data.items ?? []);
      setItems(list);
    } catch (error) {
      toast.error(trataErroAxios(error));
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  }, [config.endpoint]);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    if (config.searchFilter) return items.filter((item) => config.searchFilter!(item, q));
    return items.filter((item) =>
      JSON.stringify(item).toLowerCase().includes(q)
    );
  }, [config, items, search]);

  const openCreate = useCallback(() => {
    setEditing(null);
    setForm(config.getInitialForm());
    setDialogOpen(true);
  }, [config]);

  const openEdit = useCallback(
    (entity: T) => {
      setEditing(entity);
      setForm(config.mapEntityToForm(entity));
      setDialogOpen(true);
    },
    [config]
  );

  const openDelete = useCallback((entity: T) => {
    setDeleting(entity);
    setDeleteOpen(true);
  }, []);

  const updateField = useCallback((name: string, value: string) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleSubmit = useCallback(async () => {
    setIsSubmitting(true);
    const toastId = toast.loading(t("pages.admin.common.saving"));
    try {
      const payload = config.mapFormToPayload(form);
      if (editing?.id) {
        const { data } = await http.put(`${config.endpoint}/${editing.id}`, payload);
        toast.success(
          traduzMensagemApi((data as { message?: string }).message) ??
            t("pages.admin.common.saved"),
          { id: toastId }
        );
      } else {
        const { data } = await http.post(config.endpoint, payload);
        toast.success(
          traduzMensagemApi((data as { message?: string }).message) ??
            t("pages.admin.common.created"),
          { id: toastId }
        );
      }
      setDialogOpen(false);
      await load();
    } catch (error) {
      toast.error(trataErroAxios(error), { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  }, [config, editing, form, load, t]);

  const handleDelete = useCallback(async () => {
    if (!deleting?.id) return;
    setIsSubmitting(true);
    const toastId = toast.loading(t("pages.admin.common.deleting"));
    try {
      const { data } = await http.delete(`${config.endpoint}/${deleting.id}`);
      toast.success(
        traduzMensagemApi((data as { message?: string }).message) ??
          t("pages.admin.common.deleted"),
        { id: toastId }
      );
      setDeleteOpen(false);
      setDeleting(null);
      await load();
    } catch (error) {
      toast.error(trataErroAxios(error), { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  }, [config.endpoint, deleting, load, t]);

  return {
    items: filtered,
    isLoading,
    search,
    setSearch,
    page,
    setPage,
    pageSize,
    dialogOpen,
    setDialogOpen,
    deleteOpen,
    setDeleteOpen,
    editing,
    deleting,
    form,
    updateField,
    isSubmitting,
    openCreate,
    openEdit,
    openDelete,
    handleSubmit,
    handleDelete,
    reload: load,
  };
}
