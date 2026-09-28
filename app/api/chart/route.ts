import { NextRequest, NextResponse } from "next/server";
import tzlookup from "tz-lookup";
import { calculateCelestialTimeChart } from "@/lib/vedicChart";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type NominatimResult = {
  lat: string;
  lon: string;
  display_name: string;
};

async function geocodeCityState(city:string,state:string) {
  const query = new URLSearchParams({
    city,
    state,
    country: "United States",
    format: "jsonv2",
    limit: "1",
    addressdetails: "1"
  });

  const response = await fetch(`https://nominatim.openstreetmap.org/search?${query.toString()}`, {
    headers: {
      "User-Agent": "CelestialTime/0.3 (birth-location geocoding)",
      "Accept-Language": "en"
    },
    cache: "no-store"
  });

  if (!response.ok) throw new Error("Location lookup failed.");
  const results = await response.json() as NominatimResult[];
  if (!results.length) throw new Error("City and state could not be found.");

  const latitude = Number(results[0].lat);
  const longitude = Number(results[0].lon);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    throw new Error("Location coordinates were invalid.");
  }

  return {
    latitude,
    longitude,
    displayName:results[0].display_name,
    timeZone:tzlookup(latitude,longitude)
  };
}

export async function POST(req:NextRequest) {
  try {
    const body=await req.json();
    const city=String(body.city ?? "").trim();
    const state=String(body.state ?? "").trim();

    if (!body.date || !body.time) throw new Error("Birth date and time are required.");
    if (!city || !state) throw new Error("Birth city and state are required.");

    const location=await geocodeCityState(city,state);

    const chart=calculateCelestialTimeChart({
      date:String(body.date),
      time:String(body.time),
      timeZone:location.timeZone,
      latitude:location.latitude,
      longitude:location.longitude,
      locationName:location.displayName,
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
