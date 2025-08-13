import {Dispatch, RefObject, SetStateAction, useEffect, useRef} from "react";
import {Property} from "csstype";
import {Vector2} from "three";
import assert from "node:assert";

export function PixelCanvas({width, height, scale, picked_color, pixels, setPixels, ref}: {
    ref: RefObject<HTMLCanvasElement | null>,
    width: number,
    height: number,
    scale: number,
    picked_color: Property.BackgroundColor,
    pixels: Property.BackgroundColor[],
    setPixels: Dispatch<SetStateAction<Property.BackgroundColor[]>>
}) {
    const paint = useRef(false)
    const mouse = useRef<Vector2>(null)

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
    }, [ref, pixels, height, scale, width])

    function positionToIndex(position: Vector2) {
        return position.y * width + position.x
    }

    function drawLine(from: Vector2, to: Vector2) {
        setPixels(p => {
            const n = p.slice()
            //https://stackoverflow.com/questions/4672279/bresenham-algorithm-in-javascript
            const dx = Math.abs(to.x - from.x)
            const dy = Math.abs(to.y - from.y)
            const sy = Math.sign(to.y - from.y)
            const sx = Math.sign(to.x - from.x)
            let err = dx - dy
            const position = from.clone()

            while (true) {
                n[positionToIndex(position)] = picked_color
                if (position.equals(to)) break
                const e2 = 2 * err
                if (e2 > -dy) {
                    err -= dy;
                    position.x += sx;
                }
                if (e2 < dx) {
                    err += dx;
                    position.y += sy;
                }
            }

            return n
        })
    }

    function paintPixel() {
        setPixels(p => {
            const n = p.slice()
            assert(mouse.current)
            n[positionToIndex(mouse.current)] = picked_color
            return n
        })
    }

    return <canvas ref={ref} width={width * scale} height={height * scale} onClick={paintPixel}
                   onMouseMove={(event) => {
                       const rect = ref.current!.getBoundingClientRect()
                       const pixel = new Vector2(Math.floor((event.clientX - rect.x) / scale), Math.floor((event.clientY - rect.y) / scale))
                       if (paint.current) {
                           if (mouse.current) {
                               drawLine(pixel, mouse.current)
                               mouse.current = pixel
                           } else {
                               mouse.current = pixel
                               paintPixel()
                           }
                       } else mouse.current = pixel
                   }} onMouseLeave={() => {
        mouse.current = null;
        paint.current = false
    }} onMouseDown={() => paint.current = true} onMouseUp={() => paint.current = false}></canvas>
}