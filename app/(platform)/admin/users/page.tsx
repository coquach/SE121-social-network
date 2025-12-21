import { UsersTable } from "./_components/table";
import { UsersToolbar } from "./_components/toolbar";


export default function AdminUsersPage() {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-800">
            Quản lý người dùng
          </h1>
          <p className="text-sm text-slate-500">
            Theo dõi tài khoản, trạng thái hoạt động và thông tin hồ sơ
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-sky-100 bg-white p-4 shadow-sm">
        <UsersToolbar />
        <div className="mt-4">
          <UsersTable />
        </div>
      </div>
    </div>
  );
}
