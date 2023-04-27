import * as THREE from 'three';
import { createMachine, send } from 'xstate';
import { interpret } from 'xstate/lib/interpreter';
import { assign } from 'xstate/lib/actions';

const editorMachine = createMachine({
    /** @xstate-layout N4IgpgJg5mDOIC5QFkCGBjAFgSwHZgAIA5VAWzADpsIAbMAYgHsAHMXA9R3AFzAA9uBcrgCuAbQAMAXUShmjWNm7YuskAE9EAJgCsAdgoSAHAGYTWvXoAsR3UYBsAGhB9Et+xWsOjOgJwPfPxMAX2DnNCw8QhJyKloGWG5UACdBVFxsUlRlLkkZJBB5RRzcNVcEfQNfAEYrLV97e18JKytfZ00EK2qJCm7A+z0JPT8R+ytQ8IwcfGIySk4efkFhEQIWNkh6dBoFQkXeASE2cWk1IqUVUoLyrSNek2b7XQ7ER5MKGsbvn8aQsJAERm0XmFAOy2OonWrHwEDidHomXkqQIJggQkYEDANDy5wUl1UN0QHi01XsJh81WqNS0dyseleXWqRj6Jj0tOq9UC9S0k0B0yic1i4KOq2hmzh1ARWLovFR6NImOxuIKFxKZTcfWpOh6VJpdIZGjepIozPZpK5Oh5fKBgpilDwl1QNGwAC88FB6BAuA7cAA3RgAa19TpdrrAAFpYOhNiq5Pj1USECY2qaJL42TpGdVHhRdDaBbN7VQMspnW6PfQwMlkoxkhRmDRsgAzOukEuht2R6Oxs6qhNXDXJ1M9DMjRk1Tw6AuRIug9KZbKVxIsAgLrIlOOFAeE0DlR7VPN1bX3U96dpGirVHQUHVGKkSNl6Ew6IyhAG4JXwAq2ufkPHFIOSYRkYvieKY9i1EYZ56NejIRjevhIf4eg+JY3RaI8M7AkKDrxABBLXHuiA6GYFDuPe6YBEEjK6AYxhmBYXh2PY2F2qCIorCc4qwgRibEQgEbdOBJiQTYMFwZezIePYRjslaz5aMMj7-FMs4gsKXCHFxUIbLC8JgHxQECbm3Rkr4eiQfqPiMlavSyeanJIVaGZsX+IZlmGHpGbuLiIHUjL3rebkaZQ1a1skPlEX5FQUuBnJZpezRTiFuEUOuS64FAUVDvoYFkqRxjPjoOiNFYtkSB4DQSBI15kuy9jDBM75AA */
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
                "stop animation": {
                    target: "idle",
                    actions: "stopAnimation"
                }
            },

            entry: ["setAnimating", "startAnimation"]
        }
    },
    context: {
        scene: null,
        camera: null,
        renderer: null,
        error: '',
        objectsInScene: [],
        animating: true
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
        setAnimating: assign((context, event) => {
            return {
                ...context,
                animating: true
            }
        }),
        startAnimation: (context, event) => {
            function animate() {
                if (context.animating) {
                    requestAnimationFrame(animate);
                } else {
                    return;
                }

                context.cube.rotation.x += 0.01;
                context.cube.rotation.y += 0.01;

                context.renderer.render(context.scene, context.camera);
            }

            animate();
        },
        stopAnimation: (context, event) => {
            context.animating = false;
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

