import { useTranslation } from "react-i18next";

import { AdminCatalogPage } from "@/components/admin/AdminCatalogPage";
import type { AdminNamedEntity } from "@/types/admin";

const AdminFreightStatusTypesPage = () => {
  const { t } = useTranslation();

  return (
    <AdminCatalogPage<AdminNamedEntity>
      title={t("pages.admin.freightStatusTypes.title")}
      description={t("pages.admin.freightStatusTypes.description")}
      deleteDescription={(row) =>
        t("pages.admin.freightStatusTypes.deleteConfirm", { name: row.name })
      }
      config={{
        endpoint: "/freight-status-type",
        fields: [
          {
            name: "name",
            label: t("pages.admin.common.name"),
            required: true,
          },
        ],
        getInitialForm: () => ({ name: "" }),
        mapEntityToForm: (entity) => ({ name: entity.name ?? "" }),
        mapFormToPayload: (form) => ({ name: form.name.trim() }),
        searchFilter: (entity, query) =>
          (entity.name ?? "").toLowerCase().includes(query),
      }}
      columns={[
        { key: "id", header: "ID", cell: (row) => row.id },
        { key: "name", header: t("pages.admin.common.name"), cell: (row) => row.name },
      ]}
    />
  );
};

export default AdminFreightStatusTypesPage;
