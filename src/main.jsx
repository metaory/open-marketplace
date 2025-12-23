import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { initTheme } from './lib/theme'
import '@fontsource/bungee'
import '@fontsource-variable/baloo-2'
import './styles/main.css'
import gradientGL from 'gradient-gl'

gradientGL('a2.bf5b')

initTheme()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

