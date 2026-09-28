import { NextRequest, NextResponse } from "next/server";
import { calculateCelestialTimeChart } from "@/lib/vedicChart";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req:NextRequest) {
  try {
    const body=await req.json();
    const latitude=Number(body.latitude);
    const longitude=Number(body.longitude);
    const utcOffset=Number(body.utcOffset);

    if (!body.date || !body.time) throw new Error("Birth date and time are required.");
    if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90) throw new Error("Latitude must be between -90 and 90.");
    if (!Number.isFinite(longitude) || longitude < -180 || longitude > 180) throw new Error("Longitude must be between -180 and 180.");
    if (!Number.isFinite(utcOffset) || utcOffset < -14 || utcOffset > 14) throw new Error("UTC offset must be between -14 and +14.");

    const chart=calculateCelestialTimeChart({
      date:String(body.date),
      time:String(body.time),
      utcOffset,
      latitude,
      longitude,
      karakaMode:Number(body.karakaMode)===8?8:7
    });
    return NextResponse.json(chart);
  } catch (error) {
    return NextResponse.json(
      {error:error instanceof Error?error.message:"Chart calculation failed."},
      {status:400}
    );
  }
}
