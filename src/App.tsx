import { useCallback, useState } from "react";
import Canvas, { SvgObjectConfig } from "./ExampleCanvas.tsx";

function App() {
    const headerSimulatedObjects: SvgObjectConfig[] = [
        {
            id: "hamster",
            textureSvgPath: "/header/hamster_short.svg",
            collisionSvgPath: "/header/hamster_short_outline.svg",
            scale: 0.15,
            onClick: () => {
                console.log("hamster");
            },
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
            onClick: () => {
                console.log("conspectus");
            },
            initialPosition: { x: 150, y: 100 },
            initialVelocity: { x: -0.9, y: 1.5 },
            angularVelocity: 0.015,
        },
        {
            id: "contacts",
            textureSvgPath: "/header/contacts.svg",
            collisionSvgPath: "/header/contacts_outline.svg",
            scale: 1.0,
            onClick: () => {
                console.log("contacts");
            },
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
            scale: 0.5,
            onClick: handleAddClickObject,
            initialPosition: { x: 150, y: 100 },
            initialVelocity: { x: -0.9, y: 1.5 },
            angularVelocity: 0.015,
        },
    ]);
    const mainSimulatedObjects: SvgObjectConfig[] = [
        {
            id: "hi",
            textureSvgPath: "/main/hi.svg",
            collisionSvgPath: "/main/hi_outline.svg",
            scale: 1.0,
            onClick: () => {
                console.log("hi");
            },
            initialPosition: { x: 150, y: 150 },
            initialVelocity: { x: 0, y: 1.8 },
            angularVelocity: 0,
        },
        {
            id: "i_am",
            textureSvgPath: "/main/i_am.svg",
            collisionSvgPath: "/main/i_am_outline.svg",
            scale: 1.0,
            onClick: () => {
                console.log("i_am");
            },
            initialPosition: { x: 400, y: 250 },
            initialVelocity: { x: 0, y: 2.0 },
            angularVelocity: 0,
        },
        {
            id: "student",
            textureSvgPath: "/main/student.svg",
            collisionSvgPath: "/main/student_outline.svg",
            scale: 1.0,
            onClick: () => {
                console.log("student");
            },
            initialPosition: { x: 950, y: 300 },
            initialVelocity: { x: 0, y: 0.5 },
            angularVelocity: 0,
        },
    ];
    return (
        <div>
            <header>
                <Canvas
                    canvasWidth={300}
                    canvasHeight={250}
                    objects={headerSimulatedObjects}
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
            <Canvas
                canvasWidth={1500}
                canvasHeight={600}
                objects={mainSimulatedObjects}
                disableFreezeOnHover={true}
            />
        </div>
    );
}

export default App;
