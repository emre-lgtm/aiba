"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Plus,
  Trash2,
  Loader2,
  Save,
  Globe,
  Phone,
  Mail,
  MapPin,
  Navigation,
  Image as ImageIcon,
  RefreshCcw,
  Layout,
} from "lucide-react";
import {
  DEFAULT_SITE_SETTINGS,
  DEFAULT_SECTIONS,
  getLogoSrc,
  LOGO_UPDATED_EVENT,
  normalizeSiteSettings,
  type SiteSettings,
} from "@/lib/site-settings";

type Tab = "general" | "branding" | "contact" | "navigation" | "sections";

export function SettingsForm() {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("general");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/settings");
        if (res.ok) {
          const data = await res.json();
          setSettings(normalizeSiteSettings(data));
        }
      } catch {}
      setLoading(false);
    };
    load();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const res = await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });
    if (res.ok) {
      window.dispatchEvent(
        new CustomEvent(LOGO_UPDATED_EVENT, { detail: settings.logo_data_url })
      );
      toast.success("Settings saved");
    } else {
      toast.error("Failed to save settings");
    }
    setSaving(false);
  };

  const updateNavLink = (index: number, field: "label" | "href", value: string) => {
    const updated = [...settings.nav_links];
    updated[index] = { ...updated[index], [field]: value };
    setSettings({ ...settings, nav_links: updated });
  };
  const addNavLink = () =>
    setSettings({ ...settings, nav_links: [...settings.nav_links, { label: "", href: "" }] });
  const removeNavLink = (index: number) =>
    setSettings({ ...settings, nav_links: settings.nav_links.filter((_, i) => i !== index) });

  const updateSection = (
    key: keyof SiteSettings["sections"],
    field: keyof SiteSettings["sections"]["services"],
    value: string
  ) => {
    setSettings({
      ...settings,
      sections: {
        ...settings.sections,
        [key]: { ...settings.sections[key], [field]: value },
      },
    });
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const allowedTypes = ["image/svg+xml", "image/png", "image/jpeg", "image/webp"];
    if (!allowedTypes.includes(file.type)) { toast.error("Use SVG, PNG, JPG or WEBP"); return; }
    if (file.size > 2 * 1024 * 1024) { toast.error("Logo must be smaller than 2 MB"); return; }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== "string") { toast.error("Failed to read logo"); return; }
      setSettings({ ...settings, logo_data_url: reader.result });
      window.dispatchEvent(new CustomEvent(LOGO_UPDATED_EVENT, { detail: reader.result }));
      toast.success("Logo ready to save");
    };
    reader.readAsDataURL(file);
    event.target.value = "";
  };

  const handleFaviconUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const allowedTypes = ["image/png", "image/jpeg", "image/webp", "image/x-icon", "image/svg+xml"];
    if (!allowedTypes.includes(file.type)) { toast.error("Use PNG, JPG, WEBP or ICO"); return; }
    if (file.size > 1 * 1024 * 1024) { toast.error("Favicon must be smaller than 1 MB"); return; }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== "string") { toast.error("Failed to read favicon"); return; }
      setSettings({ ...settings, favicon_data_url: reader.result });
      window.dispatchEvent(new CustomEvent("aiba:favicon-updated", { detail: reader.result }));
      toast.success("Favicon ready to save");
    };
    reader.readAsDataURL(file);
    event.target.value = "";
  };

  const handleLogoReset = () => {
    setSettings({ ...settings, logo_data_url: "" });
    window.dispatchEvent(new CustomEvent(LOGO_UPDATED_EVENT, { detail: "" }));
  };

  const handleFaviconReset = () => {
    setSettings({ ...settings, favicon_data_url: "" });
    window.dispatchEvent(new CustomEvent("aiba:favicon-updated", { detail: "" }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-stone-400" />
      </div>
    );
  }

  const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "general", label: "General", icon: <Globe className="h-4 w-4" /> },
    { id: "branding", label: "Branding", icon: <ImageIcon className="h-4 w-4" /> },
    { id: "contact", label: "Contact", icon: <Phone className="h-4 w-4" /> },
    { id: "navigation", label: "Navigation", icon: <Navigation className="h-4 w-4" /> },
    { id: "sections", label: "Section Texts", icon: <Layout className="h-4 w-4" /> },
  ];

  const SECTION_DEFS: { key: keyof SiteSettings["sections"]; label: string }[] = [
    { key: "services", label: "Services Section" },
    { key: "portfolio", label: "Portfolio Section" },
    { key: "contact", label: "Contact Section" },
  ];

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Settings</h1>
          <p className="text-stone-500 text-sm mt-1">Manage site-wide settings</p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="bg-stone-900 hover:bg-stone-800 text-white shadow-sm">
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Save All
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 flex-wrap bg-stone-100 p-1 rounded-xl">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.id
                ? "bg-white text-stone-900 shadow-sm"
                : "text-stone-500 hover:text-stone-700"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── General ─────────────────────────────────────────────────────── */}
      {activeTab === "general" && (
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Globe className="h-4 w-4 text-bronze-600" /> General
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-medium uppercase tracking-wider text-stone-500">Site Name</Label>
                <Input value={settings.site_name} onChange={(e) => setSettings({ ...settings, site_name: e.target.value })} className="h-11" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium uppercase tracking-wider text-stone-500">Site URL</Label>
                <Input value={settings.site_url} onChange={(e) => setSettings({ ...settings, site_url: e.target.value })} className="h-11" />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-medium uppercase tracking-wider text-stone-500">Site Description (SEO)</Label>
              <Textarea value={settings.site_description} onChange={(e) => setSettings({ ...settings, site_description: e.target.value })} rows={2} />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-medium uppercase tracking-wider text-stone-500">Footer Text</Label>
              <Input value={settings.footer_text} onChange={(e) => setSettings({ ...settings, footer_text: e.target.value })} className="h-11" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Branding ────────────────────────────────────────────────────── */}
      {activeTab === "branding" && (
        <div className="space-y-5">
          {/* Logo */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <ImageIcon className="h-4 w-4 text-bronze-600" /> Logo (PNG önerilir)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="rounded-xl border border-stone-200 bg-stone-100 p-4 flex items-center justify-center min-h-20">
                  <Image
                    src={getLogoSrc(settings.logo_data_url)}
                    alt="Logo preview"
                    width={240}
                    height={120}
                    unoptimized
                    className="h-14 w-auto object-contain"
                  />
                </div>
                <div className="flex flex-wrap gap-3">
                  <label className="inline-flex cursor-pointer items-center rounded-md bg-stone-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-stone-800">
                    Logo Yükle
                    <input
                      type="file"
                      accept=".svg,image/svg+xml,image/png,image/jpeg,image/webp"
                      className="hidden"
                      onChange={handleLogoUpload}
                    />
                  </label>
                  <Button type="button" variant="outline" onClick={handleLogoReset} disabled={!settings.logo_data_url}>
                    <RefreshCcw className="mr-2 h-4 w-4" />Varsayılanı Kullan
                  </Button>
                </div>
              </div>
              <p className="text-xs text-stone-400">
                Header ve footer logosunu günceller. PNG önerilir. Maks 2 MB.
              </p>
            </CardContent>
          </Card>

          {/* Favicon */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <ImageIcon className="h-4 w-4 text-bronze-600" /> Favicon (Tarayıcı İkonu)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="rounded-xl border border-stone-200 bg-stone-100 p-4 flex items-center gap-4">
                  {settings.favicon_data_url ? (
                    <img
                      src={settings.favicon_data_url}
                      alt="Favicon preview"
                      className="h-10 w-10 object-contain rounded"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded border-2 border-dashed border-stone-300 flex items-center justify-center">
                      <ImageIcon className="h-4 w-4 text-stone-400" />
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-stone-700">
                      {settings.favicon_data_url ? "Özel favicon aktif" : "Varsayılan favicon kullanılıyor"}
                    </p>
                    <p className="text-xs text-stone-400">
                      Tarayıcı sekmesinde görünen küçük ikon
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3">
                  <label className="inline-flex cursor-pointer items-center rounded-md bg-stone-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-stone-800">
                    Favicon Yükle
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/x-icon,image/svg+xml"
                      className="hidden"
                      onChange={handleFaviconUpload}
                    />
                  </label>
                  <Button type="button" variant="outline" onClick={handleFaviconReset} disabled={!settings.favicon_data_url}>
                    <RefreshCcw className="mr-2 h-4 w-4" />Kaldır
                  </Button>
                </div>
              </div>
              <p className="text-xs text-stone-400">
                Önerilir: 32×32 veya 64×64 px PNG. Maks 1 MB.
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── Contact ─────────────────────────────────────────────────────── */}
      {activeTab === "contact" && (
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Phone className="h-4 w-4 text-bronze-600" /> Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-medium uppercase tracking-wider text-stone-500">
                  <Phone className="inline h-3 w-3 mr-1" />Phone
                </Label>
                <Input value={settings.phone} onChange={(e) => setSettings({ ...settings, phone: e.target.value })} placeholder="+90 500 123 45 67" className="h-11" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium uppercase tracking-wider text-stone-500">
                  <Mail className="inline h-3 w-3 mr-1" />Email
                </Label>
                <Input value={settings.email} onChange={(e) => setSettings({ ...settings, email: e.target.value })} placeholder="info@aibastone.com" className="h-11" />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-medium uppercase tracking-wider text-stone-500">
                <MapPin className="inline h-3 w-3 mr-1" />Address
              </Label>
              <Input value={settings.address} onChange={(e) => setSettings({ ...settings, address: e.target.value })} placeholder={DEFAULT_SITE_SETTINGS.address} className="h-11" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Navigation ──────────────────────────────────────────────────── */}
      {activeTab === "navigation" && (
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Navigation className="h-4 w-4 text-bronze-600" /> Navigation Links
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-xs text-stone-400 mb-2">
              These links appear in the header navbar and footer. Use <code className="bg-stone-100 px-1 rounded">#section</code> for same-page anchors.
            </p>
            {settings.nav_links.map((link, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="flex items-center gap-1 text-stone-400 text-xs font-mono w-6">{i + 1}</div>
                <Input value={link.label} onChange={(e) => updateNavLink(i, "label", e.target.value)} placeholder="Label" className="h-10 flex-1" />
                <Input value={link.href} onChange={(e) => updateNavLink(i, "href", e.target.value)} placeholder="#section" className="h-10 flex-1" />
                <button onClick={() => removeNavLink(i)} className="p-2 rounded-lg hover:bg-red-50 text-stone-400 hover:text-red-500 transition-colors">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
            <Button variant="outline" onClick={addNavLink} className="w-full h-10 border-dashed">
              <Plus className="h-4 w-4 mr-2" />Add Link
            </Button>
          </CardContent>
        </Card>
      )}

      {/* ── Section Texts ───────────────────────────────────────────────── */}
      {activeTab === "sections" && (
        <div className="space-y-6">
          <p className="text-sm text-stone-500">
            Edit the title, subtitle, and description text shown at the top of each section on the homepage.
          </p>
          {SECTION_DEFS.map(({ key, label }) => (
            <Card key={key} className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Layout className="h-4 w-4 text-bronze-600" />
                  {label}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-medium uppercase tracking-wider text-stone-500">
                      Subtitle (small tag)
                    </Label>
                    <Input
                      value={settings.sections[key].subtitle}
                      onChange={(e) => updateSection(key, "subtitle", e.target.value)}
                      placeholder="What We Do"
                      className="h-10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-medium uppercase tracking-wider text-stone-500">
                      Full Title
                    </Label>
                    <Input
                      value={settings.sections[key].title}
                      onChange={(e) => updateSection(key, "title", e.target.value)}
                      placeholder="Our Services"
                      className="h-10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-medium uppercase tracking-wider text-stone-500">
                      Accent Word (gradient)
                    </Label>
                    <Input
                      value={settings.sections[key].title_accent}
                      onChange={(e) => updateSection(key, "title_accent", e.target.value)}
                      placeholder="Services"
                      className="h-10"
                    />
                    <p className="text-[11px] text-stone-400">Must be a word from the full title</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-medium uppercase tracking-wider text-stone-500">
                    Description
                  </Label>
                  <Textarea
                    value={settings.sections[key].description}
                    onChange={(e) => updateSection(key, "description", e.target.value)}
                    rows={2}
                  />
                </div>
                {/* Preview */}
                <div className="rounded-xl bg-stone-50 p-4 border border-stone-100">
                  <p className="text-[10px] text-stone-400 uppercase tracking-wider mb-2">Preview</p>
                  <span className="text-amber-600 text-xs font-semibold tracking-widest uppercase">
                    {settings.sections[key].subtitle}
                  </span>
                  <h3 className="text-xl font-bold text-stone-800 mt-1">
                    {settings.sections[key].title.split(settings.sections[key].title_accent).map((part, i, arr) => (
                      <span key={i}>
                        {part}
                        {i < arr.length - 1 && (
                          <span className="text-amber-600">{settings.sections[key].title_accent}</span>
                        )}
                      </span>
                    ))}
                  </h3>
                  <p className="text-stone-500 text-sm mt-1 leading-relaxed">
                    {settings.sections[key].description}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Button onClick={handleSave} disabled={saving} className="w-full h-11 bg-stone-900 hover:bg-stone-800 text-white">
        {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
        Save All Settings
      </Button>
    </div>
  );
}
