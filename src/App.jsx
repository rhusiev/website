import { useState } from 'react'
import Canvas from './ExampleCanvas.tsx';

function App() {
  return (
    <>
      <Canvas canvasWidth={400} canvasHeight={300} rectangleWidth={80} rectangleHeight={60} />
    </>
  )
}

export default App
