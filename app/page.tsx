"use client";

import { FormEvent, useMemo, useState } from "react";
import { interpretationFor, Planet, Sign } from "@/lib/astrology";

type Placement = {
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
};

type Chart = {
  settings: {
    zodiac: string;
    ayanamsa: string;
    houseSystem: string;
    node: string;
    charaKarakaSystem: 7 | 8;
  };
  birthUtc: string;
  calculatedAt: string;
  ayanamsa: number;
  ascendant: { longitude: number; sign: Sign; degree: number };
  houses: Array<{ house: number; sign: Sign; lord: Planet; lifeArea: string }>;
  natal: Placement[];
  transit: Placement[];
};

type Feedback = "agree" | "slightly_agree" | "slightly_disagree" | "disagree" | "not_applicable";

const feedbackOptions: [Feedback, string][] = [
  ["agree", "Agree"],
  ["slightly_agree", "Slightly agree"],
  ["slightly_disagree", "Slightly disagree"],
  ["disagree", "Disagree"],
  ["not_applicable", "Not applicable"],
];

const formatDegree = (n: number) => `${n.toFixed(2)}°`;

export default function Home() {
  const [form, setForm] = useState({
    date: "1990-01-01",
    time: "12:00",
    utcOffset: "-8",
    latitude: "36.1699",
    longitude: "-115.1398",
    karakaMode: "7",
  });
  const [chart, setChart] = useState<Chart | null>(null);
  const [feedback, setFeedback] = useState<Record<string, Feedback>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const atmakaraka = useMemo(
    () => chart?.natal.find((p) => p.charaKaraka === "Atmakaraka"),
    [chart]
  );

  async function calculate(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/chart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          utcOffset: Number(form.utcOffset),
          latitude: Number(form.latitude),
          longitude: Number(form.longitude),
          karakaMode: Number(form.karakaMode),
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Chart calculation failed.");
      setChart(data);
      setFeedback({});
    } catch (err) {
      setError(err instanceof Error ? err.message : "Chart calculation failed.");
    } finally {
      setLoading(false);
    }
  }

  function saveFeedback(house: number, value: Feedback) {
    if (!chart) return;
    const key = `house-${house}`;
    const next = { ...feedback, [key]: value };
    setFeedback(next);

    const record = {
      version: "0.2.1",
      savedAt: new Date().toISOString(),
      chart: {
        birthUtc: chart.birthUtc,
        ascendant: chart.ascendant,
        settings: chart.settings,
      },
      house,
      response: value,
      interpretationContext: {
        house: chart.houses.find((h) => h.house === house),
        natalLord: chart.natal.find(
          (p) => p.planet === chart.houses.find((h) => h.house === house)?.lord
        ),
        transitLord: chart.transit.find(
          (p) => p.planet === chart.houses.find((h) => h.house === house)?.lord
        ),
      },
    };

    const existing = JSON.parse(localStorage.getItem("celestial-time-feedback-records") || "[]");
    localStorage.setItem(
      "celestial-time-feedback-records",
      JSON.stringify([...existing, record].slice(-500))
    );
  }

  return (
    <main>
      <header className="hero">
        <div>
          <p className="eyebrow">VEDIC LIFE TRACKER</p>
          <h1>Celestial Time</h1>
          <p className="lede">
            Your natal house lords define the life areas. Their current transits show how those
            areas are moving now. Chara Karakas remain a distinct interpretive layer.
          </p>
        </div>
        <div className="status">Lahiri sidereal · Whole Sign</div>
      </header>

      <form className="birth-form panel" onSubmit={calculate}>
        <div className="form-title">
          <div>
            <span className="house">CREATE NATAL MAP</span>
            <h2>Birth data</h2>
          </div>
          <p>
            Enter the exact local birth time and coordinates. UTC offset should match the location
            on the birth date, including daylight-saving time when applicable.
          </p>
        </div>

        <div className="fields">
          <label>
            Birth date
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              required
            />
          </label>
          <label>
            Birth time
            <input
              type="time"
              value={form.time}
              onChange={(e) => setForm({ ...form, time: e.target.value })}
              required
            />
          </label>
          <label>
            UTC offset
            <input
              type="number"
              step="0.25"
              min="-14"
              max="14"
              value={form.utcOffset}
              onChange={(e) => setForm({ ...form, utcOffset: e.target.value })}
              required
            />
          </label>
          <label>
            Latitude
            <input
              type="number"
              step="0.0001"
              min="-90"
              max="90"
              value={form.latitude}
              onChange={(e) => setForm({ ...form, latitude: e.target.value })}
              required
            />
          </label>
          <label>
            Longitude
            <input
              type="number"
              step="0.0001"
              min="-180"
              max="180"
              value={form.longitude}
              onChange={(e) => setForm({ ...form, longitude: e.target.value })}
              required
            />
          </label>
          <label>
            Chara Karakas
            <select
              value={form.karakaMode}
              onChange={(e) => setForm({ ...form, karakaMode: e.target.value })}
            >
              <option value="7">7-karaka</option>
              <option value="8">8-karaka</option>
            </select>
          </label>
        </div>

        <div className="submit-row">
          <button className="primary" type="submit" disabled={loading}>
            {loading ? "Calculating…" : "Calculate Celestial Time"}
          </button>
          {error && <span className="error">{error}</span>}
        </div>
      </form>

      {!chart && (
        <section className="empty-state">
          <strong>Ready for a real chart.</strong>
          <span>
            The dashboard will populate with natal rulers, nakshatras, padas, Chara Karakas,
            current transits, and feedback controls after calculation.
          </span>
        </section>
      )}

      {chart && (
        <>
          <section className="summary">
            <div className="metric">
              <span>Ascendant</span>
              <strong>
                {chart.ascendant.sign} {formatDegree(chart.ascendant.degree)}
              </strong>
            </div>
            <div className="metric">
              <span>1st Lord</span>
              <strong>{chart.houses[0].lord}</strong>
            </div>
            <div className="metric">
              <span>Atmakaraka</span>
              <strong>{atmakaraka?.planet || "—"}</strong>
            </div>
            <div className="metric">
              <span>Lahiri Ayanamsa</span>
              <strong>{formatDegree(chart.ayanamsa)}</strong>
            </div>
          </section>

          <section className="planet-strip panel">
            {chart.natal.map((planet) => (
              <div className="planet-chip" key={planet.planet}>
                <b>{planet.planet}</b>
                <span>
                  {planet.sign} {formatDegree(planet.degree)}
                </span>
                <small>
                  {planet.nakshatra} · Pada {planet.pada}
                  {planet.retrograde ? " · Rx" : ""}
                </small>
                {planet.charaKaraka && <em>{planet.charaKaraka}</em>}
              </div>
            ))}
          </section>

          <section className="grid">
            {chart.houses.map((item) => {
              const natal = chart.natal.find((p) => p.planet === item.lord);
              const transit = chart.transit.find((p) => p.planet === item.lord);
              const text = interpretationFor({
                ...item,
                natal,
                transit,
                karaka: natal?.charaKaraka,
              });
              const key = `house-${item.house}`;

              return (
                <article className="card" key={item.house}>
                  <div className="cardtop">
                    <div>
                      <span className="house">HOUSE {item.house}</span>
                      <h2>{item.lifeArea}</h2>
                    </div>
                    <div className="lord">
                      <small>LORD</small>
                      <b>{item.lord}</b>
                    </div>
                  </div>

                  <div className="tags">
                    <span>{item.sign}</span>
                    {natal && (
                      <span>
                        Natal {natal.sign} {formatDegree(natal.degree)}
                      </span>
                    )}
                    {natal && (
                      <span>
                        {natal.nakshatra} P{natal.pada}
                      </span>
                    )}
                    {transit && (
                      <span>
                        Transit H{transit.house} · {transit.sign} {formatDegree(transit.degree)}
                      </span>
                    )}
                    {natal?.charaKaraka && <span>{natal.charaKaraka}</span>}
                  </div>

                  <p className="interpretation">{text}</p>

                  {transit && transit.aspectsToNatal && transit.aspectsToNatal.length > 0 && (
                    <div className="aspects">
                      <small>Current connections</small>
                      <p>{transit.aspectsToNatal.join(" · ")}</p>
                    </div>
                  )}

                  <div className="feedback">
                    <small>How accurately does this describe your experience?</small>
                    <div className="choices">
                      {feedbackOptions.map(([value, label]) => (
                        <button
                          type="button"
                          key={value}
                          className={feedback[key] === value ? "active" : ""}
                          onClick={() => saveFeedback(item.house, value)}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                </article>
              );
            })}
          </section>
        </>
      )}

      <footer>
        Celestial Time records astrological interpretations and user feedback for pattern research.
        Astrological body-related interpretations are not medical diagnoses.
      </footer>
    </main>
  );
}
