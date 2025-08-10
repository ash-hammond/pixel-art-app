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
    const [color, setColor] = useState<Property.BackgroundColor>("red");
    return (
      <div>
          <p>hi</p>
          <ColorBlock color={color}></ColorBlock>
          <ColorButton setColor={setColor} color={"grey"}></ColorButton>
      </div>
  );
}
