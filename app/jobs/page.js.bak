"use client";
import { useState, useMemo } from "react";
import Link from "next/link";
import jobs from "@/data/jobs.json";

function parseDateDMY(s) {
  if (!s) return new Date(0);
  const parts = String(s).split("-"); // expect "dd-mm-yyyy"
  if (parts.length !== 3) return new Date(s);
  const [d, m, y] = parts;
  return new Date(`${y}-${m}-${d}`);
}

const sortedJobs = [...jobs].sort((a, b) => {
  return parseDateDMY(b.postedDate) - parseDateDMY(a.postedDate);
});

// helper: tokenize & normalize a string into lower-case tokens
function normalizeTokens(s = "") {
  return String(s || "")
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean);
}

export default function JobsPage() {
  const [searchTerm, setSearchTerm] = useState("");

  // Filter logic: use sortedJobs order (do not re-sort here)
  const filteredJobs = useMemo(() => {
    const term = (searchTerm || "").toLowerCase().trim();
    return [...sortedJobs].filter((job) => {
      if (!term) return true;
      const haystack = (
        (job.title || "") +
        " " +
        (job.company || "") +
        " " +
        (job.description || "") +
        " " +
        (job.preferredKnowledge || "") +
        " " +
        (job.additionalInfo || "") +
        " " +
        (Array.isArray(job.responsibilities) ? job.responsibilities.join(" ") : "") +
        " " +
        (Array.isArray(job.tags) ? job.tags.join(" ") : "") +
        " " +
        (job.location || "")
      ).toLowerCase();
      return haystack.includes(term);
    });
  }, [searchTerm, sortedJobs]);

  return (
    <main className="max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      {/* Header Section */}
      <section className="text-center mb-10">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-3 tracking-tight">
          🔒 Cyber Security Jobs
        </h1>
        <p className="text-gray-600 text-lg">
          Discover your next opportunity in the world of cyber defense and intelligence.
        </p>
      </section>

      {/* Search + Filter Bar */}
      <div className="mb-12 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Search */}
        <div className="relative w-full sm:w-1/2">
          <input
            type="text"
            placeholder="Search jobs, companies, or skills..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-4 text-gray-800 shadow-sm focus:border-black focus:ring-2 focus:ring-black transition"
          />
          <span className="absolute left-3 top-2.5 text-gray-400 text-lg">🔍</span>
        </div>
      </div>

      {/* Job Cards Grid */}
      {filteredJobs.length === 0 ? (
        <div className="text-center text-gray-500 py-20 text-lg">
          No jobs found matching your criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredJobs.map((job) => (
            <div
              key={job.id}
              className="group bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between overflow-hidden"
            >
              {/* Card Content */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-xl font-semibold text-gray-900 group-hover:text-blue-700 transition">
                    {job.title}
                  </h2>
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-md font-medium">
                    {job.type || "Full-Time"}
                  </span>
                </div>

                <div className="text-sm text-gray-800 font-bold mb-2">
                  {job.company}
                </div>

                <div className="flex flex-wrap gap-3 text-xs text-gray-500 mb-4">
                  <span className="flex items-center gap-1">📍 {job.location}</span>
                  <span className="flex items-center gap-1">💼 {job.workingModel}</span>
                  <span className="flex items-center gap-1">🕑 {job.experience}</span>
                </div>

                <p className="text-gray-700 text-sm leading-relaxed">
                  {job.description
                    ? job.description.length > 150
                      ? job.description.slice(0, 150) + "..."
                      : job.description
                    : ""}
                </p>
              </div>

              {/* Footer */}
              <div className="bg-gray-50 border-t border-gray-100 px-6 py-4 flex items-center justify-between">
                <span className="text-xs text-gray-500">🗓️ {job.postedDate}</span>
                <div className="flex items-center gap-3">
                  <Link
                    href={`/jobs/${job.id}`}
                    className="text-sm font-semibold bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-all"
                  >
                    View Details →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}