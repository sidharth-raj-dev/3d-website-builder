import * as THREE from 'three';
import { createMachine } from 'xstate';
import { interpret } from 'xstate/lib/interpreter';
import { assign } from 'xstate/lib/actions';

const editorMachine = createMachine({
    /** @xstate-layout N4IgpgJg5mDOIC5QFkCGBjAFgSwHZgAIA5VAWzADpsIAbMAYgHsAHMXA9R3AFze4PK4ArgG0ADAF1EoZo1jZu2LtJAAPRACYAHGIoBmAJxiAbBoCsAGhABPTTopmte5y9d6Avu6toseQiXIqWgZYblQAJ35UXGxSVEUucSkkEFl5BNwVdQQzAHZcigMARgAWDQNjYyMSkoMrWwQSot0mgzNjXLFcswNu4xLPbwwcfGIySk4eMFV+QSECFjZIenQaOUJJ3hmBNlFJFTSFJUyU7O1dQxNzesRDPUKiyqfnyo8vEB8R-3GKTenZ3YLVj4CBBOj0WKySIEPQQASMCBgGhJA5yI7KU6IXIaG4IPRme7dQYfYZ+MaBP7bOZApag6jgxF0XgwuGkBFIlEpQ4ZLJYkoUDRiPRFa42TTtBzEz5kgKUPBHVA0bAALzwUHoEC4ctwADdGABrbUKpXKsAAWlg6CWnJkaJ5mLxtQozQMem6uKKhgFZilpNGsqoMUUipVavoYHC4UY4QozBo8QAZtHSIHjSrzZbrfsuXbjrzHQZnWJXe6xQhihQie9pf6ftFYvEw6EWAR63EMjbUrmMaBsoYigKykU2jpR7k6mWzEUzA4ilois03bl8VpPO9cOz4Cka99yKj0nmHWaNCVcWbjBQxFexNO9BpcsOisu3kNfLXAvSwPv0Sde4gCfcWgaMY87FloVQ9HouLmAUYhOHe+QlEBjjGL6b67hMXBbACwg0iC372n+CAnh6IGFAYFFaCUHTnEBuRoV85KYVMVKAosIJgl+OYHj2aiIM0M7DgSIqWGWJTtAxMo-PKwYmmqBGHkRZS4vOkrVn6GEUBGUbhApvHZASWiVvOooNEYlY+up6FMRQbaNrgUB6b+fE5OOzrGAScHLmY7T9LiZgmIUxhXtOjzYsFuQDGuQA */
    id: "Machine Name",
    initial: "initializing",
    states: {
        idle: {
            on: {
                "open content menu": {
                    target: "context menu opened",
                },

                "start animation": "animating"
            },

            entry: "makeACube"
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
                },
            },
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
            const geometry = new THREE.BoxGeometry(1, 1, 1);
            const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
            const cube = new THREE.Mesh(geometry, material);
            context.scene.add(cube);

            return {
                ...context,
                cube: cube
            }
        }),
        startAnimation: (context, event) => {
            function animate() {
                requestAnimationFrame(animate);

                context.cube.rotation.x += 0.01;
                context.cube.rotation.y += 0.01;

                context.renderer.render(context.scene, context.camera);
            }

            animate();
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