import ReactDOM from 'react-dom/client';
import React from 'react';
import App from "./App.jsx";
import ActionContext from './ActionContext.js';
import editorMachine from './editorMachine';
import { interpret } from 'xstate/lib/interpreter';

let editorService;
try {
    editorService = interpret(editorMachine).onTransition((state) => {
        console.log(state.value);
        console.log(state.context);
    });
} catch (error) {
    console.error('Error interpreting editor machine:', error);
}

if (editorService) {
    editorService.start();
}

const domContainer = document.querySelector('#ui');
const root = ReactDOM.createRoot(domContainer);
root.render(
    <ActionContext.Provider value={editorService}>
        <App />
    </ActionContext.Provider>
);

// open context menu on right click
document.body.addEventListener('contextmenu', (event) => {
    event.preventDefault();
    editorService.send({
        type: 'open context menu',
        payload: {
            x: event.clientX,
            y: event.clientY
        }
    });
    return false;
});

// close context menu on left click
document.body.addEventListener('click', (event) => {
    event.preventDefault();
    editorService.send('close context menu');
});

export default domContainer;