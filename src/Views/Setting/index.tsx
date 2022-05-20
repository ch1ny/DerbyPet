import React from "react";
// let rootDiv = document.getElementById('root')
// if (!rootDiv) {
//     rootDiv = document.createElement('div')
//     rootDiv.setAttribute('id', 'root')
// }
// createRoot(rootDiv).render(<App />)
import { render } from "react-dom";
// import { createRoot } from 'react-dom/client';
import App from "./App";

render(<App />, document.getElementById('root'))