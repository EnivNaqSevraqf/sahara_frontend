'use client';
import React from 'react';
import { useRouter } from 'next/navigation';

interface ButtonProps {
  text: string;
  path: string;
}

const ProjectButton: React.FC<ButtonProps> = ({ text, path }) => {
  const router = useRouter();
  
  const handleClick = () => {
    router.push(path);
  };
  
  return (
    <button
      onClick={handleClick}
      className="w-full py-3 px-6 mb-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200 text-lg"
    >
      {text}
    </button>
  );
};

const DashboardProjectPage: React.FC = () => {
  const baseUrl = "http://localhost:3000/dashboard_test/project";
  
  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Project Dashboard</h1>
      
      <div className="space-y-4">
        <ProjectButton 
          text="Project Submission" 
          path={`${baseUrl}/submission`}
        />
        
        <ProjectButton 
          text="Submit Github Link" 
          path={`${baseUrl}/github`}
        />
      </div>
    </div>
  );
};

export default DashboardProjectPage;