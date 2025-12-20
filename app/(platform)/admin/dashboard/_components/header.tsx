export function DashboardHeader() {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-semibold text-slate-800">
          Bảng điều khiển
        </h1>
        <p className="text-sm text-sky-600">
          Tổng quan hoạt động hệ thống mạng xã hội hôm nay
        </p>
      </div>

      <div className="text-sm text-slate-500">
        Cập nhật: {new Date().toLocaleDateString('vi-VN')}
      </div>
    </div>
  );
}
