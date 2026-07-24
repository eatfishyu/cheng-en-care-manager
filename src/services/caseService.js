import { readCases } from "../utils/readExcel";

export async function getAllCases() {
  return await readCases();
}

export async function getCaseById(id) {
  const cases = await readCases();
  return cases[Number(id)];
}