import { SetStateAction, MouseEvent, Dispatch } from "react"
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button, Box, Typography, Paper } from "@mui/material"
import { IEventInfo } from "./EventCalendar"

interface IProps {
  open: boolean
  handleClose: () => void
  onDeleteEvent: (e: MouseEvent<HTMLButtonElement>) => void
  currentEvent: IEventInfo | null
}

const EventInfoModal = ({ open, handleClose, onDeleteEvent, currentEvent }: IProps) => {
  const onClose = () => {
    handleClose()
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Event Info</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <Paper 
            elevation={0} 
            sx={{ 
              p: 2, 
              bgcolor: 'background.default',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1
            }}
          >
            <Typography variant="body1" color="text.primary">
              {currentEvent?.description}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              {currentEvent?.start && new Date(currentEvent.start).toLocaleString()}
            </Typography>
          </Paper>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button variant="outlined" color="error" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="contained" color="error" onClick={onDeleteEvent}>
          Delete Event
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default EventInfoModal
