import React from "react";
import { createRoot } from "react-dom/client";
import { Demo } from "./ui/LanyardCard";

document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("lanyard-badge-root");
  const formPanel = document.getElementById("registration-form-panel");
  
  if (container && formPanel) {
    const handleDoubleClick = () => {
      // Fade out badge
      container.style.opacity = "0";
      setTimeout(() => {
        container.style.display = "none";
        
        // Show and fade in form
        formPanel.classList.remove("hidden");
        // Trigger reflow to ensure animation works
        void formPanel.offsetWidth; 
        formPanel.style.opacity = "1";
        formPanel.style.transform = "translateY(0)";
      }, 500); // Wait for transition to finish
    };

    const root = createRoot(container);
    root.render(<Demo onDoubleClick={handleDoubleClick} />);
  }
});
