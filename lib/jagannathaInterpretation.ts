import { Dignity, Planet, Sign, naturalMeanings } from "./astrology";

export type JHTransitPlanet = {
  planet: string;
  sign?: string;
  degree?: number;
  nakshatra?: string;
  pada?: number;
  retrograde?: boolean;
  dignity?: string;
};

type HouseContext = {
  house: number;
  sign: Sign;
  lord: Planet;
  lifeArea: string;
};

type PlacementContext = {
  planet: Planet;
  sign: Sign;
  degree: number;
  house: number;
  nakshatra: string;
  pada: number;
  dignity?: Dignity;
  dispositor?: Planet;
  conjunctions?: Planet[];
  receivesAspectsFrom?: Planet[];
  charaKaraka?: string;
};

const houseActivation: Record<number,string> = {
  1:"self-direction, body, identity, visibility and personal initiative",
  2:"money, speech, family obligations, possessions and what must be sustained",
  3:"messages, paperwork, skills, local movement, siblings and self-initiated effort",
  4:"home, property, vehicles, family foundations and private emotional security",
  5:"children, creativity, study, judgment, romance, performance and personally authored work",
  6:"workload, routines, service, disputes, debts, maintenance and practical problem-solving",
  7:"partners, clients, contracts, negotiations and direct encounters with other people",
  8:"shared resources, vulnerability, disruptions, research, hidden matters and major adjustments",
  9:"teachers, beliefs, higher learning, legal or ethical questions, long-distance travel and guidance",
  10:"career, bosses, responsibility, reputation, public action and visible decisions",
  11:"income, gains, networks, audiences, friends, objectives and results",
  12:"expenses, withdrawal, sleep, foreign places, endings, private work and matters happening out of view"
};

const dignityMeaning: Record<string,string> = {
  exalted:"operating with unusually strong support and visibility",
  moolatrikona:"acting from a stable and purposeful base",
  "own sign":"working from familiar territory with relatively strong agency",
  "friend sign":"receiving a cooperative sign environment",
  "neutral sign":"working in a mixed environment where results depend heavily on aspects and house context",
  "enemy sign":"working under friction, requiring compromise, correction or extra effort",
  debilitated:"under notable strain, making its topics more prone to imbalance, delay or compensating behavior",
  own:"working from familiar territory with relatively strong agency",
  friendly:"receiving a cooperative sign environment",
  neutral:"working in a mixed environment",
  enemy:"working under friction",
  exaltation:"operating with unusually strong support",
  debilitation:"under notable strain"
};

function conditionPhrase(value?: string) {
  if (!value) return "";
  return dignityMeaning[value.toLowerCase()] ?? `showing a ${value} condition`;
}

function joinNatural(items?: Planet[]) {
  if (!items?.length) return "";
  return items.join(", ");
}

export function synthesizeHouseInterpretation(args:{
  house:HouseContext;
  natal?:PlacementContext;
  transit?:JHTransitPlanet;
}) {
  const {house,natal,transit}=args;
  const baseline = natal
    ? `The ruler of this area, ${house.lord}, is natally placed in house ${natal.house}. This permanently links ${house.lifeArea.toLowerCase()} with ${houseActivation[natal.house]}.`
    : `${house.lord} governs this life area, so its natal condition sets the baseline.`;

  const natalCondition = natal
    ? [
        natal.dignity ? `Natal ${house.lord} is ${conditionPhrase(natal.dignity)}.` : "",
        natal.dispositor ? `Its dispositor is ${natal.dispositor}, so changes affecting ${natal.dispositor} feed back into this area.` : "",
        natal.conjunctions?.length ? `It is joined by ${joinNatural(natal.conjunctions)}, blending those planets directly into the story.` : "",
        natal.receivesAspectsFrom?.length ? `It receives classical Jyotish aspects from ${joinNatural(natal.receivesAspectsFrom)}, adding pressure or support according to those planets' condition.` : ""
      ].filter(Boolean).join(" ")
    : "";

  const transitHouse = transit?.sign && natal
    ? undefined
    : undefined;

  const transitCondition = transit
    ? `Right now ${house.lord} is moving through ${transit.sign ?? "its current sign"}${typeof transit.degree==="number" ? ` at ${transit.degree.toFixed(1)}°` : ""}${transit.nakshatra ? `, in ${transit.nakshatra}${transit.pada ? ` pada ${transit.pada}` : ""}` : ""}. ${conditionPhrase(transit.dignity)}`
    : `Current Jagannatha Hora transit data for ${house.lord} was not available, so no transit claim is made for this area.`;

  const concrete = natal
    ? `Likely expression: matters involving ${house.lifeArea.toLowerCase()} are most likely to surface through ${houseActivation[natal.house]}. Watch for concrete developments there rather than treating the transit as a general mood.`
    : "";

  const retro = transit?.retrograde
    ? `Because ${house.lord} is retrograde, unfinished matters, revisions, returns, delays or repeated decisions connected with this area deserve extra attention.`
    : "";

  const karaka = natal?.charaKaraka
    ? `Because ${house.lord} is also your ${natal.charaKaraka}, these events may feel personally consequential beyond this house alone.`
    : "";

  return {
    headline: `${house.lifeArea}: ${house.lord} activation`,
    interpretation:[baseline,natalCondition,transitCondition,concrete,retro,karaka].filter(Boolean).join(" "),
    evidence:{
      natalHouse:natal?.house,
      natalSign:natal?.sign,
      natalNakshatra:natal?.nakshatra,
      natalDignity:natal?.dignity,
      transitSign:transit?.sign,
      transitDegree:transit?.degree,
      transitNakshatra:transit?.nakshatra,
      transitDignity:transit?.dignity,
      retrograde:transit?.retrograde ?? false,
      naturalMeaning:naturalMeanings[house.lord]
    }
  };
}
