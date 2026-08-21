import { createFileRoute, redirect } from "@tanstack/react-router";

// Legacy/typed-in plural path: keep it working and point at the canonical listing.
export const Route = createFileRoute("/businesses/")({
  beforeLoad: () => {
    throw redirect({ to: "/business", replace: true });
  },
});
