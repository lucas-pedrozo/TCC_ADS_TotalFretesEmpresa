import { useTranslation } from "react-i18next";

import { AdminCatalogPage } from "@/components/admin/AdminCatalogPage";
import type { AdminCnhType } from "@/types/admin";

const AdminCnhTypesPage = () => {
  const { t } = useTranslation();

  return (
    <AdminCatalogPage<AdminCnhType>
      title={t("pages.admin.cnhTypes.title")}
      description={t("pages.admin.cnhTypes.description")}
      deleteDescription={(row) =>
        t("pages.admin.cnhTypes.deleteConfirm", { name: row.name })
      }
      config={{
        endpoint: "/cnh",
        fields: [
          { name: "name", label: t("pages.admin.common.name"), required: true },
          {
            name: "description",
            label: t("pages.admin.common.description"),
            required: true,
          },
        ],
        getInitialForm: () => ({ name: "", description: "" }),
        mapEntityToForm: (entity) => ({
          name: entity.name ?? "",
          description: entity.description ?? "",
        }),
        mapFormToPayload: (form) => ({
          name: form.name.trim(),
          description: form.description.trim(),
        }),
      }}
      columns={[
        { key: "id", header: "ID", cell: (row) => row.id },
        { key: "name", header: t("pages.admin.common.name"), cell: (row) => row.name },
        {
          key: "description",
          header: t("pages.admin.common.description"),
          cell: (row) => row.description,
        },
      ]}
    />
  );
};

export default AdminCnhTypesPage;
