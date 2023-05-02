import * as THREE from 'three';
import { createMachine, send } from 'xstate';
import { interpret } from 'xstate/lib/interpreter';
import { assign } from 'xstate/lib/actions';

const editorMachine = createMachine({
    /** @xstate-layout N4IgpgJg5mDOIC5QFkCGBjAFgSwHZgAIA5VAWzADpsIAbMAYgHsAHMXA9R3AFzAA9uBcrgCuAbQAMAXUShmjWNm7YuskH0QAOAJwBGCgHYJBgMwBWE5oBME7QBYrmgDQgAnol2OKANlsTNmt5WJgZB5gC+4S5oWHiEJORUtAyw3KgAToKouNikqMpckjJIIPKKBbhqGgjeDhSaBlbatWZWdnYmwS7uCI769hZWBtpmunbDJpHRGDj4xGSUnDz8gsIiBCxskPToNAqES7wCQmzi0mplSiqVJdUmdmYU99pNjiYm2pr33YhW3o-tNpDMwOXRGOxTEAxWbxBYUQ4rE6iDasfAQJJ0ei5eSZAjZDYAIwAVmB0NwihcFFdVLdEABaWoSChmazeTQSd66CStbw-BAmCTeCgvMFmUb3RneSHQuLzRII45rFFbdHUTF5ADWhHxjGJpPJ5xKlwqVXpYqFXO8uneAR0YN5bkQditFAkzvZH1qbXZUqiUJmsoSiy4R1Wp2VaIomrwUHoEC4lDwADdGFqo6gtXTsnTdSSyRSjVSTbSEHShk9vdoOWCHo4xXy7Jo7Mz3UE7BJdPbNNKA3Mg-CQ4ilZtI9HcLGwOl0ox0hRmDR8gAzGekdOZ7O5-UFuRF66m0t-HwWbncuzW3wssx8sxGQzNBpmKtsxwQv0yvtwvBXVA0bAALxjOMEyoXAUzTL9lB-f8wDpWB0C2bdSl3GlQGqM9m0FdkHC+D4vjsPkuUMAwb18B8zA5RpdB7WIP0SCDsCggDx3oSdp1neclxXEDv1-P8YLghDDR3co9xLdDXTZN03lw75HVLEwhUaBwPk8dpmkcaiYTlShslyfJANSFg8RyPIKkQ41RNQp0zCFGx-G8BSHGMa0+UsAxXQ6BpPFaQIwUiP1cEYCA4DUd9YXISkRJQ9R6QMYiKEtVSHnbXR-j5OlrW0BKAlS9lNC5AwAk0wNP2SSLqRuKyEECR5tFMCQOTsexGm0Ew+TeCgmm8Xwmn8FkrWK2jg2WRVwxHSByuLKq6UadzEraZKOzSuSwSsChQTijsbNMD4DEG8LhtDJF1nG1UysLKLKpi0tvGGBLBSSkElqvOSHiy4ZbsfdlmgMM99u0gcRrDZFTrXGNJss666Ucp4GhCRp-hGSwG0fO9nzPKwuReV9phog7AaO4dUUgCh43wCHouqaHrXWqwxV0EZBQces5M6ExOvvawxXZTH-v7BVgZO4n0VYmcKauqmMc6sJQjFGw4qsPlan0LrNDFX7O2dHH-TxgH6MY8GLoq-dLWFfrbpwz4bXS51hV+4I9AW9TuzfXt8dF9Jxf3WX7uMIwxnaW10tGHwcsfDkvuCVK+bhXTTMN4TjZLWpm08Xb-m8EYmucVnCvWtW4t8BxQgefzwiAA */
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

            entry: ["showEditorView"]
        },

        "context menu opened": {
            initial: "idle",

            states: {
                idle: {
                    on: {
                        "import an object": {
                            target: "idle",
                            internal: false
                        },

                        "make an object": "making"
                    },
                },

                making: {
                    invoke: {
                        src: "makeAnObject",
                        id: "make-an-object",
                        onDone: "done",
                        onError: "error"
                    }
                },

                done: {
                    type: "final"
                },
                error: {}
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
        showEditorView: (context, event) => {
            context.renderer.render(context.scene, context.camera);
        },
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
            contextMenu.innerHTML = `<button id="make-cube"> Make a cube </button>`;
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
        },
        makeAnObject: async (context, event) => {
            const geometry = new THREE.BoxGeometry(1, 1, 1);
            const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
            const cube = new THREE.Mesh(geometry, material);
            context.scene.add(cube);

            // render scene
            context.renderer.render(context.scene, context.camera);

            return {
                ...context,
                cube: cube
            }
        }
    }
});

let editorService;

try {
    editorService = interpret(editorMachine).onTransition((state) => {
        console.log(state.value);
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

document.getElementById('make-cube').addEventListener('click', () => {
    console.log('clicked');
    editorService.send('make an object');
});

