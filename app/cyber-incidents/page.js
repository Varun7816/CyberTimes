"use client";

import Link from "next/link";
import rawIncidents from "@/data/cyber-incidents.json";

import React, { useMemo, useState } from "react";
function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d)) return dateStr;
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

function renderBlock(block, idx) {
  if (!block || !block.type) return null;
  switch (block.type) {
    case "paragraph":
      return (
        <p key={`blk-${idx}`} className="text-gray-700 leading-relaxed mb-4 text-justify">
          {block.text}
        </p>
      );
    case "heading": {
      const Level = block.level === 3 ? "h3" : block.level === 4 ? "h4" : "h2";
      return (
        <Level key={`blk-${idx}`} className="text-xl font-semibold text-gray-900 mb-2">
          {block.text}
        </Level>
      );
    }
    case "list":
      return (
        <ul key={`blk-${idx}`} className="list-disc list-inside mb-4 text-gray-700">
          {(block.items || []).map((it, i) => (
            <li key={`li-${i}`} className="mb-1">
              {it}
            </li>
          ))}
        </ul>
      );
    case "image":
      return (
        <div key={`blk-${idx}`} className="mb-4">
          <img src={block.src} alt={block.alt ?? ""} className="w-full rounded-md border border-gray-100" />
          {block.alt && <div className="text-xs text-gray-500 mt-1">{block.alt}</div>}
        </div>
      );
    case "quote":
      return (
        <blockquote key={`blk-${idx}`} className="border-l-4 border-gray-300 pl-4 italic text-gray-700 mb-4">
          {block.text}
        </blockquote>
      );
    default:
      return null;
  }
}

export default function CyberIncidentsPage() {
  const [visibleCount, setVisibleCount] = useState(6);

  const incidents = useMemo(() => {
    if (!Array.isArray(rawIncidents)) return [];
    return rawIncidents.map((it, idx) => {
      const meta = it.metadata ?? {};
      const slug =
        it.url_slug ??
        it.slug ??
        meta.url_slug ??
        (it.id != null ? String(it.id) : undefined) ??
        `item-${idx}`;
      const title = it.title ?? meta.meta_title ?? `Untitled ${idx}`;
      const date = it.date ?? meta.date ?? null;
      const summary =
        it.summary ??
        meta.meta_description ??
        (Array.isArray(it.article_content) && it.article_content.find((b) => b.type === "paragraph")?.text) ??
        null;

      return {
        ...it,
        __slug: String(slug),
        __title: title,
        __date: date,
        __summary: summary,
        __blocks: Array.isArray(it.article_content) ? it.article_content : [],
      };
    });
  }, []);

  const sorted = useMemo(() => {
    return incidents.slice().sort((a, b) => {
      const ta = a.__date ? new Date(a.__date).getTime() : 0;
      const tb = b.__date ? new Date(b.__date).getTime() : 0;
      return tb - ta;
    });
  }, [incidents]);

  const items = sorted; // no filtering — show all

  return (
    <main className="bg-gray-50 min-h-screen">
      <section className="bg-white border-b border-gray-200 py-8 px-6 sm:px-8">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl font-semibold text-gray-900 mb-2">🚨 Cyber Incidents & Breaches</h1>
          <p className="text-gray-600 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Track the latest cyber incidents, breaches, and major attacks impacting organizations worldwide.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-12 py-16 px-6 sm:px-10 lg:px-12">
        <section className="space-y-10">
          {items.slice(0, visibleCount).map((incident, i) => (
            <article
              key={incident.__slug ?? incident.id ?? `inc-${i}`}
              className="group bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 overflow-hidden"
            >
              <div className="p-7">
                <h2 className="text-xl font-bold text-gray-900 mb-2 leading-snug group-hover:text-blue-700 transition-colors">
                  <Link href={`/cyber-incidents/${encodeURIComponent(incident.__slug)}`}>
                    {incident.__title}
                  </Link>
                </h2>

                <div className="flex flex-wrap items-center text-xs text-gray-500 font-medium mb-3 gap-3">
                  {incident.__date && <span className="flex items-center gap-1">🗓️ {formatDate(incident.__date)}</span>}
                </div>

                {incident.__summary && (
                  <p className="text-gray-700 text-base leading-relaxed mb-4 text-justify">{incident.__summary}</p>
                )}

                {/* preview first content block(s) if no meta summary */}
                {!incident.__summary && incident.__blocks && incident.__blocks.length > 0 && (
                  <div className="text-gray-700 text-base leading-relaxed mb-4 text-justify">
                    {incident.__blocks.slice(0, 2).map((b, idx) => renderBlock(b, idx))}
                  </div>
                )}

                <Link
                  href={`/cyber-incidents/${encodeURIComponent(incident.__slug)}`}
                  className="inline-flex items-center text-blue-700 font-medium hover:underline text-sm"
                >
                  Read More <span className="ml-1 group-hover:translate-x-1 transition-transform">→</span>
                </Link>
              </div>
            </article>
          ))}

          {visibleCount < items.length && (
            <div className="flex justify-center mt-8">
              <button
                onClick={() => setVisibleCount((p) => Math.min(p + 6, items.length))}
                className="px-8 py-2.5 bg-blue-700 text-white rounded-full text-sm font-medium hover:bg-blue-800 transition-all shadow-sm"
              >
                Load More Incidents
              </button>
            </div>
          )}

          {items.length === 0 && <div className="text-gray-500">No incidents available.</div>}
        </section>

        <aside className="hidden lg:flex flex-col space-y-8">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <h3 className="text-base font-semibold text-gray-800 mb-4">🔥 Trending Incidents</h3>
            <ul className="space-y-3 text-sm text-gray-700">
              {sorted.slice(0, 5).map((a, i) => (
                <li key={a.__slug ?? a.id ?? `trend-${i}`}>
                  <Link href={`/cyber-incidents/${encodeURIComponent(a.__slug)}`} className="hover:text-blue-700 hover:underline">
                    {(a.__title ?? a.title)?.slice(0, 65) ?? a.title}...
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 shadow-sm">
            <h3 className="text-base font-semibold text-blue-900 mb-2">📝 Subscribe for Incident Alerts</h3>
            <p className="text-sm text-blue-800 mb-4">Get major cyber incident alerts delivered to your inbox.</p>
            <form className="flex">
              <input type="email" placeholder="you@example.com" className="flex-1 px-3 py-2 border border-blue-200 rounded-l-md text-sm focus:outline-none" />
              <button type="submit" className="bg-blue-700 text-white px-4 py-2 rounded-r-md text-sm hover:bg-blue-800">Subscribe</button>
            </form>
          </div>
        </aside>
      </div>
    </main>
  );
}