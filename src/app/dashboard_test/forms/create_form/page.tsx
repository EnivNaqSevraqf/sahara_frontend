'use client';
import { Button, TextField, Typography } from "@mui/material";
import MuiCard from "@mui/material/Card";
import * as React from "react";
import Box from '@mui/material/Box';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { styled } from '@mui/material/styles';
import axios from 'axios';
import dayjs, { Dayjs } from "dayjs";
import { currentConfig } from '@/config';

const Card = styled(MuiCard)(({ theme }) => ({  
    display: 'flex',
    flexDirection: 'column',
    alignSelf: 'center',
    width: '100%',
    padding: theme.spacing(4),
    gap: theme.spacing(2),
    margin: 'auto',
    borderRadius: theme.spacing(2),
    [theme.breakpoints.up('sm')]: {
      maxWidth: '600px',
    },
    boxShadow:
      'hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px',
    ...theme.applyStyles('dark', {
      boxShadow:
        'hsla(220, 30%, 5%, 0.5) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.08) 0px 15px 35px -5px',
    }),
  }));


export default function Page() {
    // const [selectedDate, handleDateChange] = React.useState(new Date());
    const [selectedDate, handleDateChange] = React.useState<Dayjs | null>(dayjs().endOf('day'));
    const [jsonInput, setJsonInput] = React.useState('');
    const [formTitle, setFormTitle] = React.useState('');

    async function handleSubmit() {
        if(selectedDate === null) {
            console.error('Invalid date selected');
            return;
        }
        try{
            const json_data = JSON.parse(jsonInput);
        
            const payload = {
                title: formTitle,
                form_json: json_data,
                deadline: selectedDate.toISOString(),
            };

            try {
                const config = {
                    headers: {
                        'Authorization': 'Bearer ' + localStorage.getItem('token'),
                        'Content-Type': 'application/json',
                    }
                }
                const response = await axios.post(`${currentConfig.apiBaseUrl}/api/forms/create`, payload, config);
                console.log('Response:', response.data);
            } catch (error) {
                console.error('Error submitting form:', error);
            }
        } catch (error) {
            // TODO: Add invalid json error toast or something
            console.error('Error parsing JSON:', error);
        }
    }

    return (
        <Card>
        <Box sx = {{
            backgroundColor: 'background.paper',
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            maxWidth: '600px',
            padding: '20px',
        }}>
            <Typography component="h1">
                Create Quiz
            </Typography>
            <TextField 
                id="outlined-basic" 
                label="Form Title" 
                variant="outlined" 
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
            />
            <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DateTimePicker 
                    label="Set Deadline" 
                    value={selectedDate}
                    onChange={handleDateChange}
                />
            </LocalizationProvider>
            <TextField
                id="json-input"
                label="JSON Input"
                variant="outlined"
                multiline
                rows={4}
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
            />
            <Button onClick={handleSubmit}> Submit </Button>
        </Box>
        </Card>
    )
};
