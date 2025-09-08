import { useState } from "react";
import Canvas from "./ExampleCanvas.tsx";

function App() {
    return (
        <>
            <Canvas
                canvasWidth={300}
                canvasHeight={200}
                textureSvgPath="/hamster_short.svg"
                collisionSvgPath="/hamster_short_outline.svg"
                scale={0.15}
                onClick={() => {
                    console.log("yay");
                }}
            />
        </>
    );
}

export default App;
