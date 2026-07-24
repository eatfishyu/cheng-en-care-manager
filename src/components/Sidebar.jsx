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
import { useSettings } from "../contexts/SettingsContext";
import { getDisplayName } from "../services/settingsService";

const menus = [
  { name: "首頁", icon: Home, path: "/" },
  { name: "個案管理", icon: Users, path: "/cases" },
  { name: "工作報表", icon: FileText, path: "/report" },
  { name: "電訪", icon: Phone, path: "/phone" },
  { name: "家訪", icon: House, path: "/visit" },
  { name: "歸檔", icon: FolderOpen, path: "/archive" },
  { name: "統計", icon: BarChart3, path: "/statistics" },
  { name: "設定", icon: Settings, path: "/settings" },
];

export default function Sidebar() {
  const { settings } = useSettings();

  return (
    <aside className="flex w-64 shrink-0 flex-col bg-slate-900 text-white">
      <div className="border-b border-slate-700 px-7 py-7">
        <div className="break-words text-2xl font-bold leading-tight">
          {getDisplayName(settings)}
        </div>
        <div className="mt-2 text-xs text-slate-400">
          居督管理系統
        </div>
      </div>

      <nav className="mt-4 flex-1">
        {menus.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-8 py-4 transition-all ${
                  isActive ? "bg-blue-600" : "hover:bg-slate-800"
                }`
              }
            >
              <Icon size={20} />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="border-t border-slate-800 px-7 py-4 text-xs text-slate-500">
        版本 {settings.version || "1.0"}
      </div>
    </aside>
  );
}
