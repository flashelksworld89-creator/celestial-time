import { Dignity, Planet, Sign, naturalMeanings } from "./astrology";

export type JHTransitPlanet = {
  planet: string;
  sign?: string;
  degree?: number;
  house?: number;
  nakshatra?: string;
  pada?: number;
  retrograde?: boolean;
  dignity?: string;
  aspectsToNatal?: string[];
};

type HouseContext = {
  house: number;
  sign: Sign;
  lord: Planet;
  lifeArea: string;
};

type RuledHouse = {
  house:number;
  lifeArea:string;
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


const houseOutcome: Record<number,string[]> = {
  1:["personal decisions","changes in visibility or self-presentation","taking direct control of a matter"],
  2:["income or spending decisions","family discussions","financial paperwork or changes in possessions"],
  3:["calls, messages or negotiations","short trips or errands","skill-building, sales, writing or paperwork"],
  4:["home or property changes","vehicle or domestic responsibilities","family or private-life decisions"],
  5:["creative output or study","children or romance matters","performance, teaching or speculative decisions"],
  6:["workload or service obligations","conflict resolution, debts or maintenance","health-routine or scheduling adjustments"],
  7:["partnership or client developments","contracts and negotiations","direct encounters, agreements or disputes"],
  8:["shared-finance or debt matters","investigation, secrets or sudden changes","major adjustments, vulnerability or endings"],
  9:["travel, education or legal matters","teachers, advisors or institutions","belief, certification or long-range planning"],
  10:["career decisions","boss or authority interactions","public responsibilities, reputation or status changes"],
  11:["income or gains","network, audience or friendship developments","results, opportunities or fulfillment of objectives"],
  12:["expenses or losses","foreign or behind-the-scenes activity","withdrawal, sleep, endings or private work"]
};

const sourceToDestinationExamples: Record<number,Record<number,string>> = {
  10:{
    4:"career responsibilities can enter the home through remote work, property decisions, family obligations, relocation questions or a need to balance public duties with private life",
    11:"career activity can translate into gains, recognition, new professional networks, audience growth, bonuses or results from previous work",
    3:"career matters can be advanced through communication, marketing, paperwork, training, local travel or independent initiative",
    7:"career matters can become dependent on clients, contracts, partnerships, negotiations or direct dealings with the public"
  },
  2:{
    3:"money and family matters can move through sales, messages, paperwork, short travel, siblings or newly developed skills",
    11:"stored resources can connect with income, gains, networks and the fulfillment of financial goals",
    4:"money can be redirected toward home, property, vehicles or family needs",
    7:"finances can become tied to agreements, partners, clients or shared decision-making"
  },
  7:{
    10:"partnership or client matters can directly affect career, public standing and professional responsibility",
    4:"relationships can produce home, property, relocation or family decisions",
    11:"partnerships can bring gains, introductions, network access or the fulfillment of shared goals",
    3:"relationships can become active through conversations, messages, contracts, short trips or repeated negotiations"
  },
  11:{
    3:"income, gains and goals can be pursued through communication, sales, social media, writing, skills or local movement",
    10:"gains can come through career visibility, promotions, authority figures, leadership or increased responsibility",
    4:"income or gains can be redirected into property, home improvements, vehicles or family security",
    7:"gains can come through clients, partners, contracts, alliances or social connections"
  }
};

function relationshipSpecificOutcome(ruledHouse:number, transitHouse?:number) {
  if (!transitHouse) return "";
  const exact=sourceToDestinationExamples[ruledHouse]?.[transitHouse];
  if (exact) return exact;
  const examples=houseOutcome[transitHouse] ?? [];
  const source=houseActivation[ruledHouse] ?? `house ${ruledHouse} matters`;
  if (!examples.length) return `${source} can become active through the transit house.`;
  return `${source} can produce concrete events such as ${examples.join(", ")} because those ruled-house topics are being expressed through house ${transitHouse}.`;
}

const transitEffects: Record<Planet,{constructive:string;challenging:string;produces:string}> = {
  Sun:{
    constructive:"greater visibility, leadership, decisiveness, contact with authority and a need to define priorities",
    challenging:"ego clashes, pressure from authority, overexposure, pride or conflict over control",
    produces:"decisions, recognition, leadership duties, dealings with bosses or government, stronger focus on status and purpose"
  },
  Moon:{
    constructive:"movement, responsiveness, public contact, caregiving, adaptation and increased attention to immediate needs",
    challenging:"fluctuation, emotional reactivity, restlessness, inconsistency or rapidly changing circumstances",
    produces:"changes in routine, family activity, travel or errands, shifts in mood, public interaction and matters involving care or nourishment"
  },
  Mars:{
    constructive:"courage, initiative, competition, technical action, problem-solving and the force needed to confront obstacles",
    challenging:"conflict, impatience, accidents, cuts, heat, arguments, haste or destructive action",
    produces:"urgent tasks, disputes, repairs, physical exertion, decisive confrontations, engineering or mechanical activity and situations requiring immediate action"
  },
  Mercury:{
    constructive:"analysis, negotiation, learning, trade, writing, scheduling, paperwork and flexible problem-solving",
    challenging:"miscommunication, nervous overactivity, indecision, excessive analysis, errors or conflicting information",
    produces:"messages, contracts, purchases, calls, meetings, study, short trips, documentation and business exchanges"
  },
  Jupiter:{
    constructive:"growth, protection, counsel, opportunity, education, wisdom, legal support and expansion",
    challenging:"overextension, excess optimism, moralizing, waste or promises larger than practical capacity",
    produces:"teaching, advising, study, financial expansion, legal or institutional developments, opportunities through mentors and broader long-term planning"
  },
  Venus:{
    constructive:"agreement, attraction, relationship support, comforts, artistic activity, diplomacy and financial enjoyment",
    challenging:"indulgence, distraction through pleasure, relationship compromise, overspending or avoidance of necessary conflict",
    produces:"relationship developments, agreements, purchases, social invitations, creative work, beautification, comforts and value-based choices"
  },
  Saturn:{
    constructive:"discipline, endurance, structure, realism, mature responsibility and long-term consolidation",
    challenging:"delay, pressure, scarcity, isolation, fatigue, obstruction, consequences or heavy obligations",
    produces:"deadlines, work burdens, repairs, restrictions, commitments, separations, institutional responsibilities and matters that require patience or persistence"
  },
  Rahu:{
    constructive:"ambition, experimentation, foreign or unusual opportunities, technology, rapid expansion and unconventional problem-solving",
    challenging:"obsession, confusion, exaggeration, instability, controversy, shortcuts or appetite that outruns judgment",
    produces:"sudden opportunities, unusual contacts, internet or technology activity, foreign influences, rapid changes, intense desires and circumstances that feel unfamiliar or amplified"
  },
  Ketu:{
    constructive:"detachment, simplification, investigation, spiritual focus, cutting away excess and insight through withdrawal",
    challenging:"separation, disinterest, fragmentation, loss of attachment, abrupt endings or difficulty sustaining ordinary motivation",
    produces:"withdrawal, endings, simplification, research, separation from people or routines, reduced attachment and a turn toward specialized or inward concerns"
  }
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

function aspectConsequences(aspects?: string[]) {
  if (!aspects?.length) return "";
  const effects=aspects.map(aspect=>{
    const match=aspect.match(/natal\s+(Sun|Moon|Mars|Mercury|Jupiter|Venus|Saturn|Rahu|Ketu)/i);
    const target=match?.[1] as Planet | undefined;
    if (!target) return aspect;
    const meaning=naturalMeanings[target];
    if (/conjunct/i.test(aspect)) {
      return `conjunction with natal ${target} directly merges the transit with natal themes of ${meaning}`;
    }
    return `aspect to natal ${target} activates natal themes of ${meaning}`;
  });
  return effects.join("; ");
}

function ruledHousePrediction(planet:Planet, ruled:RuledHouse, transitHouse?:number) {
  const source=houseActivation[ruled.house] ?? ruled.lifeArea.toLowerCase();
  const destination=transitHouse ? houseActivation[transitHouse] : "the house being transited";
  const specific=relationshipSpecificOutcome(ruled.house,transitHouse);
  return `As ruler of house ${ruled.house} (${ruled.lifeArea}), ${planet} carries matters of ${source} into ${destination}. ${specific}`;
}

function rulershipTransitAnalysis(house:HouseContext,transit:JHTransitPlanet|undefined,ruledHouses:RuledHouse[]) {
  if (!transit) return "";
  const planet=house.lord;
  const activatedHouse=transit.house;
  const ruled=ruledHouses.length ? ruledHouses : [{house:house.house,lifeArea:house.lifeArea}];
  const intro=activatedHouse
    ? `${planet} is transiting house ${activatedHouse}. This prediction is limited to the natal houses ${planet} rules.`
    : `${planet}'s transit is interpreted only through the natal houses it rules.`;
  const pathways=ruled.map(item=>ruledHousePrediction(planet,item,activatedHouse)).join(" ");
  const aspectModifier=transit.aspectsToNatal?.length
    ? `Current aspects can intensify or redirect these results, but the affected subjects remain ${ruled.map(item=>`house ${item.house} (${item.lifeArea})`).join(" and ")}.`
    : "";
  const retro=transit.retrograde
    ? `Because ${planet} is retrograde, these ruled-house matters are more likely to involve review, return, repetition, renegotiation, correction or unfinished business.`
    : "";
  return [intro,pathways,aspectModifier,retro].filter(Boolean).join(" ");
}

function naturalKarakaAnalysis(planet:Planet,transit:JHTransitPlanet|undefined) {
  if (!transit) return "";
  const effect=transitEffects[planet];
  const transitArea=transit.house ? houseActivation[transit.house] : "the house currently occupied";
  const dignity=transit.dignity?.toLowerCase() ?? "";
  const strained=["enemy","enemy sign","debilitated","debilitation"].includes(dignity);
  const supported=["exalted","exaltation","moolatrikona","own","own sign","friendly","friend sign"].includes(dignity);
  const conditionLabel = transit.dignity ? `${planet} is currently ${transit.dignity}` : `${planet} has a mixed or unclassified dignity`;
  const motionLabel = transit.retrograde ? "retrograde" : "direct";
  const condition=supported
    ? `${conditionLabel} and ${motionLabel}. This supports the constructive expression of its karaka themes: ${effect.constructive}.`
    : strained
      ? `${conditionLabel} and ${motionLabel}. This places more pressure on its karaka themes, making ${effect.challenging} more likely.`
      : `${conditionLabel} and ${motionLabel}. This gives a mixed expression: ${effect.constructive}; under pressure, ${effect.challenging}.`;
  const manifestation=`As a natural karaka, ${planet} signifies ${naturalMeanings[planet]}. While transiting ${transitArea}, it can produce ${effect.produces} through that area of life.`;
  const aspects=aspectConsequences(transit.aspectsToNatal);
  const aspectText=aspects ? `Its current aspect pattern further modifies the karaka expression: ${aspects}.` : "";
  const retro=transit.retrograde
    ? `Retrograde motion can turn the karaka themes toward revision, reconnection, reconsideration or the return of earlier situations.`
    : "";
  return [manifestation,condition,aspectText,retro].filter(Boolean).join(" ");
}

export function synthesizeHouseInterpretation(args:{
  house:HouseContext;
  natal?:PlacementContext;
  transit?:JHTransitPlanet;
  ruledHouses?:RuledHouse[];
}) {
  const {house,natal,transit,ruledHouses=[]}=args;
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

  const transitCondition = transit
    ? `Right now ${house.lord} is moving through ${transit.sign ?? "its current sign"}${transit.house ? ` in house ${transit.house}` : ""}${typeof transit.degree==="number" ? ` at ${transit.degree.toFixed(1)}°` : ""}${transit.nakshatra ? `, in ${transit.nakshatra}${transit.pada ? ` pada ${transit.pada}` : ""}` : ""}. ${conditionPhrase(transit.dignity)}`
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
    deepAnalysis:rulershipTransitAnalysis(house,transit,ruledHouses),
    karakaAnalysis:naturalKarakaAnalysis(house.lord,transit),
    evidence:{
      natalHouse:natal?.house,
      natalSign:natal?.sign,
      natalNakshatra:natal?.nakshatra,
      natalDignity:natal?.dignity,
      transitHouse:transit?.house,
      transitSign:transit?.sign,
      transitDegree:transit?.degree,
      transitNakshatra:transit?.nakshatra,
      transitDignity:transit?.dignity,
      retrograde:transit?.retrograde ?? false,
      naturalMeaning:naturalMeanings[house.lord],
      ruledHouses
    }
  };
}
