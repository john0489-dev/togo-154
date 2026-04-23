import { createFileRoute, redirect } from "@tanstack/react-router";

// Legacy route — redirect to canonical /pricing page so the upgrade flow has a single entry point.
export const Route = createFileRoute("/pro")({
  beforeLoad: () => {
    throw redirect({ to: "/pricing" });
  },
});
