import Canvas, { SvgObjectConfig } from "./ExampleCanvas.tsx";

function App() {
    const headerSimulatedObjects: SvgObjectConfig[] = [
        {
            id: "hamster",
            textureSvgPath: "/hamster_short.svg",
            collisionSvgPath: "/hamster_short_outline.svg",
            scale: 0.15,
            onClick: () => {
                console.log("hamster");
            },
            initialPosition: { x: 100, y: 50 },
            initialVelocity: { x: 1, y: -2.5 },
            angularVelocity: 0.02,
        },
    ];
    return (
        <>
            <Canvas
                canvasWidth={300}
                canvasHeight={200}
                objects={headerSimulatedObjects}
            />
        </>
    );
}

export default App;
