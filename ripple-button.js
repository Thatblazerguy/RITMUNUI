/* Animata Ripple Button — Vanilla JS/CSS port */
(function () {
  const style = document.createElement("style");
  style.textContent = `
    .ripple-login-btn {
      position: relative;
      overflow: hidden;
    }
    .ripple-login-btn .ripple-circle {
      position: absolute;
      border-radius: 50%;
      pointer-events: none;
      background-color: rgba(255, 255, 255, 0.25);
      z-index: 1;
      opacity: 0;
      transform: scale(0);
      width: 0;
      height: 0;
      transition: transform 50ms linear;
    }
    .ripple-login-btn > span,
    .ripple-login-btn > * {
      position: relative;
      z-index: 2;
    }
    .ripple-circle.ripple-enter {
      animation: animata-ripple-enter 280ms ease-out forwards;
    }
    .ripple-circle.ripple-leave {
      animation: animata-ripple-leave 250ms ease-out forwards;
    }
    @keyframes animata-ripple-enter {
      from { transform: scale(0); opacity: 1; }
      to   { transform: scale(1); opacity: 1; }
    }
    @keyframes animata-ripple-leave {
      from { transform: scale(1); opacity: 1; }
      to   { transform: scale(0); opacity: 1; }
    }
  `;
  document.head.appendChild(style);

  function initRippleButton(btn) {
    // inject ripple span if not already present
    if (btn.querySelector(".ripple-circle")) return;
    const ripple = document.createElement("span");
    ripple.className = "ripple-circle";
    btn.appendChild(ripple);

    let isHovered = false;

    function positionRipple(e) {
      const rect = btn.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height) * 2;
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;
      ripple.style.width = size + "px";
      ripple.style.height = size + "px";
      ripple.style.left = x + "px";
      ripple.style.top = y + "px";
    }

    btn.addEventListener("mouseenter", function (e) {
      if (isHovered) return;
      isHovered = true;
      positionRipple(e);
      ripple.classList.remove("ripple-leave");
      ripple.classList.add("ripple-enter");
    });

    btn.addEventListener("mousemove", function (e) {
      if (!isHovered) return;
      positionRipple(e);
    });

    btn.addEventListener("mouseleave", function (e) {
      if (!isHovered) return;
      isHovered = false;
      positionRipple(e);
      ripple.classList.remove("ripple-enter");
      ripple.classList.add("ripple-leave");
      ripple.addEventListener("animationend", function handler() {
        ripple.classList.remove("ripple-leave");
        ripple.removeEventListener("animationend", handler);
      });
    });
  }

  function applyAll() {
    document.querySelectorAll(".ripple-login-btn").forEach(initRippleButton);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", applyAll);
  } else {
    applyAll();
  }
})();
