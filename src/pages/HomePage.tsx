import Canvas, { SvgObjectConfig } from "../components/Canvas.tsx";

function HomePage() {
    const mainSimulatedObjects: SvgObjectConfig[] = [
        {
            id: "hi",
            textureSvgPath: "/main/hi.svg",
            collisionSvgPath: "/main/hi_outline.svg",
            scale: 1.0,
            initialPosition: { x: 150, y: 150 },
            initialVelocity: { x: 0, y: 1.8 },
            angularVelocity: 0,
        },
        {
            id: "i_am",
            textureSvgPath: "/main/i_am.svg",
            collisionSvgPath: "/main/i_am_outline.svg",
            scale: 1.0,
            initialPosition: { x: 400, y: 250 },
            initialVelocity: { x: 0, y: 2.0 },
            angularVelocity: 0,
        },
        {
            id: "student",
            textureSvgPath: "/main/student.svg",
            collisionSvgPath: "/main/student_outline.svg",
            scale: 1.0,
            initialPosition: { x: 950, y: 300 },
            initialVelocity: { x: 0, y: 0.5 },
            angularVelocity: 0,
        },
    ];
    return (
        <Canvas
            canvasWidth={1500}
            canvasHeight={600}
            objects={mainSimulatedObjects}
            disableFreezeOnHover
        />
    );
}

export default HomePage;
