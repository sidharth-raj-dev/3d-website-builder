import * as THREE from 'three';
import { createMachine, send } from 'xstate';
import { interpret } from 'xstate/lib/interpreter';
import { assign } from 'xstate/lib/actions';

const editorMachine = createMachine({
    /** @xstate-layout N4IgpgJg5mDOIC5QFkCGBjAFgSwHZgAIA5VAWzADpsIAbMAYgHsAHMXA9R3AFze4PK4ArgG0ADAF1EoZo1jZu2LtJAAPRACYAHGIoBmAJxiAbBoCsAGhABPTTopmte5y9d6Avu6toseQiXIqWgZYblQAJ35UXGxSVEUucSkkEFl5BNwVdQQzAHZcigMARgAWDQNjYyMSkoMrWwQSot0mgzNjXLFcswNu4xLPbwwcfGIySk4eMFV+QSECFjZIenQaOUJJ3hmBNlFJFTSFJUyU7O1dQxNzesRDPUKiyqfnyo8vEB8R-3GKTenZ3YLVj4CBBOj0WKySIEPQQASMCBgGhJA5yI7KU6IYwUDSPPRaMxFIrFDTaEq5G6NIpaCglPS5UlFcptcoaQYfYZ+MaBP7bOZApag6jgxF0XgwuGkBFIlEpQ4ZLKIGmtQliIkkskUmy3XEUakM3HMsys9mfLkBSh4I6oGjYABeeCg9AgXEtuAAbowANZu622u1gAC0sHQS1lMjRCsxCD0tT1YgM9Ms2oQRUMOLMps5owtVBiiht9sd9DA4XCjHCFGYNHiADMK6Q8377UGQ2H9nLI8dFTG481E91KcUKN0s74cz9orF4sXQiwCFO4hlw6kuxjQNlDEUcWViY4xDotLk6inCWYHNSiWJ6bk9I5PO9cNL4CkzRPyKj0t3o4GtAYR04xilFoh75EUyYNIG2JiDBaolMY14lAmRT5GOXzcpawSfuiJwbogZjOBQWgaMYWj9loVQ9HolLmAUB7OBo+QlMRjjGGh5o-LyALCAKILYVGeEIIGTQAXoQHMaBuTgZS1LYqRUltMRJhSWYmbvG+3w8lwWzcfMiwgmCYD8d+gnpk0jy9EBGoEpSxq6PJjJGuUbxDOOmm+gW-qOsZ65qIgZSUmRDjse+lCluW4Q+bhfk5PiAFMhBiBGCOamuehuaLjOuBQFFPZ5P+jwEQet6qZUJS2SYhQIWqhIdCRXQDA+QA */
    id: "Machine Name",
    initial: "initializing",
    states: {
        idle: {
            on: {
                "open context menu": {
                    target: "context menu opened",
                },

                "start animation": "animating"
            },

            entry: ["makeACube"]
        },

        "context menu opened": {
            initial: "idle",

            states: {
                idle: {
                    on: {
                        "import 3d model": {
                            target: "idle",
                            actions: "updateContext",
                            internal: false,
                        },
                        "delete 3d model": {
                            target: "idle",
                            actions: "updateContext",
                            internal: false,
                        },
                    },
                },
            },

            on: {
                "close context menu": {
                    target: "idle",
                    actions: "hideContextMenu"
                },
            },

            entry: "showContextMenu"
        },

        initializing: {
            invoke: {
                src: "initializeScene",
                id: "initialize-scene",
                onDone: [
                    {
                        target: "idle",
                        actions: ["setSceneCameraAndRenderer"]
                    },
                ],
                onError: [
                    {
                        target: "error",
                    },
                ],
            },

            entry: "createContextMenu"
        },

        error: {
            entry: "setError"
        },

        animating: {
            on: {
                "stop animation": "idle"
            },

            entry: "startAnimation"
        }
    },
    context: {
        scene: null,
        camera: null,
        renderer: null,
        error: '',
        objectsInScene: []
    },
    predictableActionArguments: true,
    preserveActionOrder: true,
}, {
    actions: {
        setSceneCameraAndRenderer: assign((context, event) => {
            return {
                ...context,
                ...event.data
            }
        }),
        setError: assign((context, event) => {
            return {
                ...context,
                error: event.data
            }
        }),
        makeACube: assign((context, event) => {
            if (!context.cube) {
                const geometry = new THREE.BoxGeometry(1, 1, 1);
                const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
                const cube = new THREE.Mesh(geometry, material);
                context.scene.add(cube);

                return {
                    ...context,
                    cube: cube
                }
            }

            return context;
        }),
        startAnimation: (context, event) => {
            let animationIsPlaying = true;
            document.getElementById('stop').addEventListener('click', () => {
                animationIsPlaying = false;
            });

            function animate() {
                if (animationIsPlaying) {
                    requestAnimationFrame(animate);
                }

                context.cube.rotation.x += 0.01;
                context.cube.rotation.y += 0.01;

                context.renderer.render(context.scene, context.camera);
            }

            animate();
        },
        createContextMenu: (context, event) => {
            const contextMenu = document.createElement('div');
            contextMenu.id = 'context-menu';
            contextMenu.style.display = 'none';
            contextMenu.innerHTML = "<button> Make a cube </button>";
            document.body.appendChild(contextMenu);
        },
        showContextMenu: (context, event) => {
            const customMenu = document.getElementById('context-menu');
            customMenu.style.display = 'block';
            customMenu.style.left = event.payload.x + 'px';
            customMenu.style.top = event.payload.y + 'px';
        },
        hideContextMenu: (context, event) => {
            const customMenu = document.getElementById('context-menu');
            customMenu.style.display = 'none';
        }
    },
    services: {
        initializeScene: async (context, event) => {
            const scene = new THREE.Scene();
            const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
            const renderer = new THREE.WebGLRenderer();
            renderer.setSize(window.innerWidth, window.innerHeight);
            document.body.appendChild(renderer.domElement);
            camera.position.z = 5;

            return {
                ...context,
                scene,
                camera,
                renderer
            };
        }
    }
});

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


document.getElementById('start').addEventListener('click', () => {
    editorService.send('start animation');
});

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

document.getElementById('stop').addEventListener('click', () => {
    editorService.send('stop animation');
});

