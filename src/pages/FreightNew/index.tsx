import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { AddressMapPicker } from "@/components/maps/AddressMapPicker";
import { FreightForm } from "@/components/ui/freightForm";
import { Button } from "@/components/ui/button";
import { useFreightCreateWizard } from "@/hooks/useFreightCreateWizard";
import type {
  FreightWizardStep,
} from "@/types/freight";

const MAPBOX_PK = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN?.trim() ?? "";

const FreightNewPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const {
    step,
    origin,
    destination,
    cargoTypes,
    loadingMeta,
    submitting,
    initialOriginQuery,
    syncOrigin,
    syncDestination,
    handleCreate,
    handleStepNext,
    handleStepBack,
  } = useFreightCreateWizard();

  const stepTitle =
    step === 1
      ? t("pages.freightWizard.stepOrigin")
      : step === 2
        ? t("pages.freightWizard.stepDestination")
        : t("pages.freightWizard.stepCargo");

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:p-4 md:p-6">
      <div className="mb-3 flex flex-col gap-3 sm:mb-4 sm:flex-row sm:flex-wrap sm:items-center">
        <Button
          type="button"
          variant="outline"
          className="min-h-11 w-full shrink-0 rounded-lg sm:min-h-9 sm:w-auto"
          onClick={() => navigate("/Freights")}
        >
          {t("pages.freightDetail.back")}
        </Button>
        <h2 className="min-w-0 text-lg font-semibold text-foreground sm:ml-0">
          {t("pages.freightDetail.newTitle")}
        </h2>
      </div>

      <div className="mb-3 -mx-1 flex snap-x snap-mandatory gap-2 overflow-x-auto pb-1 sm:mx-0 sm:mb-4 sm:flex-wrap sm:overflow-visible sm:pb-0">
        {[1, 2, 3].map((n) => (
          <span
            key={n}
            className={
              "shrink-0 snap-start rounded-full px-3 py-2 text-center text-xs font-medium sm:py-1 " +
              (step === (n as FreightWizardStep)
                ? "bg-brand-green text-white"
                : "bg-muted text-muted-foreground")
            }
          >
            {n}
          </span>
        ))}
        <span className="min-w-[12rem] self-center pl-1 text-sm text-muted-foreground sm:min-w-0 sm:pl-0">
          {t("pages.freightWizard.stepProgress", { current: step })}
        </span>
      </div>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col rounded-xl border border-border bg-card shadow-sm">
        <div className="border-b border-border px-3 py-3 sm:px-6 sm:py-4">
          <h3 className="text-base font-semibold leading-snug text-foreground">{stepTitle}</h3>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-3 py-4 sm:px-6 sm:py-5">
          {loadingMeta ? (
            <p className="text-sm text-muted-foreground">{t("pages.freightDetail.loading")}</p>
          ) : step === 1 ? (
            <AddressMapPicker
              key="wizard-origin"
              accessToken={MAPBOX_PK}
              initialSearchQuery={initialOriginQuery}
              value={origin}
              onChange={syncOrigin}
            />
          ) : step === 2 ? (
            <AddressMapPicker
              key="wizard-destination"
              accessToken={MAPBOX_PK}
              value={destination}
              onChange={syncDestination}
            />
          ) : (
            <div className="flex flex-col gap-4">
              <FreightForm
                cargoTypes={cargoTypes}
                cargoFieldsOnly
                onSubmit={handleCreate}
                submitLabel={t("pages.freightForm.create")}
                isSubmitting={submitting}
              />
            </div>
          )}
        </div>

        {!loadingMeta && step !== 3 ? (
          <div className="sticky bottom-0 z-10 flex shrink-0 flex-col gap-2 border-t border-border bg-card/95 px-3 py-3 backdrop-blur-sm supports-[backdrop-filter]:bg-card/80 sm:static sm:flex-row sm:flex-wrap sm:border-t-0 sm:bg-transparent sm:px-6 sm:py-4 sm:backdrop-blur-none">
            <Button
              type="button"
              variant="outline"
              className="min-h-11 w-full rounded-lg sm:min-h-9 sm:w-auto"
              onClick={handleStepBack}
            >
              {t("pages.freightWizard.back")}
            </Button>
            <Button
              type="button"
              className="min-h-11 w-full rounded-lg bg-brand-green text-white hover:bg-brand-green-dark sm:min-h-9 sm:w-auto sm:min-w-[8rem]"
              onClick={handleStepNext}
            >
              {t("pages.freightWizard.next")}
            </Button>
          </div>
        ) : !loadingMeta && step === 3 ? (
          <div className="flex shrink-0 flex-col gap-2 border-t border-border bg-card/95 px-3 py-3 backdrop-blur-sm supports-[backdrop-filter]:bg-card/80 sm:static sm:flex-row sm:border-t-0 sm:bg-transparent sm:px-6 sm:py-4 sm:backdrop-blur-none">
            <Button
              type="button"
              variant="outline"
              className="min-h-11 w-full rounded-lg sm:min-h-9 sm:w-auto"
              onClick={handleStepBack}
            >
              {t("pages.freightWizard.back")}
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default FreightNewPage;
