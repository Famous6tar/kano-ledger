// The Base44 platform injected appId/token via a virtual module. Locally there's nothing to inject.
export function getAppParams() {
  return { appId: "local", token: null, functionsVersion: "local", appBaseUrl: "" };
}