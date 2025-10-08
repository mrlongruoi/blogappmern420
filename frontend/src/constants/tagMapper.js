import { BLOG_NAVBAR_DATA } from "../utils/data";

function normalize(s) {
  return String(s || "").toLowerCase();
}

// explicit keyword->navbar-slug mapping to ensure high-confidence matches
const CATEGORY_KEYWORDS_TO_SLUG = {
  "dev-ops": [
    "aws",
    "amazon",
    "lambda",
    "s3",
    "github",
    "gitlab",
    "docker",
    "kubernetes",
    "eks",
    "gke",
    "aks",
    "serverless",
    "ci",
    "jenkins",
    "github actions",
  ],
  "ai-machine-learning": [
    "ai",
    "machine learning",
    "ml",
    "tensorflow",
    "pytorch",
    "hugging face",
    "transformers",
    "mistral",
    "gemini",
  ],
  "database-storage": [
    "postgres",
    "postgresql",
    "mysql",
    "mongo",
    "mongodb",
    "redis",
    "sql",
    "database",
    "vector",
  ],
  "auto-workflow": ["automation", "workflow", "n8n", "zapier", "airtable"],
  "web-development": [
    "react",
    "vue",
    "angular",
    "svelte",
    "html",
    "css",
    "webpack",
    "vite",
    "next",
    "nuxt",
    "javascript",
    "typescript",
    "node",
    "express",
    "django",
    "flask",
    "spring",
    "quarkus",
    "fastapi",
    "asp.net",
    "react native",
    "flutter",
    "kotlin",
    "swift",
    "android",
    "ios",
    "android studio",
    "xcode",
    
  ],
  "mobile-development" : [
    "react native",
    "flutter",
    "kotlin",
    "swift",
    "android",
    "ios",
    "android studio",
    "xcode",
  ],
  "game-development": [
    "unity",
    "unreal",
    "godot",
    "cryengine",
    "gamemaker",
    "photon",
  ],
};

// Map an array or comma-separated tag string to closest BLOG_NAVBAR_DATA slugs
export function mapTagsToNav(tags = []) {
  // accept comma-separated string as input
  if (typeof tags === "string") {
    // split by comma or semicolon
    tags = tags
      .split(/[,;]+/)
      .map((s) => s.trim())
      .filter(Boolean);
  }

  if (!Array.isArray(tags)) return [];
  const results = [];

  for (const raw of tags) {
    const t = normalize(raw);

    // 1) explicit mapping check
    let matched = false;
    for (const [slug, keys] of Object.entries(CATEGORY_KEYWORDS_TO_SLUG)) {
      for (const k of keys) {
        if (t.includes(k)) {
          results.push(slug);
          matched = true;
          break;
        }
      }
      if (matched) break;
    }
    if (matched) continue;

    // 2) try to find by label or path substring in BLOG_NAVBAR_DATA
    let found = BLOG_NAVBAR_DATA.find((b) => {
      const label = normalize(b.label);
      const path = normalize(b.path).replace("/tag/", "");
      return label.includes(t) || t.includes(label) || path.includes(t) || t.includes(path);
    });
    if (found) {
      results.push(found.path.replace("/tag/", ""));
      continue;
    }

    // 3) word-level fallback: match any word from tag into label
    for (const b of BLOG_NAVBAR_DATA) {
      const label = normalize(b.label);
      const words = t.split(/[^a-z0-9]+/).filter(Boolean);
      for (const w of words) {
        if (label.includes(w)) {
          results.push(b.path.replace("/tag/", ""));
          found = true;
          break;
        }
      }
      if (found) break;
    }

    // 4) final fallback: slugify the original tag
    if (!found && !matched) {
      const slug = t.replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      if (slug) results.push(slug);
    }
  }

  // dedupe and limit to 5
  return Array.from(new Set(results)).slice(0, 5);
}

export default { mapTagsToNav };
