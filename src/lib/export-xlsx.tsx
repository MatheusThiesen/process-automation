"use client";

import * as XLSX from "xlsx";

interface generateXlsxProps {
  data: any[];
  filename: string;
}

export async function exportXlsx({ data, filename }: generateXlsxProps) {
  const workSheet = XLSX.utils.json_to_sheet(data);
  const workBook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workBook, workSheet, "aba");
  XLSX.write(workBook, { bookType: "xlsx", type: "binary" });
  XLSX.writeFile(workBook, `${filename}.xlsx`);
}
