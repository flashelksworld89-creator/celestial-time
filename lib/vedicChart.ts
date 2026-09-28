import {
  CalculationFlag,
  HouseSystem,
  LunarPoint,
  Planet as SwissPlanet,
  SiderealMode,
  calculateHouses,
  calculatePosition,
  getAyanamsa,
  julianDay,
  setSiderealMode
} from "@swisseph/node";
import { DateTime } from "luxon";
import { Planet, Sign, signs, signLords, lifeAreas, dignityFor, dispositorFor } from "./astrology";

export type ChartRequest = {
  date: string;
  time: string;
  timeZone: string;
  latitude: number;
  longitude: number;
  locationName?: string;
  karakaMode?: 7 | 8;
};

export type CalculatedPlacement = {
  planet: Planet;
  longitude: number;
  sign: Sign;
  degree: number;
  house: number;
  nakshatra: string;
  pada: number;
  retrograde: boolean;
  charaKaraka?: string;
  aspectsToNatal?: string[];
  dignity?: ReturnType<typeof dignityFor>;
  dispositor?: Planet;
  conjunctions?: Planet[];
  receivesAspectsFrom?: Planet[];
};

const NAKSHATRAS = [
  "Ashwini","Bharani","Krittika","Rohini","Mrigashira","Ardra","Punarvasu","Pushya","Ashlesha",
  "Magha","Purva Phalguni","Uttara Phalguni","Hasta","Chitra","Swati","Vishakha","Anuradha",
  "Jyeshtha","Mula","Purva Ashadha","Uttara Ashadha","Shravana","Dhanishta","Shatabhisha",
  "Purva Bhadrapada","Uttara Bhadrapada","Revati"
] as const;

const BODY_MAP: Array<[Planet, SwissPlanet | LunarPoint]> = [
  ["Sun", SwissPlanet.Sun],
  ["Moon", SwissPlanet.Moon],
  ["Mars", SwissPlanet.Mars],
  ["Mercury", SwissPlanet.Mercury],
  ["Jupiter", SwissPlanet.Jupiter],
  ["Venus", SwissPlanet.Venus],
  ["Saturn", SwissPlanet.Saturn],
  ["Rahu", LunarPoint.MeanNode]
];

const normalize = (n:number) => ((n % 360) + 360) % 360;

function parseLocalToUtc(input: ChartRequest) {
  const local = DateTime.fromISO(`${input.date}T${input.time}`, { zone: input.timeZone });
  if (!local.isValid) {
    throw new Error(local.invalidExplanation || "Invalid birth date, time, or time zone.");
  }
  return local.toUTC().toJSDate();
}

function toJulian(date: Date) {
  return julianDay(
    date.getUTCFullYear(),
    date.getUTCMonth()+1,
    date.getUTCDate(),
    date.getUTCHours()+date.getUTCMinutes()/60+date.getUTCSeconds()/3600
  );
}

function zodiac(longitude:number) {
  const value = normalize(longitude);
  const signIndex = Math.floor(value / 30);
  return { sign: signs[signIndex], degree: value % 30, signIndex };
}

function nakshatra(longitude:number) {
  const value = normalize(longitude);
  const span = 360/27;
  const padaSpan = span/4;
  const index = Math.floor(value/span) % 27;
  const within = value - index*span;
  return {
    nakshatra: NAKSHATRAS[index],
    pada: Math.min(4, Math.floor(within/padaSpan)+1)
  };
}

function wholeSignHouse(ascSign: Sign, planetSign: Sign) {
  return ((signs.indexOf(planetSign)-signs.indexOf(ascSign)+12)%12)+1;
}

function charaAssignments(placements: CalculatedPlacement[], mode:7|8) {
  const names7 = ["Atmakaraka","Amatyakaraka","Bhratrikaraka","Matrikaraka","Putrakaraka","Gnatikaraka","Darakaraka"];
  const names8 = ["Atmakaraka","Amatyakaraka","Bhratrikaraka","Matrikaraka","Pitri Karaka","Putrakaraka","Gnatikaraka","Darakaraka"];
  const eligible = placements.filter(p => mode===8 ? p.planet!=="Ketu" : !["Rahu","Ketu"].includes(p.planet));
  const ranked = eligible.map(p => ({
    p,
    value: p.planet==="Rahu" ? 30-p.degree : p.degree
  })).sort((a,b)=>b.value-a.value);
  const names=mode===8?names8:names7;
  return new Map(ranked.map((x,i)=>[x.p.planet,names[i]]));
}

function drishtiOffsets(planet:Planet) {
  if (planet==="Mars") return [3,6,7];
  if (planet==="Jupiter") return [4,6,8];
  if (planet==="Saturn") return [2,6,9];
  if (["Sun","Moon","Mercury","Venus"].includes(planet)) return [6];
  return [];
}

function aspectsTransitToNatal(transit:CalculatedPlacement, natal:CalculatedPlacement[]) {
  const from = signs.indexOf(transit.sign);
  const targets = new Set(drishtiOffsets(transit.planet).map(offset => signs[(from+offset)%12]));
  return natal.filter(n => n.sign===transit.sign || targets.has(n.sign))
    .map(n => n.sign===transit.sign ? `conjunct natal ${n.planet}` : `aspects natal ${n.planet}`);
}

function basePlacements(jd:number, ascSign:Sign) {
  const flags = CalculationFlag.SwissEphemeris | CalculationFlag.Speed | CalculationFlag.Sidereal;
  const output: CalculatedPlacement[] = BODY_MAP.map(([planet,body]) => {
    const position = calculatePosition(jd, body, flags);
    const z=zodiac(position.longitude);
    const n=nakshatra(position.longitude);
    return {
      planet,
      longitude:normalize(position.longitude),
      sign:z.sign,
      degree:z.degree,
      house:wholeSignHouse(ascSign,z.sign),
      nakshatra:n.nakshatra,
      pada:n.pada,
      retrograde:position.longitudeSpeed<0,
      dignity:dignityFor(planet,z.sign,z.degree),
      dispositor:dispositorFor(z.sign)
    };
  });

  const rahu=output.find(p=>p.planet==="Rahu")!;
  const ketuLong=normalize(rahu.longitude+180);
  const kz=zodiac(ketuLong);
  const kn=nakshatra(ketuLong);
  output.push({
    planet:"Ketu",
    longitude:ketuLong,
    sign:kz.sign,
    degree:kz.degree,
    house:wholeSignHouse(ascSign,kz.sign),
    nakshatra:kn.nakshatra,
    pada:kn.pada,
    retrograde:rahu.retrograde,
    dignity:dignityFor("Ketu",kz.sign,kz.degree),
    dispositor:dispositorFor(kz.sign)
  });
  return output;
}

export function calculateCelestialTimeChart(input:ChartRequest) {
  setSiderealMode(SiderealMode.Lahiri);
  const birthUtc=parseLocalToUtc(input);
  const birthJd=toJulian(birthUtc);
  const ayanamsa=getAyanamsa(birthJd);

  const tropicalHouses=calculateHouses(birthJd,input.latitude,input.longitude,HouseSystem.WholeSign);
  const siderealAsc=normalize(tropicalHouses.ascendant-ayanamsa);
  const siderealMc=normalize(tropicalHouses.mc-ayanamsa);
  const asc=zodiac(siderealAsc);

  let natal=basePlacements(birthJd,asc.sign);

  natal=natal.map(p=>{
    const conjunctions=natal.filter(other=>other.planet!==p.planet && other.sign===p.sign).map(other=>other.planet);
    const receivesAspectsFrom=natal.filter(other=>{
      if (other.planet===p.planet) return false;
      const from=signs.indexOf(other.sign);
      return drishtiOffsets(other.planet).some(offset=>signs[(from+offset)%12]===p.sign);
    }).map(other=>other.planet);
    return {...p,conjunctions,receivesAspectsFrom};
  });

  const karakas=charaAssignments(natal,input.karakaMode ?? 7);
  natal=natal.map(p=>({...p,charaKaraka:karakas.get(p.planet)}));

  const now=new Date();
  const transitJd=toJulian(now);
  const transit=basePlacements(transitJd,asc.sign).map(p=>({
    ...p,
    aspectsToNatal: aspectsTransitToNatal(p,natal)
  }));

  const houses=Array.from({length:12},(_,i)=>{
    const sign=signs[(asc.signIndex+i)%12];
    return {
      house:i+1,
      sign,
      lord:signLords[sign],
      lifeArea:lifeAreas[i]
    };
  });

  return {
    settings:{
      zodiac:"Sidereal",
      ayanamsa:"Lahiri",
      houseSystem:"Whole Sign",
      node:"Mean Rahu",
      charaKarakaSystem:input.karakaMode ?? 7
    },
    location:{
      name:input.locationName ?? "",
      latitude:input.latitude,
      longitude:input.longitude,
      timeZone:input.timeZone
    },
    birthUtc:birthUtc.toISOString(),
    calculatedAt:now.toISOString(),
    ayanamsa,
    ascendant:{longitude:siderealAsc,sign:asc.sign,degree:asc.degree},
    mc:{longitude:siderealMc,...zodiac(siderealMc)},
    houses,
    natal,
    transit
  };
}
