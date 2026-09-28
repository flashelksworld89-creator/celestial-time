"use client";

import { useMemo, useState } from "react";
import { assignCharaKarakas, houseLords, interpretationFor, signs, Sign, transitHouse } from "@/lib/astrology";
import { natalSample, transitSample } from "@/lib/sample";

type Feedback = "agree"|"slightly_agree"|"slightly_disagree"|"disagree"|"not_applicable";
const options:[Feedback,string][] = [
  ["agree","Agree"],["slightly_agree","Slightly agree"],["slightly_disagree","Slightly disagree"],["disagree","Disagree"],["not_applicable","Not applicable"]
];

export default function Home() {
  const [asc,setAsc] = useState<Sign>("Leo");
  const [karakaMode,setKarakaMode] = useState<7|8>(7);
  const [feedback,setFeedback] = useState<Record<number,Feedback>>({});
  const lords = useMemo(()=>houseLords(asc),[asc]);
  const karakas = useMemo(()=>assignCharaKarakas(natalSample,karakaMode),[karakaMode]);

  const saveFeedback=(house:number,value:Feedback)=>{
    const next={...feedback,[house]:value}; setFeedback(next);
    localStorage.setItem("celestial-time-feedback",JSON.stringify({
      version:"0.1.0", ascendant:asc, karakaMode, responses:next, savedAt:new Date().toISOString()
    }));
  };

  return <main>
    <header className="hero">
      <div>
        <p className="eyebrow">VEDIC LIFE TRACKER</p>
        <h1>Celestial Time</h1>
        <p className="lede">Your natal house lords define the life areas. Their transits show how those areas are moving now. Chara Karakas add a second, separate layer.</p>
      </div>
      <div className="status">Prototype engine · Lahiri-ready architecture</div>
    </header>

    <section className="controls panel">
      <label>Sidereal Ascendant
        <select value={asc} onChange={e=>setAsc(e.target.value as Sign)}>
          {signs.map(s=><option key={s}>{s}</option>)}
        </select>
      </label>
      <label>Chara Karaka system
        <select value={karakaMode} onChange={e=>setKarakaMode(Number(e.target.value) as 7|8)}>
          <option value={7}>7 Karakas</option><option value={8}>8 Karakas</option>
        </select>
      </label>
      <div className="notice">
        This first build uses a sample chart to prove the life-area logic. The calculation adapter is isolated so a precision sidereal ephemeris can replace sample placements without rewriting the app.
      </div>
    </section>

    <section className="summary">
      <div className="metric"><span>Ascendant</span><strong>{asc}</strong></div>
      <div className="metric"><span>1st Lord</span><strong>{lords[0].lord}</strong></div>
      <div className="metric"><span>Atmakaraka</span><strong>{karakas.find(k=>k.karaka==="Atmakaraka")?.planet}</strong></div>
      <div className="metric"><span>Feedback</span><strong>{Object.keys(feedback).length}/12</strong></div>
    </section>

    <section className="grid">
      {lords.map(item=>{
        const natal=natalSample.find(p=>p.planet===item.lord);
        const rawTransit=transitSample.find(p=>p.planet===item.lord);
        const transit=rawTransit?{...rawTransit,house:transitHouse(asc,rawTransit.sign)}:undefined;
        const karaka=karakas.find(k=>k.planet===item.lord)?.karaka;
        const text=interpretationFor({...item,natal,transit,karaka});
        return <article className="card" key={item.house}>
          <div className="cardtop">
            <div><span className="house">HOUSE {item.house}</span><h2>{item.lifeArea}</h2></div>
            <div className="lord"><small>LORD</small><b>{item.lord}</b></div>
          </div>
          <div className="tags">
            <span>{item.sign}</span>
            {natal && <span>Natal {natal.sign} {natal.degree.toFixed(1)}°</span>}
            {transit && <span>Transit H{transit.house} · {transit.sign}</span>}
            {karaka && <span>{karaka}</span>}
          </div>
          <p className="interpretation">{text}</p>
          <div className="feedback">
            <small>How accurately does this describe your experience?</small>
            <div className="choices">
              {options.map(([value,label])=><button key={value} className={feedback[item.house]===value?"active":""} onClick={()=>saveFeedback(item.house,value)}>{label}</button>)}
            </div>
          </div>
        </article>
      })}
    </section>

    <footer>
      Celestial Time presents astrological interpretations for reflection and pattern tracking. It is not a medical diagnostic system.
    </footer>
  </main>;
}
