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
      ) : null}
    </main>
  );
}