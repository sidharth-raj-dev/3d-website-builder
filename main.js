import * as THREE from 'three';
import { createMachine, interpret, assign } from 'xstate';

const editorMachine = createMachine({
    /** @xstate-layout N4IgpgJg5mDOIC5QFkCGBjAFgSwHZgAIA5VAWzADpsIAbMAYgHsAHMXA9R3AFze4PK4ArgG0ADAF1EoZo1jZu2LtJAAPRACYAHGIoBmAJxiAbBoCsAGhABPTTopmte5y9d6Avu6toseQiXIKTh4wVX5BIQIWNkh6dBo5QmDeMIE2UUkVWXlFZSQ1O11DE3MrWwRDPQoDAEZjeobG4w8vEB8cfGIySmTQ8PSo1nwIKloGbFJZACd+PQgBRggwGnEpfOyFJVwVdQQAdg0yxD0zKr2zT28MDv9uoK4U-uFBmJHqOnolul4COYWv1ZZOSbPKgXZ7AAsFA0Yj0NVKNk0ZmMDkubWufi6gTwm1QNGwAC88FBPlxKHgAG6MADW5NwuPxBLAAFpYOgYoD1sDctt8rs9BCDBQamIDHpzkcEDVDNCLq12piAnSGYTifQwFMpowphRmDRUNwAGba0hUemKPGEllsjmZLk5LY7Y6C4Wi8WWREIWoUc6eVq4RZwFQKzpKoEO0EFBDMjQQyXM4xokO3bFjcMg3lgxCnIViCHGLQSz3aGoUMRONxuJMY0N3XqpCIvYbpnlOhCxyV1AzV3y1wL1p6RaLDUZ0FuOvmIEVmYUGU7wj3lCHIns3LHKi2M4njyO7CGHT1aUtyq69lOUDVaqY7zNR05aH1HhHlIw+uWeIA */
    id: "Machine Name",
    initial: "initializing",
    states: {
        idle: {
            on: {
                "open content menu": {
                    target: "context menu opened",
                },
            },
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
    },
    context: {
        scene: null,
        camera: null,
        renderer: null,
        error: ''
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
        })
    },
    services: {
        initializeScene: async (context, event) => {
            const scene = new THREE.Scene();
            const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
            const renderer = new THREE.WebGLRenderer();
            renderer.setSize(window.innerWidth, window.innerHeight);
            document.body.appendChild(renderer.domElement);

            function animate() {
                requestAnimationFrame(animate);
                renderer.render(scene, camera);
            }

            animate();

            return {
                ...context,
                scene,
                camera,
                renderer
            };


        }
    }
});

const editorService = interpret(editorMachine).onTransition((state) => {
    console.log(state.value);
    console.log(state.context);
});

editorService.start();