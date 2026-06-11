import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { DatePickerInput } from "@/components/custom/inputs/DatePickerInput";
import { adminNativeSelectClass } from "@/components/admin/adminNativeSelect";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import http from "@/service/http";
import type { AdminCnhType } from "@/types/admin";
import type { AdminCreateDriverForm } from "@/utils/adminCreateAccountPayload";
import {
  maskBrazilianPhone,
  maskCnhNumber,
  maskCpf,
  maskEmail,
  normalizeBrazilianPhoneInput,
  normalizeCnhInput,
  normalizeCpfInput,
} from "@/utils/mask";

type AdminCreateDriverFieldsProps = {
  form: AdminCreateDriverForm;
  onChange: <K extends keyof AdminCreateDriverForm>(
    key: K,
    value: AdminCreateDriverForm[K]
  ) => void;
};

export function AdminCreateDriverFields({ form, onChange }: AdminCreateDriverFieldsProps) {
  const { t } = useTranslation();
  const [cnhTypes, setCnhTypes] = useState<AdminCnhType[]>([]);

  useEffect(() => {
    void http.get<AdminCnhType[]>("/cnh").then(({ data }) => {
      setCnhTypes(Array.isArray(data) ? data : []);
    });
  }, []);

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
        <Label>{t("pages.admin.accounts.birthDate")}</Label>
        <DatePickerInput
          value={form.birthDate}
          onChange={(value) => onChange("birthDate", value)}
        />
      </div>
      <div className="space-y-2">
        <Label>{t("pages.admin.accounts.phone")}</Label>
        <Input
          inputMode="tel"
          autoComplete="tel"
          maxLength={15}
          value={maskBrazilianPhone(form.phoneNumber)}
          onChange={(e) => onChange("phoneNumber", normalizeBrazilianPhoneInput(e.target.value))}
        />
      </div>
      <div className="space-y-2">
        <Label>{t("pages.admin.accounts.cpf")}</Label>
        <Input
          inputMode="numeric"
          autoComplete="off"
          maxLength={14}
          value={maskCpf(form.cpf)}
          onChange={(e) => onChange("cpf", normalizeCpfInput(e.target.value))}
        />
      </div>
      <div className="space-y-2">
        <Label>{t("pages.admin.accounts.sex")}</Label>
        <select
          className={adminNativeSelectClass}
          value={form.sex}
          onChange={(e) => onChange("sex", e.target.value)}
        >
          <option value="M">{t("pages.admin.accounts.sexMale")}</option>
          <option value="F">{t("pages.admin.accounts.sexFemale")}</option>
        </select>
      </div>
      <div className="space-y-2">
        <Label>{t("pages.admin.accounts.cnhNumber")}</Label>
        <Input
          inputMode="numeric"
          autoComplete="off"
          maxLength={11}
          value={maskCnhNumber(form.cnhNumber)}
          onChange={(e) => onChange("cnhNumber", normalizeCnhInput(e.target.value))}
        />
      </div>
      <div className="space-y-2">
        <Label>{t("pages.admin.groupVehicleTypes.cnhType")}</Label>
        <select
          className={adminNativeSelectClass}
          value={form.cnhType_id}
          onChange={(e) => onChange("cnhType_id", e.target.value)}
        >
          <option value="">{t("pages.admin.groupVehicleTypes.selectCnh")}</option>
          {cnhTypes.map((type) => (
            <option key={type.id} value={String(type.id)}>
              {type.name}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-2 sm:col-span-2">
        <Label>{t("pages.admin.accounts.issuingAgencyCnh")}</Label>
        <Input
          value={form.issuingAgencyCnh}
          maxLength={100}
          onChange={(e) => onChange("issuingAgencyCnh", e.target.value)}
        />
      </div>
      <div className="flex items-center gap-2 sm:col-span-2">
        <input
          id="admin-driver-glasses"
          type="checkbox"
          checked={form.useGlasses}
          onChange={(e) => onChange("useGlasses", e.target.checked)}
        />
        <Label htmlFor="admin-driver-glasses">{t("pages.admin.accounts.useGlasses")}</Label>
      </div>
      <div className="flex items-center gap-2 sm:col-span-2">
        <input
          id="admin-driver-deficient"
          type="checkbox"
          checked={form.isDeficient}
          onChange={(e) => onChange("isDeficient", e.target.checked)}
        />
        <Label htmlFor="admin-driver-deficient">{t("pages.admin.accounts.isDeficient")}</Label>
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
