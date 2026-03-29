import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import Login from "./frontend/LogIn";
import EscapeRoom from "./frontend/EscapeRoom";
import LeaderBoard from "./frontend/LeaderBoard";
import Ending from "./frontend/Ending";

function App() {
  useEffect(() => {
    // Play eerie background sound for entire game
    const audio = new Audio("/pics/eerie.mp3");
    audio.loop = true;
    audio.volume = 0.4; // optional: softer background
    audio.play().catch(() => {
      // Autoplay blocked, wait for user interaction
      const startAudio = () => {
        audio.play();
        window.removeEventListener("click", startAudio);
      };
      window.addEventListener("click", startAudio);
    });

    // Cleanup on unmount (though for SPA, this won't happen until close)
    return () => {
      audio.pause();
      audio.currentTime = 0;
    };
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/escaperoom" element={<EscapeRoom />} />
        <Route path="/ending" element={<Ending />} />
        <Route path="/leaderboard" element={<LeaderBoard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
