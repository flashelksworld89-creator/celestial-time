import { Planet, Sign } from "@/lib/astrology";

type Placement = {
  planet: Planet;
  sign: Sign;
  degree: number;
  house: number;
  retrograde?: boolean;
  nakshatra?: string;
  pada?: number;
};

type House = {
  house: number;
  sign: Sign;
  lord: Planet;
  lifeArea: string;
};

type Props = {
  ascendant: { sign: Sign; degree: number };
  houses: House[];
  natal: Placement[];
};

const abbreviations: Record<Planet,string> = {
  Sun:"Su", Moon:"Mo", Mars:"Ma", Mercury:"Me", Jupiter:"Ju",
  Venus:"Ve", Saturn:"Sa", Rahu:"Ra", Ketu:"Ke"
};

const slots: Record<number,{gridColumn:string;gridRow:string}> = {
  1:{gridColumn:"2 / 4",gridRow:"1 / 2"},
  2:{gridColumn:"1 / 2",gridRow:"1 / 2"},
  3:{gridColumn:"1 / 2",gridRow:"2 / 3"},
  4:{gridColumn:"1 / 2",gridRow:"3 / 4"},
  5:{gridColumn:"1 / 2",gridRow:"4 / 5"},
  6:{gridColumn:"2 / 4",gridRow:"4 / 5"},
  7:{gridColumn:"4 / 5",gridRow:"4 / 5"},
  8:{gridColumn:"4 / 5",gridRow:"3 / 4"},
  9:{gridColumn:"4 / 5",gridRow:"2 / 3"},
  10:{gridColumn:"4 / 5",gridRow:"1 / 2"},
  11:{gridColumn:"3 / 4",gridRow:"2 / 4"},
  12:{gridColumn:"2 / 3",gridRow:"2 / 4"}
};

export default function NorthIndianChart({ascendant,houses,natal}:Props) {
  return (
    <section className="panel vedic-chart-panel">
      <div className="vedic-chart-heading">
        <div>
          <span className="house">D1 RASHI CHART</span>
          <h2>Vedic Natal Chart</h2>
        </div>
        <div className="vedic-lagna">
          <small>Lagna</small>
          <strong>{ascendant.sign} {ascendant.degree.toFixed(2)}°</strong>
        </div>
      </div>

      <div className="vedic-chart-wrap">
        <div className="vedic-chart-grid" aria-label="North Indian Vedic natal chart">
          {houses.map(house=>{
            const planets=natal.filter(p=>p.house===house.house);
            return (
              <div
                className={`vedic-house vedic-house-${house.house}`}
                style={slots[house.house]}
                key={house.house}
              >
                <div className="vedic-house-meta">
                  <span>H{house.house}</span>
                  <b>{house.sign}</b>
                </div>
                <div className="vedic-house-planets">
                  {house.house===1 && (
                    <span className="vedic-asc">ASC {ascendant.degree.toFixed(1)}°</span>
                  )}
                  {planets.map(planet=>(
                    <span key={planet.planet}>
                      {abbreviations[planet.planet]} {planet.degree.toFixed(1)}°
                      {planet.retrograde ? " Rx" : ""}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="vedic-chart-legend">
          <span><b>Su</b> Sun</span><span><b>Mo</b> Moon</span><span><b>Ma</b> Mars</span>
          <span><b>Me</b> Mercury</span><span><b>Ju</b> Jupiter</span><span><b>Ve</b> Venus</span>
          <span><b>Sa</b> Saturn</span><span><b>Ra</b> Rahu</span><span><b>Ke</b> Ketu</span>
        </div>
      </div>
    </section>
  );
}
