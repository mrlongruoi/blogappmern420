import { AI_TOPICS } from "./aiTopics";

// Lightweight categorization keywords. These are heuristics to group topics.
const CATEGORY_KEYWORDS = {
  cameras_lenses: ["canon", "nikon", "sony", "fujifilm", "leica", "hasselblad", "dslr", "mirrorless", "ống kính", "lens", "prime", "zoom", "macro", "tele", "sigma", "tamron"],

  // Thiết bị và kỹ thuật ánh sáng trong studio
  lighting: ["flash", "strobe", "godox", "profoto", "softbox", "umbrella", "dù", "beauty dish", "reflector", "hắt sáng", "trigger", "high-key", "low-key", "rembrandt", "led"],

  // Hậu kỳ, phần mềm và các kỹ thuật chỉnh sửa
  post_production: ["photoshop", "lightroom", "capture one", "retouch", "chỉnh màu", "color grading", "preset", "actions", "dodge & burn", "frequency separation", "wacom", "hậu kỳ"],

  // Các thể loại nhiếp ảnh phổ biến
  genres: ["portrait", "chân dung", "fashion", "thời trang", "beauty", "sản phẩm", "product", "food", "ẩm thực", "lookbook", "headshot", "phong cảnh", "đường phố"],

  // Các kỹ thuật và kiến thức nhiếp ảnh cốt lõi
  techniques: ["iso", "aperture", "khẩu độ", "shutter speed", "tốc độ màn trập", "bố cục", "composition", "dof", "phơi sáng", "exposure", "white balance", "cân bằng trắng"],

  // Kinh doanh, marketing và xây dựng sự nghiệp nhiếp ảnh
  business: ["kinh doanh", "marketing", "portfolio", "seo", "hợp đồng", "báo giá", "pricing", "khách hàng", "thương hiệu cá nhân"],

  // Các thương hiệu nổi bật trong ngành
  brands: ["canon", "nikon", "sony", "fujifilm", "godox", "profoto", "adobe", "sigma", "tamron", "wacom", "capture one"],

  // Các phụ kiện và chủ đề khác
  other: ["studio", "tripod", "filter", "kính lọc", "backdrop", "phông nền", "sáng tạo", "creativity", "nhiếp ảnh"]
};

function normalize(s) {
  return String(s || "").toLowerCase();
}

// Determine a best-fit category for a single topic string using simple keyword matching
export function categorizeTopic(topic) {
  const t = normalize(topic);
  for (const [cat, kws] of Object.entries(CATEGORY_KEYWORDS)) {
    for (const kw of kws) {
      if (t.includes(kw)) return cat;
    }
  }
  return "other";
}

// Build categories map from AI_TOPICS (runs once)
let _categoriesCache = null;
export function buildCategories() {
  if (_categoriesCache) return _categoriesCache;
  const map = {};
  for (const topic of AI_TOPICS) {
    const cat = categorizeTopic(topic);
    if (!map[cat]) map[cat] = [];
    map[cat].push(topic);
  }
  _categoriesCache = map;
  return map;
}

// Suggest up to `maxTags` tags given a piece of text.
// Heuristic:
// - exact substring matches of topic name in text get strong score
// - token overlap (words) gives smaller score
// - categories detected in text boost topics from those categories
export function suggestTags(text, maxTags = 5) {
  const t = normalize(text);
  const words = new Set(t.split(/[^a-z0-9]+/).filter(Boolean));

  // detect categories present in text
  const presentCats = new Set();
  for (const [cat, kws] of Object.entries(CATEGORY_KEYWORDS)) {
    for (const kw of kws) {
      if (t.includes(kw)) {
        presentCats.add(cat);
        break;
      }
    }
  }

  const scores = [];
  for (const topic of AI_TOPICS) {
    const nt = normalize(topic);
    let score = 0;
    if (t.includes(nt)) score += 100; // exact-ish match

    // token overlap
    const tokWords = new Set(nt.split(/[^a-z0-9]+/).filter(Boolean));
    let common = 0;
    for (const w of tokWords) if (words.has(w)) common++;
    score += common * 5;

    // boost if topic category is present in text
    const cat = categorizeTopic(topic);
    if (presentCats.has(cat)) score += 3;

    if (score > 0) scores.push({ topic, score });
  }

  // sort by score desc then by topic length (shorter first)
  scores.sort((a, b) => b.score - a.score || a.topic.length - b.topic.length);

  const result = [];
  for (const s of scores) {
    if (result.length >= maxTags) break;
    // avoid picking duplicates or very similar tags
    if (!result.includes(s.topic)) result.push(s.topic);
  }

  // If nothing matched, pick a small random sample from the most relevant pool:
  // - If categories were detected in the text, sample from those categories
  // - Otherwise sample from the whole AI_TOPICS list
  if (result.length === 0) {
    const pool = [];
    if (presentCats.size > 0) {
      for (const cat of presentCats) {
        const items = AI_TOPICS_BY_CATEGORY[cat] || [];
        pool.push(...items);
      }
    }
    if (pool.length === 0) pool.push(...AI_TOPICS);

    // Shuffle pool and pick up to maxTags unique items
    for (let i = pool.length - 1; i > 0 && result.length < maxTags; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const item = pool[j];
      if (!result.includes(item)) result.push(item);
      // remove used item to avoid duplicates
      pool.splice(j, 1);
    }
  }

  return result.slice(0, maxTags);
}

// Small convenience: return a short list of tags for a title + body pair
export function suggestTagsForPost(title = "", body = "", maxTags = 5) {
  const combined = `${title}\n\n${body}`;
  return suggestTags(combined, maxTags);
}

// Export categories for UI consumption
export const AI_TOPICS_BY_CATEGORY = buildCategories();

export default {
  categorizeTopic,
  buildCategories,
  suggestTags,
  suggestTagsForPost,
  AI_TOPICS_BY_CATEGORY
};

