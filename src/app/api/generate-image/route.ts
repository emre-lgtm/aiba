import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const ZAI_API_KEY = process.env.ZAI_API_KEY;
  if (!ZAI_API_KEY) {
    return NextResponse.json({ error: "ZAI_API_KEY not configured" }, { status: 500 });
  }

  const { prompt, size } = await request.json();

  if (!prompt) {
    return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
  }

  const response = await fetch("https://api.z.ai/api/paas/v4/images/generations", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${ZAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "glm-image",
      prompt,
      size: size || "1280x1280",
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    return NextResponse.json(
      { error: data.error?.message || "Image generation failed" },
      { status: response.status }
    );
  }

  const imageUrl = data.data?.[0]?.url;
  if (!imageUrl) {
    return NextResponse.json({ error: "No image URL returned" }, { status: 500 });
  }

  return NextResponse.json({ url: imageUrl });
}
