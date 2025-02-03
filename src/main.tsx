/*
 * @Description: create by southernMD
 */

import React from 'react'
import ReactDOM from 'react-dom/client'
import ScreenShotMain from '@/pages/ScreenshotMain.tsx'
import { HashRouter, Route, Routes } from 'react-router-dom'
import ScreenShot from '@/windows/Screenshot.tsx'
import Layout from './Layout.tsx'
import './assets/css/base.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <HashRouter>
    {/* <React.StrictMode> */}
      <Routes>
        <Route path="/" element={<Layout/>}>
          <Route index element={<ScreenShotMain/>}></Route>
          <Route path='/w' element={<div>w</div>}></Route>
        </Route>
        <Route path="/pick" element={<ScreenShot/>}></Route>
      </Routes>
    {/* </React.StrictMode> */}
  </HashRouter>

)
