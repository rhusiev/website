import { useCallback, useState } from "react";
import Canvas, { SvgObjectConfig } from "./Canvas.tsx";

function Header() {
    const homeSimulatedObjects: SvgObjectConfig[] = [
        {
            id: "hamster",
            textureSvgPath: "/header/hamster_short.svg",
            collisionSvgPath: "/header/hamster_short_outline.svg",
            scale: 0.15,
            href: "/",
            initialPosition: { x: 100, y: 50 },
            initialVelocity: { x: 1, y: -2.5 },
            angularVelocity: 0.035,
        },
    ];
    const navigationSimulatedObjects: SvgObjectConfig[] = [
        {
            id: "conspectus",
            textureSvgPath: "/header/notebook.svg",
            collisionSvgPath: "/header/notebook_outline.svg",
            scale: 1.0,
            href: "https://conspectus.r1a.nl/readme",
            initialPosition: { x: 150, y: 100 },
            initialVelocity: { x: -0.9, y: 1.5 },
            angularVelocity: 0.015,
        },
        {
            id: "contacts",
            textureSvgPath: "/header/contacts.svg",
            collisionSvgPath: "/header/contacts_outline.svg",
            scale: 1.0,
            href: "/contacts",
            initialPosition: { x: 400, y: 150 },
            initialVelocity: { x: 3.7, y: 5.5 },
            angularVelocity: -0.025,
        },
    ];
    const handleAddClickObject = useCallback(() => {
        const id: string = `cookie-${crypto.randomUUID()}`;
        const newObject: SvgObjectConfig = {
            id: id,
            textureSvgPath: "/header/cookie.svg",
            collisionSvgPath: "/header/cookie_outline.svg",
            scale: 0.07,
            onClick: () => {
                setClickSimulatedObjects((prevObjects) =>
                    prevObjects.filter((svgObject: SvgObjectConfig) =>
                        svgObject.id !== id
                    )
                );
            },
        };

        setClickSimulatedObjects((prevObjects) => [...prevObjects, newObject]);
    }, []);
    const [clickSimulatedObjects, setClickSimulatedObjects] = useState<
        SvgObjectConfig[]
    >([
        {
            id: "click",
            textureSvgPath: "/header/click.svg",
            collisionSvgPath: "/header/click_outline.svg",
            scale: 0.4,
            onClick: handleAddClickObject,
            initialPosition: { x: 150, y: 50 },
            initialVelocity: { x: -0.9, y: 1.5 },
            angularVelocity: 0.015,
        },
    ]);
    return (
        <header>
            <Canvas
                canvasWidth={300}
                canvasHeight={250}
                objects={homeSimulatedObjects}
            />
            <Canvas
                canvasWidth={500}
                canvasHeight={250}
                objects={clickSimulatedObjects}
                padding={50}
            />
            <Canvas
                canvasWidth={600}
                canvasHeight={250}
                objects={navigationSimulatedObjects}
            />
        </header>
    );
}

export default Header;
