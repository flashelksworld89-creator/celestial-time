import { Placement } from "./astrology";

export const natalSample: Placement[] = [
  {planet:"Sun",sign:"Scorpio",degree:18.4,nakshatra:"Jyeshtha",pada:1},
  {planet:"Moon",sign:"Taurus",degree:11.2,nakshatra:"Rohini",pada:1},
  {planet:"Mars",sign:"Cancer",degree:7.1,nakshatra:"Pushya",pada:2},
  {planet:"Mercury",sign:"Libra",degree:24.8,nakshatra:"Vishakha",pada:2},
  {planet:"Jupiter",sign:"Pisces",degree:14.3,nakshatra:"Uttara Bhadrapada",pada:4},
  {planet:"Venus",sign:"Sagittarius",degree:27.6,nakshatra:"Uttara Ashadha",pada:1},
  {planet:"Saturn",sign:"Aquarius",degree:3.9,nakshatra:"Dhanishta",pada:4},
  {planet:"Rahu",sign:"Aries",degree:9.4,nakshatra:"Ashwini",pada:3},
  {planet:"Ketu",sign:"Libra",degree:9.4,nakshatra:"Swati",pada:1}
];

export const transitSample: Placement[] = [
  {planet:"Sun",sign:"Virgo",degree:11.0,nakshatra:"Hasta",pada:1,aspects:["Saturn"]},
  {planet:"Moon",sign:"Aries",degree:22.1,nakshatra:"Bharani",pada:3},
  {planet:"Mars",sign:"Gemini",degree:8.7,nakshatra:"Ardra",pada:1},
  {planet:"Mercury",sign:"Virgo",degree:18.2,nakshatra:"Hasta",pada:3},
  {planet:"Jupiter",sign:"Cancer",degree:3.4,nakshatra:"Punarvasu",pada:4},
  {planet:"Venus",sign:"Libra",degree:4.8,nakshatra:"Chitra",pada:4},
  {planet:"Saturn",sign:"Pisces",degree:16.6,nakshatra:"Uttara Bhadrapada",pada:4},
  {planet:"Rahu",sign:"Aquarius",degree:6.2,nakshatra:"Dhanishta",pada:4},
  {planet:"Ketu",sign:"Leo",degree:6.2,nakshatra:"Magha",pada:2}
];
