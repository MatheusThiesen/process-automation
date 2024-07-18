"client";

import * as XLSX from "xlsx";

export function xlsxToJson<T>(file: File) {
  let data: T[] = [];
  const reader = new FileReader();

  reader.onload = (event: any) => {
    const workbook = XLSX.read(event.target.result, { type: "binary" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const sheetData = XLSX.utils.sheet_to_json(sheet);

    console.log(sheetData);

    data = sheetData as any;
  };

  reader.readAsBinaryString(file as any);
}
