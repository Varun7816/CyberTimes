import { notFound } from "next/navigation";
import Link from "next/link";
import incidents from "@/data/cyber-incidents.json"; // ensure path/casing matches your project

function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d)) return dateStr;
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function getSlug(item) {
  return (
    item.url_slug ??
    item.slug ??
    item.metadata?.url_slug ??
    (item.id != null ? String(item.id) : undefined)
  )?.toString();
}

// Generate static paths for all incidents
export async function generateStaticParams() {
  const raw = Array.isArray(incidents) ? incidents : [];
  const slugs = raw.map(getSlug).filter(Boolean);
  return Array.from(new Set(slugs)).map((s) => ({ slug: String(s) }));
}

function renderBlock(block, idx) {
  if (!block) return null;
  if (typeof block === "string")
    return (
      <p key={idx} className="text-gray-700 mb-4 whitespace-pre-line">
        {block}
      </p>
    );

  if (block.type) {
    switch (block.type) {
      case "paragraph":
        return (
          <p key={`blk-${idx}`} className="text-gray-700 mb-4 whitespace-pre-line">
            {block.text}
          </p>
        );
      case "heading": {
        const Tag =
          block.level === 3 ? "h3" : block.level === 4 ? "h4" : "h2";
        return (
          <Tag key={`blk-${idx}`} className="text-xl font-semibold mb-2">
            {block.text}
          </Tag>
        );
      }
      case "list":
        return (
          <ul key={`blk-${idx}`} className="list-disc list-inside mb-4 text-gray-700">
            {(block.items || []).map((it, i) => (
              <li key={`blk-${idx}-li-${i}`}>{it}</li>
            ))}
          </ul>
        );
      case "image":
        return (
          <div key={`blk-${idx}`} className="mb-4">
            <img
              src={block.src}
              alt={block.alt ?? ""}
              className="w-full rounded-md border border-gray-100"
            />
            {block.alt && (
              <div className="text-xs text-gray-500 mt-1">{block.alt}</div>
            )}
          </div>
        );
      case "quote":
        return (
          <blockquote
            key={`blk-${idx}`}
            className="border-l-4 pl-4 italic text-gray-700 mb-4"
          >
            {block.text}
          </blockquote>
        );
      default:
        return null;
    }
  }

  // unknown shape
  return (
    <pre key={`blk-${idx}`} className="text-sm text-gray-700 bg-gray-50 p-3 rounded">
      {JSON.stringify(block, null, 2)}
    </pre>
  );
}

export default function IncidentPage({ params }) {
  const slug = params?.slug;
  if (!slug) return notFound();

  const all = Array.isArray(incidents) ? incidents : [];
  const incident = all.find((it) => getSlug(it) === String(slug));
  if (!incident) return notFound();

  const title = incident.title ?? incident.metadata?.meta_title ?? "Untitled";
  const date = incident.date ?? incident.metadata?.date ?? null;
  const summary =
    incident.summary ?? incident.metadata?.meta_description ?? incident.description ?? null;

  // Prefer: string content fields => structured article_content (array or sections) => metadata fields
  const stringContent =
    typeof incident.content === "string"
      ? incident.content
      : typeof incident.body === "string"
      ? incident.body
      : typeof incident.article === "string"
      ? incident.article
      : typeof incident.metadata?.content === "string"
      ? incident.metadata.content
      : null;

  // Normalized blocks array: either article_content array, or article_content.sections array, or metadata.blocks
  let blocks = null;
  if (Array.isArray(incident.article_content)) blocks = incident.article_content;
  else if (Array.isArray(incident.article_content?.sections))
    blocks = incident.article_content.sections;
  else if (Array.isArray(incident.metadata?.article_content))
    blocks = incident.metadata.article_content;
  else if (Array.isArray(incident.metadata?.sections)) blocks = incident.metadata.sections;

  const looksLikeHTML = (s) => typeof s === "string" && /<\/?[a-z][\s\S]*>/i.test(s);

  return (
    <main className="bg-gray-50 min-h-screen py-12 px-6 sm:px-10 lg:px-16">
      <nav className="text-sm text-gray-600 mb-6">
        <Link href="/" className="hover:text-blue-700">
          Home
        </Link>{" "}
        /{" "}
        <Link href="/cyber-incidents" className="hover:text-blue-700">
          Cyber Incidents
        </Link>{" "}
        /{" "}
        <span className="text-gray-900 font-medium">{title}</span>
      </nav>

      <article className="bg-white border border-gray-200 rounded-2xl shadow-sm p-8 max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-3 leading-snug">
          {title}
        </h1>

        {date && (
          <p className="text-sm text-gray-600 mb-6">🗓 {formatDate(date)}</p>
        )}
        {summary && <p className="text-gray-800 mb-6">{summary}</p>}

        <div className="prose">
          {stringContent ? (
            looksLikeHTML(stringContent) ? (
              <div dangerouslySetInnerHTML={{ __html: stringContent }} />
            ) : (
              <div className="whitespace-pre-wrap">{stringContent}</div>
            )
          ) : blocks && blocks.length > 0 ? (
            blocks.map((b, i) => renderBlock(b, i))
          ) : (
            // fallback: show available metadata fields rather than raw JSON
            <>
              {incident.key_findings && (
                <section>
                  <h2 className="text-xl font-semibold mb-2">Key findings</h2>
                  <p className="whitespace-pre-line">{incident.key_findings}</p>
                </section>
              )}
              {incident.affected && (
                <section className="mt-4">
                  <h3 className="font-semibold">Affected</h3>
                  <p>
                    {Array.isArray(incident.affected)
                      ? incident.affected.join(", ")
                      : incident.affected}
                  </p>
                </section>
              )}
              {!stringContent && !blocks && !incident.key_findings && !incident.affected && (
                <div className="text-sm text-gray-500 mt-4">
                  No article body available for this incident.
                </div>
              )}
            </>
          )}
        </div>

        {Array.isArray(incident.external_links) &&
          incident.external_links.length > 0 && (
            <div className="mt-8 border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                External References
              </h3>
              <ul className="list-disc list-inside text-sm text-blue-700 space-y-1">
                {incident.external_links.map((l, i) => (
                  <li key={i}>
                    <a
                      href={l}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline"
                    >
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

        <div className="mt-10">
          <Link
            href="/cyber-incidents"
            className="inline-flex items-center text-blue-700 hover:underline text-sm font-medium"
          >
            ← Back to all incidents
          </Link>
        </div>
      </article>
    </main>
  );
}