import Canvas, { SvgObjectConfig } from "../components/Canvas.tsx";

function Contacts() {
    const contactsSimulatedObjects: SvgObjectConfig[] = [
        {
            id: "github",
            textureSvgPath: "/contacts/github.svg",
            collisionSvgPath: "/contacts/github_outline.svg",
            scale: 0.2,
            href: "https://github.com/rhusiev",
            initialPosition: { x: 150, y: 150 },
            initialVelocity: { x: -3.4, y: 1.8 },
            angularVelocity: 0.02,
        },
    ];
    return (
        <Canvas
            canvasWidth={1200}
            canvasHeight={500}
            objects={contactsSimulatedObjects}
        />
    );
}

export default Contacts;
