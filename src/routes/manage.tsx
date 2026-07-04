import { createFileRoute, Outlet } from "@tanstack/react-router";

import { ManagerShell } from "@/components/manager/ManagerShell";
import { RequireManager } from "@/components/manager/RequireManager";

export const Route = createFileRoute("/manage")({
  head: () => ({
    meta: [
      { title: "Manager Console — StayNest" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ManageLayout,
});

function ManageLayout() {
  return (
    <RequireManager>
      <ManagerShell>
        <Outlet />
      </ManagerShell>
    </RequireManager>
  );
}
