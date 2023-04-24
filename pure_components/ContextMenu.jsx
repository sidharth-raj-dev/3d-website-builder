import React from 'react'

function ContextMenu({ open, x, y }) {
    console.log(x);
    console.log(y);
    return (
        <div id="context-menu"
            style={{
                display: open ? 'block' : 'none',
                left: x + 'px',
                top: y + 'px'
            }}
        >
            ContextMenu
        </div>
    )
}

export default ContextMenu;