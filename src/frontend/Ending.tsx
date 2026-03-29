import { useState, useEffect } from "react";
import computer from "../../public/pics/computer.png";
import { useNavigate, useLocation } from "react-router-dom";

function Ending() {
  const { state } = useLocation();
  const { username, timeSpent, completed } = state || {};
  const navigate = useNavigate();
  const [zoom, setZoom] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setZoom(true), 2500);
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
            <h1 className="animate-flicker">
              {completed
                ? `Congratulations ${username || "Player"}!`
                : `Time's Up ${username || "Player"}!`}
            </h1>
          </div>
          <p>
            {completed
              ? "You solved all 5 questions in time!"
              : "Time ran out before you could escape!"}
          </p>

          <button
            onClick={() =>
              navigate("/leaderboard", {
                state: { username, timeSpent, completed },
              })
            }
          >
            View Leaderboard
          </button>
        </div>
      </div>
    </div>
  );
}

export default Ending;
