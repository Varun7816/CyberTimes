"use client";
import { useState } from "react";
import zeroDays from "@/data/zero-days.json";
import Link from "next/link";

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

export default function ZeroDaysPage() {
  const [visibleCount, setVisibleCount] = useState(6);

  const handleViewMore = () => {
    setVisibleCount((prev) => Math.min(prev + 6, zeroDays.length));
  };

  const sortedZeroDays = zeroDays.sort(
    (a, b) => new Date(b.metadata.date) - new Date(a.metadata.date)
  );

  return (
    <main className="bg-gray-50 min-h-screen">
      {/* Page Header */}
      <section className="bg-white border-b border-gray-200 py-14 px-4 sm:px-8">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl font-semibold text-gray-900 mb-3 tracking-tight">
            ⚡ Zero-Day Vulnerabilities
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto leading-relaxed">
            Stay updated on the latest zero-day vulnerabilities and critical
            security flaws — curated for cybersecurity professionals.
          </p>
        </div>
      </section>

      {/* Main Layout */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-12 py-16 px-6 sm:px-10 lg:px-12">
        {/* Left Column: Articles */}
        <section className="space-y-10">
          {sortedZeroDays.slice(0, visibleCount).map((article) => (
            <article
              key={article.metadata.url_slug}
              className="bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h2 className="text-xl font-bold text-gray-900 leading-snug">
                    <Link
                      href={`/zero-days/${article.metadata.url_slug}`}
                      className="hover:text-blue-700"
                    >
                      {article.metadata.meta_title}
                    </Link>
                  </h2>
                  <span className="ml-2 px-2 py-0.5 bg-red-600 text-white text-xs rounded font-medium">
                    Zero-Day
                  </span>
                </div>

                <div className="text-xs text-gray-500 font-medium mb-4">
                  {article.metadata.date && <>🗓️ {formatDate(article.metadata.date)}</>}
                </div>

                <p className="text-gray-700 text-base leading-relaxed mb-4 line-clamp-3">
                  {article.metadata.meta_description}
                </p>

                <Link
                  href={`/zero-days/${article.metadata.url_slug}`}
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
          {visibleCount < sortedZeroDays.length && (
            <div className="flex justify-center mt-8">
              <button
                onClick={handleViewMore}
                className="px-8 py-2.5 bg-blue-700 text-white rounded-full text-sm font-medium hover:bg-blue-800 transition-all shadow-sm"
              >
                Load More Articles
              </button>
            </div>
          )}
        </section>

        {/* Right Column: Sidebar */}
        <aside className="hidden lg:flex flex-col space-y-8">
          {/* Reserved Ad Space #1 */}
          <div className="h-56 w-full rounded-2xl" aria-hidden="true"></div>

          {/* Trending Zero-Days Section */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <h3 className="text-base font-semibold text-gray-800 mb-4">
              🔥 Trending Zero-Days
            </h3>
            <ul className="space-y-3 text-sm text-gray-700">
              {sortedZeroDays.slice(0, 5).map((a, i) => (
                <li key={i}>
                  <Link
                    href={`/zero-days/${a.metadata.url_slug}`}
                    className="hover:text-blue-700 hover:underline"
                  >
                    {a.metadata.meta_title.slice(0, 65)}...
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
              Get curated zero-day alerts delivered to your inbox.
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
