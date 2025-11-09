import zeroDays from "../../../data/zero-days.json";
import Link from "next/link";

export function generateStaticParams() {
  return zeroDays
    .filter((a) => a.metadata && a.metadata.url_slug)
    .map((a) => ({
      slug: a.metadata.url_slug,
    }));
}

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

export default function ZeroDayDetailPage({ params }) {
  const article = zeroDays.find((a) => a.metadata.url_slug === params.slug);

  if (!article) {
    return (
      <div className="p-10 text-center text-black text-lg font-medium">
        Zero-Day not found.
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto bg-white border border-gray-200 rounded-2xl shadow p-6 md:p-8">
        {/* Back Link */}
        <Link
          href="/zero-days"
          className="inline-block mb-4 text-sm text-gray-600 hover:underline"
        >
          ← Back to Zero-Days
        </Link>

        {/* Title */}
        <h1 className="text-3xl font-bold text-gray-900 mb-3 leading-snug">
          {article.article_content.article_title}
        </h1>

        {/* Meta Info */}
        <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 mb-6">
          <span>🗓️ {formatDate(article.metadata.date)}</span>
          <span className="px-2 py-0.5 bg-red-600 text-white text-xs rounded font-medium">
            Zero-Day
          </span>
        </div>

        {/* Meta Description */}
        <p className="text-gray-700 mb-8 text-justify leading-relaxed">
          {article.metadata.meta_description}
        </p>

        {/* Sections */}
        <div className="space-y-8">
          {article.article_content.sections?.map((section, idx) => (
            <section key={idx} className="pl-4 border-l-4 border-blue-600">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {section.heading}
              </h2>
              <p className="text-gray-800 text-base leading-relaxed text-justify">
                {section.content}
              </p>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
