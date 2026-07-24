const STORAGE_KEY = "phoneScheduleData";

function loadData() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    return saved ? JSON.parse(saved) : {};
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

export function getCurrentPhonePeriod() {
  const now = new Date();

  return `${now.getFullYear()}-${String(
    now.getMonth() + 1
  ).padStart(2, "0")}`;
}

export function addPhoneMonths(period, amount) {
  const [year, month] = period
    .split("-")
    .map(Number);

  const date = new Date(
    year,
    month - 1 + amount,
    1
  );

  return `${date.getFullYear()}-${String(
    date.getMonth() + 1
  ).padStart(2, "0")}`;
}

export function formatPhonePeriod(period) {
  if (!period) return "";

  const [year, month] = period
    .split("-")
    .map(Number);

  return `${year - 1911}年${month}月`;
}

export function initializePhoneRecords(cases) {
  const data = loadData();
  let changed = false;

  cases.forEach((person) => {
    const key = String(person.id);

    if (!data[key]) {
      data[key] = {
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

export function getPhoneSchedule(cases) {
  const data = initializePhoneRecords(cases);

  return cases.map((person) => {
    const record = data[String(person.id)] || {
      completedPeriods: [],
    };

    return {
      ...person,

      completedPhonePeriods:
        record.completedPeriods || [],
    };
  });
}

export function finishPhone(
  caseId,
  period = getCurrentPhonePeriod()
) {
  const data = loadData();
  const key = String(caseId);

  const currentRecord = data[key] || {
    completedPeriods: [],
  };

  data[key] = {
    completedPeriods: Array.from(
      new Set([
        ...(currentRecord.completedPeriods || []),
        period,
      ])
    ),
  };

  saveData(data);

  return data[key];
}

export function undoPhone(
  caseId,
  period = getCurrentPhonePeriod()
) {
  const data = loadData();
  const key = String(caseId);

  if (!data[key]) return null;

  data[key] = {
    completedPeriods: (
      data[key].completedPeriods || []
    ).filter((item) => item !== period),
  };

  saveData(data);

  return data[key];
}

export function removePhoneRecord(caseId) {
  const data = loadData();

  delete data[String(caseId)];

  saveData(data);
}