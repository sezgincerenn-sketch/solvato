// Giriş noktası: yazı tipleri, kalıcı depolama, React kökü.
import React from "react"
import ReactDOM from "react-dom/client"
import "@fontsource/outfit/400.css"
import "@fontsource/outfit/500.css"
import "@fontsource/outfit/600.css"
import "@fontsource/outfit/700.css"
import "@fontsource/outfit/800.css"
import "@fontsource/jetbrains-mono/400.css"
import "@fontsource/jetbrains-mono/500.css"
import "@fontsource/jetbrains-mono/600.css"
import "@fontsource/jetbrains-mono/700.css"
import "@fontsource/jetbrains-mono/800.css"
import App from "./App"
import { initPersistence } from "./utils/persist"
import "./index.css"

async function boot() {
  await initPersistence()
  ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  )
}

boot()
