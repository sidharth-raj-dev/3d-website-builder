import React, { useContext } from 'react';
import ActionContext from './ActionContext.js';

function Button({ onClick }) {
    const globalServices = useContext(ActionContext);
    return (
        <button id="start" onClick={() => globalServices.send('start animation')}>Start</button>
    )
}

export default Button;