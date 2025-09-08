import { useCallback, useEffect, useRef } from "react";
import {
    Bodies,
    Body,
    Engine,
    Render,
    Runner,
    Svg,
    Vector,
    World,
    Query,
} from "matter-js";
import "pathseg";

interface CanvasProps {
    canvasWidth: number;
    canvasHeight: number;
    textureSvgPath: string;
    collisionSvgPath: string;
    scale?: number;
    initialVelocity?: { x: number; y: number };
    angularVelocity?: number;
    onClick?: () => void;
}

const Canvas = ({
    canvasWidth,
    canvasHeight,
    textureSvgPath,
    collisionSvgPath,
    scale = 0.5,
    initialVelocity = { x: 1, y: -0.5 },
    angularVelocity = 0.03,
    onClick = () => {},
}: CanvasProps) => {
    const canvasRef = useRef<HTMLDivElement>(null);
    const engineRef = useRef<Engine>();
    const renderRef = useRef<Render>();
    const runnerRef = useRef<Runner>();

    const bodyRef = useRef<Body | null>(null);
    const velocityRef = useRef({ x: 0, y: 0, angular: 0 });

    const handleFreeze = useCallback(() => {
        if (!bodyRef.current) return;

        velocityRef.current = {
            x: bodyRef.current.velocity.x,
            y: bodyRef.current.velocity.y,
            angular: bodyRef.current.angularVelocity,
        };
        Body.setStatic(bodyRef.current, true);
    }, []);

    const handleUnfreeze = useCallback(() => {
        if (!bodyRef.current) return;

        Body.setStatic(bodyRef.current, false);
        Body.setVelocity(bodyRef.current, {
            x: velocityRef.current.x,
            y: velocityRef.current.y,
        });
        Body.setAngularVelocity(bodyRef.current, velocityRef.current.angular);
    }, []);

    useEffect(() => {
        if (!canvasRef.current || !textureSvgPath || !collisionSvgPath) return;

        const engine = Engine.create();
        engineRef.current = engine;

        const render = Render.create({
            element: canvasRef.current,
            engine,
            options: {
                width: canvasWidth,
                height: canvasHeight,
                wireframes: false,
                background: "#00000000",
                showVelocity: false,
                showAngleIndicator: false,
            },
        });
        renderRef.current = render;

        const wallThickness = 50;
        const wallOptions = { isStatic: true, render: { visible: false } };
        const walls = [
            Bodies.rectangle(canvasWidth / 2, -wallThickness / 2, canvasWidth, wallThickness, wallOptions),
            Bodies.rectangle(canvasWidth / 2, canvasHeight + wallThickness / 2, canvasWidth, wallThickness, wallOptions),
            Bodies.rectangle(-wallThickness / 2, canvasHeight / 2, wallThickness, canvasHeight, wallOptions),
            Bodies.rectangle(canvasWidth + wallThickness / 2, canvasHeight / 2, wallThickness, canvasHeight, wallOptions),
        ];
        World.add(engine.world, walls);

        fetch(collisionSvgPath)
            .then((r) => r.text())
            .then((raw) => {
                const svgEl = new DOMParser().parseFromString(raw, "image/svg+xml").querySelector("svg");
                const pathEls = svgEl?.querySelectorAll("path");
                if (!pathEls || pathEls.length === 0) return;

                const vertexSets: Vector[][] = Array.from(pathEls).map((pathEl) => {
                    const vertices = Svg.pathToVertices(pathEl, 10);
                    return vertices.map((p) => Vector.mult(p, scale));
                });

                const svgBody = Bodies.fromVertices(
                    canvasWidth / 2,
                    canvasHeight / 3,
                    vertexSets,
                    {
                        restitution: 1,
                        friction: 0,
                        frictionAir: 0,
                        inertia: Infinity,
                        render: {
                            sprite: {
                                texture: textureSvgPath,
                                xScale: scale,
                                yScale: scale,
                            },
                        },
                    },
                );

                bodyRef.current = svgBody;

                Body.setVelocity(svgBody, initialVelocity);
                Body.setAngularVelocity(svgBody, angularVelocity);
                World.add(engine.world, svgBody);
            });

        const runner = Runner.create();
        runnerRef.current = runner;
        Runner.run(runner, engine);
        Render.run(render);

        const canvasElement = render.canvas;

        const handleClick = (event: MouseEvent) => {
            if (!bodyRef.current || !onClick) return;

            const mousePosition = {
                x: event.offsetX,
                y: event.offsetY,
            };

            const bodies = Query.point([bodyRef.current], mousePosition);

            if (bodies.length > 0) {
                onClick();
            }
        };

        if (onClick) {
            canvasElement.addEventListener('click', handleClick);
        }

        return () => {
            if (onClick && canvasElement) {
                canvasElement.removeEventListener('click', handleClick);
            }

            if (renderRef.current) {
                Render.stop(renderRef.current);
                if (renderRef.current.canvas) {
                    renderRef.current.canvas.remove();
                }
            }
            if (runnerRef.current && engineRef.current) {
                Runner.stop(runnerRef.current);
                World.clear(engineRef.current.world, false);
                Engine.clear(engineRef.current);
            }
            bodyRef.current = null;
        };
    }, [
        canvasWidth,
        canvasHeight,
        textureSvgPath,
        collisionSvgPath,
        scale,
        initialVelocity,
        angularVelocity,
        onClick,
    ]);

    return (
        <div
            ref={canvasRef}
            onMouseEnter={handleFreeze}
            onMouseLeave={handleUnfreeze}
            onFocus={handleFreeze}
            onBlur={handleUnfreeze}
            style={{
                border: "2px solid #aaa",
                borderRadius: "8px",
                width: canvasWidth,
                height: canvasHeight,
                overflow: "hidden",
            }}
        />
    );
};

export default Canvas;
