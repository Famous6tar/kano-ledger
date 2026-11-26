import { useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useTheme } from "next-themes";
import { ImagePlus, Monitor, Moon, Sun } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Image } from "@/components/ui/image";
import { PageHeader } from "@/components/PageHeader";
import { useBrand } from "@/components/brand/BrandProvider";
import { extractDominantColor, readFileAsDataUrl } from "@/lib/logo-color";
import { saveProfile, uploadLogo } from "@/lib/shop";
import { initials } from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authed/_app/settings")({
  head: () => ({ meta: [{ title: "Business profile · Kanti" }] }),
  component: SettingsPage,
});

const THEMES = [
  { key: "light", label: "Light", icon: Sun },
  { key: "dark", label: "Dark", icon: Moon },
  { key: "system", label: "System", icon: Monitor },
];

const SWATCHES = ["#0E7C66", "#1D4ED8", "#B91C1C", "#7C3AED", "#B45309", "#0F172A"];

function SettingsPage() {
  const { brand, setBrand } = useBrand();
  const { theme, setTheme } = useTheme();
  const [draft, setDraft] = useState(brand);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef(null);

  const update = (patch) => setDraft((prev) => ({ ...prev, ...patch }));

  const onLogo = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const dataUrl = await readFileAsDataUrl(file);
    const color = await extractDominantColor(dataUrl);
    update({ logo_url: dataUrl, ...(color ? { brand_color: color } : {}) });
    try {
      const url = await uploadLogo(file);
      update({ logo_url: url });
      toast.success(color ? "Logo added — colours matched" : "Logo added");
    } catch (error) {
      toast.error(error?.message || "Logo upload failed");
    }
  };

  const save = async () => {
    setSaving(true);
    try {
      const saved = await saveProfile(draft);
      setBrand(saved);
      setDraft(saved);
      toast.success("Business profile saved");
    } catch (error) {
      toast.error(error?.message || "Could not save your profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Settings"
        title="Business profile"
        description="Your name, logo and colours flow into every page and every receipt you share."
        actions={
          <Button
            className="rounded-full bg-brand text-brand-foreground hover:bg-brand/90"
            onClick={save}
            disabled={saving}
          >
            {saving ? "Saving…" : "Save changes"}
          </Button>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <section className="card-surface space-y-5 p-5 sm:p-6">
          <div className="flex items-center gap-4">
            {draft.logo_url ? (
              <Image
                src={draft.logo_url}
                alt={draft.business_name}
                className="h-14 w-14 rounded-2xl object-cover ring-1 ring-black/10"
                fittingType="fill"
              />
            ) : (
              <div
                className="grid h-14 w-14 place-items-center rounded-2xl font-heading text-lg font-bold text-white"
                style={{ backgroundColor: draft.brand_color }}
              >
                {initials(draft.business_name)}
              </div>
            )}
            <div>
              <Button
                type="button"
                variant="outline"
                className="rounded-full"
                onClick={() => fileRef.current?.click()}
              >
                <ImagePlus className="mr-1.5 h-4 w-4" /> Upload logo
              </Button>
              <p className="mt-1.5 text-[0.7rem] text-muted-foreground">PNG or SVG, square works best</p>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onLogo} />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label htmlFor="business_name">Business name</Label>
              <Input
                id="business_name"
                value={draft.business_name || ""}
                onChange={(e) => update({ business_name: e.target.value })}
                className="mt-1.5"
              />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="tagline">Tagline</Label>
              <Input
                id="tagline"
                value={draft.tagline || ""}
                onChange={(e) => update({ tagline: e.target.value })}
                placeholder="Wholesale & provisions · Kano"
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={draft.phone || ""}
                onChange={(e) => update({ phone: e.target.value })}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={draft.email || ""}
                onChange={(e) => update({ email: e.target.value })}
                className="mt-1.5"
              />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={draft.address || ""}
                onChange={(e) => update({ address: e.target.value })}
                className="mt-1.5"
              />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="bank_details">Bank Details (for Invoices)</Label>
              <Textarea
                id="bank_details"
                value={draft.bank_details || ""}
                onChange={(e) => update({ bank_details: e.target.value })}
                placeholder="Acc No. - Bank Name - Account Name"
                rows={3}
                className="mt-1.5"
              />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="receipt_note">Receipt footer</Label>
              <Textarea
                id="receipt_note"
                value={draft.receipt_note || ""}
                onChange={(e) => update({ receipt_note: e.target.value })}
                rows={2}
                className="mt-1.5"
              />
            </div>
          </div>
        </section>

        <div className="space-y-4">
          <section className="card-surface space-y-4 p-5 sm:p-6">
            <div>
              <h2 className="font-heading text-base font-bold tracking-tight text-foreground">Brand colour</h2>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Pulled from your logo — override it any time.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="color"
                aria-label="Brand colour"
                value={draft.brand_color || "#0E7C66"}
                onChange={(e) => update({ brand_color: e.target.value })}
                className="h-11 w-14 cursor-pointer rounded-xl border border-border bg-transparent p-1"
              />
              <Input
                value={draft.brand_color || ""}
                onChange={(e) => update({ brand_color: e.target.value })}
                className="font-mono text-xs uppercase"
              />
            </div>
            <div className="flex gap-2">
              {SWATCHES.map((swatch) => (
                <button
                  key={swatch}
                  type="button"
                  aria-label={`Use ${swatch}`}
                  onClick={() => update({ brand_color: swatch })}
                  className={cn(
                    "h-8 w-8 rounded-full ring-2 ring-offset-2 ring-offset-card transition",
                    draft.brand_color?.toLowerCase() === swatch.toLowerCase()
                      ? "ring-foreground"
                      : "ring-transparent"
                  )}
                  style={{ backgroundColor: swatch }}
                />
              ))}
            </div>
            <p className="text-[0.7rem] text-muted-foreground">
              Save to repaint the workspace and every new receipt.
            </p>
          </section>

          <section className="card-surface space-y-3 p-5 sm:p-6">
            <h2 className="font-heading text-base font-bold tracking-tight text-foreground">Appearance</h2>
            <div className="flex flex-wrap gap-2">
              {THEMES.map((t) => {
                const Icon = t.icon;
                return (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => setTheme(t.key)}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-xs font-semibold transition-colors",
                      theme === t.key
                        ? "border-brand bg-brand/10 text-brand"
                        : "border-border text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" /> {t.label}
                  </button>
                );
              })}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}