import { useEffect, useState } from "react";

import http from "@/service/http";
import type { AdminAccount, AdminCompany, AdminUser } from "@/types/admin";

export function useAdminSubjectNames() {
  const [namesByKey, setNamesByKey] = useState<Record<string, string>>({});

  useEffect(() => {
    void Promise.all([
      http.get<AdminUser[]>("/user"),
      http.get<AdminCompany[]>("/company"),
    ]).then(([usersRes, companiesRes]) => {
      const map: Record<string, string> = {};
      for (const user of Array.isArray(usersRes.data) ? usersRes.data : []) {
        if (user.id != null && user.name) {
          map[`USER:${user.id}`] = user.name;
        }
      }
      for (const company of Array.isArray(companiesRes.data) ? companiesRes.data : []) {
        if (company.id != null && company.name) {
          map[`COMPANY:${company.id}`] = company.name;
        }
      }
      setNamesByKey(map);
    });
  }, []);

  const resolveSubjectName = (account: AdminAccount): string => {
    const typeName = account.AccountType?.name?.trim().toUpperCase();
    if (typeName === "USER") {
      return namesByKey[`USER:${account.subject_id}`] ?? `#${account.subject_id}`;
    }
    if (typeName === "COMPANY") {
      return namesByKey[`COMPANY:${account.subject_id}`] ?? `#${account.subject_id}`;
    }
    if (typeName === "ADMIN") {
      return namesByKey[`USER:${account.subject_id}`] ?? `#${account.subject_id}`;
    }
    return String(account.subject_id);
  };

  return { resolveSubjectName };
}
