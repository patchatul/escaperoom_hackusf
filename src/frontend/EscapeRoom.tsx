import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ModelViewer from "./ThreeDRoom";
const controls = [
  { key: "Mouse", action: "look around" },
  { key: "W", action: "move forward" },
  { key: "S", action: "move backward" },
  { key: "A", action: "move left" },
  { key: "D", action: "move right" },
  { key: "Esc", action: "show cursor" },
];
function EscapeRoom() {
  const { state } = useLocation();
  const { username } = state || {};
  const navigate = useNavigate();
  const [showPopup, setShowPopup] = useState(true);
  const [timerStart, setTimerStart] = useState(false);
  const totalTime = 600; //10 mins 600
  const [timeLeft, setTimeLeft] = useState(totalTime);
  const [startTime, setStartTime] = useState<number | null>(null);
  // timer runs ONLY when timerStart is true
  useEffect(() => {
    if (!timerStart) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          const timeSpent = startTime ? (Date.now() - startTime) / 1000 : 0;
          navigate("/ending", {
            state: { username, timeSpent, completed: false },
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timerStart, startTime, username, navigate]);

  //start Let's go button
  const handleStart = () => {
    setShowPopup(false);
    setTimerStart(true);
    setStartTime(Date.now());
  };

  const handleQuizFinish = () => {
    const timeSpent = startTime ? (Date.now() - startTime) / 1000 : 0;
    navigate("/ending", { state: { username, timeSpent, completed: true } });
  };

  //set time format
  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const time = `${mins}:${secs.toString().padStart(2, "0")}`;
  const progressPercent = (timeLeft / totalTime) * 100;
  //effect -flash when less than 30 secs

  // Play tick sound when less than 30 seconds
  useEffect(() => {
    if (timeLeft <= 30 && timeLeft > 0) {
      const tickAudio = new Audio("/pics/tick.mp3");
      tickAudio.loop = true;
      tickAudio.volume = 0.6;
      tickAudio.play().catch(() => {});
      return () => {
        tickAudio.pause();
        tickAudio.currentTime = 0;
      };
    }
  }, [timeLeft]);

  return (
    <div className="relative w-full h-full">
      {/* 3D ROOM */}
      <ModelViewer onFinish={handleQuizFinish} username={username} />
      {showPopup && (
        <div className="fixed inset-0  flex items-center justify-center z-50">
          <div className=" bg-[#7a0000]/50 p-8 rounded-2xl text-center space-y-6">
            <h1 className="animate-flicker">
              <span className="text-white">WELCOME TO</span>
              <br />
              ESCAPE ROOM
            </h1>
            <h2 className="font-['Nosifer'] text-2xl ">
              Solve 5 Questions in 10 Minutes
            </h2>

            <div className="grid grid-cols-3  gap-1 ">
              {controls.map((c, i) => (
                <div
                  key={i}
                  className=" bg-[#e8d8b0]/30 rounded-lg 
                "
                >
                  <p className="text-[#2de200] ">
                    <span className="text-xl">{c.key}</span>
                    <br />
                    <span className="text-[#e8d8b0] ">{c.action}</span>
                  </p>
                </div>
              ))}
            </div>

            <button
              onClick={handleStart}
              className="w-100 py-2  font-bold rounded-lg transition"
            >
              LET'S GO
            </button>
          </div>
        </div>
      )}
      {timerStart && (
        <div>
          <div
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50 
             flex items-center gap-4"
          >
            <p className="font-bold text-2xl text-white">Player: {username}</p>
            <p className="font-bold text-2xl text-white">{time}</p>
            <div className="w-150 h-5 border-2 border-red rounded overflow-hidden">
              <div
                className="bg-red-700 h-full rounded transition-all duration-100"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default EscapeRoom;
