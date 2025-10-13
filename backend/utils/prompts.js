// utils/prompts.js

// Danh sách các tone (giọng văn) tiếng Việt đã được dọn dẹp và tối ưu cho chủ đề nhiếp ảnh
const AI_TONES = [
  // Nhóm 1: Chuyên nghiệp & Hướng dẫn
  "Trang trọng", "Chuyên nghiệp", "Học thuật", "Phân tích", "Thuyết phục",
  "Uy tín", "Khách quan", "Giáo dục", "Hướng dẫn chi tiết", "Kỹ thuật",

  // Nhóm 2: Thân thiện & Nghệ thuật
  "Thân mật", "Thân thiện", "Đàm thoại", "Hài hước", "Nhiệt tình",
  "Truyền cảm hứng", "Đồng cảm", "Kể chuyện", "Nghệ thuật", "Sáng tạo",

  // Nhóm 3: Trực tiếp & Tối giản
  "Trực tiếp", "Tự tin", "Thực tế", "Tối giản", "Ngắn gọn", "Thẳng thắn",
  "Chân thực", "Cẩn thận",

  // Nhóm 4: Sáng tạo & Độc đáo
  "Sắc sảo", "Huyền bí", "Lạc quan", "Hoài nghi", "Độc đáo",
  "Đầy cảm hứng", "Tưởng tượng", "Khám phá", "Lãng mạn", "Cổ điển",
];

// Loại bỏ các giá trị trùng lặp để đảm bảo danh sách là duy nhất
const uniqueTones = [...new Set(AI_TONES)];
const AI_TONES_STRING = uniqueTones.join(", ");

/**
 * Prompt để tạo ý tưởng bài viết blog SÁNG TẠO và CHUẨN SEO về nhiếp ảnh.
 * @param {string} topic - Chủ đề chính được người dùng chọn (ví dụ: "Chụp ảnh chân dung").
 * @param {string} allTopicsString - Chuỗi chứa TẤT CẢ các chủ đề nhiếp ảnh có thể có.
 * @param {string[]} existingTitles - Mảng các tiêu đề đã có để tránh trùng lặp.
 * @param {string} targetAudience - Đối tượng độc giả mục tiêu.
 * @returns {string} - Prompt hoàn chỉnh cho AI.
 */
const blogPostIdeasPrompt = (
  topic,
  allTopicsString,
  existingTitles = [],
  targetAudience = "nhiếp ảnh gia, người yêu nhiếp ảnh, và chủ studio"
) => {
  const existingTitlesString =
    existingTitles.length > 0
      ? `Để đảm bảo tính độc đáo, HÃY TRÁNH tạo ra các ý tưởng tương tự với các tiêu đề đã có sau đây: ${existingTitles.join(", ")}.`
      : "";

  return `
Bạn là một Nhiếp ảnh gia Chuyên nghiệp và một Chuyên gia Nội dung với nhiều năm kinh nghiệm trong ngành. Nhiệm vụ của bạn là tạo ra 5 ý tưởng bài viết blog CÓ GIÁ TRỊ CAO, CHUẨN SEO, và thu hút, dựa trên chủ đề chính là "${topic}".

Để thực hiện nhiệm vụ, bạn có quyền truy cập vào một kho kiến thức khổng lồ về các kỹ thuật, thiết bị và phong cách nhiếp ảnh:
<KNOWLEDGE_BASE>
${allTopicsString}
</KNOWLEDGE_BASE>

YÊU CẦU CỐT LÕI:
Những ý tưởng giá trị nhất thường **kết hợp các chủ đề từ nhiều lĩnh vực nhiếp ảnh khác nhau**. Hãy tạo ra những sự kết hợp mới lạ và hữu ích.
Ví dụ: kết hợp kỹ thuật "Chụp ảnh chân dung" với "Ánh sáng Studio (Strobe)", "Hậu kỳ bằng Lightroom" và "Marketing cho nhiếp ảnh gia".

Đối tượng mục tiêu là ${targetAudience}.
${existingTitlesString}

Hãy đa dạng hóa định dạng ý tưởng, bao gồm:
- **Bài hướng dẫn thực hành (Tutorial):** "Hướng dẫn từng bước setup ánh sáng cho [Phong cách ảnh cụ thể] bằng [Thiết bị A] và [Thiết bị B]".
- **Bài so sánh chuyên sâu:** "[Máy ảnh/Ống kính A] và [Máy ảnh/Ống kính B]: Lựa chọn nào tối ưu cho [Thể loại ảnh]?".
- **Bài giải quyết vấn đề:** "Làm thế nào để khắc phục [Vấn đề thường gặp] khi chụp ảnh trong điều kiện [Môi trường cụ thể]".
- **Nghiên cứu tình huống (Case Study):** "Phân tích một bức ảnh thành công: Từ ý tưởng, setup ánh sáng đến hậu kỳ".

Với mỗi ý tưởng, hãy trả về:
- title: Một tiêu đề cụ thể, hướng đến kết quả và chứa từ khóa chính.
- description: Một bản tóm tắt 2 dòng giải thích rõ ràng vấn đề bài viết giải quyết và giá trị mang lại cho người đọc.
- tags: Một mảng gồm ĐÚNG 3 thẻ. Thẻ đầu tiên PHẢI là "${topic}". Hai thẻ còn lại là các kỹ thuật hoặc thiết bị chính khác được đề cập.
- tone: Chọn một giọng văn phù hợp từ danh sách sau: ${AI_TONES_STRING}.

Chỉ trả về một mảng các đối tượng JSON hợp lệ. KHÔNG thêm bất kỳ văn bản hay định dạng markdown nào bên ngoài mảng JSON.
    `;
};

/**
 * Prompt để tạo toàn bộ nội dung bài viết blog chi tiết và chuẩn SEO về nhiếp ảnh.
 * @param {string} title - Tiêu đề của bài viết.
 * @param {string} tone - Giọng văn mong muốn.
 * @param {string} targetAudience - Đối tượng độc giả mục tiêu.
 * @returns {string} - Prompt hoàn chỉnh cho AI.
 */
const generateFullPostPrompt = (
  title,
  tone,
  targetAudience = "người yêu nhiếp ảnh và các nhiếp ảnh gia"
) => {
  return `
Bạn là một blogger nhiếp ảnh chuyên nghiệp và một nhiếp ảnh gia giàu kinh nghiệm, có khả năng giải thích các chủ đề phức tạp một cách rõ ràng và hấp dẫn.

Nhiệm vụ của bạn là viết một bài blog CHI TIẾT, CHUẨN SEO, và TRỰC QUAN SINH ĐỘNG bằng tiếng Việt, định dạng markdown dựa trên các thông tin sau:
- **Tiêu đề:** "${title}"
- **Giọng văn:** "${tone}"
- **Đối tượng độc giả:** "${targetAudience}"

YÊU CẦU VỀ NỘI DUNG VÀ CẤU TRÚC:
1.  **Từ khóa & SEO:**
    -   Từ khóa chính của bài viết được suy ra từ tiêu đề. Hãy lồng ghép từ khóa chính và các từ khóa phụ liên quan một cách tự nhiên trong các tiêu đề phụ (H2, H3) và trong nội dung.
    -   Nội dung phải giải quyết trực tiếp ý định tìm kiếm (search intent) của người dùng khi họ tìm kiếm tiêu đề này.
2.  **Cấu trúc bài viết (BẮT BUỘC):**
    -   **Mở bài hấp dẫn (Hook):** Bắt đầu bằng một đoạn giới thiệu ngắn (2-3 câu) nêu rõ vấn đề hoặc vẻ đẹp mà bài viết sẽ khám phá, và tóm tắt những gì người đọc sẽ học được.
    -   **Thiết bị và chuẩn bị (Prerequisites):** (Nếu có) Liệt kê những thiết bị, phụ kiện hoặc kiến thức cần có trước khi bắt đầu.
    -   **Các phần chính (Thân bài):** Sử dụng các tiêu đề phụ (H2, H3) để chia nhỏ nội dung thành các bước logic, dễ theo dõi. Mỗi phần phải tập trung giải quyết một khía cạnh của chủ đề.
    -   **Hình ảnh minh họa và Thông số kỹ thuật:** Mô tả rõ ràng các setup, bố cục. Khi đề cập đến một kỹ thuật, hãy gợi ý thông số máy ảnh tham khảo (ví dụ: khẩu độ, tốc độ màn trập, ISO) và giải thích tại sao.
    -   **Kết luận và Gợi ý thực hành:** Tóm tắt lại những điểm quan trọng nhất của bài viết và gợi ý các bài tập thực hành hoặc các chủ đề nâng cao mà người đọc có thể tìm hiểu.

Bài viết phải hoàn toàn bằng tiếng Việt và tuân thủ nghiêm ngặt định dạng markdown để đảm bảo tính dễ đọc và chuyên nghiệp.
`;
};

/**
 * Prompt để tự động gợi ý thẻ (tags) từ nội dung bài viết nhiếp ảnh.
 * @param {string} title - Tiêu đề bài viết.
 * @param {string} content - Nội dung bài viết.
 * @param {string} allTopicsString - Chuỗi chứa TẤT CẢ các chủ đề nhiếp ảnh có thể có.
 * @returns {string} - Prompt hoàn chỉnh cho AI.
 */
const suggestTagsPrompt = (title, content, allTopicsString) => {
  return `
Bạn là một chuyên gia SEO và Biên tập viên Ảnh. Nhiệm vụ của bạn là đọc tiêu đề và nội dung của một bài viết, sau đó chọn ra các thẻ (tags) phù hợp nhất từ một danh sách cho trước.

DANH SÁCH CÁC THẺ HỢP LỆ:
<TOPICS>
${allTopicsString}
</TOPICS>

TIÊU ĐỀ BÀI VIẾT:
"${title}"

NỘI DUNG BÀI VIẾT (một phần để phân tích):
"${content.substring(0, 1500)}..."

HƯỚNG DẪN:
1.  Đọc kỹ tiêu đề và nội dung để hiểu chủ đề chính.
2.  Chọn ra từ 5 đến 7 thẻ phù hợp nhất từ danh sách <TOPICS> ở trên.
3.  Ưu tiên chọn các thẻ là tên kỹ thuật, thiết bị, hoặc phần mềm cụ thể được đề cập trực tiếp trong bài.
4.  Sau đó, chọn thêm các thẻ là các khái niệm hoặc thể loại nhiếp ảnh rộng hơn liên quan đến bài viết (ví dụ: 'Chân dung', 'Ánh sáng tự nhiên', 'Hậu kỳ').

Chỉ trả về một mảng JSON chứa các chuỗi (string) là tên các thẻ đã chọn. KHÔNG thêm bất kỳ văn bản nào khác.

Ví dụ định dạng trả về:
["Chụp ảnh chân dung", "Canon EOS R5", "Ống kính 85mm f/1.8", "Ánh sáng Studio", "Lightroom", "Chỉnh màu"]
`;
};

/**
 * Prompt để tóm tắt nội dung bài viết nhiếp ảnh theo chuẩn SEO chuyên sâu.
 * @param {string} blogContent - Nội dung của bài viết.
 * @returns {string} - Prompt hoàn chỉnh cho AI.
 */
const blogSummaryPrompt = (blogContent) =>
  `
Bạn là một chuyên gia SEO kỹ thuật và Biên tập viên Nội dung chuyên về lĩnh vực nhiếp ảnh.
Mục tiêu của bạn là phân tích nội dung bài viết dưới đây và tạo ra một đối tượng JSON chứa siêu dữ liệu (metadata) đã được tối ưu hóa hoàn hảo cho công cụ tìm kiếm và người đọc.

Hướng dẫn chi tiết:
1.  **Phân tích nội dung:** Đọc kỹ nội dung bài viết để xác định chủ đề chính, kỹ thuật, và các thiết bị được đề cập.
2.  **Tạo đối tượng JSON** với các trường sau:
    -   **title:** Một tiêu đề SEO (tối đa 12 từ, dưới 70 ký tự). Phải chứa từ khóa chính và đặt nó ở gần đầu.
    -   **metaDescription:** Một đoạn mô tả meta hấp dẫn (dưới 160 ký tự). Viết bằng giọng văn chủ động, tóm tắt giá trị bài viết và kết thúc bằng lời kêu gọi hành động (ví dụ: "Khám phá ngay!", "Học kỹ thuật mới!").
    -   **keywords:** Một mảng gồm 5-7 từ khóa. Bao gồm: 1 từ khóa chính (ví dụ: "kỹ thuật chụp ảnh ngược sáng"), 2-3 từ khóa đuôi dài (ví dụ: "cách chụp ảnh chân dung ngược sáng đẹp"), và 2-3 từ khóa liên quan (ví dụ: "golden hour", "đèn flash Godox").
    -   **summary:** Một bản tóm tắt khoảng 150-200 từ để hiển thị trên website. Ở cuối bản tóm tắt này, thêm một phần markdown có tiêu đề "## Bạn sẽ học được gì" và liệt kê 3–5 kỹ năng hoặc kiến thức chính dưới dạng gạch đầu dòng (\`- \`).

Chỉ trả về một đối tượng JSON hợp lệ. Không bao gồm bất kỳ văn bản hay định dạng nào khác.

Nội dung bài viết:
${blogContent}
`;

/**
 * Prompt để tạo câu trả lời tương tác cho bình luận trên blog nhiếp ảnh.
 * @param {object} comment - Đối tượng bình luận chứa author và content.
 * @returns {string} - Prompt hoàn chỉnh cho AI.
 */
function generateReplyPrompt(comment) {
  const authorName = comment.author?.name || "Bạn đọc";
  const content = comment.content;

  return `
Bạn là tác giả thân thiện và am hiểu của một blog nhiếp ảnh. Mục tiêu của bạn là trả lời một bình luận từ độc giả tên là ${authorName}.

Bình luận của độc giả là:
"${content}"

Hướng dẫn cho câu trả lời của bạn:
- Duy trì giọng văn hữu ích, gần gũi và đầy cảm hứng.
- Khiến người bình luận cảm thấy được lắng nghe bằng cách đề cập đến một điểm cụ thể mà họ đã nêu trong bình luận.
- Giữ câu trả lời ngắn gọn (2-4 câu).
- **Thêm giá trị:** Nếu có thể, hãy khéo léo giới thiệu một kỹ thuật liên quan hoặc một bài viết khác trên blog có thể hữu ích cho họ để khuyến khích họ khám phá thêm.
- Kết thúc bằng cách khuyến khích họ tiếp tục chụp ảnh và chia sẻ tác phẩm.

Hãy viết một câu trả lời sâu sắc và phù hợp cho bình luận này.
  `;
}


module.exports = {
  blogPostIdeasPrompt,
  generateFullPostPrompt,
  suggestTagsPrompt,
  blogSummaryPrompt,
  generateReplyPrompt,
  AI_TONES: uniqueTones,
  AI_TONES_STRING,
};