import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import http from "@/service/http";
import { trataErroAxios } from "@/utils/trataErroAxios";
import type { CargoTypeDto, FreightCreateBody, FreightDto } from "@/types/freight";

import { FreightForm } from "./FreightForm";

type CreateResponse = {
  message?: string;
  freight: FreightDto;
};

const FreightNewPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [cargoTypes, setCargoTypes] = useState<CargoTypeDto[]>([]);
  const [loadingMeta, setLoadingMeta] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const loadMeta = useCallback(async () => {
    try {
      setLoadingMeta(true);
      const { data } = await http.get<CargoTypeDto[]>("/cargo-type");
      setCargoTypes(Array.isArray(data) ? data : []);
    } catch (e) {
      toast.error(trataErroAxios(e));
    } finally {
      setLoadingMeta(false);
    }
  }, []);

  useEffect(() => {
    void loadMeta();
  }, [loadMeta]);

  async function handleCreate(body: FreightCreateBody) {
    try {
      setSubmitting(true);
      const { data } = await http.post<CreateResponse>("/freight", body);
      toast.success(data.message ?? t("pages.freightDetail.createdOk"));
      const id = data.freight?.id;
      if (id != null) navigate(`/Freights/${id}`, { replace: true });
      else navigate("/Freights", { replace: true });
    } catch (e) {
      toast.error(trataErroAxios(e));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-w-0 flex-1 flex-col p-3 sm:p-4 md:p-6">
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Button
          type="button"
          variant="outline"
          className="rounded-lg"
          onClick={() => navigate("/Freights")}
        >
          {t("pages.freightDetail.back")}
        </Button>
        <h2 className="text-lg font-semibold text-foreground">
          {t("pages.freightDetail.newTitle")}
        </h2>
      </div>

      <div className="rounded-xl border border-border bg-card p-4 shadow-sm sm:p-6">
        {loadingMeta ? (
          <p className="text-sm text-muted-foreground">{t("pages.freightDetail.loading")}</p>
        ) : (
          <FreightForm
            cargoTypes={cargoTypes}
            onSubmit={handleCreate}
            submitLabel={t("pages.freightForm.create")}
            isSubmitting={submitting}
          />
        )}
      </div>
    </div>
  );
};

export default FreightNewPage;
