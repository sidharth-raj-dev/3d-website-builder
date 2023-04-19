import * as THREE from 'three';
import { createMachine, interpret, assign } from 'xstate';

const editorMachine = createMachine({
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
            entry: ["setScene", "setCamera", "setRenderer", "adjustRender", "startAnimationLoop"],
            on: {
                complete: {
                    target: "idle",
                },
            },
        },
    },
    context: {
        scene: null,
        camera: null,
        renderer: null,
    },
    predictableActionArguments: true,
    preserveActionOrder: true,
}, {
    actions: {
        setScene: assign((context) => {
            return {
                ...context,
                scene: new THREE.Scene()
            }
        }),
        setCamera: assign((context) => {
            return {
                ...context,
                camera: new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
            }
        }),
        setRenderer: assign((context) => {
            return {
                ...context,
                renderer: new THREE.WebGLRenderer()
            }
        }),
        adjustRender: (context) => {
            context.renderer.setSize(window.innerWidth, window.innerHeight);
            document.body.appendChild(context.renderer.domElement);
        },
        startAnimationLoop: (context) => {
            function animate() {
                requestAnimationFrame(animate);
                context.renderer.render(context.scene, context.camera);
            }

            animate();
        }
    }
});

const editorService = interpret(editorMachine).onTransition((state) => {
    console.log(state.value);
});

editorService.start();