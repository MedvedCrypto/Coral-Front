import { OverlayScrollbars } from "overlayscrollbars";
// Инициализация OverlayScrollbars
document.addEventListener("DOMContentLoaded", function () {
  const elements = document.querySelectorAll(".scroll-js");

  elements.forEach(function (element) {
    OverlayScrollbars(element, {
      className: "os-theme-dark",
      scrollbars: {
        visibility: "auto",
        autoHide: "leave",
        autoHideDelay: 800,
        dragScrolling: true,
        clickScrolling: true,
        touchSupport: true,
      },
    });
  });
});
