import ReactDOM from 'react-dom/client';
import React from 'react';
import App from './App.jsx';

const domContainer = document.querySelector('#ui');
const root = ReactDOM.createRoot(domContainer);

root.render(
    <App />
);

export default domContainer;