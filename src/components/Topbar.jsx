import { useSettings } from "../contexts/SettingsContext";
import { getDisplayName } from "../services/settingsService";

export default function Topbar() {
  const { settings } = useSettings();

  return (
    <header className="flex min-h-16 items-center border-b border-slate-200 bg-white px-8 py-3 shadow-sm">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          {getDisplayName(settings)}
        </h1>
        <p className="text-sm text-slate-500">
          今日工作總覽
        </p>
      </div>
    </header>
  );
}
