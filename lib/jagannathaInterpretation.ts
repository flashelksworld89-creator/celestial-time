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

const signMeaning: Record<Sign,string> = {
  Aries:"initiative, urgency, independence, competition and starting action",
  Taurus:"stability, resources, security, comfort, values and material continuity",
  Gemini:"communication, learning, movement, comparison, trade and multiple options",
  Cancer:"home, protection, care, memory, family and emotional security",
  Leo:"visibility, authority, creativity, pride, leadership and self-expression",
  Virgo:"analysis, organization, service, correction, skill and practical problem-solving",
  Libra:"partnership, agreement, balance, negotiation, social exchange and fairness",
  Scorpio:"intensity, secrecy, investigation, vulnerability, control and transformation",
  Sagittarius:"belief, teaching, travel, expansion, law, guidance and long-range direction",
  Capricorn:"duty, structure, status, endurance, hierarchy and measurable results",
  Aquarius:"networks, systems, communities, unconventional ideas, reform and collective goals",
  Pisces:"imagination, surrender, compassion, retreat, spirituality and diffuse boundaries"
};

type NakMeaning={lord:Planet;nature:string;meaning:string};

const nakshatraMeaning: Record<string,NakMeaning> = {
  Ashwini:{lord:"Ketu",nature:"quick",meaning:"beginnings, speed, healing, rescue, movement and rapid intervention"},
  Bharani:{lord:"Venus",nature:"fierce",meaning:"containment, responsibility, pressure, endurance, consequences and carrying something to completion"},
  Krittika:{lord:"Sun",nature:"mixed",meaning:"cutting, purification, separation, decisive judgment and removing what is unnecessary"},
  Rohini:{lord:"Moon",nature:"fixed",meaning:"growth, fertility, attraction, creation, comfort, accumulation and material development"},
  Mrigashira:{lord:"Mars",nature:"gentle",meaning:"searching, curiosity, exploration, investigation, movement and looking for a better option"},
  Ardra:{lord:"Rahu",nature:"sharp",meaning:"disruption, storms, grief, breaking patterns, intense learning and rebuilding after disturbance"},
  Punarvasu:{lord:"Jupiter",nature:"movable",meaning:"return, restoration, renewal, repetition, homecoming and recovering what was lost"},
  Pushya:{lord:"Saturn",nature:"quick",meaning:"nourishment, support, duty, teaching, protection, growth through discipline and sustaining others"},
  Ashlesha:{lord:"Mercury",nature:"sharp",meaning:"entanglement, strategy, persuasion, hidden motives, binding agreements and psychological complexity"},
  Magha:{lord:"Ketu",nature:"fierce",meaning:"ancestry, status, inheritance, authority, tradition, lineage and obligations to the past"},
  "Purva Phalguni":{lord:"Venus",nature:"fierce",meaning:"pleasure, attraction, romance, creativity, rest, enjoyment and social connection"},
  "Uttara Phalguni":{lord:"Sun",nature:"fixed",meaning:"contracts, patronage, commitments, alliances, support and making arrangements durable"},
  Hasta:{lord:"Moon",nature:"quick",meaning:"skill, hands-on work, crafting, control, negotiation, practical execution and making something tangible"},
  Chitra:{lord:"Mars",nature:"gentle",meaning:"design, construction, beauty, craftsmanship, image, refinement and creating a visible result"},
  Swati:{lord:"Rahu",nature:"movable",meaning:"independence, trade, flexibility, dispersion, wind-like movement and learning through autonomy"},
  Vishakha:{lord:"Jupiter",nature:"mixed",meaning:"goal pursuit, competition, branching choices, ambition, persistence and reaching a target"},
  Anuradha:{lord:"Saturn",nature:"gentle",meaning:"friendship, loyalty, cooperation, devotion, organization and success through alliances"},
  Jyeshtha:{lord:"Mercury",nature:"sharp",meaning:"seniority, protection, responsibility, strategy, crisis management and defending position"},
  Mula:{lord:"Ketu",nature:"sharp",meaning:"uprooting, investigation, origins, elimination, truth-seeking and rebuilding from the root"},
  "Purva Ashadha":{lord:"Venus",nature:"fierce",meaning:"campaigning, persuasion, declaration, confidence, cleansing and refusing defeat"},
  "Uttara Ashadha":{lord:"Sun",nature:"fixed",meaning:"lasting achievement, duty, leadership, integrity, consolidation and long-term victory"},
  Shravana:{lord:"Moon",nature:"movable",meaning:"listening, learning, information, reputation, travel, transmission and following established paths"},
  Dhanishtha:{lord:"Mars",nature:"movable",meaning:"timing, resources, wealth, performance, groups, rhythm and coordinated action"},
  Shatabhisha:{lord:"Rahu",nature:"movable",meaning:"healing, diagnosis, isolation, technology, research, secrecy and solving complex problems"},
  "Purva Bhadrapada":{lord:"Jupiter",nature:"fierce",meaning:"intensity, conviction, sacrifice, transformation, idealism and confronting extremes"},
  "Uttara Bhadrapada":{lord:"Saturn",nature:"fixed",meaning:"depth, patience, stability, responsibility, endings, maturity and sustaining long processes"},
  Revati:{lord:"Mercury",nature:"gentle",meaning:"completion, guidance, safe travel, transition, protection, nourishment and bringing matters to a close"}
};

function signNakshatraModifier(transit:JHTransitPlanet|undefined) {
  if (!transit) return "";
  const sign=transit.sign as Sign | undefined;
  const signText=sign && signMeaning[sign]
    ? `In ${sign}, the transit operates through ${signMeaning[sign]}.`
    : "";
  const nak=transit.nakshatra ? nakshatraMeaning[transit.nakshatra] : undefined;
  const nakText=nak
    ? `In ${transit.nakshatra}, ruled by ${nak.lord}, the event pattern emphasizes ${nak.meaning}. Its ${nak.nature} nature describes the way events tend to develop rather than changing which natal houses are activated.`
    : "";
  return [signText,nakText].filter(Boolean).join(" ");
}



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

const classicalKarakaMeanings: Record<Planet,string> = {
  Sun:"atma, vitality, authority, father, leadership, government, status, reputation, honor, vision, bones and central life-purpose",
  Moon:"mind, emotions, mother, care, nourishment, public, home, fluids, sleep, memory, receptivity and daily rhythms",
  Mars:"courage, action, conflict, energy, competition, brothers, land, property disputes, technical skill, weapons, surgery and physical exertion",
  Mercury:"intellect, speech, communication, writing, calculation, learning, trade, commerce, accounting, documents, negotiation, analysis, coordination and younger people",
  Jupiter:"wisdom, dharma, teachers, gurus, children, education, judgment, adversary, finance, expansion, prosperity, law, faith and protection",
  Venus:"relationships, marriage, attraction, agreement, comforts, vehicles, luxury, art, music, beauty, sensual pleasure, values and financial enjoyment",
  Saturn:"discipline, delay, labor, responsibility, endurance, age, older people, service, scarcity, structure, conservation, separation, longevity and the consequences of time",
  Rahu:"amplification, appetite, ambition, foreign influences, technology, mass communication, obsession, status hunger, unconventional choices, controversy and disruption",
  Ketu:"detachment, separation, release, moksha, intuition, research, isolation, renunciation, breaks, loss of identification and specialized knowledge"
};

const planetBodyCorrespondence: Record<Planet,string> = {
  Sun:"heart, spine, bones, vitality, right eye and the body’s central life-force",
  Moon:"mind-body rhythms, bodily fluids, breasts and chest, stomach, left eye, sleep and nourishment",
  Mars:"blood, muscles, bone marrow, heat, inflammation, cuts, burns, surgery and physical exertion",
  Mercury:"nervous system, skin, hands and arms, tongue, speech apparatus, lungs and sensory coordination",
  Jupiter:"liver, fat tissue, growth, hips and thighs, metabolic nourishment and reproductive growth",
  Venus:"kidneys, reproductive organs, urinary system, face, hormonal functions and sexual vitality",
  Saturn:"bones, joints, knees, teeth, nerves, legs, chronic strain, aging and connective structures",
  Rahu:"toxins, unusual or difficult-to-classify disturbances, nervous agitation, compulsive patterns and foreign substances",
  Ketu:"numbness, scars, severance, intermittent or subtle disturbances, wasting patterns and neurological sensitivity"
};

function bodyHealthAnalysis(planet:Planet, house:HouseContext, transit:JHTransitPlanet|undefined, ruledHouses:RuledHouse[]) {
  const relevantHouses=new Set([1,6,8,12]);
  const ruledRelevant=ruledHouses.filter(h=>relevantHouses.has(h.house));
  const directlyRelevant=relevantHouses.has(house.house) || ruledRelevant.length>0 || (transit?.house ? relevantHouses.has(transit.house) : false);
  if (!directlyRelevant) return "";
  const ruledText=ruledRelevant.length ? ` Because ${planet} rules ${ruledRelevant.map(h=>`${ordinal(h.house)} house`).join(" and ")}, those body or health-related houses are directly involved.` : "";
  const transitText=transit?.house ? ` Its transit through the ${ordinal(transit.house)} house shows where these themes are being activated now.` : "";
  return `Body & health correspondence: in traditional Jyotish, ${planet} is associated with ${planetBodyCorrespondence[planet]}.${ruledText}${transitText} These correspondences describe astrological symbolism and should not be treated as a medical diagnosis.`;
};

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

function ordinal(n:number) {
  const mod100=n%100;
  if (mod100>=11 && mod100<=13) return `${n}th`;
  if (n%10===1) return `${n}st`;
  if (n%10===2) return `${n}nd`;
  if (n%10===3) return `${n}rd`;
  return `${n}th`;
}

function ruledHousePrediction(planet:Planet, ruled:RuledHouse, transitHouse?:number) {
  const specific=relationshipSpecificOutcome(ruled.house,transitHouse);
  if (!transitHouse) {
    return `${planet} rules your ${ordinal(ruled.house)} house of ${ruled.lifeArea.toLowerCase()}, keeping this area central to the transit.`;
  }
  return `For your ${ordinal(ruled.house)} house of ${ruled.lifeArea.toLowerCase()}, this can show up as ${specific}.`;
}

function rulershipTransitAnalysis(house:HouseContext,transit:JHTransitPlanet|undefined,ruledHouses:RuledHouse[]) {
  if (!transit) return "";
  const planet=house.lord;
  const activatedHouse=transit.house;
  const ruled=ruledHouses.length ? ruledHouses : [{house:house.house,lifeArea:house.lifeArea}];
  const ruledText=ruled.map(item=>`${ordinal(item.house)} house of ${item.lifeArea.toLowerCase()}`).join(" and ");
  const transitTheme=activatedHouse ? houseActivation[activatedHouse] : "the area occupied by the transit";
  const intro=activatedHouse
    ? `${planet} is moving through your ${ordinal(activatedHouse)} house, activating your ${ruledText}. This can make ${transitTheme} directly affect those parts of your life.`
    : `${planet} is activating your ${ruledText}.`;
  const pathways=ruled.map(item=>ruledHousePrediction(planet,item,activatedHouse)).join(" ");
  const signNakshatra=signNakshatraModifier(transit);
  const aspectModifier=transit.aspectsToNatal?.length
    ? `The current aspects sharpen the timing and can redirect how these themes manifest, while the main story remains centered on ${ruled.map(item=>item.lifeArea.toLowerCase()).join(" and ")}.`
    : "";
  const retro=transit.retrograde
    ? `Because ${planet} is retrograde, expect more review, repetition, renegotiation or unfinished matters before the situation settles.`
    : "";
  return [intro,pathways,signNakshatra,aspectModifier,retro].filter(Boolean).join(" ");
}

const charaKarakaMeaning: Record<string,string> = {
  Atmakaraka:"your core self, identity development, central life direction and personally significant lessons",
  Amatyakaraka:"career, work, responsibility, skill, professional decisions and how you function in the world",
  Bhratrikaraka:"siblings, peers, courage, initiative, communication and cooperative effort",
  Matrikaraka:"mother, caregiving, emotional foundations, home support and nurturing relationships",
  "Pitri Karaka":"father, ancestry, guidance, authority, lineage and inherited responsibilities",
  Putrakaraka:"children, creativity, intelligence, learning, teaching, legacy and what you produce",
  Gnatikaraka:"conflict, competition, obstacles, illness, debts, relatives and situations requiring problem-solving",
  Darakaraka:"spouse, committed partners, significant one-to-one relationships, agreements and the experience of relating closely to others"
};

function charaKarakaAnalysis(planet:Planet, role:string|undefined, transit:JHTransitPlanet|undefined, ruledHouses:RuledHouse[]) {
  if (!role || !transit) return "";
  const meaning=charaKarakaMeaning[role];
  if (!meaning) return "";
  const transitArea=transit.house ? houseActivation[transit.house] : "the current transit area";
  const ruled=ruledHouses.length ? ruledHouses.map(h=>`${ordinal(h.house)} house of ${h.lifeArea.toLowerCase()}`).join(" and ") : "the natal houses this planet rules";
  const roleFocus=`Because ${planet} is your ${role}, it also carries a personal role connected with ${meaning}.`;
  const synthesis=`As ${planet} moves through ${transitArea}, this Chara Karaka role can become personally active through ${ruled}.`;
  const dk=role==="Darakaraka" ? "This makes partners, relationship decisions, agreements or the behavior of an important one-to-one connection more relevant to the transit, especially when the transit house itself supports relationship, romance, family or shared-life themes." : "";
  const ak=role==="Atmakaraka" ? "This can make the transit feel more personally defining, bringing choices that affect identity, direction or what you consider meaningful." : "";
  const amk=role==="Amatyakaraka" ? "This can connect the transit more strongly with work, career decisions, responsibilities, skills or professional relationships." : "";
  return [roleFocus,synthesis,dk,ak,amk].filter(Boolean).join(" ");
};

function personalizedExamples(planet:Planet, transit:JHTransitPlanet|undefined, ruledHouses:RuledHouse[]) {
  if (!transit?.house) return "";
  const transitExamples=houseOutcome[transit.house] ?? [];
  const ruledLabels=ruledHouses.map(h=>`house ${h.house} (${h.lifeArea})`);
  const sign=transit.sign ? ` in ${transit.sign}` : "";
  const nak=transit.nakshatra ? ` through ${transit.nakshatra}` : "";
  const examples=ruledHouses.slice(0,2).map((ruled,i)=>{
    const base=relationshipSpecificOutcome(ruled.house,transit.house);
    const concrete=transitExamples[i % Math.max(transitExamples.length,1)] ?? "a noticeable development";
    return `${concrete}: ${base}`;
  });
  if (!examples.length) return "";
  return `Examples${sign}${nak}: ${examples.join(" Another possibility is ")}.`;
}

function personalizedAdvice(planet:Planet, transit:JHTransitPlanet|undefined, ruledHouses:RuledHouse[]) {
  if (!transit) return "";
  const dignity=(transit.dignity ?? "").toLowerCase();
  const strained=["enemy","enemy sign","debilitated","debilitation"].includes(dignity);
  const supported=["exalted","exaltation","moolatrikona","own","own sign","friendly","friend sign"].includes(dignity);
  const ruled=ruledHouses.map(h=>`house ${h.house}`).join(" and ");
  const nak=transit.nakshatra ? nakshatraMeaning[transit.nakshatra] : undefined;

  const conditionAdvice=supported
    ? `${planet}'s current condition is relatively supportive, so use the transit proactively rather than waiting for circumstances to force a response.`
    : strained
      ? `${planet}'s current condition is strained, so slow decisions down, verify details, and avoid forcing results in the areas governed by ${ruled || "this planet"}.`
      : `${planet}'s condition is mixed, so stay flexible and judge results by what is actually developing rather than assuming the transit is entirely positive or negative.`;

  const retroAdvice=transit.retrograde
    ? `Because ${planet} is retrograde, review earlier decisions, unfinished conversations, prior agreements or recurring issues before starting something completely new.`
    : `Because ${planet} is direct, forward movement is generally easier once the facts are clear.`;

  const signAdvice=transit.sign && signMeaning[transit.sign as Sign]
    ? `Work with the ${transit.sign} style of ${signMeaning[transit.sign as Sign]}.`
    : "";

  const nakAdvice=nak
    ? `The ${transit.nakshatra} pattern favors ${nak.meaning}; use that as the practical strategy for handling the transit.`
    : "";

  return `Advice: ${[conditionAdvice,retroAdvice,signAdvice,nakAdvice].filter(Boolean).join(" ")}`;
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
  const manifestation=`As a natural karaka in classical Jyotish, ${planet} signifies ${classicalKarakaMeanings[planet]}. While transiting ${transitArea}, these significations can become active through ${effect.produces}.`;
  const aspects=aspectConsequences(transit.aspectsToNatal);
  const aspectText=aspects ? `Its current aspect pattern further modifies the karaka expression: ${aspects}.` : "";
  const retro=transit.retrograde
    ? `Retrograde motion can turn the karaka themes toward revision, reconnection, reconsideration or the return of earlier situations.`
    : "";
  const signNakshatra=signNakshatraModifier(transit);
  return [manifestation,condition,signNakshatra,aspectText,retro].filter(Boolean).join(" ");
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
    charaKarakaAnalysis:charaKarakaAnalysis(house.lord,natal?.charaKaraka,transit,ruledHouses),
    bodyHealthAnalysis:bodyHealthAnalysis(house.lord,house,transit,ruledHouses),
    examples:personalizedExamples(house.lord,transit,ruledHouses),
    advice:personalizedAdvice(house.lord,transit,ruledHouses),
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
      naturalMeaning:classicalKarakaMeanings[house.lord],
      ruledHouses
    }
  };
}
