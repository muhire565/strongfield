import React, { useState } from 'react';
import { Home as HomeIcon, Building2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function BranchCard({ branch, accentColor, icon: Icon }) {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(`/${branch.name.toLowerCase()}/login`)}
      className="group relative flex flex-col items-center text-center w-full sm:w-80 md:w-96
                 rounded-[28px] border border-white/[0.2] bg-white/[0.08] backdrop-blur-[20px]
                 p-10 transition-all duration-300 ease-out
                 hover:-translate-y-2 hover:bg-white/[0.12]
                 hover:shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)]
                 cursor-pointer"
    >
      {/* Glow ring */}
      <div
        className="w-20 h-20 rounded-full flex items-center justify-center mb-6
                   transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg"
        style={{
          border: `2px solid ${accentColor}`,
          color: accentColor,
          boxShadow: `0 0 20px -5px ${accentColor}40`,
        }}
      >
        <Icon className="w-8 h-8" />
      </div>

      <h3 className="text-2xl font-bold mb-2 text-white tracking-wide drop-shadow-md">
        {branch.display_name}
      </h3>
      <p className="text-sm text-white/70 mb-8 leading-relaxed max-w-[16rem]">
        Access the business management portal for {branch.display_name}
      </p>

      <span
        className="px-8 py-3 rounded-full font-semibold text-white text-sm
                   transition-all duration-300 ease-out
                   group-hover:scale-105 group-hover:shadow-[0_0_24px_-4px_var(--glow)]"
        style={{
          backgroundColor: accentColor,
          '--glow': accentColor,
        }}
      >
        Enter Portal
      </span>
    </button>
  );
}

export default function Home() {
  const [branches] = useState([
    { id: '1', name: 'HIGHWAY', display_name: 'Highway Branch' },
    { id: '2', name: 'MAIN', display_name: 'Main Branch' }
  ]);

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden">
      {/* Full-screen background */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/login.png')" }}
      />

      {/* Dark cinematic overlay */}
      <div className="absolute inset-0 bg-black/60" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center px-6 py-16 w-full">
        {/* Hero */}
        <div className="text-center mb-14">
         
          <p className="text-lg md:text-xl text-white/80 font-medium drop-shadow-sm">
            Select your branch to continue
          </p>
        </div>

        {/* Branch cards */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-8 w-full max-w-5xl">
          <BranchCard
            branch={branches.find((b) => b.name === 'HIGHWAY')}
            accentColor="#3b82f6"
            icon={HomeIcon}
          />
          <BranchCard
            branch={branches.find((b) => b.name === 'MAIN')}
            accentColor="#14b8a6"
            icon={Building2}
          />
        </div>
      </div>
    </div>
  );
}
