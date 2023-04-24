import React, { useEffect } from 'react'
import { useMachine } from '@xstate/react';
import editorMachine from './editorMachine';
import Button from "./pure_components/Button.jsx";
import StopButton from "./pure_components/StopButton.jsx";
import ContextMenu from "./pure_components/ContextMenu.jsx";

function App() {
    const [current, send] = useMachine(editorMachine);
    console.log(current.context);
    useEffect(() => {
        // open context menu on right click
        document.body.addEventListener('contextmenu', (event) => {
            event.preventDefault();
            send({
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
            send('close context menu');
        });
    }, [])

    return (
        <div>
            <Button
                onClick={() => send('start animation')}
            />
            <StopButton
                onClick={() => send('stop animation')}
            />
            <ContextMenu
                open={current.matches('context menu opened')}
                x={current.context.x}
                y={current.context.y}
            />
        </div>
    )
}

export default App;