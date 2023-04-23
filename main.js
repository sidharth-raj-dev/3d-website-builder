import editorMachine from './editorMachine';
import { interpret } from 'xstate/lib/interpreter';
import reactContainer from './index.jsx';

console.log(reactContainer);

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


setTimeout(() => {
    // document.getElementById('start').addEventListener('click', () => {
    //     editorService.send('start animation');
    // });
}, 2000)

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