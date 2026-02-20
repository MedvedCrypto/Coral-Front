import App from "./layout.tsx";
// import "./css/style.global.css";
import { OverlayScrollbars } from "overlayscrollbars";
import 'overlayscrollbars/overlayscrollbars.css';
import React from "react";
import { createRoot } from "react-dom/client";



const rootElement = document.getElementById("root");
const root = createRoot(rootElement);
// const osInstance = OverlayScrollbars(document.body, { scrollbars: { autoHide: "scroll" } });

root.render(
        <App />
  );
