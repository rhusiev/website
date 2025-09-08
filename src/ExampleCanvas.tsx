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
} from "matter-js";
import "pathseg";

export interface SvgObjectConfig {
    id: string;
    textureSvgPath: string;
    collisionSvgPath: string;
    scale?: number;
    initialPosition?: { x: number; y: number };
    initialVelocity?: { x: number; y: number };
    angularVelocity?: number;
    onClick?: () => void;
}

interface CanvasProps {
    canvasWidth: number;
    canvasHeight: number;
    objects: SvgObjectConfig[];
}

const Canvas = ({ canvasWidth, canvasHeight, objects }: CanvasProps) => {
    const canvasRef = useRef<HTMLDivElement>(null);
    const engineRef = useRef<Engine>();
    const renderRef = useRef<Render>();
    const runnerRef = useRef<Runner>();

    const bodiesRef = useRef<Body[]>([]);
    const velocitiesRef = useRef<
        Map<number, { x: number; y: number; angular: number }>
    >(new Map());
    const onClickHandlersRef = useRef<Map<number, () => void>>(new Map());

    const selectedRef = useRef<{ body: Body; originalScale: number } | null>(
        null,
    );
    const frozenRef = useRef(false);

    const handleFreeze = useCallback(() => {
        if (bodiesRef.current.length === 0) return;
        frozenRef.current = true;
        bodiesRef.current.forEach((body) => {
            if (body.isStatic) return;
            velocitiesRef.current.set(body.id, {
                x: body.velocity.x,
                y: body.velocity.y,
                angular: body.angularVelocity,
            });
            Body.setStatic(body, true);
        });
    }, []);

    const handleUnfreeze = useCallback(() => {
        if (bodiesRef.current.length === 0) return;
        frozenRef.current = false;
        bodiesRef.current.forEach((body) => {
            Body.setStatic(body, false);
            const saved = velocitiesRef.current.get(body.id);
            if (saved) {
                Body.setVelocity(body, { x: saved.x, y: saved.y });
                Body.setAngularVelocity(body, saved.angular);
            }
        });
        clearSelection();
    }, []);

    const clearSelection = useCallback(() => {
        if (!selectedRef.current) return;
        const { body, originalScale } = selectedRef.current;
        body.render.sprite &&
            (body.render.sprite.xScale =
                body.render.sprite.yScale =
                    originalScale);
        selectedRef.current = null;
    }, []);

    const updateSelection = useCallback(
        (mouseX: number, mouseY: number) => {
            if (!frozenRef.current) return;
            let closest: Body | null = null;
            let minDist = Infinity;

            bodiesRef.current.forEach((body) => {
                const dist = Vector.magnitude(
                    Vector.sub(body.position, { x: mouseX, y: mouseY }),
                );
                if (dist < minDist) {
                    minDist = dist;
                    closest = body;
                }
            });

            if (!closest) return;

            if (selectedRef.current?.body.id !== closest.id) {
                clearSelection();

                const currentScale = closest.render.sprite?.xScale ?? 1;
                selectedRef.current = {
                    body: closest,
                    originalScale: currentScale,
                };

                closest.render.sprite &&
                    (closest.render.sprite.xScale = closest.render.sprite
                        .yScale = currentScale * 1.25);
            }
        },
        [clearSelection],
    );

    useEffect(() => {
        if (!canvasRef.current) return;

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
            },
        });
        renderRef.current = render;

        const wallThickness = 50;
        const wallOptions = { isStatic: true, render: { visible: false } };
        World.add(engine.world, [
            Bodies.rectangle(
                canvasWidth / 2,
                -wallThickness / 2,
                canvasWidth,
                wallThickness,
                wallOptions,
            ),
            Bodies.rectangle(
                canvasWidth / 2,
                canvasHeight + wallThickness / 2,
                canvasWidth,
                wallThickness,
                wallOptions,
            ),
            Bodies.rectangle(
                -wallThickness / 2,
                canvasHeight / 2,
                wallThickness,
                canvasHeight,
                wallOptions,
            ),
            Bodies.rectangle(
                canvasWidth + wallThickness / 2,
                canvasHeight / 2,
                wallThickness,
                canvasHeight,
                wallOptions,
            ),
        ]);

        const bodyCreationPromises = objects.map((obj) =>
            fetch(obj.collisionSvgPath)
                .then((r) => r.text())
                .then((rawSvg) => {
                    const svgEl = new DOMParser().parseFromString(
                        rawSvg,
                        "image/svg+xml",
                    ).querySelector("svg");
                    const pathEls = Array.from(
                        svgEl?.querySelectorAll("path") || [],
                    );
                    if (pathEls.length === 0) return null;

                    const scale = obj.scale ?? 0.5;
                    const vertexSets: Vector[][] = pathEls.map((pathEl) => {
                        const vertices = Svg.pathToVertices(pathEl, 10);
                        return vertices.map((p) => Vector.mult(p, scale));
                    });

                    const initialPosition = obj.initialPosition ?? {
                        x: Math.random() * (canvasWidth * 0.8) +
                            canvasWidth * 0.1,
                        y: Math.random() * (canvasHeight * 0.8) +
                            canvasHeight * 0.1,
                    };

                    const svgBody = Bodies.fromVertices(
                        initialPosition.x,
                        initialPosition.y,
                        vertexSets,
                        {
                            restitution: 1,
                            friction: 0,
                            frictionAir: 0,
                            inertia: Infinity,
                            render: {
                                sprite: {
                                    texture: obj.textureSvgPath,
                                    xScale: scale,
                                    yScale: scale,
                                },
                            },
                        },
                    );

                    Body.setVelocity(
                        svgBody,
                        obj.initialVelocity ??
                            {
                                x: (Math.random() - 0.5) * 2,
                                y: (Math.random() - 0.5) * 2,
                            },
                    );
                    Body.setAngularVelocity(
                        svgBody,
                        obj.angularVelocity ?? (Math.random() - 0.5) * 0.05,
                    );

                    if (obj.onClick) {
                        onClickHandlersRef.current.set(svgBody.id, obj.onClick);
                    }
                    return svgBody;
                })
        );

        Promise.all(bodyCreationPromises).then((createdBodies) => {
            const validBodies = createdBodies.filter((body): body is Body =>
                body !== null
            );
            bodiesRef.current = validBodies;
            World.add(engine.world, validBodies);
        });

        const runner = Runner.create();
        runnerRef.current = runner;
        Runner.run(runner, engine);
        Render.run(render);

        const canvasElement = render.canvas;

        const handleClick = (event: MouseEvent) => {
            if (selectedRef.current) {
                const selectedBodyId = selectedRef.current.body.id;
                const onClickHandler = onClickHandlersRef.current.get(selectedBodyId);
                onClickHandler?.();
            }
        };

        const handleMouseMove = (event: MouseEvent) =>
            updateSelection(event.offsetX, event.offsetY);
        canvasElement.addEventListener("mousemove", handleMouseMove);
        canvasElement.addEventListener("click", handleClick);

        return () => {
            canvasElement.removeEventListener("click", handleClick);
            canvasElement.removeEventListener("mousemove", handleMouseMove);
            if (renderRef.current) {
                Render.stop(renderRef.current);
                renderRef.current.canvas?.remove();
            }
            if (runnerRef.current && engineRef.current) {
                Runner.stop(runnerRef.current);
                World.clear(engineRef.current.world, false);
            }
            bodiesRef.current = [];
            velocitiesRef.current.clear();
            onClickHandlersRef.current.clear();
        };
    }, [canvasWidth, canvasHeight, objects, updateSelection]);

    return (
        <div
            ref={canvasRef}
            onMouseEnter={handleFreeze}
            onMouseLeave={handleUnfreeze}
            onFocus={handleFreeze}
            onBlur={handleUnfreeze}
            tabIndex={0}
            style={{
                border: "2px solid #aaa",
                borderRadius: "8px",
                width: canvasWidth,
                height: canvasHeight,
                overflow: "hidden",
                outline: "none",
                cursor: "pointer",
            }}
        />
    );
};

export default Canvas
