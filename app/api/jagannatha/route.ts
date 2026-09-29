import { NextRequest, NextResponse } from "next/server";
import { DateTime } from "luxon";
import { synthesizeHouseInterpretation, type JHTransitPlanet } from "@/lib/jagannathaInterpretation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BASE_URL = "https://jagannatha-hora-359167915530.europe-west1.run.app";

type House = {
  house:number;
  sign:string;
  lord:string;
  lifeArea:string;
};

type NatalPlacement = {
  planet:string;
  sign:string;
  degree:number;
  house:number;
  nakshatra:string;
  pada:number;
  dignity?:string;
  dispositor?:string;
  conjunctions?:string[];
  receivesAspectsFrom?:string[];
  charaKaraka?:string;
};

type Body = {
  date:string;
  time:string;
  timeZone:string;
  latitude:number;
  longitude:number;
  place?:string;
  houses:House[];
  natal:NatalPlacement[];
  transit?: Array<{ planet:string; sign:string; degree:number; house:number; nakshatra:string; pada:number; retrograde:boolean; aspectsToNatal?:string[] }>;
};

function offsetHours(date:string,time:string,zone:string) {
  const dt=DateTime.fromISO(`${date}T${time}`,{zone});
  if (!dt.isValid) throw new Error("Invalid date, time, or timezone.");
  return dt.offset/60;
}

function collectPlanetArrays(value:unknown): any[][] {
  const found:any[][]=[];
  const visit=(node:any)=>{
    if (!node || typeof node!=="object") return;
    if (Array.isArray(node)) {
      if (node.length && node.every(item=>item && typeof item==="object") &&
          node.some(item=>"name" in item || "planet" in item)) {
        found.push(node);
      }
      for (const item of node) visit(item);
      return;
    }
    for (const child of Object.values(node)) visit(child);
  };
  visit(value);
  return found;
}

function normalizeTransitPlanets(payload:any):JHTransitPlanet[] {
  const arrays=collectPlanetArrays(payload);
  const best=arrays.sort((a,b)=>b.length-a.length)[0] ?? [];
  const seen=new Set<string>();
  const out:JHTransitPlanet[]=[];
  for (const item of best) {
    const planet=String(item.name ?? item.planet ?? "").trim();
    if (!planet || seen.has(planet)) continue;
    if (!["Sun","Moon","Mars","Mercury","Jupiter","Venus","Saturn","Rahu","Ketu"].includes(planet)) continue;
    seen.add(planet);
    out.push({
      planet,
      sign:typeof item.sign==="string" ? item.sign : undefined,
      degree:Number.isFinite(Number(item.degree)) ? Number(item.degree) : undefined,
      nakshatra:typeof item.nakshatra==="string" ? item.nakshatra : undefined,
      pada:Number.isFinite(Number(item.pada)) ? Number(item.pada) : undefined,
      retrograde:Boolean(item.retrograde ?? item.is_retrograde ?? false),
      dignity:typeof item.dignity==="string" ? item.dignity : undefined
    });
  }
  return out;
}

async function postJson(path:string,body:Record<string,unknown>) {
  const response=await fetch(`${BASE_URL}${path}`,{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify(body),
    cache:"no-store",
    signal:AbortSignal.timeout(30000)
  });

  const text=await response.text();
  let data:any=null;
  try { data=JSON.parse(text); } catch {}

  if (!response.ok) {
    const message=data?.detail ?? data?.message ?? `Jagannatha Hora ${path} failed with status ${response.status}.`;
    throw new Error(typeof message==="string" ? message : JSON.stringify(message));
  }
  return data;
}

export async function POST(req:NextRequest) {
  try {
    const body=(await req.json()) as Body;
    if (!body.date || !body.time || !body.timeZone) {
      throw new Error("Birth date, time, and timezone are required.");
    }
    if (!Number.isFinite(body.latitude) || !Number.isFinite(body.longitude)) {
      throw new Error("Valid coordinates are required.");
    }

    const birthOffset=offsetHours(body.date,body.time,body.timeZone);
    const now=DateTime.now().setZone(body.timeZone);
    const targetDate=now.toISODate();
    if (!targetDate) throw new Error("Could not resolve the current local date.");
    const targetOffset=now.offset/60;

    const common={
      date:body.date,
      time:body.time.length===5 ? `${body.time}:00` : body.time,
      latitude:body.latitude,
      longitude:body.longitude,
      timezone:birthOffset,
      place:body.place ?? "",
      ayanamsa_mode:"LAHIRI"
    };

    const [horoscope,gochara]=await Promise.all([
      postJson("/horoscope",common),
      postJson("/gochara",{
        ...common,
        target_date:targetDate,
        event_place:body.place ?? "",
        event_latitude:body.latitude,
        event_longitude:body.longitude,
        event_timezone:targetOffset,
        include:[]
      })
    ]);

    const transitPlanets=normalizeTransitPlanets(gochara).map(planet=>{
      const matchingHouse=(body.houses ?? []).find(h=>h.sign===planet.sign);
      const localTransit=(body.transit ?? []).find(p=>p.planet===planet.planet);
      return {
        ...planet,
        sign:planet.sign ?? localTransit?.sign,
        degree:planet.degree ?? localTransit?.degree,
        house:matchingHouse?.house ?? localTransit?.house,
        nakshatra:planet.nakshatra ?? localTransit?.nakshatra,
        pada:planet.pada ?? localTransit?.pada,
        retrograde:planet.retrograde ?? localTransit?.retrograde ?? false,
        dignity:planet.dignity ?? (localTransit as any)?.dignity,
        aspectsToNatal:localTransit?.aspectsToNatal ?? []
      };
    });
    const interpretations=(body.houses ?? []).map(house=>{
      const natal=(body.natal ?? []).find(p=>p.planet===house.lord);
      const transit=transitPlanets.find(p=>p.planet===house.lord);
      const ruledHouses=(body.houses ?? [])
        .filter(candidate=>candidate.lord===house.lord)
        .map(candidate=>({house:candidate.house,lifeArea:candidate.lifeArea}));
      return {
        house:house.house,
        lifeArea:house.lifeArea,
        lord:house.lord,
        ...synthesizeHouseInterpretation({
          house:house as any,
          natal:natal as any,
          transit,
          ruledHouses,
          allHouses:body.houses as any,
          allNatal:body.natal as any
        })
      };
    });

    return NextResponse.json({
      provider:"Jagannatha Hora",
      targetDate,
      transitPlanets,
      interpretations,
      validation:{
        horoscopeReceived:Boolean(horoscope),
        gocharaReceived:Boolean(gochara),
        transitPlanetCount:transitPlanets.length
      }
    });
  } catch (error) {
    return NextResponse.json(
      {error:error instanceof Error ? error.message : "Jagannatha Hora interpretation failed."},
      {status:500}
    );
  }
}
