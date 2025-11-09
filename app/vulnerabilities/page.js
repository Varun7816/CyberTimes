"use client";

import Link from "next/link";
import vulnerabilitiesData from "../../data/vulnerabilities.json";

import React, { useState } from "react";
const validVulns = Array.isArray(vulnerabilitiesData)
  ? vulnerabilitiesData.filter(
      (it) =>
        it &&
        it.metadata &&
        typeof it.metadata.url_slug === "string" &&
        it.metadata.url_slug.trim() !== ""
    )
  : [];

function formatDate(dateStr) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  if (isNaN(date)) return dateStr;
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function VulnerabilitiesPage() {
  const [visibleCount, setVisibleCount] = useState(6);

  const handleViewMore = () => {
    setVisibleCount((prev) => Math.min(prev + 6, validVulns.length));
  };

  const sorted = [...validVulns].sort(
    (a, b) => new Date(b.metadata?.date || 0) - new Date(a.metadata?.date || 0)
  );

  return (
    <main className="bg-gray-50 min-h-screen">
      {/* Hero Section */}
      <section className="bg-white border-b border-gray-200 py-14 px-4 sm:px-8">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl font-semibold text-gray-900 mb-3">
            🛡️ Vulnerability Insights Hub
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto leading-relaxed">
            Stay updated with the latest vulnerabilities, exploits, and threat intelligence curated for security professionals.
          </p>
        </div>
      </section>

      {/* Main Layout */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-12 py-16 px-6 sm:px-10 lg:px-12">
        {/* Left Column: Articles */}
        <section className="space-y-10">
          {sorted
            .filter((v) => v && v.metadata && v.metadata.url_slug)
            .slice(0, visibleCount)
            .map((vuln) => (
              <article
                key={vuln.metadata.url_slug}
                className="group bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 overflow-hidden"
              >
                <div className="p-7">
                  <h2 className="text-xl font-bold text-gray-900 mb-2 leading-snug group-hover:text-blue-700 transition-colors">
                    <Link href={`/vulnerabilities/${vuln.metadata.url_slug}`}>
                      {vuln.metadata.meta_title}
                    </Link>
                  </h2>

                  <div className="flex flex-wrap items-center text-xs text-gray-500 font-medium mb-3 gap-3">
                    {vuln.metadata.date && (
                      <span className="flex items-center gap-1">
                        🗓️ {formatDate(vuln.metadata.date)}
                      </span>
                    )}
                    {vuln.metadata.severity && (
                      <span
                        className={`ml-2 px-2 py-0.5 text-xs rounded font-semibold text-white ${
                          vuln.metadata.severity === "High"
                            ? "bg-red-600"
                            : vuln.metadata.severity === "Medium"
                            ? "bg-yellow-500"
                            : "bg-green-600"
                        }`}
                      >
                        {vuln.metadata.severity}
                      </span>
                    )}
                  </div>

                  <p className="text-gray-700 text-base leading-relaxed mb-4 text-justify">
                    {vuln.metadata.meta_description}
                  </p>

                  <Link
                    href={`/vulnerabilities/${vuln.metadata.url_slug}`}
                    className="inline-flex items-center text-blue-700 font-medium hover:underline text-sm"
                  >
                    Read More
                    <span className="ml-1 group-hover:translate-x-1 transition-transform">
                      →
                    </span>
                  </Link>
                </div>
              </article>
            ))}

          {/* View More Button */}
          {visibleCount < sorted.length && (
            <div className="flex justify-center mt-8">
              <button
                onClick={handleViewMore}
                className="px-8 py-2.5 bg-blue-700 text-white rounded-full text-sm font-medium hover:bg-blue-800 transition-all shadow-sm"
              >
                Load More Vulnerabilities
              </button>
            </div>
          )}
        </section>

        {/* Right Column (Sidebar) */}
        <aside className="hidden lg:flex flex-col space-y-8">
          {/* Reserved Ad Space #1 */}
          <div className="h-56 w-full rounded-2xl" aria-hidden="true"></div>

          {/* Trending Vulnerabilities Section */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <h3 className="text-base font-semibold text-gray-800 mb-4">
              🔥 Trending Vulnerabilities
            </h3>
            <ul className="space-y-3 text-sm text-gray-700">
              {validVulns.slice(0, 5).map((a, i) => (
                <li key={i}>
                  <Link
                    href={`/vulnerabilities/${a.metadata.url_slug}`}
                    className="hover:text-blue-700 hover:underline"
                  >
                    {a.metadata.meta_title?.slice(0, 65) ?? a.metadata.meta_title}...
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Reserved Ad Space #2 */}
          <div className="h-56 w-full rounded-2xl" aria-hidden="true"></div>

          {/* Newsletter Signup */}
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 shadow-sm">
            <h3 className="text-base font-semibold text-blue-900 mb-2">
              📨 Subscribe for Weekly Threat Intel
            </h3>
            <p className="text-sm text-blue-800 mb-4">
              Get curated vulnerability alerts delivered to your inbox.
            </p>
            <form className="flex">
              <input
                type="email"
                placeholder="you@example.com"
                className="flex-1 px-3 py-2 border border-blue-200 rounded-l-md text-sm focus:outline-none"
              />
              <button
                type="submit"
                className="bg-blue-700 text-white px-4 py-2 rounded-r-md text-sm hover:bg-blue-800"
              >
                Subscribe
              </button>
            </form>
          </div>
        </aside>
      </div>
    </main>
  );
}
