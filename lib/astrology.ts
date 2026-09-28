export const signs = ["Aries","Taurus","Gemini","Cancer","Leo","Virgo","Libra","Scorpio","Sagittarius","Capricorn","Aquarius","Pisces"] as const;
export type Sign = typeof signs[number];
export type Planet = "Sun"|"Moon"|"Mars"|"Mercury"|"Jupiter"|"Venus"|"Saturn"|"Rahu"|"Ketu";

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

export type Placement = { planet: Planet; sign: Sign; degree: number; house?: number; nakshatra?: string; pada?: number; aspects?: string[] };

export function houseSigns(asc: Sign): Sign[] {
  const start = signs.indexOf(asc);
  return Array.from({length:12},(_,i)=>signs[(start+i)%12]);
}

export function houseLords(asc: Sign) {
  return houseSigns(asc).map((sign,i)=>({house:i+1, sign, lord:signLords[sign], lifeArea:lifeAreas[i]}));
}

const karakas7 = ["Atmakaraka","Amatyakaraka","Bhratrikaraka","Matrikaraka","Putrakaraka","Gnatikaraka","Darakaraka"];
const karakas8 = ["Atmakaraka","Amatyakaraka","Bhratrikaraka","Matrikaraka","Putrakaraka","Gnatikaraka","Darakaraka","Pitri Karaka"];

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
    ? `Natal ${lord} is in ${natal.sign} at ${natal.degree.toFixed(1)}°, giving the ${lifeArea.toLowerCase()} story a ${natal.sign} expression.`
    : `The natal condition of ${lord} will define the baseline once a precise natal ephemeris is connected.`;
  const transitText = transit
    ? `Today ${lord} is transiting ${transit.sign} at ${transit.degree.toFixed(1)}° and activates house ${transit.house}; current events in this life area are read through that changing condition.`
    : `Today's transit condition is awaiting the precision ephemeris adapter.`;
  const karakaText = karaka ? ` ${lord} is also your ${karaka}, so that Chara Karaka role is tracked separately rather than being blended invisibly into the house-lord meaning.` : "";
  return `House ${house} — ${lifeArea}: ${lord} rules this area. As a natural significator it carries themes of ${naturalMeanings[lord]}. ${natalText} ${transitText}${karakaText}`;
}
