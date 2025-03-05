/*
 * @Description: create by southernMD
 */

import React from 'react'
import ReactDOM from 'react-dom/client'
import ScreenShotMain from '@/pages/ScreenShotMain/ScreenShotMain.tsx'
import Beast from '@/pages/Beast/Beast.tsx'
import { HashRouter, Route, Routes } from 'react-router-dom'
import ScreenShot from '@/windows/Screenshot.tsx'
import Layout from './Layout.tsx'
import './assets/css/base.css'
import KeepAlive from './components/KeepAlive.tsx'
import ColorPick from './pages/colorPick/colorPick.tsx'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <HashRouter>
    {/* <React.StrictMode> */}
    <Routes>
      <Route path="/" element={<KeepAlive />}>
        <Route index element={<Layout><ScreenShotMain /></Layout>}></Route>
        <Route path='/beast' element={<Layout><Beast /></Layout>}></Route>
        <Route path='/colorPick' element={<Layout><ColorPick /></Layout>}></Route>
      </Route>
      <Route path="/pick" element={<ScreenShot />}></Route>
    </Routes>
    {/* </React.StrictMode> */}
  </HashRouter>

)
