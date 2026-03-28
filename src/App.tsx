import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './frontend/Login';
import Escaperoom from './frontend/Escaperoom';

function App() {

  return (
   <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/escaperoom" element={<Escaperoom />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
