'use client'
import Image from "next/image";
import {Property} from "csstype";
import {useState} from "react";

function ColorButton({setColor, color}: {setColor: (color: Property.BackgroundColor) => void, color: Property.BackgroundColor}) {
    return <button onClick={() => setColor(color)} style={{backgroundColor: color}} className="h-6 w-6 rounded-2xl cursor-pointer"></button>
}

function ColorBlock({color}: {color: Property.BackgroundColor}) {
    return <div style={{backgroundColor: color}} className="h-6 w-6 rounded-2xl"></div>
}

export default function Home() {
    const pallete: Property.BackgroundColor[] = ["red", "blue", "green", "yellow", "orange", "purple", "pink", "brown", "grey", "black", "white"];
    const [color, setColor] = useState<Property.BackgroundColor>("red");
    return (
      <div>
          <p>hi</p>
          <ColorBlock color={color}></ColorBlock>
          {pallete.map((color, i) => <ColorButton key={i} setColor={setColor} color={color}></ColorButton>)}
      </div>
  );
}
