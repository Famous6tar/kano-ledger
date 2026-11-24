import { useRef, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowRight, ImagePlus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Image } from "@/components/ui/image";
import { ThemeToggle } from "@/components/ThemeToggle";
import { brandChannels } from "@/components/brand/BrandProvider";
import { extractDominantColor, readFileAsDataUrl } from "@/lib/logo-color";
import { saveProfile, uploadLogo } from "@/lib/shop";
import { initials } from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authed/setup")({
  head: () => ({ meta: [{ title: "Register your brand · Kanti" }] }),
  component: SetupPage,
});

const SWATCHES = ["#0E7C66", "#1D4ED8", "#B91C1C", "#7C3AED", "#B45309", "#0F172A"];

function SetupPage() {
  const navigate = useNavigate();
  const fileRef = useRef(null);
  const [draft, setDraft] = useState({
    business_name: "",
    tagline: "",
    logo_url: "",
    brand_color: "#0E7C66",
    phone: "",
    address: "",
    receipt_note: "Thank you for your business. Please keep this receipt for your records.",
  });
  const [saving, setSaving] = useState(false);

  const update = (patch) => setDraft((prev) => ({ ...prev, ...patch }));
  const channels = brandChannels(draft.brand_color, false);

  const onLogo = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const dataUrl = await readFileAsDataUrl(file);
    const color = await extractDominantColor(dataUrl);
    update({ logo_url: dataUrl, ...(color ? { brand_color: color } : {}) });
    try {
      const url = await uploadLogo(file);
      update({ logo_url: url });
    } catch {
      /* keep the local preview if the upload fails */
    }
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!draft.business_name.trim()) return;
    setSaving(true);
    try {
      await saveProfile(draft);
      toast.success("Workspace ready");
      navigate({ to: "/" });
    } catch (error) {
      toast.error(error?.message || "Could not save your brand");
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto grid min-h-screen w-full max-w-6xl items-center gap-10 px-5 py-10 lg:grid-cols-2 lg:gap-16 lg:py-16">
        <div className="order-2 lg:order-1">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
            Step 1 of 1
          </p>
          <h1 className="mt-3 font-display text-[2.6rem] leading-[0.95] tracking-tight text-foreground sm:text-5xl">
            Register your brand
          </h1>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
            Add your shop name and logo once. Every balance, transaction and receipt will carry your
            colours from here on.
          </p>

          <form onSubmit={submit} className="mt-8 space-y-5">
            <div>
              <Label htmlFor="setup-name">Business name</Label>
              <Input
                id="setup-name"
                value={draft.business_name}
                onChange={(e) => update({ business_name: e.target.value })}
                placeholder="Sahad Stores"
                className="mt-1.5 h-12 rounded-xl text-base"
                autoFocus
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="setup-tagline">Tagline</Label>
                <Input
                  id="setup-tagline"
                  value={draft.tagline}
                  onChange={(e) => update({ tagline: e.target.value })}
                  placeholder="Wholesale & provisions · Kano"
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="setup-phone">Phone</Label>
                <Input
                  id="setup-phone"
                  value={draft.phone}
                  onChange={(e) => update({ phone: e.target.value })}
                  placeholder="+234 …"
                  className="mt-1.5"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="setup-address">Address</Label>
              <Input
                id="setup-address"
                value={draft.address}
                onChange={(e) => update({ address: e.target.value })}
                placeholder="12 France Road, Sabon Gari, Kano"
                className="mt-1.5"
              />
            </div>

            <div>
              <Label>Logo &amp; colour</Label>
              <div className="mt-1.5 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2.5 text-xs font-semibold text-foreground transition-colors hover:border-brand/40 hover:text-brand"
                >
                  <ImagePlus className="h-4 w-4" /> Upload logo
                </button>
                <div className="flex gap-1.5">
                  {SWATCHES.map((swatch) => (
                    <button
                      key={swatch}
                      type="button"
                      aria-label={`Use ${swatch}`}
                      onClick={() => update({ brand_color: swatch })}
                      className={cn(
                        "h-7 w-7 rounded-full ring-2 ring-offset-2 ring-offset-background transition",
                        draft.brand_color?.toLowerCase() === swatch.toLowerCase()
                          ? "ring-foreground"
                          : "ring-transparent"
                      )}
                      style={{ backgroundColor: swatch }}
                    />
                  ))}
                </div>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onLogo} />
              </div>
              <p className="mt-2 text-[0.7rem] text-muted-foreground">
                We pull the main colour out of your logo automatically — you can change it any time.
              </p>
            </div>

            <div>
              <Label htmlFor="setup-note">Receipt footer</Label>
              <Textarea
                id="setup-note"
                value={draft.receipt_note}
                onChange={(e) => update({ receipt_note: e.target.value })}
                rows={2}
                className="mt-1.5"
              />
            </div>

            <Button
              type="submit"
              disabled={saving || !draft.business_name.trim()}
              className="h-12 w-full rounded-full bg-brand text-brand-foreground hover:bg-brand/90"
            >
              {saving ? "Setting up…" : "Create my workspace"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>
        </div>

        <div className="order-1 lg:order-2">
          <div className="relative overflow-hidden rounded-[2rem] border border-border/70 bg-card p-6 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_40px_80px_-60px_rgba(16,24,40,0.6)]">
            <div
              aria-hidden="true"
              className="absolute inset-0"
              style={{
                background: `radial-gradient(120% 120% at 100% 0%, ${draft.brand_color}55 0%, ${draft.brand_color}18 34%, transparent 68%)`,
              }}
            />
            <div className="relative">
              <div className="flex items-center gap-3">
                {draft.logo_url ? (
                  <Image
                    src={draft.logo_url}
                    alt="Brand logo preview"
                    className="h-12 w-12 rounded-2xl object-cover ring-1 ring-black/10"
                    fittingType="fill"
                  />
                ) : (
                  <div
                    className="grid h-12 w-12 place-items-center rounded-2xl font-heading text-sm font-bold text-white"
                    style={{ backgroundColor: draft.brand_color }}
                  >
                    {initials(draft.business_name || "Your business")}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="truncate font-heading text-base font-bold tracking-tight text-foreground">
                    {draft.business_name || "Your business"}
                  </p>
                  <p className="truncate text-[0.72rem] text-muted-foreground">
                    {draft.tagline || "Shop finance & debt ledger"}
                  </p>
                </div>
              </div>

              <div className="mt-6 rounded-2xl bg-background/80 p-5 backdrop-blur">
                <p className="text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  Total outstanding
                </p>
                <p className="tnum mt-2 font-display text-4xl leading-none tracking-tight text-foreground">
                  ₦560,000
                </p>
                <div className="mt-4 flex items-center gap-2">
                  <span
                    className="rounded-full px-2.5 py-1 text-[0.6rem] font-bold uppercase tracking-[0.1em] text-white"
                    style={{ backgroundColor: draft.brand_color }}
                  >
                    Owing
                  </span>
                  <span className="text-[0.7rem] text-muted-foreground">4 of 5 retailers</span>
                </div>
              </div>

              <div className="mt-3 rounded-2xl border border-border/70 bg-background/80 p-4 backdrop-blur">
                <p className="text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  Receipt preview
                </p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-xs font-semibold text-foreground">Aisha General Store</span>
                  <span className="tnum text-xs font-bold text-foreground">₦185,000</span>
                </div>
                <div
                  className="mt-3 flex items-center justify-between rounded-xl px-3 py-2"
                  style={{ backgroundColor: `${draft.brand_color}18` }}
                >
                  <span className="text-[0.65rem] text-muted-foreground">Balance left</span>
                  <span className="tnum text-[0.72rem] font-bold" style={{ color: draft.brand_color }}>
                    ₦420,000
                  </span>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between text-[0.65rem] text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: draft.brand_color }} />
                  {channels ? `${channels.h}° hue` : "Brand colour"}
                </span>
                <ThemeToggle compact />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}