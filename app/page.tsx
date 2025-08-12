'use client'
import {Property} from "csstype";
import {Dispatch, SetStateAction, useEffect, useRef, useState} from "react";
import assert from "node:assert";

function ColorButton({setColor, color}: {setColor: (color: Property.BackgroundColor) => void, color: Property.BackgroundColor}) {
    return <button onClick={() => setColor(color)} style={{backgroundColor: color}} className="h-6 w-6 rounded-2xl cursor-pointer"></button>
}

function ColorBlock({color}: {color: Property.BackgroundColor}) {
    return <div style={{backgroundColor: color}} className="h-6 w-6 rounded-2xl"></div>
}

interface Position {
    x: number;
    y: number;
}

function PixelCanvas({width, height, scale, picked_color, pixels, setPixels}: {width: number, height: number, scale: number, picked_color: Property.BackgroundColor, pixels: Property.BackgroundColor[], setPixels: Dispatch<SetStateAction<Property.BackgroundColor[]>>}) {
    const ref = useRef<HTMLCanvasElement>(null);
    const paint = useRef(false)
    const mouse = useRef<Position>(null)

    useEffect(() => {
        const ctx = ref.current!.getContext("2d")!
        function fillPixel(x: number, y: number, color: string) {
            ctx.fillStyle = color
            ctx.fillRect(x * scale, y * scale, scale, scale);
        }
        pixels.forEach((pixel, i) => {
            const y = Math.floor(i / width)
            fillPixel(i - y * width, y, pixel)
        })
    }, [pixels, height, scale, width])

    function positionToIndex(position: Position) {
        return position.y * width + position.x
    }

    function paintPixel() {
        setPixels(p => {
            const n = p.slice()
            assert(mouse.current)
            n[positionToIndex(mouse.current)] = picked_color
            return n
        })
    }
    return <canvas ref={ref} width={width * scale} height={height * scale} onClick={paintPixel} onMouseMove={(event) => {
        const rect = ref.current!.getBoundingClientRect()
        mouse.current = {
            x: Math.floor((event.clientX - rect.x) / scale),
            y: Math.floor((event.clientY - rect.y) / scale)
        }
        if (paint.current) paintPixel()
    }} onMouseDown={() => paint.current = true} onMouseUp={() => paint.current = false}></canvas>
}

export default function Home() {
    const palette: Property.BackgroundColor[] = ["red", "blue", "green", "yellow", "orange", "purple", "pink", "brown", "grey", "black", "white"];
    const [color, setColor] = useState<Property.BackgroundColor>("red");
    const width = 64
    const height= 64

    const [pixels, setPixels] = useState<Property.BackgroundColor[]>(Array<Property.BackgroundColor>(width * height).fill("red"));
    return (
      <div>
          <ColorBlock color={color}></ColorBlock>
          {palette.map((color, i) => <ColorButton key={i} setColor={setColor} color={color}></ColorButton>)}
          <PixelCanvas width={width} picked_color={color} height={height} scale={10} pixels={pixels} setPixels={setPixels}></PixelCanvas>
      </div>
  );
}
