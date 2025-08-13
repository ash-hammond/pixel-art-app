import {Firestore, getDocs} from "@firebase/firestore";
import {Auth, GithubAuthProvider, signInWithPopup, signOut, User} from "@firebase/auth";
import {Dispatch, SetStateAction, useState} from "react";
import {Box} from "@mui/system";
import {Button, List, ListItemButton, Modal} from "@mui/material";
import {getUserProjectsCollection} from "@/helpers/database";

export function TopBar({user, auth, db, forceUpdate, loadProject}: {
    loadProject: (id: string) => void,
    db: Firestore,
    user: User | null,
    auth: Auth,
    forceUpdate: Dispatch<SetStateAction<boolean>>
}) {
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