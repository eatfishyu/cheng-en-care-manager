const STORAGE_KEY = "reportData";

function loadData() {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : {};
}

function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function getReports(caseId) {
  const data = loadData();

  return (data[caseId] || []).sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );
}

export function addReport(caseId, report) {
  const data = loadData();

  if (!data[caseId]) {
    data[caseId] = [];
  }

  data[caseId].push({
    ...report,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });

  saveData(data);
}

export function updateReport(caseId, report) {
  const data = loadData();

  data[caseId] = (data[caseId] || []).map((item) =>
    item.id === report.id
      ? {
          ...report,
          createdAt: item.createdAt,
          updatedAt: Date.now(),
        }
      : item
  );

  saveData(data);
}

export function deleteReport(caseId, reportId) {
  const data = loadData();

  data[caseId] = (data[caseId] || []).filter(
    (item) => item.id !== reportId
  );

  saveData(data);
}