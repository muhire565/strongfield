import React from 'react';
import LoginForm from '../../components/auth/LoginForm';

export default function MainLogin() {
  return (
    <div className="min-h-screen w-full flex">
      {/* Left — Image */}
      <div
        className="hidden lg:flex w-1/2 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/login.png')" }}
      />

      {/* Right — Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-background p-6">
        <LoginForm branchName="MAIN" accentColor="#14b8a6" />
      </div>
    </div>
  );
}
