import * as THREE from 'three';
import { createMachine } from 'xstate';
import { assign } from 'xstate/lib/actions';

const editorMachine = createMachine({
    /** @xstate-layout N4IgpgJg5mDOIC5QFkCGBjAFgSwHZgAIA5VAWzADpsIAbMAYgHsAHMXA9R3AFzAA9uBcrgCuAbQAMAXUShmjWNm7YuskAE9EAJgCsAdgoSAHAGYTWvXoAsR3UYBsAGhB9Et+xWsOjOgJwPfPxMAX2DnNCw8QhJyKloGWG5UACdBVFxsUlRlLkkZJBB5RRzcNVcEfQNfAEYrLV97e18JKytfZ00EK2qJCm7A+z0JPT8R+ytQ8IwcfGIySk4efkFhEQIWNkh6dBoFQkXeASE2cWk1IqUVUoLyrSNek2b7XQ7ER5MKGsbvn8aQsJAERm0XmFAOy2OonWrHwEDidHomXkqQIJggQkYEDANDy5wUl1UN0QHi01XsJh81WqNS0dyseleXWqRj6Jj0tOq9UC9S0k0B0yic1i4KOq2hmzh1ARWLovFR6NImOxuIKFxKZTcfWpOh6VJpdIZGjepIozPZpK5Oh5fKBgpilDwl1QNGwAC88FB6BAuA7cAA3RgAa19TpdrrAAFpYOhNiq5Pj1USEGZqhQtBTtTpuhJ9NVDZ1mVpWd4TE0tK0dTobQLZvaqBllM63R76GBkslGMkKMwaNkAGad0j10NuyPR2NnVUJq4a5NtU0SXxsnSMmqeKsA2210HpTLZFuJFgEXdZEpxwrTwmgcqPVPl0mBe5PvTtI0Vao6Cg6oxUiRsvQmDoRihACuBKvABRbiC5B4sUM5JhGRi+J4pj2LURjPnoH6MhGHgSPhf6LkBQF-g01aRNusRSmAsEEtc16IDoZgUO4P6LgEQSMroBjGGYFheHY9jkcCQoLFwhwrCc4qwrRiYMQgEbdChpboZh2FvumHz2EY7LdP09hMUYEybjW0FiUsopSRssLwjRU5wVeLhvMh3Rkr4ehofqPiMlavTaeanK+NyS7CXaoKOo2YYerJ8HyXUjI-l+oWUZQbYdskMWOeUhkoZyK5vs067JWZFAnvuuBQJl9FORUL6mgZJjGABOg6I0Vg+RIHgNPhH5kuy9jDMZoRAA */
    id: "Machine Name",
    initial: "initializing",
    states: {
        idle: {
            on: {
                "open context menu": {
                    target: "context menu opened",
                    actions: "setPositionOfContextMenu"
                },

                "start animation": "animating"
            },

            entry: ["makeACube", "showGlimpse"]
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
                "close context menu": "idle",
            }
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
            }
        },

        error: {
            entry: "setError"
        },

        animating: {
            on: {
                "stop animation": {
                    target: "idle",
                    actions: "setAnimatingToFalse"
                }
            },

            entry: "startAnimation"
        }
    },
    context: {
        scene: null,
        camera: null,
        renderer: null,
        error: '',
        objectsInScene: [],
        x: 0,
        y: 0,
        animating: true,
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
        setPositionOfContextMenu: assign((context, event) => {
            console.log(event.clientX);
            return {
                ...context,
                x: event.payload.x,
                y: event.payload.y
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
        setAnimatingToFalse: assign((context, event) => {
            // create the scene from start

            return {
                ...context,
                animating: false
            }
        }),
        startAnimation: (context, event) => {
            function animate() {
                if (context.animating) {
                    console.log('animating');
                    requestAnimationFrame(animate);

                    context.cube.rotation.x += 0.01;
                    context.cube.rotation.y += 0.01;

                    context.renderer.render(context.scene, context.camera);
                }
            }

            animate();
        },
        showGlimpse: (context, event) => {
            context.renderer.render(context.scene, context.camera);
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

export default editorMachine;