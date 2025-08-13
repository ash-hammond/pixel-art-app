'use client'
import {Property} from "csstype";
import {Dispatch, RefObject, SetStateAction, useEffect, useRef, useState} from "react";
import assert from "node:assert";
import {Vector2} from "three";
import {Button, Container, List, ListItemButton, Modal, TextField} from "@mui/material";

// Import the functions you need from the SDKs you need
import {FirebaseApp, initializeApp} from "firebase/app";
import {Auth, getAuth, GithubAuthProvider, signInWithPopup, signOut, User} from "@firebase/auth";
import {Box} from "@mui/system";
import {addDoc, Firestore, collection, doc, getDoc, getDocs, getFirestore, updateDoc} from "@firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyBoSsmVIbFOFUxIT694874IJBRrLtKgG7I",
    authDomain: "pixel-painter-eb21f.firebaseapp.com",
    projectId: "pixel-painter-eb21f",
    storageBucket: "pixel-painter-eb21f.firebasestorage.app",
    messagingSenderId: "292877217298",
    appId: "1:292877217298:web:79fd9e6eccbb052ee872cb",
    measurementId: "G-P77XPN2ZJY"
};

function ColorButton({setColor, color}: {
    setColor: (color: Property.BackgroundColor) => void,
    color: Property.BackgroundColor
}) {
    return <button onClick={() => setColor(color)} style={{backgroundColor: color}}
                   className="h-6 w-6 rounded-2xl cursor-pointer"></button>
}

function ColorBlock({color}: { color: Property.BackgroundColor }) {
    return <div style={{backgroundColor: color}} className="h-6 w-6 rounded-2xl"></div>
}

function PixelCanvas({width, height, scale, picked_color, pixels, setPixels, ref}: {
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

function TopBar({user, auth, db, forceUpdate, loadProject}: {loadProject: (id: string) => void, db: Firestore, user: User | null, auth: Auth, forceUpdate: Dispatch<SetStateAction<boolean>>}) {
    interface Project {
        name: string,
        id: string,
    }
    const [projects, setProjects] = useState<Project[] | null>(null)
    if (user) {
        return <Box><Button onClick={async () => {
            await signOut(auth)
            forceUpdate((n) => !n)
        }}>Logout</Button>
            <Button onClick={async () => {
                const snapshot = await getDocs(getUserProjectsCollection(db, user))
                setProjects(snapshot.docs.map((doc) => {
                    return {
                        name: doc.get("name"),
                        id: doc.id,
                    }
                }))
            }}>Open</Button>
            <Modal open={Boolean(projects)}>
                <List>
                    {projects?.map((project: Project, id) => <ListItemButton key={id} onClick={() => {
                        setProjects(null)
                        loadProject(project.id)
                    }
                    }>{project.name}</ListItemButton>)}
                    <ListItemButton>Test</ListItemButton>
                </List>
            </Modal>
        </Box>
    }
        return <Button onClick={async () => {
             await signInWithPopup(auth, new GithubAuthProvider())
            forceUpdate((n) => !n)
        }}>Login with GitHub</Button>
}

function getProjectsPath(user: User) {
    return `users/${user.uid!}/projects`
}

function getUserProjectsCollection(db: Firestore, user: User) {
    return collection(db, getProjectsPath(user))
}

export default function Home() {
    const palette: Property.BackgroundColor[] = ["red", "blue", "green", "yellow", "orange", "purple", "pink", "brown", "grey", "black", "white"];
    const [color, setColor] = useState<Property.BackgroundColor>("red");
    const width = 64
    const height = 64

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [pixels, setPixels] = useState<Property.BackgroundColor[]>(Array<Property.BackgroundColor>(width * height).fill("red"));
    const [projectId, setProjectId] = useState<string | null>(null)
    const [projectName, setProjectName] = useState("New Project")
    const app = useRef<FirebaseApp>(null)
    if (app.current == null) {
        app.current = initializeApp(firebaseConfig)
    }
    const auth = getAuth(app.current);
    const user = auth.currentUser
    const [_, forceUpdate] = useState<boolean>(false)
    const db = getFirestore(app.current)

    async function saveProject() {
        if (projectId) {
            return await updateDoc(doc(db, getProjectsPath(user!), projectId), {
                pixels: pixels,
                name: projectName
            })
        }
        return await addDoc(getUserProjectsCollection(db, user!), {
            pixels: pixels,
            name: projectName
        })
    }

    async function loadProject(id: string) {
        const p = await getDoc(doc(db, getProjectsPath(user!), id))
        setPixels(p.data()!.pixels)
        setProjectId(id)
    }

    return (
        <Box>
            <Container>
                <TopBar loadProject={loadProject} auth={auth} forceUpdate={forceUpdate} db={db} user={user}/>
                <TextField variant="standard" color="primary" defaultValue={projectName} onChange={(e) => setProjectName(e.target.value)}></TextField>
                <ColorBlock color={color}></ColorBlock>
                {palette.map((color, i) => <ColorButton key={i} setColor={setColor} color={color}></ColorButton>)}
                <PixelCanvas ref={canvasRef} width={width} picked_color={color} height={height} scale={10}
                             pixels={pixels} setPixels={setPixels}></PixelCanvas>
                <Button onClick={() => {
                    const a = document.createElement("a")
                    a.href = canvasRef.current!.toDataURL()
                    a.download = "export.png"
                    a.click()
                }}>Export</Button>
                <Button onClick={async () => {
                    if (user) {
                        saveProject().catch(alert)
                    } else {
                        alert("You must login to save")
                    }
                }}>Save</Button>
            </Container>
        </Box>
    );
}
