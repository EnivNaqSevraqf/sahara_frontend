import { useState, MouseEvent } from "react"
import { Box, Button, ButtonGroup, Card, CardContent, CardHeader, Container, Divider, useTheme } from "@mui/material"
import { Calendar, type Event, dateFnsLocalizer } from "react-big-calendar"
import { format, parse, startOfWeek, getDay } from "date-fns"
import { enUS } from "date-fns/locale"
import "react-big-calendar/lib/css/react-big-calendar.css"

import EventInfo from "./EventInfo"
import AddEventModal from "./AddEventModal"
import EventInfoModal from "./EventInfoModal"
import { AddTodoModal } from "./AddTodoModal"
import AddDatePickerEventModal from "./AddDatePickerEventModal"

const locales = {
  "en-US": enUS,
}

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
})

export interface ITodo {
  _id: string
  title: string
  color?: string
}

export interface IEventInfo extends Event {
  _id: string
  description: string
  todoId?: string
  start: Date
  end: Date
  title?: string
  allDay?: boolean
}

export interface EventFormData {
  description: string
  todoId?: string
}

export interface DatePickerEventFormData {
  description: string
  todoId?: string
  allDay: boolean
  start?: Date
  end?: Date
}

export const generateId = () => (Math.floor(Math.random() * 10000) + 1).toString()

const initialEventFormState: EventFormData = {
  description: "",
  todoId: undefined,
}

const initialDatePickerEventFormData: DatePickerEventFormData = {
  description: "",
  todoId: undefined,
  allDay: false,
  start: undefined,
  end: undefined,
}

const EventCalendar = () => {
  const theme = useTheme()
  const [openSlot, setOpenSlot] = useState(false)
  const [openDatepickerModal, setOpenDatepickerModal] = useState(false)
  const [openTodoModal, setOpenTodoModal] = useState(false)
  const [currentEvent, setCurrentEvent] = useState<Event | IEventInfo | null>(null)
  const [eventInfoModal, setEventInfoModal] = useState(false)
  const [events, setEvents] = useState<IEventInfo[]>([])
  const [todos, setTodos] = useState<ITodo[]>([])
  const [eventFormData, setEventFormData] = useState<EventFormData>(initialEventFormState)
  const [datePickerEventFormData, setDatePickerEventFormData] = useState<DatePickerEventFormData>(initialDatePickerEventFormData)

  const handleSelectSlot = (event: Event) => {
    setOpenSlot(true)
    setCurrentEvent(event)
  }

  const handleSelectEvent = (event: IEventInfo) => {
    setCurrentEvent(event)
    setEventInfoModal(true)
  }

  const handleClose = () => {
    setEventFormData(initialEventFormState)
    setOpenSlot(false)
  }

  const handleDatePickerClose = () => {
    setDatePickerEventFormData(initialDatePickerEventFormData)
    setOpenDatepickerModal(false)
  }

  const onAddEvent = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()

    if (!currentEvent?.start || !currentEvent?.end) {
      return
    }

    const data: IEventInfo = {
      ...eventFormData,
      _id: generateId(),
      start: currentEvent.start,
      end: currentEvent.end,
    }

    const newEvents = [...events, data]
    setEvents(newEvents)
    handleClose()
  }

  const onAddEventFromDatePicker = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()

    const addHours = (date: Date | undefined, hours: number) => {
      return date ? new Date(date.setHours(date.getHours() + hours)) : undefined
    }

    const setMinToZero = (date: Date | undefined) => {
      if (!date) return undefined
      const newDate = new Date(date)
      newDate.setSeconds(0)
      return newDate
    }

    if (!datePickerEventFormData.start) return

    const data: IEventInfo = {
      ...datePickerEventFormData,
      _id: generateId(),
      start: setMinToZero(datePickerEventFormData.start) || new Date(),
      end: datePickerEventFormData.allDay
        ? addHours(datePickerEventFormData.start, 12) || new Date()
        : setMinToZero(datePickerEventFormData.end) || new Date(),
    }

    const newEvents = [...events, data]
    setEvents(newEvents)
    setDatePickerEventFormData(initialDatePickerEventFormData)
  }

  const onDeleteEvent = () => {
    setEvents(() => [...events].filter((e) => e._id !== (currentEvent as IEventInfo)._id!))
    setEventInfoModal(false)
  }

  return (
    <Box
      component="main"
      sx={{
        flexGrow: 1,
        py: 8,
        px: 3,
      }}
    >
      <Container maxWidth={false}>
        <Card>
          <CardHeader 
            title="Calendar" 
            subheader="Create Events and Todos and manage them easily"
            sx={{ pb: 2 }}
          />
          <Divider />
          <CardContent>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
              <ButtonGroup variant="contained" aria-label="calendar actions">
                <Button onClick={() => setOpenDatepickerModal(true)}>
                  Add event
                </Button>
                <Button onClick={() => setOpenTodoModal(true)}>
                  Create todo
                </Button>
              </ButtonGroup>
            </Box>
            <AddEventModal
              open={openSlot}
              handleClose={handleClose}
              eventFormData={eventFormData}
              setEventFormData={setEventFormData}
              onAddEvent={onAddEvent}
              todos={todos}
            />
            <AddDatePickerEventModal
              open={openDatepickerModal}
              handleClose={handleDatePickerClose}
              datePickerEventFormData={datePickerEventFormData}
              setDatePickerEventFormData={setDatePickerEventFormData}
              onAddEvent={onAddEventFromDatePicker}
              todos={todos}
            />
            <EventInfoModal
              open={eventInfoModal}
              handleClose={() => setEventInfoModal(false)}
              onDeleteEvent={onDeleteEvent}
              currentEvent={currentEvent as IEventInfo}
            />
            <AddTodoModal
              open={openTodoModal}
              handleClose={() => setOpenTodoModal(false)}
              todos={todos}
              setTodos={setTodos}
            />
            <Calendar
              localizer={localizer}
              events={events}
              onSelectEvent={handleSelectEvent}
              onSelectSlot={handleSelectSlot}
              selectable
              startAccessor="start"
              components={{ event: EventInfo }}
              endAccessor="end"
              defaultView="week"
              eventPropGetter={(event: IEventInfo) => {
                const hasTodo = todos.find((todo) => todo._id === event.todoId)
                return {
                  style: {
                    backgroundColor: hasTodo ? hasTodo.color : theme.palette.primary.main,
                    borderColor: hasTodo ? hasTodo.color : theme.palette.primary.main,
                    color: theme.palette.primary.contrastText,
                    borderRadius: '4px',
                    border: 'none',
                    display: 'block',
                    padding: '2px 5px',
                  },
                }
              }}
              style={{
                height: 900,
              }}
            />
          </CardContent>
        </Card>
      </Container>
    </Box>
  )
}

export default EventCalendar
