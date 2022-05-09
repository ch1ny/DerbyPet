import React from "react";
import { createRoot } from 'react-dom/client';
import App from "./App";

let rootDiv = document.getElementById('root')
if (!rootDiv) {
    rootDiv = document.createElement('div')
    rootDiv.setAttribute('id', 'root')
}
createRoot(rootDiv).render(<App />)