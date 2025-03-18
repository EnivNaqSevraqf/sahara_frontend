import { Typography, Box } from "@mui/material"
import { IEventInfo } from "./EventCalendar"

interface IProps {
  event: IEventInfo
}

const EventInfo = ({ event }: IProps) => {
  return (
    <Box sx={{ p: 1 }}>
      <Typography variant="body2" noWrap>
        {event.description}
      </Typography>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
        {new Date(event.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </Typography>
    </Box>
  )
}

export default EventInfo
