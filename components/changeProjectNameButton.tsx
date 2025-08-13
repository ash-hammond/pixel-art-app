import {Button, DialogActions, DialogContent, TextField} from "@mui/material";
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import {useRef, useState} from "react";

//TODO validate non-empty string
export function ChangeProjectNameButton({changeName, name}: { changeName: (name: string) => void, name: string }) {
    const [open, setOpen] = useState(false);
    const newName = useRef(name)
    return <><Button onClick={() => setOpen(!open)} variant="contained" >Change Name</Button>
        <Dialog open={open} onClose={() => setOpen(false)}>
            <DialogTitle>Change Project Name</DialogTitle>
            <DialogContent>
                <TextField defaultValue={name} onChange={(e) => newName.current = e.target.value}></TextField>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => setOpen(false)}>Cancel</Button>
                <Button onClick={() => {changeName(newName.current); setOpen(false)}}>Confirm</Button>
            </DialogActions>
        </Dialog>
    </>
}