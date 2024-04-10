import { useState } from 'react'
import Footer from './components/layout/Footer'
import Header from './components/layout/Header'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './App.scss'
import GCF from './pages/GCF'
import ImageConverter from './pages/ImageConverter'
import Home from './pages/Home'
import { Privacy } from './pages/Privacy'
import TextGenerator from './pages/TextGenerator'

function App() {

  return (
    <>
      <BrowserRouter>
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/gcf" element={<GCF />} />
          <Route path="/image-converter" element={<ImageConverter />} />
          <Route path="/image-crop-tovideo" element={<ImageConverter croptovideo={true} />} />
          <Route path="/text-generator" element={<TextGenerator />} />
          <Route path="/privacy" element={<Privacy />} />
        </Routes>
        <Footer />
      </BrowserRouter>
    </>
  )
}

export default App
