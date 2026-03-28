import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './frontend/Login';
import Escaperoom from './frontend/Escaperoom';
import LeaderBoard from './frontend/LeaderBoard';

function App() {

  return (
   <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/escaperoom" element={<Escaperoom />} />
        
        <Route path="/leaderboard" element={<LeaderBoard />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
