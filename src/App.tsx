import { useState } from 'react'
import reactLogo from './assets/react.svg'
import './App.css'
import { Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import Setting from './pages/Setting'
import Profile from './pages/Profile'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/setting" element={<Setting />} />
      <Route path="/profile" element={<Profile />} />
    </Routes>
  )
}

export default App
