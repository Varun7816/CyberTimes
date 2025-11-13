"use client";

import React, { useState } from "react";

export default function Page() {
  const [showComingSoon, setShowComingSoon] = useState(false);

  const handleLearningClick = () => setShowComingSoon(true);
  const handleEventsClick = () => setShowComingSoon(true);

  return (
    <main>
      {/* You do NOT need <Header /> here */}
      {showComingSoon ? (
        <div className="flex justify-center items-center min-h-[60vh]">
          <span className="text-6xl font-extrabold text-gray-300">Coming soon</span>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-4">Welcome to CyberTimes</h1>
          <p className="text-gray-600 mb-6">Latest highlights from Cyber Incidents, Vulnerabilities and Zero‑Days will appear here.</p>
          <div className="flex gap-4">
            <button onClick={handleLearningClick} className="px-4 py-2 bg-blue-600 text-white rounded">Learning</button>
            <button onClick={handleEventsClick} className="px-4 py-2 bg-blue-600 text-white rounded">Events</button>
          </div>
        </div>
      )}
    </main>
  );
}