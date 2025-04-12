'use client';
import * as React from "react";
import {Stack, Button, Grid, Card, CardContent, Typography, Snackbar, Alert} from "@mui/material";
import { Scheduler } from "@aldabil/react-scheduler";
// import {
//     EventActions,
//     ProcessedEvent,
//     ViewEvent
//   } from "@aldabil/react-scheduler/types";
import axios from "axios";
import { RemoteQuery, EventActions, ProcessedEvent } from "@aldabil/react-scheduler/types";
import { currentConfig } from '@/config';
import { headers } from "next/headers";
import { Router } from "next/router";
// Configure axios base URL
axios.defaults.baseURL = currentConfig.apiBaseUrl;
const profColor = "#0044ff"; // Red color for prof events
const teamColor = "#00ff99"; // Green color for team events
const personalColor = "#ffb300"; // Blue color for personal events

export default function Calendar(){
    const [Events, setEvents] = React.useState<ProcessedEvent[]>([]);
    const [role, setRole] = React.useState<string>("");
    const [userId, setUserId] = React.useState<string>("");
    const [fields, setFields] = React.useState<any[] | null>(null);
    
    // Snackbar states
    const [snackbarOpen, setSnackbarOpen] = React.useState(false);
    const [snackbarMessage, setSnackbarMessage] = React.useState("");
    const [snackbarSeverity, setSnackbarSeverity] = React.useState<"success" | "error" | "info" | "warning">("success");

    // Snackbar handlers
    const handleSnackbarClose = () => {
        setSnackbarOpen(false);
    };

    const showSnackbar = (message: string, severity: "success" | "error" | "info" | "warning") => {
        setSnackbarMessage(message);
        setSnackbarSeverity(severity);
        setSnackbarOpen(true);
    };

    const fetchEevents =  async (query: RemoteQuery): Promise<ProcessedEvent[]> => {
        const role = localStorage.getItem("role");
        const token = localStorage.getItem("token");
        const config = {
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("token")}`,
                "Content-Type": "application/json",
            },
        }
        const response = await axios.get(`${currentConfig.apiBaseUrl}/calendar/`, config);
        const returnedEvents = response.data;
        const events = JSON.parse(JSON.stringify(returnedEvents));
        for (let i = 0; i < events.length; i++) {
            events[i].start = new Date(events[i].start);
            events[i].end = new Date(events[i].end);
            if (!events[i].type) {
                events[i].type = "personal"; // Assign a default type if none exists
            }

            if(events[i].type === "global"){
                if(role != "prof") {
                    events[i].editable = false; // Disable editing for non-admin users
                    events[i].deletable = false; // Disable deletion for non-admin users
                }
                events[i].color = profColor; // Red color for global events
            }
            else if(events[i].type === "team"){
                events[i].color = teamColor; // Green color for team events
            }
            else if(events[i].type === "personal"){
                events[i].color = personalColor; // Blue color for personal events
            }
        }
        setEvents(events);  
        // setEvents(response.data);

        return events;
    };  
    const handleRefresh = () => {
        console.log("Button cicked");
        console.log("Events:", JSON.stringify(Events));
        axios.get(`${currentConfig.apiBaseUrl}/calendar/`)
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

    const handleConfirm = async (
        event: ProcessedEvent,
        action: EventActions) : Promise<ProcessedEvent> => {
        console.log("Event confirmed:", event);
        console.log("Action:", action);
        console.log("Event ID:", event.event_id);
        event.color = event.type === "global" ? profColor : event.type === "team" ? teamColor : personalColor;
        
        return new Promise((res, rej) => {
            if (action === "edit") {
              console.log("Edited event:", event);
              console.log("Event id:", event.event_id.toString().charAt(0));
              // Disallow changing the event type
              if(event.event_id.toString().charAt(0) === "g" && event.type !== "global"){
                showSnackbar("You cannot change the type of events", "error");
                rej("You cannot change the type events");
                return;
              }
              if(event.event_id.toString().charAt(0) === "t" && event.type !== "team"){
                showSnackbar("You cannot change the type of events", "error");
                rej("You cannot change the type of events");
                return;
              }
              if(event.event_id.toString().charAt(0) === "p" && event.type !== "personal"){
                showSnackbar("You cannot change the type of events", "error");
                rej("You cannot change the type of events");
                return;
              }

              const config = {
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("token")}`,
                    "Content-Type": "application/json",
                }
              }
              /**PUT event to remote DB */
              
              axios.put(`${currentConfig.apiBaseUrl}/calendar/update`, event, config)
                .then(response => {
                  console.log('Event updated:', response);
                  showSnackbar("Event updated successfully", "success");
                  res({
                    ...event,
                  });
                })
                .catch(error => {
                  console.error('Error updating event:', error);
                  showSnackbar("Failed to update event: " + (error.response?.data?.message || error.message), "error");
                  rej("Failed to update event");
                });
            } else if (action === "create") {
                console.log("Created event:", event);
                const token = localStorage.getItem("token");
                const config = {
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json",
                    }
                }
                axios.post(`${currentConfig.apiBaseUrl}/calendar/create`, event, config)
                .then(response => {
                    console.log('Event created:', response);
                    showSnackbar("Event created successfully", "success");
                    res({
                        ...event,
                        event_id: response.data.event.id || Math.random(),
                    });
                })
                .catch(error => {
                    console.error('Error creating event:', error);
                    showSnackbar("Failed to create event: " + (error.response?.data?.message || error.message), "error");
                    rej("Failed to create event");
                });
              /**POST event to remote DB */
            }
          });
    }
    const handleDelete = async (deletedId: string) => {
        
        console.log("Deleting event with ID:", deletedId);

        const token = localStorage.getItem("token");
        const config = {
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            }
        }
        return axios.delete(`${currentConfig.apiBaseUrl}/calendar/delete/${deletedId}`, config)
            .then(response => {
                console.log('Event deleted:', response);
                return deletedId;
            })
            .catch(error => {
                console.error('Error deleting event:', error);
                throw new Error("Failed to delete event");
            });
    }
    // const fetchRemote = async (query: ViewEvent): Promise<ProcessedEvent[]> => {
    //     console.log({ query });
    //     /**Simulate fetchin remote data */
    //     return new Promise((res) => {
    //       setTimeout(() => {
    //         res(EVENTS);
    //       }, 3000);
    //     });
    //   };
    // const EVENTS: ProcessedEvent[] =[
    //             {
    //                 event_id: 1,
    //                 title: "Event 1",
    //                 start: new Date("2025/3/5 09:30"),
    //                 end: new Date("2025/3/5 10:30"),
    //                 type: "global",
    //             },
    //         ];

    React.useEffect(() => {
        const role = localStorage.getItem("role");
        const userId = localStorage.getItem("userId");
        setRole(role || "");
        setUserId(userId || "");
        console.log("Role:", role);
        console.log("User ID:", userId);
        console.log("Updated fields:", fields);
        if (role === "prof" || role === "admin") {
            setFields([
                { name: "type", type: "select", options: [
                    { id: 1, text: "Personal", value: "personal" },
                    { id: 3, text: "Global", value: "global" },
                  ], 
                  config: { label: "Type", required: true, errMsg: "Please select a type" },
                },
                  
            ]);
        }
        else if (role === "student") {
            setFields([
                { name: "type", type: "select", options: [
                    { id: 1, text: "Personal", value: "personal" },
                    { id: 2, text: "Team", value: "team" },
                  ], 
                  config: { label: "Type", required: true, errMsg: "Please select a type" },
                },
                  
            ]);
        }
        else if (role === "ta") {
            setFields([
                { name: "type", type: "select", options: [
                    { id: 1, text: "Personal", value: "personal" },
                    { id: 2, text: "Team", value: "team" },
                  ], 
                  config: { label: "Type", required: true, errMsg: "Please select a type" },
                },
                  
            ]);
        }
        else{
            // Logout the user if role is not founder or admin
        }

    }, []);


    return (
        <Stack spacing={2}>
            <Grid container spacing={3} sx={{ mb: 2 }}>
                <Grid item xs={12} md={4}>
                    <Card sx={{ 
                        height: '100%',
                        background: 'linear-gradient(135deg, #0044ff 0%, #2979FF 100%)',
                        boxShadow: '0 4px 20px rgba(0, 68, 255, 0.2)',
                        borderRadius: 2,
                        color: 'white'
                    }}>
                        <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <div style={{ width: 20, height: 20, backgroundColor: profColor, borderRadius: '50%', border: '2px solid rgba(255, 255, 255, 0.8)' }}></div>
                            <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                Global Events
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Card sx={{ 
                        height: '100%',
                        background: 'linear-gradient(135deg, #00ff99 0%, #00CC77 100%)',
                        boxShadow: '0 4px 20px rgba(0, 255, 153, 0.2)',
                        borderRadius: 2,
                        color: 'white'
                    }}>
                        <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <div style={{ width: 20, height: 20, backgroundColor: teamColor, borderRadius: '50%', border: '2px solid rgba(255, 255, 255, 0.8)' }}></div>
                            <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                Team Events
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Card sx={{ 
                        height: '100%',
                        background: 'linear-gradient(135deg, #ffb300 0%, #FF9800 100%)',
                        boxShadow: '0 4px 20px rgba(255, 179, 0, 0.2)',
                        borderRadius: 2,
                        color: 'white'
                    }}>
                        <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <div style={{ width: 20, height: 20, backgroundColor: personalColor, borderRadius: '50%', border: '2px solid rgba(255, 255, 255, 0.8)' }}></div>
                            <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                Personal Events
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {fields != null && <Scheduler
                view="month"
                getRemoteEvents={fetchEevents}
                events={Events}
                onDelete={handleDelete}
                onConfirm={handleConfirm}
                fields={fields}
            />}
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={6000}
                onClose={handleSnackbarClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </Stack>
    );
}