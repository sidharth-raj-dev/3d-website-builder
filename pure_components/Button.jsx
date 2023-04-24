import React from 'react';

function Button({ onClick }) {

    return (
        <button id="start" onClick={onClick}>
            Start
        </button>
    )
}

export default Button;