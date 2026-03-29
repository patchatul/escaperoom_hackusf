import { useState, useEffect } from "react";
import computer from "../../public/pics/computer.png";

function LeaderBoard() {
  // -----------------------------
  // MOCK DATA (local only)
  // -----------------------------
  const [scores, setScores] = useState([
    { name: "Peduncle", time: 3.55 },
    { name: "ShadowWalker", time: 3.25 },
    { name: "CryptKeeper", time: 4.1 },
    { name: "NightCrawler", time: 4.58 },
    { name: "GrimPlayer", time: 5.12 },
    { name: "SilentWhisper", time: 5.47 },
    { name: "VoidSeeker", time: 5.59 },
    { name: "DarkEcho", time: 6.33 },
    { name: "PhantomSoul", time: 7.11 },
    { name: "RustedKey", time: 7.2 },
    { name: "BrokenLantern", time: 8.05 },

  ]);

  // -----------------------------
  // BACKEND FETCH AREA
  // (replace mock data later)
  // -----------------------------
  /*
  useEffect(() => {
    fetch("/api/leaderboard")
      .then(res => res.json())
      .then(data => setScores(data));
  }, []);
  */

  // Sort fastest → slowest
  const sorted = [...scores].sort((a, b) => a.time - b.time);
const [zoom, setZoom] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setZoom(true);
    }, 2500); // 2.5 seconds after page load

    return () => clearTimeout(timer);
  }, []);
  return (
    <div className="min-h-screen flex items-center justify-center">
         {/* Flicker light layer */}
      <div className="absolute inset-0 bg-gray-800/10 flicker-bg pointer-events-none"></div>

      {/* Static noise layer */}
      <div className="absolute inset-0 static-bg pointer-events-none mix-blend-overlay"></div>

<div
        className={` relative w-225
          transition-transform duration-1500 ease-out
          ${zoom ? "scale-100" : "scale-60"}
        `}
      >
        {/* Computer image */}
 <img src={computer} className="w-full" />

        {/* SCREEN AREA (overlay) */}
        <div
          className="absolute top-[16%] left-[16%] w-[68%] h-[42%] 
                    flex flex-col items-center justify-center"
        >
          <div className="w-[80%] mb-1 flex flex-col items-center ">
            <h1 className="animate-flicker">LEADER BOARD</h1>
          </div>
          
            {/* Example: show current player */}
            <p className="mb-6 text-sm text-[#e8d8b0]/80">
        Fastest: <span className="text-[#2de200] font-semibold">
          {sorted[1].name}
        </span>{" "}
        {sorted[1].time.toFixed(2)}
      </p>

      <div className="w-full max-w-xl overflow-y-scroll overflow-x-hidden rounded-lg bg-[#0b0b0b]/80 shadow-[0_0_25px_rgba(0,0,0,0.9)]">
        <table className="w-full text-left ">
          <thead className="">
            <tr>
              <th className="px-4 py-2 text-xs  tracking-widest text-[#e8d8b0]/70">
                Rank
              </th>
              <th className="px-4 py-2 text-xs  tracking-widest text-[#e8d8b0]/70">
                Username
              </th>
              <th className="px-4 py-2 text-xs  tracking-widest text-[#e8d8b0]/70">
                Time 
              </th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((entry, index) => (
              <tr
                key={index}
                className={`border-b ${
                  index === 0
                    ? "bg-[#13210f]/80"
                    : index % 2 === 0
                    ? "bg-[#0d0d0d]"
                    : "bg-[#090909]"
                } hover:bg-[#1a1a1a] transition-colors`}
              >
                <td className="px-4 py-2 text-sm text-[#e8d8b0]/80">
                  {index + 1}
                </td>
                <td className="px-4 py-2 text-sm font-medium text-[#e8d8b0]">
                  {entry.name}
                </td>
                <td className="px-4 py-2 text-sm text-[#2de200]">
                  {entry.time.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

          </div>
        </div>
      </div>
    </div>
  );
}

export default LeaderBoard;
