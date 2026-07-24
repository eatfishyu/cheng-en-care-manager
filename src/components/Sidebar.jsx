import {
  Home,
  Users,
  FileText,
  Phone,
  House,
  FolderOpen,
  BarChart3,
  Settings,
} from "lucide-react";

import { NavLink } from "react-router-dom";

const menus = [
  {
    name: "首頁",
    icon: Home,
    path: "/",
  },
  {
    name: "個案管理",
    icon: Users,
    path: "/cases",
  },
  {
    name: "工作報表",
    icon: FileText,
    path: "/report",
  },
  {
    name: "電訪",
    icon: Phone,
    path: "/phone",
  },
  {
    name: "家訪",
    icon: House,
    path: "/visit",
  },
  {
    name: "歸檔",
    icon: FolderOpen,
    path: "/archive",
  },
  {
    name: "統計",
    icon: BarChart3,
    path: "/statistics",
  },
  {
    name: "設定",
    icon: Settings,
    path: "/settings",
  },
];

export default function Sidebar() {
  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col">

      <div className="text-3xl font-bold px-8 py-8 border-b border-slate-700">
        承恩居督
      </div>

      <nav className="flex-1 mt-4">

        {menus.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-8 py-4 transition-all ${
                  isActive
                    ? "bg-blue-600"
                    : "hover:bg-slate-800"
                }`
              }
            >
              <Icon size={20} />

              <span>{item.name}</span>
            </NavLink>
          );
        })}

      </nav>

    </aside>
  );
}