
import { createRoot } from "react-dom/client";
import App from "./app/App.tsx";
import { NuiProvider } from "./app/state/nuiStore";
import "./styles/index.css";

createRoot(document.getElementById("root")!).render(
  <NuiProvider>
    <App />
  </NuiProvider>
);
  
