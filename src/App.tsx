import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./frontend/LogIn";
import EscapeRoom from "./frontend/EscapeRoom";
import LeaderBoard from "./frontend/LeaderBoard";
import Ending from "./frontend/Ending";

function App() {
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
