import vulnerabilities from "../../../data/vulnerabilities.json";
import Link from "next/link";

export function generateStaticParams() {
  return vulnerabilities
    .filter((v) => v.metadata && v.metadata.url_slug)
    .map((v) => ({
      slug: v.metadata.url_slug,
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

export default function VulnerabilityDetailPage({ params }) {
  const article = vulnerabilities.find((v) => v.metadata.url_slug === params.slug);

  if (!article) {
    return <div className="p-10 text-center text-black">Vulnerability not found.</div>;
  }

  const { metadata, article_content, citation } = article;

  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-gray-100 py-8 px-2">
      <div className="max-w-3xl mx-auto bg-white border border-gray-200 rounded-2xl shadow p-6 md:p-8 relative">
        {/* Left Accent Bar */}
        <div className="absolute left-0 top-0 h-full w-1 bg-blue-700 rounded-l-xl"></div>

        {/* Back Link */}
        <Link
          href="/vulnerabilities"
          className="inline-block mb-4 text-sm text-gray-600 hover:underline"
        >
          ← Back to Vulnerabilities
        </Link>

        {/* Title */}
        <h1 className="text-2xl font-bold text-black mb-4 leading-tight">
          {article_content?.article_title || metadata.meta_title}
        </h1>

        {/* Meta Info */}
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
          {metadata.date && <span>🗓️ {formatDate(metadata.date)}</span>}
          {metadata.severity && (
            <span
              className={`ml-2 px-2 py-0.5 text-xs rounded font-semibold text-white ${
                metadata.severity === "High"
                  ? "bg-red-600"
                  : metadata.severity === "Medium"
                  ? "bg-yellow-500"
                  : "bg-green-600"
              }`}
            >
              {metadata.severity}
            </span>
          )}
        </div>

        {/* Description */}
        <p className="text-gray-800 mb-6 text-justify leading-relaxed">
          {metadata.meta_description}
        </p>

        {/* Sections */}
        <div className="space-y-6">
          {article_content?.sections?.map((section, idx) => (
            <section key={idx} className="border-l-4 border-blue-200 pl-4">
              <h2 className="text-lg font-bold text-black mb-2">{section.section_title || section.heading}</h2>
              <p className="text-gray-900 leading-relaxed text-justify mb-2">{section.content}</p>

              {/* Subsections */}
              {section.subsections?.map((sub, subIdx) => (
                <div key={subIdx} className="pl-4 border-l-2 border-blue-100 mb-2">
                  <h3 className="font-semibold text-gray-800">{sub.subtitle}</h3>
                  <p className="text-gray-900 text-justify">{sub.content}</p>
                </div>
              ))}
            </section>
          ))}
        </div>

        {/* Conclusion */}
        {article_content?.conclusion_title && (
          <h3 className="text-xl font-bold text-black mt-6 mb-2">{article_content.conclusion_title}</h3>
        )}
        {article_content?.conclusion_content && (
          <p className="mb-4 text-gray-800 text-justify">{article_content.conclusion_content}</p>
        )}

        {/* Mitigation / Points */}
        {article_content?.mitigation_points?.length > 0 && (
          <ul className="list-disc pl-6 mb-6">
            {article_content.mitigation_points.map((point, idx) => (
              <li key={idx} className="text-gray-800 text-justify">{point}</li>
            ))}
          </ul>
        )}

        {/* Citation */}
        {citation && (
          <div className="mt-8 border-t pt-4 text-sm text-gray-500">
            <p>{citation.note || ""}</p>
            {citation.link && (
              <a
                href={citation.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline"
              >
                {citation.link}
              </a>
            )}
          </div>
        )}
      </div>
    </main>
  );
}