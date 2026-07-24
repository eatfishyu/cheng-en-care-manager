import reportData from "../data/reportData";

export function getReports(caseId) {
  return reportData[caseId] || [];
}

export function addReport(caseId, report) {
  if (!reportData[caseId]) {
    reportData[caseId] = [];
  }

  reportData[caseId].push(report);
}