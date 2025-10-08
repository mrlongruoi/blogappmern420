const { GoogleGenAI } = require("@google/genai");

const {
  blogPostIdeasPrompt,
  generateReplyPrompt,
  blogSummaryPrompt,
} = require("../utils/prompts");

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// @desc    Generate blog content from title
// @route   POST /api/ai/generate
// @access  Private
const generateBlogPost = async (req, res) => {
  try {
    const { title, tone } = req.body;

    if (!title || !tone) {
      return res.status(400).json({ message: "Thiếu các trường bắt buộc" });
    }

    const prompt = `Viết một bài blog hoàn chỉnh bằng tiếng Việt, định dạng markdown với tiêu đề "${title}". Sử dụng giọng văn '${tone}'. Bài viết cần có phần giới thiệu hấp dẫn, các tiêu đề phụ rõ ràng, ví dụ code nếu có liên quan, và một phần kết luận súc tích.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: prompt,
    });

    let rawText = response.text;
    res.status(200).json(rawText);
  } catch (error) {
    res.status(500).json({
      message: "Lỗi khi tạo bài đăng",
      error: error.message,
    });
  }
};

// @desc    Generate blog post ideas from title
// @route   POST /api/ai/generate-ideas
// @access  Private
const generateBlogPostIdeas = async (req, res) => {
  try {
    const { topics } = req.body;

    // Debug: log incoming topics to help diagnose client-side issues
    console.log("[aiController] generateBlogPostIdeas received topics:", topics);

    if (!topics) {
      return res.status(400).json({ message: "Thiếu các trường bắt buộc" });
    }

    const prompt = blogPostIdeasPrompt(topics);

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: prompt,
    });

    let rawText = response.text;

    // Clean it: Remove ```json and ``` from beginning and end
    const cleanedText = rawText
      .replace(/^```json\s*/, "") // remove starting ```json
      .replace(/```$/, "") // remove ending ```
      .trim(); // remove extra spaces

    // Now safe to parse
    const data = JSON.parse(cleanedText);

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({
      message: "Không tạo ra ý tưởng bài đăng trên blog",
      error: error.message,
    });
  }
};

// @desc    Generate comment reply
// @route   POST /api/ai/generate-reply
// @access  Private
const generateCommentReply = async (req, res) => {
  try {
    const { author, content } = req.body;

    if (!content) {
      return res.status(400).json({ message: "Thiếu các trường bắt buộc" });
    }

    const prompt = generateReplyPrompt({ author, content });

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: prompt,
    });

    let rawText = response.text;
    res.status(200).json(rawText);
  } catch (error) {
    res.status(500).json({
      message: "Không tạo ra phản hồi cho bình luận",
      error: error.message,
    });
  }
};

// @desc    Generate blog post summary
// @route   POST /api/ai/generate-summary
// @access  Private
const generatePostSummary = async (req, res) => {
  try {
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ message: "Thiếu các trường bắt buộc" });
    }

    const prompt = blogSummaryPrompt(content);

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: prompt,
    });

    let rawText = response.text;

    // Clean it: Remove ```json and ``` from beginning and end
    const cleanedText = rawText
      .replace(/^```json\s*/, "") // remove starting ```json
      .replace(/```$/, "") // remove ending ```
      .trim(); // remove extra spaces

    // Now safe to parse
    const data = JSON.parse(cleanedText);
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({
      message: "Không tạo ra tóm tắt bài đăng",
      error: error.message,
    });
  }
};

module.exports = {
  generateBlogPost,
  generateBlogPostIdeas,
  generateCommentReply,
  generatePostSummary,
};
