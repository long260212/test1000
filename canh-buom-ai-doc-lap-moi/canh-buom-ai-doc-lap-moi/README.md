# Cánh Buồm Tri Thức AI — dự án mới độc lập

Đây là một dự án Vite + Vercel Functions hoàn chỉnh và độc lập. Dự án không nhập,
không gọi và không phụ thuộc vào bất kỳ thư mục dự án cũ nào trong repository.

## Cấu trúc

- `src/`: giao diện React/Vite
- `api/ai-status.ts`: kiểm tra trạng thái AI
- `api/chat-ai.ts`: trò chuyện với giáo viên AI
- `api/generate-questions.ts`: tạo câu hỏi
- `lib/`: xử lý Gemini và nội dung dự phòng
- `vercel.json`: cấu hình triển khai Vercel

Khi thiếu API key hoặc Gemini gặp lỗi, API dùng nội dung dự phòng và vẫn trả HTTP 200,
nhờ đó giao diện không hiện lỗi máy chủ 500.

## Đưa vào repository GitHub đang có dự án cũ

1. Giải nén file ZIP.
2. Tải nguyên thư mục `canh-buom-ai-doc-lap-moi` lên **thư mục gốc** của repository.
3. Không đặt thư mục này vào bên trong dự án cũ.
4. Không xóa dự án cũ; hai dự án có thể cùng tồn tại trong một repository.
5. Trên Vercel, đặt Root Directory chính xác là:

```text
canh-buom-ai-doc-lap-moi
```

## Cấu hình Vercel

- Framework Preset: `Vite`
- Root Directory: `canh-buom-ai-doc-lap-moi`
- Install Command: để Vercel đọc từ `vercel.json`
- Build Command: để Vercel đọc từ `vercel.json`
- Output Directory: `dist`
- Environment Variable: `GEMINI_API_KEY`

Sau khi đổi Root Directory hoặc API key, tạo deployment mới.

## Kiểm tra cục bộ

```bash
npm ci
npm run check
```

Không đưa API key thật vào GitHub.
