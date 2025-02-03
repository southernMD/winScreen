/*
 * @Description: create by southernMD
 */

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { HashRouter, Route, Routes } from 'react-router-dom'
import Screenshot from './Screenshot.tsx'
import Layout from './Layout.tsx'
import './assets/css/base.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <HashRouter>
    {/* <React.StrictMode> */}
      <Routes>
        <Route path="/" element={<Layout/>}>
          <Route index element={<App/>}></Route>
        </Route>
        <Route path="/pick" element={<Screenshot/>}></Route>
      </Routes>
    {/* </React.StrictMode> */}
  </HashRouter>

)
