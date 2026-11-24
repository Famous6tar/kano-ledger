// TanStack Start SSR entry for Kano Ledger (local build).
// No Base44 error reporting, no Cloudflare Worker wrapper.
import { createStartHandler, defaultStreamHandler } from "@tanstack/react-start/server";

export default { fetch: createStartHandler(defaultStreamHandler) };