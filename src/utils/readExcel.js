import * as XLSX from "xlsx";

export async function readCases() {
  const response = await fetch("/個案名單1150724.xlsx");
  const data = await response.arrayBuffer();

  const workbook = XLSX.read(data);

  const sheet = workbook.Sheets[workbook.SheetNames[0]];

  const json = XLSX.utils.sheet_to_json(sheet, {
    defval: "",
  });

  console.log("Excel資料", json);

  return json;
}