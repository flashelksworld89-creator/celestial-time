import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RequestBody = {
  date?: string;
  time?: string;
  latitude?: number;
  longitude?: number;
  timeZone?: string;
};

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.VEDIKA_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            "Vedika is not configured yet. Add VEDIKA_API_KEY to the project's server environment variables, then redeploy."
        },
        { status: 503 }
      );
    }

    const body = (await req.json()) as RequestBody;
    const { date, time, latitude, longitude, timeZone } = body;

    if (!date || !time || !timeZone) {
      return NextResponse.json({ error: "Birth date, time, and time zone are required." }, { status: 400 });
    }
    if (
      typeof latitude !== "number" ||
      typeof longitude !== "number" ||
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude)
    ) {
      return NextResponse.json({ error: "Valid birth coordinates are required." }, { status: 400 });
    }

    const question = [
      "Give me a Vedic astrology interpretation of my CURRENT TRANSITS against my natal chart.",
      "Use sidereal Vedic/Jyotish reasoning and focus on synthesis, not a list of positions.",
      "Do not use dasha periods yet.",
      "Prioritize: natal house lordship, current transit house activation, sign condition, conjunctions/aspects, dispositors, and nakshatra when relevant.",
      "Explain what is actually being activated in life now.",
      "Organize the response into: Current Themes, Life Areas Activated, Likely Manifestations, Challenges or Friction, and Useful Focus.",
      "Give concrete real-life possibilities such as conversations, work events, money matters, home changes, travel, relationships, obligations, opportunities, or changes in routines when supported by the chart.",
      "Avoid vague encouragement and avoid merely repeating planetary positions.",
      "Treat health-related symbolism as non-medical themes only."
    ].join(" ");

    const response = await fetch("https://api.vedika.io/api/v1/astrology/query", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey
      },
      body: JSON.stringify({
        question,
        birthDetails: {
          datetime: `${date}T${time}:00`,
          latitude,
          longitude,
          timezone: timeZone
        }
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(180000)
    });

    const raw = await response.text();
    let data: any;
    try {
      data = JSON.parse(raw);
    } catch {
      data = null;
    }

    if (!response.ok) {
      const message =
        data?.error?.message ||
        data?.message ||
        `Vedika request failed with status ${response.status}.`;
      return NextResponse.json({ error: message }, { status: response.status });
    }

    const answer =
      data?.answer ||
      data?.response ||
      data?.data?.answer ||
      data?.data?.response ||
      data?.result?.answer;

    if (!answer || typeof answer !== "string") {
      return NextResponse.json(
        { error: "Vedika returned a response, but no interpretation text was found.", raw: data },
        { status: 502 }
      );
    }

    return NextResponse.json({
      provider: "Vedika",
      answer,
      metadata: data?.metadata ?? null
    });
  } catch (error) {
    const message =
      error instanceof Error && error.name === "TimeoutError"
        ? "Vedika took too long to respond."
        : error instanceof Error
          ? error.message
          : "Vedika interpretation failed.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
