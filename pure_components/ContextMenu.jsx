import React from 'react'

function ContextMenu({ open }) {
    return (
        <div id="context-menu"
            style={{
                display: open ? 'block' : 'none',
            }}
        >
            ContextMenu
        </div>
    )
}

export default ContextMenu;