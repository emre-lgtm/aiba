"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { SITE as FALLBACK_SITE } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, Loader2, Save, Globe, Phone, Mail, MapPin, Navigation } from "lucide-react";

type NavLink = { label: string; href: string };

type Settings = {
  site_name: string;
  site_description: string;
  site_url: string;
  phone: string;
  email: string;
  address: string;
  nav_links: NavLink[];
  footer_text: string;
};

const DEFAULT_SETTINGS: Settings = {
  site_name: "AIBA STONE",
  site_description: "Premium natural stone and marble solutions. Adding elegance to luxury spaces.",
  site_url: "https://www.aibastone.com",
  phone: "+90 500 123 45 67",
  email: "info@aibastone.com",
  address: FALLBACK_SITE.address,
  nav_links: [
    { label: "Home", href: "#hero" },
    { label: "Services", href: "#services" },
    { label: "Portfolio", href: "#portfolio" },
    { label: "About", href: "#about" },
    { label: "Contact", href: "#contact" },
  ],
  footer_text: "Premium Natural Stone & Marble Solutions",
};

export function SettingsForm() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/settings");
        if (res.ok) {
          const data = await res.json();
          setSettings({
            ...DEFAULT_SETTINGS,
            ...data,
            address:
              data.address && data.address !== "Antalya, Turkey"
                ? data.address
                : DEFAULT_SETTINGS.address,
          });
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
    if (res.ok) toast.success("Settings saved");
    else toast.error("Failed to save settings");
    setSaving(false);
  };

  const updateNavLink = (index: number, field: "label" | "href", value: string) => {
    const updated = [...settings.nav_links];
    updated[index] = { ...updated[index], [field]: value };
    setSettings({ ...settings, nav_links: updated });
  };

  const addNavLink = () => {
    setSettings({ ...settings, nav_links: [...settings.nav_links, { label: "", href: "" }] });
  };

  const removeNavLink = (index: number) => {
    setSettings({ ...settings, nav_links: settings.nav_links.filter((_, i) => i !== index) });
  };

  if (loading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-stone-400" /></div>;
  }

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

      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base"><Globe className="h-4 w-4 text-bronze-600" /> General</CardTitle>
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
            <Label className="text-xs font-medium uppercase tracking-wider text-stone-500">Site Description</Label>
            <Input value={settings.site_description} onChange={(e) => setSettings({ ...settings, site_description: e.target.value })} className="h-11" />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-medium uppercase tracking-wider text-stone-500">Footer Text</Label>
            <Input value={settings.footer_text} onChange={(e) => setSettings({ ...settings, footer_text: e.target.value })} className="h-11" />
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Phone className="h-4 w-4 text-bronze-600" /> Contact Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs font-medium uppercase tracking-wider text-stone-500"><Phone className="inline h-3 w-3 mr-1" />Phone</Label>
              <Input value={settings.phone} onChange={(e) => setSettings({ ...settings, phone: e.target.value })} placeholder="+90 500 123 45 67" className="h-11" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-medium uppercase tracking-wider text-stone-500"><Mail className="inline h-3 w-3 mr-1" />Email</Label>
              <Input value={settings.email} onChange={(e) => setSettings({ ...settings, email: e.target.value })} placeholder="info@aibastone.com" className="h-11" />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-medium uppercase tracking-wider text-stone-500"><MapPin className="inline h-3 w-3 mr-1" />Address</Label>
            <Input value={settings.address} onChange={(e) => setSettings({ ...settings, address: e.target.value })} placeholder={DEFAULT_SETTINGS.address} className="h-11" />
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Navigation className="h-4 w-4 text-bronze-600" /> Navigation Links
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
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

      <Button onClick={handleSave} disabled={saving} className="w-full h-11 bg-stone-900 hover:bg-stone-800 text-white">
        {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
        Save All Settings
      </Button>
    </div>
  );
}
