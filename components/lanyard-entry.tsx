import React from "react";
import { createRoot } from "react-dom/client";
import { Demo } from "./ui/LanyardCard";

document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("lanyard-badge-root");
  if (container) {
    const root = createRoot(container);
    root.render(<Demo />);
  }
});
