'use client'
import {Property} from "csstype";
import {useRef, useState} from "react";
import {Button, Container, Skeleton, Snackbar, Stack, Typography} from "@mui/material";
import {firebaseConfig, getProjectsPath, getUserProjectsCollection} from "@/helpers/database"
// Import the functions you need from the SDKs you need
import {FirebaseApp, initializeApp} from "firebase/app";
import {getAuth, User} from "@firebase/auth";
import {Box} from "@mui/system";
import {addDoc, collection, deleteDoc, doc, Firestore, getDoc, getFirestore, updateDoc} from "@firebase/firestore";
import {PixelCanvas} from "@/components/pixelCanvas";
import {DeleteProjectButton} from "@/components/deleteProjectButton";
import {ChangeProjectNameButton} from "@/components/changeProjectNameButton";
import {TopBar} from "@/components/topBar";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional


function ColorButton({setColor, color}: {
    setColor: (color: Property.BackgroundColor) => void,
    color: Property.BackgroundColor
}) {
    return <button onClick={() => setColor(color)} style={{backgroundColor: color}}
                   className="h-6 w-6 border rounded-2xl cursor-pointer"></button>
}

function ColorBlock({color}: { color: Property.BackgroundColor }) {
    return <div style={{backgroundColor: color}} className="border h-6 w-6 rounded-2xl"></div>
}

export default function Home() {
    const palette: Property.BackgroundColor[] = ["red", "blue", "green", "yellow", "orange", "purple", "pink", "brown", "grey", "black", "white"];
    const [color, setColor] = useState<Property.BackgroundColor>("black");
    const width = 64
    const height = 64
    const DEFAULT_BACKGROUND = 'white'
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [pixels, setPixels] = useState<Property.BackgroundColor[]>(Array<Property.BackgroundColor>(width * height).fill(DEFAULT_BACKGROUND));
    const [projectId, setProjectId] = useState<string | null>(null)
    const DEFAULT_PROJECT_NAME = "New Project"
    const [projectName, setProjectName] = useState(DEFAULT_PROJECT_NAME);
    const [loading, setLoading] = useState(false)
    const app = useRef<FirebaseApp>(null)
    if (app.current == null) {
        app.current = initializeApp(firebaseConfig)
    }
    const [saved, setSaved] = useState(false)
    const [saving, setSaving] = useState(false)
    const auth = getAuth(app.current);
    const user = auth.currentUser
    const [_, forceUpdate] = useState<boolean>(false)
    const db = getFirestore(app.current)

    async function saveProject() {
        setSaving(true)
        if (projectId) {
            await updateDoc(doc(db, getProjectsPath(user!), projectId), {
                pixels: pixels,
                name: projectName
            })
        } else {

            await addDoc(getUserProjectsCollection(db, user!), {
                pixels: pixels,
                name: projectName
            })
        }
        setSaved(true)
        setSaving(false)
    }

    async function loadProject(id: string) {
        setLoading(true)
        const p = await getDoc(doc(db, getProjectsPath(user!), id))
        const data = p.data()!
        setPixels(data.pixels)
        setProjectName(data.name)
        setProjectId(id)
        setLoading(false)
    }

    function clearPixels(color: string) {
        const p = new Array(pixels.length)
        p.fill(color)
        setPixels(p)
    }

    async function deleteProject() {
        clearPixels(DEFAULT_BACKGROUND)
        if (projectId != null) {
            await deleteDoc(doc(db, getProjectsPath(user!), projectId))
            setProjectId(null)
        }
        setProjectName(DEFAULT_PROJECT_NAME)
    }
    const scale = 10

    //TODO warn on leave w/out saving
    return (
            <Container sx={{marginTop: 2}}>
                <Snackbar open={saved} onClose={() => setSaved(false)} message="Saved Project"></Snackbar>
                <Stack spacing={1}>
                    <TopBar loadProject={loadProject} auth={auth} forceUpdate={forceUpdate} db={db} user={user}/>
                    <Typography>{projectName}</Typography>
                    <Stack direction="row" spacing={1}>
                        {saving ?
                            <Button color='success' variant="contained" disabled>Saving...</Button>
                            :
                            <Button color='success' variant="contained" onClick={async () => {
                                if (user) {
                                    //TODO add toast
                                    saveProject().catch(alert)
                                } else {
                                    alert("You must login to save")
                                }
                            }}>Save</Button>
                        }
                        <ChangeProjectNameButton changeName={setProjectName} name={projectName}/>
                        <Button variant="contained" onClick={() => {
                            const a = document.createElement("a")
                            a.href = canvasRef.current!.toDataURL()
                            a.download = "export.png"
                            a.click()
                        }}>Export</Button>
                        <DeleteProjectButton deleteProject={deleteProject}/>
                    </Stack>
                    <Stack direction="row" spacing={1}>
                        <Typography>Selected:</Typography>
                        <ColorBlock color={color}></ColorBlock>
                    </Stack>
                        <Stack direction="row" spacing={1}>
                            {palette.map((color, i) => <ColorButton key={i} setColor={setColor} color={color}></ColorButton>)}
                        </Stack>
                    <Box>
                        {loading ?
                            <Skeleton variant="rectangular" width={width * scale} height={height * scale}/>
                        :
                            <PixelCanvas ref={canvasRef} width={width} picked_color={color} height={height} scale={scale}
                                         pixels={pixels} setPixels={setPixels}></PixelCanvas>
                        }
                    </Box>
                </Stack>
            </Container>
    );
}
