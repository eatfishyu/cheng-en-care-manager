import { useMemo, useRef, useState } from "react";
import {
  Building2,
  CalendarDays,
  Check,
  Database,
  Download,
  Home,
  RotateCcw,
  Save,
  Trash2,
  Upload,
  UserRound,
} from "lucide-react";

import { useSettings } from "../contexts/SettingsContext";
import {
  clearAllAppData,
  downloadBackup,
  getDisplayName,
  getSystemStats,
  importBackup,
  resetSettings,
} from "../services/settingsService";
import { clearCaseCache } from "../services/caseService";

export default function Settings() {
  const { settings, saveSettings, reloadSettings } = useSettings();
  const [form, setForm] = useState(settings);
  const [message, setMessage] = useState("");
  const [statsVersion, setStatsVersion] = useState(0);
  const fileInputRef = useRef(null);

  const stats = useMemo(() => getSystemStats(), [statsVersion]);

  function updateField(field, value) {
    setForm((previous) => ({ ...previous, [field]: value }));
  }

  function updateHome(field, value) {
    setForm((previous) => ({
      ...previous,
      home: { ...previous.home, [field]: value },
    }));
  }

  function showMessage(text) {
    setMessage(text);
    window.setTimeout(() => setMessage(""), 2600);
  }

  function handleSave(event) {
    event.preventDefault();

    if (!String(form.organizationName || "").trim()) {
      window.alert("請填寫機構名稱");
      return;
    }

    saveSettings({
      ...form,
      organizationName: form.organizationName.trim(),
      supervisorName: form.supervisorName.trim(),
      visitCycleMonths: Number(form.visitCycleMonths),
      phoneCycleMonths: Number(form.phoneCycleMonths),
    });

    showMessage("設定已儲存並立即生效");
  }

  async function handleImport(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    const confirmed = window.confirm(
      "匯入備份會覆蓋目前相同類型的資料，確定繼續嗎？"
    );
    if (!confirmed) return;

    try {
      await importBackup(file);
      clearCaseCache();
      reloadSettings();
      setForm(resetFormFromStorage());
      setStatsVersion((value) => value + 1);
      showMessage("資料匯入完成");
    } catch (error) {
      window.alert(error.message || "資料匯入失敗");
    }
  }

  function handleResetSettings() {
    if (!window.confirm("確定將所有設定恢復為預設值嗎？")) return;

    const next = resetSettings();
    setForm(next);
    reloadSettings();
    showMessage("設定已恢復預設值");
  }

  function handleClearAll() {
    const first = window.confirm(
      "這會刪除個案、電訪、家訪、工作報表及設定。確定要繼續嗎？"
    );
    if (!first) return;

    const typed = window.prompt(
      "此操作無法復原。請輸入「清除全部資料」以確認："
    );
    if (typed !== "清除全部資料") {
      window.alert("確認文字不正確，已取消清除");
      return;
    }

    clearAllAppData();
    clearCaseCache();
    reloadSettings();
    setForm(resetFormFromStorage());
    setStatsVersion((value) => value + 1);
    showMessage("全部資料已清除");
  }

  return (
    <form onSubmit={handleSave} className="mx-auto max-w-5xl space-y-6 pb-24">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">設定</h1>
          <p className="mt-2 text-slate-500">
            儲存後會立即套用至左側選單、上方標題及首頁。
          </p>
        </div>

        <button
          type="submit"
          className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700"
        >
          <Save size={19} />
          儲存設定
        </button>
      </div>

      {message && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4 font-medium text-emerald-700">
          <Check size={19} />
          {message}
        </div>
      )}

      <SettingSection
        icon={Building2}
        title="機構資訊"
        description="設定系統顯示的機構名稱與督導姓名。"
      >
        <div className="grid gap-5 md:grid-cols-2">
          <TextField
            label="機構名稱"
            value={form.organizationName}
            onChange={(value) => updateField("organizationName", value)}
            placeholder="例如：承恩居督"
            required
          />

          <TextField
            label="督導姓名"
            value={form.supervisorName}
            onChange={(value) => updateField("supervisorName", value)}
            placeholder="例如：聖權"
          />
        </div>

        <div className="mt-5 rounded-xl border border-blue-200 bg-blue-50 p-5">
          <div className="text-sm font-medium text-blue-700">顯示預覽</div>
          <div className="mt-2 text-2xl font-bold text-blue-900">
            {getDisplayName(form)}
          </div>
        </div>
      </SettingSection>

      <SettingSection
        icon={CalendarDays}
        title="訪視週期"
        description="設定完成後，系統會依照選擇的週期安排下一次工作。"
      >
        <div className="grid gap-5 md:grid-cols-2">
          <SelectField
            label="家訪週期"
            value={form.visitCycleMonths}
            onChange={(value) => updateField("visitCycleMonths", Number(value))}
            options={[
              [1, "每 1 個月"],
              [2, "每 2 個月"],
              [3, "每 3 個月"],
              [6, "每 6 個月"],
            ]}
          />

          <SelectField
            label="電訪週期"
            value={form.phoneCycleMonths}
            onChange={(value) => updateField("phoneCycleMonths", Number(value))}
            options={[
              [1, "每月"],
              [2, "每 2 個月"],
              [3, "每 3 個月"],
            ]}
          />
        </div>
      </SettingSection>

      <SettingSection
        icon={Home}
        title="首頁設定"
        description="選擇首頁要顯示的資訊。"
      >
        <div className="grid gap-3 md:grid-cols-2">
          <Toggle
            label="顯示今日日期"
            checked={form.home.showToday}
            onChange={(value) => updateHome("showToday", value)}
          />
          <Toggle
            label="顯示完成率"
            checked={form.home.showCompletionRate}
            onChange={(value) => updateHome("showCompletionRate", value)}
          />
          <Toggle
            label="顯示首頁提醒"
            checked={form.home.showReminder}
            onChange={(value) => updateHome("showReminder", value)}
          />
          <Toggle
            label="顯示待電訪"
            checked={form.home.showPhone}
            onChange={(value) => updateHome("showPhone", value)}
          />
          <Toggle
            label="顯示待家訪"
            checked={form.home.showVisit}
            onChange={(value) => updateHome("showVisit", value)}
          />
          <Toggle
            label="顯示首頁統計卡片"
            checked={form.home.showDashboardCards}
            onChange={(value) => updateHome("showDashboardCards", value)}
          />
        </div>
      </SettingSection>

      <SettingSection
        icon={Database}
        title="資料管理"
        description="建議定期匯出備份。匯入及清除操作都會影響目前資料。"
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <ActionButton
            icon={Download}
            title="匯出資料"
            description="下載完整 JSON 備份"
            onClick={downloadBackup}
          />
          <ActionButton
            icon={Upload}
            title="匯入資料"
            description="從 JSON 備份還原"
            onClick={() => fileInputRef.current?.click()}
          />
          <ActionButton
            icon={RotateCcw}
            title="重設設定"
            description="保留工作資料"
            onClick={handleResetSettings}
          />
          <ActionButton
            icon={Trash2}
            title="清除全部資料"
            description="刪除所有本機資料"
            danger
            onClick={handleClearAll}
          />
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={handleImport}
        />
      </SettingSection>

      <SettingSection
        icon={UserRound}
        title="系統資訊"
        description="目前瀏覽器本機資料統計。"
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <Stat label="個案數" value={stats.caseCount} />
          <Stat label="工作報表" value={stats.reportCount} />
          <Stat label="電訪紀錄" value={stats.phoneCount} />
          <Stat label="家訪紀錄" value={stats.visitCount} />
          <Stat label="版本" value={`v${form.version || "1.0"}`} />
        </div>
      </SettingSection>
    </form>
  );
}

function resetFormFromStorage() {
  try {
    const saved = localStorage.getItem("appSettings");
    return saved ? JSON.parse(saved) : {
      organizationName: "承恩居督",
      supervisorName: "聖權",
      visitCycleMonths: 3,
      phoneCycleMonths: 1,
      home: {
        showToday: true,
        showCompletionRate: true,
        showReminder: true,
        showPhone: true,
        showVisit: true,
        showDashboardCards: true,
      },
      version: "1.0",
    };
  } catch {
    return resetFormFromStorage();
  }
}

function SettingSection({ icon: Icon, title, description, children }) {
  return (
    <section className="rounded-2xl bg-white p-6 shadow">
      <div className="flex items-start gap-3 border-b border-slate-200 pb-5">
        <div className="rounded-xl bg-blue-100 p-3 text-blue-700">
          <Icon size={22} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-800">{title}</h2>
          <p className="mt-1 text-sm text-slate-500">{description}</p>
        </div>
      </div>
      <div className="pt-6">{children}</div>
    </section>
  );
}

function TextField({ label, value, onChange, required, placeholder }) {
  return (
    <label>
      <span className="mb-2 block font-medium text-slate-700">{label}</span>
      <input
        required={required}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
      />
    </label>
  );
}

function SelectField({ label, value, onChange, options }) {
  return (
    <label>
      <span className="mb-2 block font-medium text-slate-700">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
      >
        {options.map(([optionValue, optionLabel]) => (
          <option key={optionValue} value={optionValue}>
            {optionLabel}
          </option>
        ))}
      </select>
    </label>
  );
}

function Toggle({ label, checked, onChange }) {
  return (
    <label className="flex cursor-pointer items-center justify-between rounded-xl border border-slate-200 px-4 py-4 hover:bg-slate-50">
      <span className="font-medium text-slate-700">{label}</span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-5 w-5 accent-blue-600"
      />
    </label>
  );
}

function ActionButton({ icon: Icon, title, description, onClick, danger }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl border p-4 text-left transition ${
        danger
          ? "border-red-200 hover:bg-red-50"
          : "border-slate-200 hover:border-blue-300 hover:bg-blue-50"
      }`}
    >
      <Icon size={22} className={danger ? "text-red-600" : "text-blue-600"} />
      <div className={`mt-3 font-bold ${danger ? "text-red-700" : "text-slate-800"}`}>
        {title}
      </div>
      <div className="mt-1 text-sm text-slate-500">{description}</div>
    </button>
  );
}

function Stat({ label, value }) {
  return (
    <div className="rounded-xl bg-slate-50 p-4">
      <div className="text-sm text-slate-500">{label}</div>
      <div className="mt-2 text-2xl font-bold text-slate-800">{value}</div>
    </div>
  );
}
