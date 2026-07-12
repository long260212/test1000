# Cánh Buồm Tri Thức AI — bản độc lập cho Vercel

Dự án này đã tách hoàn toàn frontend Vite khỏi backend cũ dùng Express. Ba API được triển khai trực tiếp bằng Vercel Functions:

- `api/ai-status.ts`
- `api/chat-ai.ts`
- `api/generate-questions.ts`

Khi chưa có API key hoặc Gemini tạm lỗi, hệ thống tự dùng nội dung học tập cục bộ và vẫn trả mã HTTP 200, vì vậy giao diện không hiện lỗi máy chủ 500.

## Đưa lên GitHub và Vercel

1. Tạo một repository GitHub mới, rồi tải **toàn bộ nội dung trong thư mục dự án** lên thư mục gốc.
2. Trên Vercel, chọn **Add New Project** và import repository mới này.
3. Giữ Root Directory là `./`.
4. Vercel sẽ đọc tự động:
   - Install Command: `npm install`
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. Thêm biến môi trường `GEMINI_API_KEY` trong **Vercel > Project > Settings > Environment Variables** nếu muốn dùng Gemini thật.
6. Redeploy sau khi thêm hoặc thay API key.

Không đưa API key thật vào `.env`, mã nguồn hoặc GitHub.

## Kiểm tra trước khi triển khai

```bash
npm install
npm run check
```

## Bản sửa triển khai Vercel

Bản này khóa Node.js 24.x và npm 10.9.2, dùng public npm registry, và không chứa đường dẫn registry nội bộ. Hãy tải toàn bộ nội dung ZIP lên thư mục gốc của repository; Root Directory trên Vercel để trống hoặc là `.`.
Redeploy after fixing Root Directory
