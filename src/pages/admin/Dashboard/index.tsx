import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Building2, FileText, Truck, Users } from "lucide-react";

import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useAdminDashboardStats } from "@/hooks/admin/useAdminDashboard";

const AdminDashboardPage = () => {
  const { t } = useTranslation();
  const stats = useAdminDashboardStats();

  const cards = [
    { label: t("pages.admin.dashboard.users"), value: stats.users, icon: Users, to: "/admin/users" },
    {
      label: t("pages.admin.dashboard.companies"),
      value: stats.companies,
      icon: Building2,
      to: "/admin/companies",
    },
    {
      label: t("pages.admin.dashboard.freights"),
      value: stats.freights,
      icon: Truck,
      to: "/admin/freights",
    },
    {
      label: t("pages.admin.dashboard.proposals"),
      value: stats.proposals,
      icon: FileText,
      to: "/admin/proposals",
    },
  ];

  return (
    <AdminPageShell
      title={t("pages.admin.dashboard.title")}
      description={t("pages.admin.dashboard.description")}
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <Card key={card.to}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.label}</CardTitle>
              <card.icon className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {stats.isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-2xl font-bold">{card.value}</div>
              )}
              <Button variant="link" className="mt-2 h-auto p-0" render={<Link to={card.to} />}>
                {t("pages.admin.dashboard.viewModule")}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </AdminPageShell>
  );
};

export default AdminDashboardPage;
