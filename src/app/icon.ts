import { readFile } from "node:fs/promises";
import path from "node:path";
import { createClient } from "@/lib/supabase/server";
import { isLogoDataUrl } from "@/lib/site-settings";

export const dynamic = "force-dynamic";

function buildResponse(body: BodyInit, contentType: string) {
  return new Response(body, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "no-store, max-age=0",
    },
  });
}

async function getFallbackLogo() {
  const fallbackPath = path.join(process.cwd(), "public", "logo.png");
  const fallbackBody = await readFile(fallbackPath);
  return buildResponse(fallbackBody, "image/png");
}

export default async function Icon() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("site_settings")
      .select("data")
      .eq("id", 1)
      .single();

    if (error || !isLogoDataUrl(data?.data?.logo_data_url)) {
      return getFallbackLogo();
    }

    const match = data.data.logo_data_url.match(
      /^data:(image\/(?:svg\+xml|png|jpeg|jpg|webp));base64,(.+)$/i
    );

    if (!match) {
      return getFallbackLogo();
    }

    const [, contentType, encodedBody] = match;
    return buildResponse(Buffer.from(encodedBody, "base64"), contentType);
  } catch {
    return getFallbackLogo();
  }
}
