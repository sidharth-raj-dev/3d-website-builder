import React from 'react'

function ContextMenu({ open, x, y }) {
    return (
        <div id="context-menu"
            style={{
                display: open ? 'block' : 'none',
                left: x + 'px',
                top: y + 'px'
            }}
        >
            <button>
                Add a Cube
            </button>
        </div>
    )
}

export default ContextMenu;