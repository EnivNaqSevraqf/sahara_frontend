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

  // Handle survey completion
  survey.onComplete.add((sender) => {
    console.log("Survey results:", sender.data);
    console.log("Correct answers:", sender.correctAnswersCount);
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