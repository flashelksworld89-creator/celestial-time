export const signs = ["Aries","Taurus","Gemini","Cancer","Leo","Virgo","Libra","Scorpio","Sagittarius","Capricorn","Aquarius","Pisces"] as const;
export type Sign = typeof signs[number];
export type Planet = "Sun"|"Moon"|"Mars"|"Mercury"|"Jupiter"|"Venus"|"Saturn"|"Rahu"|"Ketu";
export type ClassicalPlanet = Exclude<Planet,"Rahu"|"Ketu">;

export const signLords: Record<Sign, Planet> = {
  Aries:"Mars", Taurus:"Venus", Gemini:"Mercury", Cancer:"Moon", Leo:"Sun", Virgo:"Mercury",
  Libra:"Venus", Scorpio:"Mars", Sagittarius:"Jupiter", Capricorn:"Saturn", Aquarius:"Saturn", Pisces:"Jupiter"
};

export const lifeAreas = [
  "Body & Identity","Money, Speech & Family","Communication, Skills & Local Travel","Home, Property & Inner Life",
  "Creativity, Children & Intelligence","Health Routines, Work & Obstacles","Partnerships & Contracts",
  "Transformation, Vulnerability & Shared Resources","Beliefs, Teachers & Long-Distance Travel","Career, Status & Responsibility",
  "Gains, Networks & Aspirations","Sleep, Retreat, Expenses & Foreign Places"
];

export const naturalMeanings: Record<Planet,string> = {
  Sun:"vitality, identity, authority, visibility and purpose",
  Moon:"mind, habits, nourishment, emotional processing and responsiveness",
  Mars:"effort, conflict, courage, heat, drive and decisive action",
  Mercury:"speech, analysis, learning, commerce, information and coordination",
  Jupiter:"growth, judgment, teachers, meaning, wisdom and expansion",
  Venus:"relationships, pleasure, aesthetics, agreements, comforts and values",
  Saturn:"duty, limits, endurance, labor, delay, structure and consequences",
  Rahu:"amplification, appetite, novelty, disruption and unconventional pursuit",
  Ketu:"separation, simplification, detachment, past-patterns and inward focus"
};

const ownSigns: Record<ClassicalPlanet, Sign[]> = {
  Sun:["Leo"], Moon:["Cancer"], Mars:["Aries","Scorpio"], Mercury:["Gemini","Virgo"],
  Jupiter:["Sagittarius","Pisces"], Venus:["Taurus","Libra"], Saturn:["Capricorn","Aquarius"]
};

const exaltation: Record<ClassicalPlanet,{sign:Sign;degree:number}> = {
  Sun:{sign:"Aries",degree:10}, Moon:{sign:"Taurus",degree:3}, Mars:{sign:"Capricorn",degree:28},
  Mercury:{sign:"Virgo",degree:15}, Jupiter:{sign:"Cancer",degree:5}, Venus:{sign:"Pisces",degree:27},
  Saturn:{sign:"Libra",degree:20}
};

const debilitation: Record<ClassicalPlanet,{sign:Sign;degree:number}> = {
  Sun:{sign:"Libra",degree:10}, Moon:{sign:"Scorpio",degree:3}, Mars:{sign:"Cancer",degree:28},
  Mercury:{sign:"Pisces",degree:15}, Jupiter:{sign:"Capricorn",degree:5}, Venus:{sign:"Virgo",degree:27},
  Saturn:{sign:"Aries",degree:20}
};

const moolatrikona: Partial<Record<ClassicalPlanet,{sign:Sign;from:number;to:number}>> = {
  Sun:{sign:"Leo",from:0,to:20},
  Moon:{sign:"Taurus",from:4,to:30},
  Mars:{sign:"Aries",from:0,to:12},
  Mercury:{sign:"Virgo",from:16,to:20},
  Jupiter:{sign:"Sagittarius",from:0,to:10},
  Venus:{sign:"Libra",from:0,to:15},
  Saturn:{sign:"Aquarius",from:0,to:20}
};

const naturalFriends: Record<ClassicalPlanet,ClassicalPlanet[]> = {
  Sun:["Moon","Mars","Jupiter"],
  Moon:["Sun","Mercury"],
  Mars:["Sun","Moon","Jupiter"],
  Mercury:["Sun","Venus"],
  Jupiter:["Sun","Moon","Mars"],
  Venus:["Mercury","Saturn"],
  Saturn:["Mercury","Venus"]
};

const naturalEnemies: Record<ClassicalPlanet,ClassicalPlanet[]> = {
  Sun:["Venus","Saturn"],
  Moon:[],
  Mars:["Mercury"],
  Mercury:["Moon"],
  Jupiter:["Mercury","Venus"],
  Venus:["Sun","Moon"],
  Saturn:["Sun","Moon","Mars"]
};

export type Dignity = "exalted"|"moolatrikona"|"own sign"|"friend sign"|"neutral sign"|"enemy sign"|"debilitated"|"node";

export type Placement = {
  planet: Planet;
  sign: Sign;
  degree: number;
  house?: number;
  nakshatra?: string;
  pada?: number;
  aspects?: string[];
  dignity?: Dignity;
  dispositor?: Planet;
  conjunctions?: Planet[];
  receivesAspectsFrom?: Planet[];
};

export function houseSigns(asc: Sign): Sign[] {
  const start = signs.indexOf(asc);
  return Array.from({length:12},(_,i)=>signs[(start+i)%12]);
}

export function houseLords(asc: Sign) {
  return houseSigns(asc).map((sign,i)=>({house:i+1, sign, lord:signLords[sign], lifeArea:lifeAreas[i]}));
}

export function dignityFor(planet:Planet, sign:Sign, degree:number):Dignity {
  if (planet==="Rahu" || planet==="Ketu") return "node";
  const p=planet as ClassicalPlanet;
  if (exaltation[p].sign===sign) return "exalted";
  if (debilitation[p].sign===sign) return "debilitated";
  const mt=moolatrikona[p];
  if (mt && mt.sign===sign && degree>=mt.from && degree<mt.to) return "moolatrikona";
  if (ownSigns[p].includes(sign)) return "own sign";

  const lord=signLords[sign];
  if (lord==="Rahu" || lord==="Ketu") return "neutral sign";
  const signLord=lord as ClassicalPlanet;
  if (naturalFriends[p].includes(signLord)) return "friend sign";
  if (naturalEnemies[p].includes(signLord)) return "enemy sign";
  return "neutral sign";
}

export function dispositorFor(sign:Sign):Planet {
  return signLords[sign];
}

export function conditionTone(dignity?:Dignity) {
  switch(dignity) {
    case "exalted": return "strongly supported and able to express its significations with unusual force";
    case "moolatrikona": return "stable, purposeful and strongly rooted in its own agenda";
    case "own sign": return "well supported and able to act with relative consistency";
    case "friend sign": return "supported by the sign environment";
    case "enemy sign": return "under friction and likely to require adjustment or effort";
    case "debilitated": return "under strain, with its themes more likely to require compensation or conscious management";
    case "neutral sign": return "mixed or context-dependent rather than inherently helped or hindered";
    default: return "best judged through its house, dispositor, aspects and conjunctions";
  }
}

const karakas7 = ["Atmakaraka","Amatyakaraka","Bhratrikaraka","Matrikaraka","Putrakaraka","Gnatikaraka","Darakaraka"];
const karakas8 = ["Atmakaraka","Amatyakaraka","Bhratrikaraka","Matrikaraka","Pitri Karaka","Putrakaraka","Gnatikaraka","Darakaraka"];

export function assignCharaKarakas(placements: Placement[], mode:7|8=7) {
  const allowed: Planet[] = mode===8
    ? ["Sun","Moon","Mars","Mercury","Jupiter","Venus","Saturn","Rahu"]
    : ["Sun","Moon","Mars","Mercury","Jupiter","Venus","Saturn"];
  const names = mode===8 ? karakas8 : karakas7;
  const ranked = placements
    .filter(p=>allowed.includes(p.planet))
    .map(p=>({...p, rankDegree:p.planet==="Rahu" ? 30-p.degree : p.degree}))
    .sort((a,b)=>b.rankDegree-a.rankDegree);
  return ranked.map((p,i)=>({...p, karaka:names[i]}));
}

export function transitHouse(asc: Sign, transitSign: Sign) {
  const a=signs.indexOf(asc), t=signs.indexOf(transitSign);
  return ((t-a+12)%12)+1;
}

export function interpretationFor(args:{
  house:number; lifeArea:string; lord:Planet; natal?:Placement; transit?:Placement; karaka?:string;
}) {
  const {house,lifeArea,lord,natal,transit,karaka}=args;
  const natalText = natal
    ? `Natal ${lord} is in house ${natal.house ?? "?"}, ${natal.sign} at ${natal.degree.toFixed(1)}° (${natal.nakshatra ?? "nakshatra"} P${natal.pada ?? "?"}). Its dignity is ${natal.dignity ?? "unclassified"}, so this ruler is ${conditionTone(natal.dignity)}. Its dispositor is ${natal.dispositor ?? dispositorFor(natal.sign)}.`
    : `The natal condition of ${lord} defines the baseline for this life area.`;
  const conjunctionText = natal?.conjunctions?.length
    ? ` It is joined by ${natal.conjunctions.join(", ")}, tying those planetary themes directly into this natal life-area ruler.`
    : "";
  const aspectText = natal?.receivesAspectsFrom?.length
    ? ` It receives Jyotish sign aspects from ${natal.receivesAspectsFrom.join(", ")}.`
    : "";
  const transitText = transit
    ? ` Today ${lord} is transiting house ${transit.house}, ${transit.sign} at ${transit.degree.toFixed(1)}° (${transit.nakshatra ?? "nakshatra"} P${transit.pada ?? "?"}), with ${transit.dignity ?? "mixed"} dignity. This is the current moving condition of the planet governing ${lifeArea.toLowerCase()}.`
    : "";
  const karakaText = karaka
    ? ` ${lord} is also ${karaka}; that Chara Karaka role is tracked as a separate layer rather than treated as the same thing as house lordship.`
    : "";
  return `House ${house} — ${lifeArea}: ${lord} rules this area and naturally signifies ${naturalMeanings[lord]}. ${natalText}${conjunctionText}${aspectText}${transitText}${karakaText}`;
}
