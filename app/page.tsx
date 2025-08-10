'use client'
import Image from "next/image";
import {Property} from "csstype";
import {useEffect, useRef, useState} from "react";

function ColorButton({setColor, color}: {setColor: (color: Property.BackgroundColor) => void, color: Property.BackgroundColor}) {
    return <button onClick={() => setColor(color)} style={{backgroundColor: color}} className="h-6 w-6 rounded-2xl cursor-pointer"></button>
}

function ColorBlock({color}: {color: Property.BackgroundColor}) {
    return <div style={{backgroundColor: color}} className="h-6 w-6 rounded-2xl"></div>
}

function PixelCanvas({width, height, scale}) {
    const ref = useRef<HTMLCanvasElement>(null);
    useEffect(() => {
        const canvas = ref.current!
        const ctx = canvas.getContext("2d")!
        ctx.fillStyle = "red"
        ctx.fillRect(0, 0, width * scale, height * scale)
        console.log("position", canvas.getBoundingClientRect())
        canvas.addEventListener("mousemove", (event) => {
            const rect = canvas.getBoundingClientRect()
            const x = Math.floor((event.x - rect.x) / scale)
            const y = Math.floor((event.y - rect.y) / scale)
            console.log(x, y)
        })
    })
    return <canvas ref={ref} width={width * scale} height={height * scale}></canvas>
}

export default function Home() {
    const pallete: Property.BackgroundColor[] = ["red", "blue", "green", "yellow", "orange", "purple", "pink", "brown", "grey", "black", "white"];
    const [color, setColor] = useState<Property.BackgroundColor>("red");
    return (
      <div>
          <p>hi</p>
          <ColorBlock color={color}></ColorBlock>
          {pallete.map((color, i) => <ColorButton key={i} setColor={setColor} color={color}></ColorButton>)}
          <PixelCanvas width={64} height={64} scale={10}></PixelCanvas>
      </div>
  );
}
