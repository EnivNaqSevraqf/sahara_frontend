'use client';
import React from "react";
import { Model } from "survey-core";
import { Survey } from "survey-react-ui";
import { Box } from "@mui/material";
import Sidebar from "@/components/Sidebar";
import "survey-core/survey-core.css";

interface QuizViewerProps {
  params: {
    id: string;
  };
}

export default function QuizViewer({ params }: QuizViewerProps) {
  const otherSurveyJson = {
    title: "Customer Satisfaction Survey",
    elements: [
      {
        name: "satisfaction",
        type: "radiogroup",
        title: "How satisfied are you with our service?",
        choices: ["Very satisfied", "Satisfied", "Neutral", "Unsatisfied", "Very unsatisfied"]
      },
      {
        name: "feedback",
        type: "comment",
        title: "What can we improve?"
      }
    ]
  };
  const surveyJson = {
    title: "Sample Quiz",
    showProgressBar: "bottom",
    showTimerPanel: "top",
    maxTimeToFinish: 300,
    firstPageIsStarted: true,
    startSurveyText: "Start Quiz",
    pages: [
      {
        elements: [
          {
            type: "html",
            html: "You are about to start the quiz.<br>You will have 5 minutes to complete all questions.<br>Click <b>Start Quiz</b> to begin."
          }
        ]
      },
      {
        elements: [
          {
            type: "radiogroup",
            name: "question1",
            title: "Sample Question 1",
            isRequired: true,
            choices: [
              "Option 1",
              "Option 2",
              "Option 3",
              "Option 4"
            ],
            correctAnswer: "Option 1"
          }
        ]
      },
      {
        elements: [
          {
            type: "radiogroup",
            name: "question2",
            title: "Sample Question 2",
            isRequired: true,
            choices: [
              "Choice 1",
              "Choice 2",
              "Choice 3",
              "Choice 4"
            ],
            correctAnswer: "Choice 2"
          }
        ]
      }
    ],
    completedHtml: "<h4>You got {correctAnswers} out of {questionCount} questions correct.</h4>",
    completedHtmlOnCondition: [
      {
        expression: "{correctAnswers} == 0",
        html: "<h4>Unfortunately, none of your answers are correct. Please try again.</h4>"
      },
      {
        expression: "{correctAnswers} == {questionCount}",
        html: "<h4>Congratulations! You answered all the questions correctly!</h4>"
      }
    ]
  };

  const survey = new Model(surveyJson);
  survey.mode = "display";
  survey.data = { "question1": "Option 1", "question2": "Choice 2"};
  // survey.data = { satisfaction: "Satisfied", feedback: "Great service!" };
  // survey.data = JSON.parse('{ satisfaction: "Satisfied", feedback: "Great service!" }');

  // Handle survey completion
  survey.onComplete.add((survey, options) => {
    options.showSaveInProgress();
    const surveyServiceUrl = "http://localhost:8000";
    const dataObj = { userId: "1", postId: "1", surveyResult: JSON.stringify(survey.data)};
    const dataStr = JSON.stringify(dataObj);
    const headers = new Headers({ "Content-Type": "application/json; charset=utf-8" });
    survey.mode = "display";
    // survey.data = survey.data;
    // console.log(survey.data);
    fetch(surveyServiceUrl + "/storeResult", {
      method: "POST",
      body: dataStr,
      headers: headers
    }).then(response => {
      if (!response.ok) {
        throw new Error("Could not post the survey results");
      }
      // Display the "Success" message (pass a string value to display a custom message)
      options.showSaveSuccess();
      // Alternatively, you can clear all messages:
      // options.clearSaveMessages();
    }).catch(error => {
      // Display the "Error" message (pass a string value to display a custom message)
      options.showSaveError();
      console.log(error);
      console.log(error.detail);
    });
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