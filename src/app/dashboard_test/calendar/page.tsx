'use client';
import * as React from "react";
import {Stack, Button} from "@mui/material";
import { Scheduler } from "@aldabil/react-scheduler";
// import {
//     EventActions,
//     ProcessedEvent,
//     ViewEvent
//   } from "@aldabil/react-scheduler/types";
import axios from "axios";
import { ProcessedEvent } from "@aldabil/react-scheduler/types";

export default function Calendar(){
    const [Events, setEvents] = React.useState<ProcessedEvent[]>([]);
    const fetchEevents = async () => {
        const response = await axios.get("http://localhost:3000/api/events");
        setEvents(response.data);
    }; 
    const handleUpdate = () => {
        console.log("Sending events to server");
        console.log("Events: ", Events);
        const stringifiedEvents = JSON.parse(JSON.stringify(Events));
        console.log("Parsed Events:",stringifiedEvents);
        const payload = {
            events: stringifiedEvents,
        }
        console.log("Payload:", payload);
        axios.post("http://localhost:8000/calendar/update", payload)
        .then(response => {
            console.log('Calendar updated:', response);
        })
        .catch(error => {
        console.error('Error updating calendar:', error);
        });
        console.log("Button clicked");
        const eventsString = JSON.stringify(EVENTS);
        console.log(eventsString);
        const events = JSON.parse(eventsString);

        // Convert string dates to Date objects
        for (let i = 0; i < events.length; i++) {
            events[i].start = new Date(events[i].start);
            events[i].end = new Date(events[i].end);
            if (!events[i].type) {
                events[i].type = "personal"; // Assign a default type if none exists
            }
        }
        setEvents(events);
        // console.log(events);
    };
    const handleRefresh = () => {
        console.log("Button cicked");
        console.log("Events:", JSON.stringify(Events));
        axios.get("http://localhost:8000/calendar/")
        .then(response => {
            console.log('Calendar refreshed:', response);
            const returnedEvents = response.data;
            const events = JSON.parse(JSON.stringify(returnedEvents));
            for (let i = 0; i < events.length; i++) {
                events[i].start = new Date(events[i].start);
                events[i].end = new Date(events[i].end);
                if (!events[i].type) {
                    events[i].type = "personal"; // Assign a default type if none exists
                }
            }
            setEvents(events);
        })
        .catch(error => {
            console.error('Error refreshing calendar:', error);
        }
        )
    };
    // const fetchRemote = async (query: ViewEvent): Promise<ProcessedEvent[]> => {
    //     console.log({ query });
    //     /**Simulate fetchin remote data */
    //     return new Promise((res) => {
    //       setTimeout(() => {
    //         res(EVENTS);
    //       }, 3000);
    //     });
    //   };
    const EVENTS: ProcessedEvent[] =[
                {
                    event_id: 1,
                    title: "Event 1",
                    start: new Date("2025/3/5 09:30"),
                    end: new Date("2025/3/5 10:30"),
                    type: "global",
                },
                // {
                //     event_id: 2,
                //     title: "Event 2",
                //     start: new Date("2021/5/4 10:00"),
                //     end: new Date("2021/5/4 11:00"),
                //     type: "global"
                // },
            ];
    return (
        <Stack spacing={2}>
        <Scheduler
            view="month"
            events={Events}
        />
        <Button onClick={handleUpdate}>Update Calendar</Button>
        <Button onClick={handleRefresh}>Refresh Calendar</Button>
        </Stack>
    );
}