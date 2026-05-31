import React, { useState, useEffect } from 'react';

export default function GenericDashboard({ title, branchName }) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
          <p className="text-muted-foreground">{branchName} Branch</p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          <div className="h-32 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="h-40 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse"></div>
            <div className="h-40 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse"></div>
            <div className="h-40 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse"></div>
          </div>
          <div className="h-64 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse"></div>
        </div>
      ) : (
        <div className="p-8 border border-dashed border-gray-300 dark:border-gray-700 rounded-xl text-center text-muted-foreground">
          <p>This module is currently a placeholder and will be implemented in future phases.</p>
        </div>
      )}
    </div>
  );
}
