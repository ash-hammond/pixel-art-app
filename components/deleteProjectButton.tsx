import {Button, DialogActions, DialogContent} from "@mui/material";
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import {useState} from "react";

export function DeleteProjectButton({deleteProject}: { deleteProject: () => void }) {
    const [open, setOpen] = useState(false);
    return <><Button onClick={() => setOpen(!open)} variant="contained" color="error">Delete</Button>
        <Dialog open={open} onClose={() => setOpen(false)}>
            <DialogTitle>Delete Project?</DialogTitle>
            <DialogContent>This can&apos;t be undone.</DialogContent>
            <DialogActions>
                <Button onClick={() => setOpen(false)}>Cancel</Button>
                <Button onClick={() => {deleteProject(); setOpen(false)}}>Delete Project</Button>
            </DialogActions>
        </Dialog>
    </>
}