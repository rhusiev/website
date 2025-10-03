import {
    CSSProperties,
    MouseEvent,
    useCallback,
    useEffect,
    useRef,
} from "react";
import { useNavigate } from "react-router-dom";
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
    href?: string;
    target?: string;
    onClick?: (event: MouseEvent) => void;
}

interface CanvasProps {
    canvasWidth: number;
    canvasHeight: number;
    objects: SvgObjectConfig[];
    style?: CSSProperties;
    padding?: number;
    disableFreezeOnHover?: boolean;
}

const Canvas = ({
    canvasWidth,
    canvasHeight,
    objects,
    style,
    padding = 30,
    disableFreezeOnHover = false,
}: CanvasProps) => {
    const navigate = useNavigate();
    const canvasRef = useRef<HTMLDivElement>(null);

    const matterInstanceRef = useRef<
        {
            engine: Engine;
            render: Render;
            runner: Runner;
        } | null
    >(null);

    const bodiesRef = useRef<Map<string, Body>>(new Map());
    const velocitiesRef = useRef<
        Map<number, { x: number; y: number; angular: number }>
    >(new Map());

    const bodyIdToConfigRef = useRef<Map<number, SvgObjectConfig>>(new Map());

    const selectedRef = useRef<{ body: Body; originalScale: number } | null>(
        null,
    );
    const frozenRef = useRef(false);

    const handleFreeze = useCallback(() => {
        if (bodiesRef.current.size === 0) return;
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
        if (bodiesRef.current.size === 0) return;
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

            if (!closest) {
                clearSelection();
                return;
            }

            if (selectedRef.current?.body.id !== closest.id) {
                clearSelection();
                const currentScale = closest.render.sprite?.xScale ?? 1;
                selectedRef.current = {
                    body: closest,
                    originalScale: currentScale,
                };
                closest.render.sprite &&
                    (closest.render.sprite.xScale =
                        closest.render.sprite
                            .yScale =
                            currentScale * 1.25);
            }
        },
        [clearSelection],
    );

    useEffect(() => {
        if (!canvasRef.current) return;

        const engine = Engine.create();
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
        const runner = Runner.create();

        matterInstanceRef.current = { engine, render, runner };

        const wallThickness = 50;
        const wallOptions = { isStatic: true, render: { visible: false } };
        World.add(engine.world, [
            Bodies.rectangle(
                canvasWidth / 2,
                padding - wallThickness / 2,
                canvasWidth,
                wallThickness,
                wallOptions,
            ),
            Bodies.rectangle(
                canvasWidth / 2,
                canvasHeight - padding + wallThickness / 2,
                canvasWidth,
                wallThickness,
                wallOptions,
            ),
            Bodies.rectangle(
                padding - wallThickness / 2,
                canvasHeight / 2,
                wallThickness,
                canvasHeight,
                wallOptions,
            ),
            Bodies.rectangle(
                canvasWidth - padding + wallThickness / 2,
                canvasHeight / 2,
                wallThickness,
                canvasHeight,
                wallOptions,
            ),
        ]);

        Runner.run(runner, engine);
        Render.run(render);

        return () => {
            if (matterInstanceRef.current) {
                const { render, runner, engine } = matterInstanceRef.current;
                Render.stop(render);
                render.canvas?.remove();
                Runner.stop(runner);
                World.clear(engine.world, false);
                Engine.clear(engine);
            }
            bodiesRef.current.clear();
            velocitiesRef.current.clear();
            bodyIdToConfigRef.current.clear();
        };
    }, [canvasWidth, canvasHeight, padding]);

    useEffect(() => {
        const canvasElement = matterInstanceRef.current?.render.canvas;
        if (!canvasElement) return;

        const handleMouseDown = (event: MouseEvent) => {
            if (selectedRef.current) {
                const selectedBodyId = selectedRef.current.body.id;
                const config = bodyIdToConfigRef.current.get(selectedBodyId);

                if (!config) return;

                if (config.href) {
                    event.preventDefault();

                    const isNewTab = event.button === 1 || event.metaKey ||
                        event.ctrlKey;
                    const isLocalNav = config.href.startsWith("/");

                    if (isLocalNav && event.button === 0 && !isNewTab) {
                        navigate(config.href);
                    } else {
                        const target = isNewTab
                            ? "_blank"
                            : (config.target || "_self");
                        window.open(config.href, target);
                    }
                } else if (config.onClick && event.button === 0) {
                    config.onClick(event);
                }
            }
        };

        const handleContextMenu = (event: MouseEvent) => {
            if (selectedRef.current) {
                const selectedBodyId = selectedRef.current.body.id;
                const config = bodyIdToConfigRef.current.get(selectedBodyId);

                if (config?.href) {
                    event.preventDefault();
                }
            }
        };
        const handleMouseMove = (event: MouseEvent) => {
            updateSelection(event.offsetX, event.offsetY);
        };

        if (!disableFreezeOnHover) {
            canvasElement.addEventListener("mousemove", handleMouseMove);
        }
        canvasElement.addEventListener(
            "mousedown",
            handleMouseDown as EventListener,
        );
        canvasElement.addEventListener(
            "contextmenu",
            handleContextMenu as EventListener,
        );

        return () => {
            canvasElement.removeEventListener("mousemove", handleMouseMove);
            canvasElement.removeEventListener(
                "mousedown",
                handleMouseDown as EventListener,
            );
            canvasElement.removeEventListener(
                "contextmenu",
                handleContextMenu as EventListener,
            );
        };
    }, [disableFreezeOnHover, updateSelection, navigate]);

    useEffect(() => {
        const engine = matterInstanceRef.current?.engine;
        if (!engine) return;
        const currentBodyIds = new Set(objects.map((obj) => obj.id));

        bodiesRef.current.forEach((body, id) => {
            if (!currentBodyIds.has(id)) {
                World.remove(engine.world, body);
                bodiesRef.current.delete(id);
                bodyIdToConfigRef.current.delete(body.id);
                velocitiesRef.current.delete(body.id);
            }
        });

        const objectsToAdd = objects.filter((obj) =>
            !bodiesRef.current.has(obj.id)
        );

        const bodyCreationPromises = objectsToAdd.map((obj) =>
            fetch(obj.collisionSvgPath)
                .then((r) => r.text())
                .then((rawSvg) => {
                    const svgEl = new DOMParser().parseFromString(
                        rawSvg,
                        "image/svg+xml",
                    ).querySelector("svg");
                    if (!svgEl) return null;
                    const pathEls = Array.from(svgEl.querySelectorAll("path"));
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

                    return { obj, body: svgBody };
                })
        );

        Promise.all(bodyCreationPromises).then((results) => {
            const validCreations = results.filter((
                r,
            ): r is { obj: SvgObjectConfig; body: Body } => r !== null);

            if (validCreations.length > 0) {
                const newBodies = validCreations.map((c) => c.body);
                World.add(engine.world, newBodies);

                validCreations.forEach(({ obj, body }) => {
                    bodiesRef.current.set(obj.id, body);
                    bodyIdToConfigRef.current.set(body.id, obj);
                });
            }
        });
    }, [objects, canvasWidth, canvasHeight]);

    const defaultStyle: CSSProperties = {
        border: "0px solid #aaa",
        borderRadius: "8px",
        width: canvasWidth,
        height: canvasHeight,
        overflow: "hidden",
        outline: "none",
        cursor: disableFreezeOnHover ? "default" : "pointer",
    };

    const hoverHandlers = disableFreezeOnHover ? {} : {
        onMouseEnter: handleFreeze,
        onMouseLeave: handleUnfreeze,
        onFocus: handleFreeze,
        onBlur: handleUnfreeze,
    };

    return (
        <div
            ref={canvasRef}
            tabIndex={0}
            style={{ ...defaultStyle, ...style }}
            {...hoverHandlers}
        />
    );
};

export default Canvas;
