const STORAGE_KEY = "appSettings";

export const DEFAULT_SETTINGS = {
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

function mergeSettings(value = {}) {
  return {
    ...DEFAULT_SETTINGS,
    ...value,
    home: {
      ...DEFAULT_SETTINGS.home,
      ...(value.home || {}),
    },
  };
}

export function getSettings() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? mergeSettings(JSON.parse(saved)) : mergeSettings();
  } catch {
    return mergeSettings();
  }
}

export function saveSettings(settings) {
  const next = mergeSettings(settings);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent("app-settings-changed", {
    detail: next,
  }));
  return next;
}

export function resetSettings() {
  localStorage.removeItem(STORAGE_KEY);
  const next = mergeSettings();
  window.dispatchEvent(new CustomEvent("app-settings-changed", {
    detail: next,
  }));
  return next;
}

export function getDisplayName(settings = getSettings()) {
  const organization = String(settings.organizationName || "").trim();
  const supervisor = String(settings.supervisorName || "").trim();

  if (organization && supervisor) return `${organization}－${supervisor}`;
  return organization || supervisor || "居督管理系統";
}

const BACKUP_KEYS = [
  "appSettings",
  "cases",
  "phoneScheduleData",
  "visitScheduleData",
  "reportData",
  "reports",
];

export function createBackup() {
  const data = {};

  BACKUP_KEYS.forEach((key) => {
    const value = localStorage.getItem(key);
    if (value !== null) {
      try {
        data[key] = JSON.parse(value);
      } catch {
        data[key] = value;
      }
    }
  });

  return {
    app: "居督管理系統",
    backupVersion: 1,
    exportedAt: new Date().toISOString(),
    data,
  };
}

export function downloadBackup() {
  const backup = createBackup();
  const blob = new Blob(
    [JSON.stringify(backup, null, 2)],
    { type: "application/json;charset=utf-8" }
  );

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const date = new Date().toISOString().slice(0, 10);

  link.href = url;
  link.download = `居督管理系統備份_${date}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export async function importBackup(file) {
  if (!file) throw new Error("未選擇檔案");

  let backup;
  try {
    backup = JSON.parse(await file.text());
  } catch {
    throw new Error("備份檔不是有效的 JSON 格式");
  }

  if (
    !backup ||
    typeof backup !== "object" ||
    !backup.data ||
    typeof backup.data !== "object"
  ) {
    throw new Error("備份檔格式不正確");
  }

  Object.entries(backup.data).forEach(([key, value]) => {
    if (!BACKUP_KEYS.includes(key)) return;
    localStorage.setItem(
      key,
      typeof value === "string" ? value : JSON.stringify(value)
    );
  });

  const settings = getSettings();
  window.dispatchEvent(new CustomEvent("app-settings-changed", {
    detail: settings,
  }));

  return backup;
}

export function clearAllAppData() {
  BACKUP_KEYS.forEach((key) => localStorage.removeItem(key));

  Object.keys(localStorage).forEach((key) => {
    if (
      key.startsWith("reports_") ||
      key.startsWith("reports-") ||
      key.startsWith("report_")
    ) {
      localStorage.removeItem(key);
    }
  });

  window.dispatchEvent(new CustomEvent("app-settings-changed", {
    detail: mergeSettings(),
  }));
}

export function getSystemStats() {
  const safeParse = (key, fallback) => {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : fallback;
    } catch {
      return fallback;
    }
  };

  const cases = safeParse("cases", []);
  const reports = safeParse("reportData", {});
  const phone = safeParse("phoneScheduleData", {});
  const visits = safeParse("visitScheduleData", {});

  const reportCount = Object.values(reports).reduce(
    (sum, list) => sum + (Array.isArray(list) ? list.length : 0),
    0
  );

  const phoneCount = Object.values(phone).reduce(
    (sum, item) => sum + (item?.completedPeriods?.length || 0),
    0
  );

  const visitCount = Object.values(visits).reduce(
    (sum, item) => sum + (item?.completedPeriods?.length || 0),
    0
  );

  return {
    caseCount: Array.isArray(cases) ? cases.length : 0,
    reportCount,
    phoneCount,
    visitCount,
  };
}
