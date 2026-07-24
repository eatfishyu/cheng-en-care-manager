import { Bell, Search, UserCircle2 } from "lucide-react";

export default function Topbar() {
  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shadow-sm">

      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          承恩居督管理系統
        </h1>
        <p className="text-sm text-slate-500">
          今日工作總覽
        </p>
      </div>

      <div className="flex items-center gap-6">

        <div className="relative">
          <Search
            className="absolute left-3 top-2.5 text-slate-400"
            size={18}
          />

          <input
            type="text"
            placeholder="搜尋個案..."
            className="pl-10 pr-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 w-72"
          />
        </div>

        <button className="relative">
          <Bell size={22} />
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            3
          </span>
        </button>

        <UserCircle2
          size={34}
          className="text-slate-600"
        />

      </div>
    </header>
  );
}