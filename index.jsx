import ReactDOM from 'react-dom/client';
import React from 'react';
import Button from "./Button.jsx";

const domContainer = document.querySelector('#ui');
const root = ReactDOM.createRoot(domContainer);
root.render(<Button />);


export default domContainer;