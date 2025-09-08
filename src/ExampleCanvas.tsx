import { useEffect, useRef } from "react";
import { Bodies, Body, Engine, Render, Runner, World } from "matter-js";

interface CanvasProps {
    canvasWidth: number;
    canvasHeight: number;
    rectangleWidth?: number;
    rectangleHeight?: number;
    initialVelocity?: { x: number; y: number };
    angularVelocity?: number;
}

const Canvas = ({ 
    canvasWidth, 
    canvasHeight, 
    rectangleWidth = 60, 
    rectangleHeight = 40,
    initialVelocity = { x: 5, y: -3 },
    angularVelocity = 0.05
}: CanvasProps) => {
    const canvasRef = useRef<HTMLDivElement>(null);
    const engineRef = useRef<Engine>();
    const renderRef = useRef<Render>();
    const runnerRef = useRef<Runner>();

    useEffect(() => {
        if (!canvasRef.current) return;

        const engine = Engine.create();
        engineRef.current = engine;

        const render = Render.create({
            element: canvasRef.current,
            engine: engine,
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
        const wallOptions = { isStatic: true };

        const walls = [
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
        ];

        const bouncingRect = Bodies.rectangle(
            canvasWidth / 2, 
            canvasHeight / 3, 
            rectangleWidth, 
            rectangleHeight, 
            {
                restitution: 1.0,
                friction: 0,
                frictionAir: 0,
                inertia: Infinity,
                render: {
                    fillStyle: "#e74c3c",
                },
            }
        );

        Body.setVelocity(bouncingRect, initialVelocity);
        Body.setAngularVelocity(bouncingRect, angularVelocity);

        World.add(engine.world, [...walls, bouncingRect]);

        const runner = Runner.create();
        runnerRef.current = runner;

        Runner.run(runner, engine);
        Render.run(render);

        return () => {
            if (renderRef.current) {
                Render.stop(renderRef.current);
                renderRef.current.canvas.remove();
            }
            if (runnerRef.current && engineRef.current) {
                Runner.stop(runnerRef.current);
                World.clear(engineRef.current.world, false);
                Engine.clear(engineRef.current);
            }
        };
    }, [canvasWidth, canvasHeight, rectangleWidth, rectangleHeight, initialVelocity, angularVelocity]);

    return (
        <div
            ref={canvasRef}
            style={{ 
                border: "2px solid #aaa", 
                borderRadius: "8px", 
                width: canvasWidth, 
                height: canvasHeight 
            }}
        />
    );
};

export default Canvas;
