import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { parseCnpjInput } from "@/utils/cnpjInRfb2229";
import type { AdminCreateCompanyForm } from "@/utils/adminCreateAccountPayload";
import { maskCep, maskCnpj, maskEmail, maskUf, normalizeCepInput } from "@/utils/mask";
import {
  formatPhoneCountryCode,
  maskPhoneNationalNumber,
  normalizePhoneCountryCodeInput,
  normalizePhoneNationalNumberInput,
} from "@/utils/phone";

type ViaCepResponse = {
  erro?: boolean;
  logradouro?: string;
  bairro?: string;
  localidade?: string;
  uf?: string;
};

type AdminCreateCompanyFieldsProps = {
  form: AdminCreateCompanyForm;
  onChange: <K extends keyof AdminCreateCompanyForm>(
    key: K,
    value: AdminCreateCompanyForm[K]
  ) => void;
  onPatch: (partial: Partial<AdminCreateCompanyForm>) => void;
};

export function AdminCreateCompanyFields({
  form,
  onChange,
  onPatch,
}: AdminCreateCompanyFieldsProps) {
  const { t } = useTranslation();
  const isBrazil = form.country.trim().toUpperCase() === "BR";
  const [isSearchingCep, setIsSearchingCep] = useState(false);
  const onPatchRef = useRef(onPatch);
  onPatchRef.current = onPatch;

  useEffect(() => {
    const digits = form.cep.replace(/\D/g, "");

    if (!isBrazil || digits.length !== 8) return;

    const controller = new AbortController();

    const fetchAddress = async () => {
      try {
        setIsSearchingCep(true);
        const response = await fetch(`https://viacep.com.br/ws/${digits}/json/`, {
          signal: controller.signal,
        });
        const data = (await response.json()) as ViaCepResponse;

        if (!response.ok || data.erro) {
          toast.error(t("pages.singupAddress.cepNotFound"));
          return;
        }

        onPatchRef.current({
          street: data.logradouro ?? "",
          district: data.bairro ?? "",
          city: data.localidade ?? "",
          state: data.uf ?? "",
        });
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
        toast.error(t("pages.singupAddress.cepLookupError"));
      } finally {
        setIsSearchingCep(false);
      }
    };

    void fetchAddress();

    return () => controller.abort();
  }, [form.cep, isBrazil, t]);

  return (
    <div className="grid max-h-[min(60vh,28rem)] gap-3 overflow-y-auto pr-1 sm:grid-cols-2">
      <div className="space-y-2 sm:col-span-2">
        <Label>{t("pages.admin.common.name")}</Label>
        <Input value={form.name} onChange={(e) => onChange("name", e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label>{t("pages.admin.common.email")}</Label>
        <Input
          type="email"
          autoComplete="email"
          value={form.email}
          onChange={(e) => onChange("email", maskEmail(e.target.value))}
        />
      </div>
      <div className="space-y-2">
        <Label>{t("pages.admin.accounts.companyBirthFundation")}</Label>
        <Input
          type="date"
          value={form.birthFundation}
          onChange={(e) => onChange("birthFundation", e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label>{t("pages.admin.accounts.cnpj")}</Label>
        <Input
          value={maskCnpj(form.cnpj)}
          maxLength={18}
          autoComplete="off"
          onChange={(e) => onChange("cnpj", parseCnpjInput(e.target.value))}
        />
      </div>
      <div className="space-y-2">
        <Label>{t("pages.admin.accounts.phone")}</Label>
        <div className="flex gap-2">
          <Input
            className="w-20"
            inputMode="numeric"
            autoComplete="tel-country-code"
            maxLength={4}
            value={formatPhoneCountryCode(form.phoneCountryCode)}
            onChange={(e) =>
              onChange("phoneCountryCode", normalizePhoneCountryCodeInput(e.target.value))
            }
          />
          <Input
            className="flex-1"
            inputMode="tel"
            autoComplete="tel-national"
            maxLength={20}
            value={maskPhoneNationalNumber(form.phoneNumber, form.phoneCountryCode)}
            onChange={(e) =>
              onChange(
                "phoneNumber",
                normalizePhoneNationalNumberInput(e.target.value, form.phoneCountryCode)
              )
            }
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label>{t("pages.admin.accounts.website")}</Label>
        <Input
          type="url"
          value={form.website}
          onChange={(e) => onChange("website", e.target.value)}
        />
      </div>
      <div className="space-y-2 sm:col-span-2">
        <Label>{t("pages.admin.accounts.addressSection")}</Label>
      </div>
      <div className="space-y-2">
        <Label>{t("pages.admin.companies.country")}</Label>
        <Input
          value={form.country}
          maxLength={2}
          onChange={(e) => onChange("country", e.target.value.toUpperCase().slice(0, 2))}
        />
      </div>
      <div className="space-y-2">
        <Label>{t("pages.admin.companies.cep")}</Label>
        <Input
          inputMode={isBrazil ? "numeric" : "text"}
          maxLength={isBrazil ? 9 : undefined}
          value={isBrazil ? maskCep(form.cep) : form.cep}
          onChange={(e) =>
            onChange("cep", isBrazil ? normalizeCepInput(e.target.value) : e.target.value)
          }
        />
        {isSearchingCep ? (
          <p className="text-sm text-muted-foreground">{t("pages.singupAddress.searchingCep")}</p>
        ) : null}
      </div>
      <div className="space-y-2 sm:col-span-2">
        <Label>{t("pages.admin.companies.street")}</Label>
        <Input value={form.street} onChange={(e) => onChange("street", e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label>{t("pages.admin.companies.district")}</Label>
        <Input value={form.district} onChange={(e) => onChange("district", e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label>{t("pages.admin.companies.number")}</Label>
        <Input value={form.number} onChange={(e) => onChange("number", e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label>{t("pages.admin.companies.city")}</Label>
        <Input value={form.city} onChange={(e) => onChange("city", e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label>{t("pages.admin.companies.state")}</Label>
        <Input
          value={isBrazil ? maskUf(form.state) : form.state}
          maxLength={isBrazil ? 2 : undefined}
          onChange={(e) =>
            onChange("state", isBrazil ? maskUf(e.target.value) : e.target.value)
          }
        />
      </div>
      <div className="space-y-2">
        <Label>{t("pages.admin.accounts.password")}</Label>
        <Input
          type="password"
          autoComplete="new-password"
          value={form.password}
          onChange={(e) => onChange("password", e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label>{t("pages.admin.accounts.passwordConfirm")}</Label>
        <Input
          type="password"
          autoComplete="new-password"
          value={form.passwordConfirm}
          onChange={(e) => onChange("passwordConfirm", e.target.value)}
        />
      </div>
    </div>
  );
}
