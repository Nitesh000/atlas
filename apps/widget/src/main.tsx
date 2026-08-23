import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import AtlasWidget from "./App.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <div className="min-h-screen bg-neutral-900 w-full flex items-center justify-center">
      <div className="text-center max-w-lg">
        <h1 className="text-3xl font-bold text-white mb-4">Atlas Widget Sandbox</h1>
        <p className="text-neutral-400">
          This is a simulated customer website. The Atlas widget is floating in the bottom right corner.
          Click it to start chatting.
        </p>
      </div>
      <AtlasWidget />
    </div>
  </StrictMode>
);
