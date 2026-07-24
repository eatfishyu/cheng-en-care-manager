import { readCases } from "../utils/readExcel";

const STORAGE_KEY = "cases";
let cache = null;

function loadLocalCases() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

function saveLocalCases(cases) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cases));
  cache = [...cases];
}

function getCurrentPeriod() {
  const now = new Date();

  return `${now.getFullYear()}-${String(
    now.getMonth() + 1
  ).padStart(2, "0")}`;
}

function dateToPeriod(date) {
  if (!date) return "";

  const match = String(date).match(/^(\d{4})-(\d{1,2})/);

  if (!match) return "";

  return `${match[1]}-${String(Number(match[2])).padStart(
    2,
    "0"
  )}`;
}

function normalizeVisitPeriod(value) {
  if (!value) return getCurrentPeriod();

  const text = String(value).trim();

  if (/^\d{4}-\d{1,2}$/.test(text)) {
    const [year, month] = text.split("-");

    return `${year}-${String(Number(month)).padStart(
      2,
      "0"
    )}`;
  }

  const fullDateMatch = text.match(
    /^(\d{4})-(\d{1,2})-(\d{1,2})$/
  );

  if (fullDateMatch) {
    return `${fullDateMatch[1]}-${String(
      Number(fullDateMatch[2])
    ).padStart(2, "0")}`;
  }

  const rocMatch = text.match(
    /(\d{2,3})\s*年\s*(\d{1,2})\s*月?/
  );

  if (rocMatch) {
    const year = Number(rocMatch[1]) + 1911;
    const month = String(Number(rocMatch[2])).padStart(
      2,
      "0"
    );

    return `${year}-${month}`;
  }

  const monthMatch = text.match(/(\d{1,2})/);

  if (monthMatch) {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    const visitMonth = Number(monthMatch[1]);

    const year =
      visitMonth >= currentMonth
        ? currentYear
        : currentYear + 1;

    return `${year}-${String(visitMonth).padStart(
      2,
      "0"
    )}`;
  }

  return getCurrentPeriod();
}

function normalizeCase(item, index) {
  const name =
    item.name ||
    item["個案名稱"] ||
    item["姓名"] ||
    "";

  const address =
    item.address ||
    item["地址"] ||
    "";

  const manager =
    item.manager ||
    item["負責人"] ||
    "";

  const gender =
    item.gender ||
    item["性別"] ||
    "";

  const age =
    item.age ??
    item["年齡"] ??
    "";

  const phone =
    item.phone ||
    item["電話"] ||
    item["聯絡電話"] ||
    "";

  const firstVisitDate =
    item.firstVisitDate ||
    item["首次家訪日期"] ||
    "";

  const visitValue =
    item.nextVisitPeriod ||
    dateToPeriod(firstVisitDate) ||
    item["家訪"] ||
    item["家訪月份"] ||
    item.visitMonth;

  const id =
    item.id !== undefined && item.id !== null
      ? item.id
      : index;

  return {
    ...item,

    id,
    name,
    address,
    manager,
    gender,
    age,
    phone,
    firstVisitDate,

    nextVisitPeriod: normalizeVisitPeriod(visitValue),

    phoneMonth:
      item.phoneMonth ||
      new Date().getMonth() + 1,

    "個案名稱": name,
    "姓名": name,
    "地址": address,
    "負責人": manager,
    "性別": gender,
    "年齡": age,
    "電話": phone,
    "首次家訪日期": firstVisitDate,
  };
}

export async function getCases() {
  if (cache) return cache;

  const localCases = loadLocalCases();

  if (localCases?.length) {
    cache = localCases.map(normalizeCase);
    saveLocalCases(cache);

    return cache;
  }

  const excelCases = await readCases();

  cache = excelCases.map(normalizeCase);
  saveLocalCases(cache);

  return cache;
}

export async function getCaseById(id) {
  const cases = await getCases();

  return cases.find(
    (item) => String(item.id) === String(id)
  );
}

export async function addCase(person) {
  const cases = await getCases();

  const newCase = normalizeCase(
    {
      ...person,
      id: Date.now(),
    },
    cases.length
  );

  const updatedCases = [...cases, newCase];

  saveLocalCases(updatedCases);

  return newCase;
}

export async function updateCase(updatedCase) {
  const cases = await getCases();

  const normalizedCase = normalizeCase(
    updatedCase,
    updatedCase.id
  );

  const updatedCases = cases.map((item) =>
    String(item.id) === String(normalizedCase.id)
      ? normalizedCase
      : item
  );

  saveLocalCases(updatedCases);

  return normalizedCase;
}

export async function deleteCase(id) {
  const cases = await getCases();

  const updatedCases = cases.filter(
    (item) => String(item.id) !== String(id)
  );

  saveLocalCases(updatedCases);

  removeRelatedLocalData(id);
}

function removeRelatedLocalData(caseId) {
  const id = String(caseId);

  removeObjectEntry("visitScheduleData", id);
  removeObjectEntry("phoneScheduleData", id);

  // 支援以個案編號分開儲存工作報表的情況
  localStorage.removeItem(`reports_${id}`);
  localStorage.removeItem(`reports-${id}`);
  localStorage.removeItem(`report_${id}`);

  // 支援全部工作報表存在同一個物件的情況
  removeObjectEntry("reports", id);
  removeObjectEntry("reportData", id);
}

function removeObjectEntry(storageKey, id) {
  try {
    const raw = localStorage.getItem(storageKey);

    if (!raw) return;

    const data = JSON.parse(raw);

    if (
      data &&
      typeof data === "object" &&
      !Array.isArray(data)
    ) {
      delete data[id];

      localStorage.setItem(
        storageKey,
        JSON.stringify(data)
      );
    }
  } catch {
    // 無法解析時不影響刪除個案
  }
}

export function clearCaseCache() {
  cache = null;
}