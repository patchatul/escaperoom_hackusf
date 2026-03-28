import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './frontend/LogIn';
import EscapeRoom from './frontend/EscapeRoom';
import LeaderBoard from './frontend/LeaderBoard';

function App() {

  return (
   <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/escaperoom" element={<EscapeRoom />} />
        
        <Route path="/leaderboard" element={<LeaderBoard />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
