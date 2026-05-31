import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function BranchCard({ branch, accentColor }) {
  const navigate = useNavigate();

  return (
    <div 
      className="group relative overflow-hidden rounded-2xl bg-card border shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl cursor-pointer flex flex-col items-center p-8 text-center"
      onClick={() => navigate(`/${branch.name.toLowerCase()}/login`)}
      style={{ '--tw-ring-color': accentColor }}
    >
      <div 
        className="w-20 h-20 rounded-full flex items-center justify-center mb-6 transition-transform group-hover:scale-110"
        style={{ backgroundColor: `${accentColor}20`, color: accentColor }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
          <polyline points="9 22 9 12 15 12 15 22"></polyline>
        </svg>
      </div>
      <h3 className="text-2xl font-bold mb-2 text-foreground">{branch.display_name}</h3>
      <p className="text-muted-foreground mb-6">Access the business management portal for {branch.display_name}.</p>
      
      <button 
        className="px-6 py-2 rounded-full font-medium text-white shadow-md transition-opacity group-hover:opacity-90"
        style={{ backgroundColor: accentColor }}
      >
        Enter Portal
      </button>
    </div>
  );
}
