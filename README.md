# Social Network FE

Frontend cho dự án mạng xã hội, xây dựng bằng Next.js (App Router) + React + Tailwind CSS. Hỗ trợ xác thực Clerk, realtime qua WebSocket và upload media qua Cloudinary.

## Mục tiêu

- Cung cấp giao diện người dùng cho hệ thống mạng xã hội (newsfeed, bạn bè, nhóm, chat).
- Tương tác realtime (tin nhắn, thông báo, cập nhật nội dung).
- Quản trị nội dung và người dùng ở khu vực admin.

## Tính năng chính

- Xác thực và quản lý phiên đăng nhập bằng Clerk (đăng nhập/đăng ký, webhook).
- Bài viết: tạo/sửa/xóa, cảm xúc (reactions), chia sẻ.
- Bình luận và phản hồi theo thread.
- Bạn bè: gợi ý, kết bạn, danh sách, yêu cầu kết bạn.
- Nhóm: tạo nhóm, quản trị thành viên, bài viết theo nhóm.
- Chat realtime: hội thoại cá nhân/nhóm, trạng thái online.
- Cảm xúc (emotion): dashboard, thống kê, phân tích.
- Khu vực admin: dashboard, người dùng, nhóm, báo cáo nội dung, cài đặt.

## Công nghệ

- Next.js 15 + React 19
- Tailwind CSS
- TanStack Query
- Zustand
- Clerk
- Cloudinary
- Socket.io client

## Yêu cầu

- Node.js 18+ (khuyến nghị 20+)
- npm / pnpm / yarn

## Cài đặt

```bash
npm install
```

## Cấu hình môi trường

Tạo file `.env` từ `.env.example` và điền giá trị:

```bash
cp .env.example .env
```

Các biến chính:

- `NEXT_PUBLIC_BACKEND_API_URL`: URL API backend (vd: `http://localhost:3001`)
- `NEXT_PUBLIC_WS_URL`: URL WebSocket (vd: `ws://localhost:3002`)
- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`, `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `CLERK_WEBHOOK_SIGNING_SECRET`
- `NEXT_PUBLIC_CLERK_SIGN_IN_URL`, `NEXT_PUBLIC_CLERK_SIGN_UP_URL`

## Chạy dự án

```bash
npm run dev
```

Mở `http://localhost:3000` để xem ứng dụng.

## Scripts

```bash
npm run dev     # chạy development
npm run build   # build production
npm run start   # chạy production
npm run lint    # kiểm tra lint
```

## Cấu trúc thư mục chính

- `app/`: routing và pages (App Router)
- `components/`: UI components
- `contexts/`: React contexts
- `hooks/`: custom hooks
- `lib/`, `utils/`: helper và tiện ích
- `store/`: state management
- `models/`: DTOs và enums
- `config/`: cấu hình UI và sidebar
- `public/`: static assets

## Luồng hoạt động chính

- Auth: Clerk middleware bảo vệ route, phân quyền admin/staff.
- Data fetching: TanStack Query + API client axios.
- Realtime: socket client kết nối backend để cập nhật chat/thông báo.
- Media: upload ảnh/video lên Cloudinary rồi lưu URL về backend.

## Ghi chú vận hành

- Cần chạy backend trước để các tính năng hoạt động đầy đủ.
- Cần cấu hình Clerk dashboard đúng redirect/callback URLs theo môi trường.
- WS và API có thể tách port, cấu hình ở `.env`.

## Đóng góp

- PR/issue được hoan nghênh; ưu tiên mô tả rõ bug và cách tái hiện.
