import { useState } from 'react'
import Footer from './components/layout/Footer'
import Header from './components/layout/Header'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './App.scss'
import GCF from './pages/GCF'
import ImageConverter from './pages/ImageConverter'

function App() {

  return (
    <>
      <BrowserRouter>
        <Header />
        <div className='border border-red'>Test</div>
        <Routes>
          <Route path="/gcf" element={<GCF />} />
          <Route path="/imageConverter" element={<ImageConverter />} />
        </Routes>
        <Footer />
      </BrowserRouter>
    </>
  )
}

export default App
