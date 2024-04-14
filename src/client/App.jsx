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
import CodeTeach from './pages/CodeTeach'
import FontConverter from './pages/FontConverter'

export const AppRoutes = [
  { path: "/gcf", element: < GCF />, name: 'GCF' },
  { path: "/image-converter", element: < ImageConverter />, name: 'Image Convertor' },
  { path: "/font-converter", element: < FontConverter />, name: 'Font Converter' },
  { path: "/image-crop-tovideo", element: <ImageConverter croptovideo={true} />, name: 'To Video' },
  { path: "/text-generator", element: < TextGenerator />, name: 'TextGenerator' },
  { path: "/code-teach", element: < CodeTeach />, name: 'CodeTeach' },
]


function App() {

  return (
    <>
      <BrowserRouter>
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/privacy" element={<Privacy />} />
          {AppRoutes.map(route => <Route key={route.path} path={route.path} element={route.element} />)}

        </Routes>
        <Footer />
      </BrowserRouter>
    </>
  )
}

export default App
