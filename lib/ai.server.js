// Base44's AI gateway is not available locally. If you need AI later, wire a real
// OpenAI/Anthropic key here — nothing in the current app calls this.
export const gatewayModel = () => {
  throw new Error("AI is not enabled in this local build.");
};