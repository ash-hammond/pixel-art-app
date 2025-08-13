import {Firestore, getDocs} from "@firebase/firestore";
import {Auth, GithubAuthProvider, signInWithPopup, signOut, User} from "@firebase/auth";
import {Dispatch, SetStateAction, useState} from "react";
import {Box} from "@mui/system";
import {Button, Container, Grid, List, ListItemButton, Modal, Paper, Stack, Typography} from "@mui/material";
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
        return <Grid sx={{alignItems: 'end'}} container spacing={2}>
            <Grid size={4}>

                <Typography variant="h3">Pixel Painter</Typography>
            </Grid>
            <Grid size={8}>
                <Button onClick={async () => {
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
                    <Container sx={{marginTop: 10}}>
                        <Paper sx={{padding:2}}>
                            <Typography variant="h4">Open Project</Typography>
                            <List>
                                {projects?.map((project: Project, id) => <ListItemButton key={id} onClick={() => {
                                    setProjects(null)
                                    loadProject(project.id)
                                }
                                }>{project.name}</ListItemButton>)}
                                <ListItemButton>Test</ListItemButton>
                            </List>
                            <Button onClick={() => setProjects(null)}>Cancel</Button>
                        </Paper>
                    </Container>
                </Modal>
            </Grid>
        </Grid>
    }
    return <Grid sx={{alignItems: 'end'}}container spacing={2}>
        <Grid size={4}>
            <Typography variant="h3">Pixel Painter</Typography>
        </Grid>
        <Grid size={8}>
            <Button onClick={async () => {
                await signInWithPopup(auth, new GithubAuthProvider())
                forceUpdate((n) => !n)
            }}>Login with GitHub</Button>
        </Grid>
    </Grid>
}