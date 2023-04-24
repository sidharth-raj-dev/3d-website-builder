import React from 'react';

function StopButton({ onClick }) {

    return (
        <button id="stop" onClick={onClick}>
            Stop
        </button>
    )
}

export default StopButton;