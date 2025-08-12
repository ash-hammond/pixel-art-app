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

function PixelCanvas({width, height, scale, picked_color}) {
    const ref = useRef<HTMLCanvasElement>(null);
    useEffect(() => {
        const canvas = ref.current!
        const ctx = canvas.getContext("2d")!
        ctx.fillStyle = "red"
        function fillPixel(x, y, color) {
            ctx.fillStyle = color
            ctx.fillRect(x * scale, y * scale, scale, scale);
        }
        ctx.fillRect(0, 0, width * scale, height * scale)
        console.log("position", canvas.getBoundingClientRect())
        let mouse_x = 0
        let mouse_y = 0
        let paint = false
        canvas.addEventListener("mousemove", (event) => {
            const rect = canvas.getBoundingClientRect()
            mouse_x = Math.floor((event.x - rect.x) / scale)
            mouse_y = Math.floor((event.y - rect.y) / scale)
            if (paint) fillPixel(mouse_x, mouse_y, picked_color)
        })
        canvas.addEventListener("mouseup", (event) => paint = false)
        canvas.addEventListener("mousedown", (event) => paint = true)
        canvas.addEventListener("click", (event) => {
            console.log("clicked", mouse_x, mouse_y)
            fillPixel(mouse_x, mouse_y, picked_color);
        })
    })
    return <canvas ref={ref} width={width * scale} height={height * scale}></canvas>
}

export default function Home() {
    const pallete: Property.BackgroundColor[] = ["red", "blue", "green", "yellow", "orange", "purple", "pink", "brown", "grey", "black", "white"];
    const [color, setColor] = useState<Property.BackgroundColor>("red");
    return (
      <div>
          <ColorBlock color={color}></ColorBlock>
          {pallete.map((color, i) => <ColorButton key={i} setColor={setColor} color={color}></ColorButton>)}
          <PixelCanvas width={64} picked_color={color} height={64} scale={10}></PixelCanvas>
      </div>
  );
}
