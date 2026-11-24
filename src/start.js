import { createStart } from "@tanstack/react-start";

// Local Kano Ledger: no Base44 middleware.
// Server-side auth is handled by the Express API on :3001 (proxied by Vite).
export const startInstance = createStart(() => ({}));
