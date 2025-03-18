import { useState, Dispatch, SetStateAction } from "react"
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Box,
  Button,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemText,
  TextField,
} from "@mui/material"
import DeleteIcon from "@mui/icons-material/Delete"
import { HexColorPicker } from "react-colorful"
import { ITodo, generateId } from "./EventCalendar"

interface IProps {
  open: boolean
  handleClose: () => void
  todos: ITodo[]
  setTodos: Dispatch<SetStateAction<ITodo[]>>
}

export const AddTodoModal = ({ open, handleClose, todos, setTodos }: IProps) => {
  const [color, setColor] = useState("#b32aa9")
  const [title, setTitle] = useState("")

  const onAddTodo = () => {
    if (!title.trim()) return

    setTodos([
      ...todos,
      {
        _id: generateId(),
        color,
        title: title.trim(),
      },
    ])
    setTitle("")
  }

  const onDeleteTodo = (_id: string) => {
    setTodos(todos.filter((todo) => todo._id !== _id))
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add todo</DialogTitle>
      <DialogContent>
        <DialogContentText>Create todos to add to your Calendar.</DialogContentText>
        <Box sx={{ mt: 2 }}>
          <TextField
            name="title"
            autoFocus
            margin="dense"
            id="title"
            label="Title"
            type="text"
            fullWidth
            sx={{ mb: 3 }}
            required
            variant="outlined"
            onChange={(e) => setTitle(e.target.value)}
            value={title}
          />
          <Box sx={{ display: "flex", justifyContent: "space-around", alignItems: "center", mb: 3 }}>
            <HexColorPicker color={color} onChange={setColor} />
            <Box 
              sx={{ 
                height: 80, 
                width: 80, 
                borderRadius: 1,
                backgroundColor: color,
                border: '1px solid',
                borderColor: 'divider'
              }} 
            />
          </Box>
          <Box>
            <List>
              {todos.map((todo) => (
                <ListItem
                  key={todo._id}
                  secondaryAction={
                    <IconButton onClick={() => onDeleteTodo(todo._id)} color="error" edge="end">
                      <DeleteIcon />
                    </IconButton>
                  }
                >
                  <Box
                    sx={{ 
                      height: 40, 
                      width: 40, 
                      borderRadius: 1, 
                      marginRight: 2,
                      backgroundColor: todo.color,
                      border: '1px solid',
                      borderColor: 'divider'
                    }}
                  />
                  <ListItemText primary={todo.title} />
                </ListItem>
              ))}
            </List>
          </Box>
        </Box>
      </DialogContent>
      <Divider />
      <DialogActions sx={{ p: 2 }}>
        <Button variant="outlined" color="error" onClick={handleClose}>
          Cancel
        </Button>
        <Button
          onClick={onAddTodo}
          disabled={!title.trim()}
          variant="contained"
          color="primary"
        >
          Add
        </Button>
      </DialogActions>
    </Dialog>
  )
}
