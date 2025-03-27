'use client';
import React from 'react';
import { useRouter } from 'next/navigation';

interface ProjectButtonProps {
  text: string;
  path: string;
}

const ProjectButton: React.FC<ProjectButtonProps> = ({ text, path }) => {
  const router = useRouter();
  
  return (
    <button
      onClick={() => router.push(path)}
      className="w-full p-4 text-left bg-white shadow-md rounded-lg hover:shadow-lg transition-shadow"
    >
      {text}
    </button>
  );
};

const DashboardProjectPage: React.FC = () => {
  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Project Dashboard</h1>
      
      <div className="space-y-4">
        <ProjectButton 
          text="Project Submission" 
          path="/dashboard_test/project/submission"
        />
        
        <ProjectButton 
          text="Submit Github Link" 
          path="/dashboard_test/project/github"
        />
      </div>
    </div>
  );
};

export default DashboardProjectPage;