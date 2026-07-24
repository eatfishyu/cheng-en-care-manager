import { getSettings } from "./settingsService";

const STORAGE_KEY = "visitScheduleData";

function loadData() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);

    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
}

function saveData(data) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(data)
  );
}

export function getCurrentPeriod() {
  const now = new Date();

  return `${now.getFullYear()}-${String(
    now.getMonth() + 1
  ).padStart(2, "0")}`;
}

export function addMonths(period, amount) {
  const [year, month] = period
    .split("-")
    .map(Number);

  const date = new Date(year, month - 1 + amount, 1);

  return `${date.getFullYear()}-${String(
    date.getMonth() + 1
  ).padStart(2, "0")}`;
}

export function formatPeriod(period) {
  if (!period) return "";

  const [year, month] = period
    .split("-")
    .map(Number);

  const rocYear = year - 1911;

  return `${rocYear}年${month}月`;
}

export function getVisitRecord(
  caseId,
  defaultNextPeriod
) {
  const data = loadData();
  const key = String(caseId);

  if (!data[key]) {
    data[key] = {
      nextVisitPeriod:
        defaultNextPeriod || getCurrentPeriod(),

      completedPeriods: [],
    };

    saveData(data);
  }

  return data[key];
}

export function initializeVisitRecords(cases) {
  const data = loadData();
  let changed = false;

  cases.forEach((person) => {
    const key = String(person.id);

    if (!data[key]) {
      data[key] = {
        nextVisitPeriod:
          person.nextVisitPeriod ||
          getCurrentPeriod(),

        completedPeriods: [],
      };

      changed = true;
    }
  });

  if (changed) {
    saveData(data);
  }

  return data;
}

export function getVisitSchedule(cases) {
  const data = initializeVisitRecords(cases);

  return cases.map((person) => {
    const record = data[String(person.id)] || {
      nextVisitPeriod:
        person.nextVisitPeriod ||
        getCurrentPeriod(),

      completedPeriods: [],
    };

    return {
      ...person,

      nextVisitPeriod:
        record.nextVisitPeriod,

      completedPeriods:
        record.completedPeriods || [],
    };
  });
}

export function finishVisit(
  caseId,
  completedPeriod = getCurrentPeriod()
) {
  const data = loadData();
  const key = String(caseId);

  const currentRecord = data[key] || {
    nextVisitPeriod: completedPeriod,
    completedPeriods: [],
  };

  const completedPeriods = Array.from(
    new Set([
      ...(currentRecord.completedPeriods || []),
      completedPeriod,
    ])
  );

  data[key] = {
    ...currentRecord,

    completedPeriods,

    // 依設定週期安排下一次家訪
    nextVisitPeriod: addMonths(
      completedPeriod,
      Number(getSettings().visitCycleMonths) || 3
    ),
  };

  saveData(data);

  return data[key];
}

export function undoVisit(
  caseId,
  period = getCurrentPeriod()
) {
  const data = loadData();
  const key = String(caseId);

  if (!data[key]) return null;

  data[key] = {
    ...data[key],

    nextVisitPeriod: period,

    completedPeriods: (
      data[key].completedPeriods || []
    ).filter((item) => item !== period),
  };

  saveData(data);

  return data[key];
}

export function updateNextVisitPeriod(
  caseId,
  period
) {
  const data = loadData();
  const key = String(caseId);

  data[key] = {
    ...(data[key] || {
      completedPeriods: [],
    }),

    nextVisitPeriod: period,
  };

  saveData(data);

  return data[key];
}

export function removeVisitRecord(caseId) {
  const data = loadData();

  delete data[String(caseId)];

  saveData(data);
}