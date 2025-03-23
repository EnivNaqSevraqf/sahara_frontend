'use client';
import React, { useEffect } from "react";
import axios from 'axios';
import { Model } from "survey-core";
import { Survey } from "survey-react-ui";
import { Box } from "@mui/material";
import Sidebar from "@/components/Sidebar";
import "survey-core/survey-core.css";
import { LayeredDarkPanelless } from "survey-core/themes";
import { ContrastLight } from "survey-core/themes";


interface QuizViewerProps {
  params: {
    id: string;
  };
}

export default function QuizViewer({ id }: { id: string }) {
  // const { id } = params;

  const [surveyJson, setSurveyJson] = React.useState(null);

  React.useEffect(() => {
    const fetchSurveyJson = async () => {
      try {
        console.log("Fetching the survey JSON");
        const response = await axios.get(`http://localhost:8000/api/forms/${id}`);
        setSurveyJson(response.data);
      } catch (error) {
        console.error('Error fetching survey JSON:', error);
      }
    };

    fetchSurveyJson();
  }, [id]);

  if (!surveyJson) {
    return <div>Loading...</div>;
  }
  const survey = new Model(surveyJson);
  survey.applyTheme(ContrastLight);
  // survey.mode = "display";
  // survey.data = { "question1": "Option 1", "question2": "Choice 2"};

  // Handle survey completion
  survey.onComplete.add((survey, options) => {
    options.showSaveInProgress();
    const surveyServiceUrl = "http://localhost:8000";
    const dataObj = { form_id: id, response: survey.data, user_id: "123" };
    const dataStr = JSON.stringify(dataObj);
    const headers = new Headers({ "Content-Type": "application/json; charset=utf-8" });
    survey.mode = "display";
    
    // survey.data = survey.data;
    // console.log(survey.data);
    // useEffect(() => {
    const payload = {
      form_id: id,
      response_data: survey.data,
      user_id: "123"
    }
    axios.post('http://localhost:8000/api/forms/submit', payload)
      .then(response => {
        options.showSaveSuccess();
      })
      .catch(error => {
        options.showSaveError();
        console.error('Error fetching quizzes:', error);
      });
    // }, []);
    // axios.post('http://localhost:8000/api/forms/submit');
    
    // fetch(surveyServiceUrl + "/api/forms/submit", {
    //   method: "POST",
    //   body: dataStr,
    //   headers: headers
    // }).then(response => {
    //   if (!response.ok) {
    //     throw new Error("Could not post the survey results");
    //   }
    //   // Display the "Success" message (pass a string value to display a custom message)
    //   options.showSaveSuccess();
    //   // Alternatively, you can clear all messages:
    //   // options.clearSaveMessages();
    // }).catch(error => {
    //   // Display the "Error" message (pass a string value to display a custom message)
    //   options.showSaveError();
    //   console.log(error);
    //   console.log(error.detail);
    // });
  });

  return (
    <Box display="flex">
      <Sidebar />
      <Box 
        flexGrow={1} 
        p={3}
        sx={{ 
          backgroundColor: "#f9f9f9",
          "& .sv-root-modern": {
            maxWidth: "100%"
          }
        }}
      >
        <Survey model={survey} />
      </Box>
    </Box>
  );
}