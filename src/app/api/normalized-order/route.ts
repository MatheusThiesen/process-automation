import { dbSiger } from "@/services/dbSiger";
import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";

interface FileProps {
  "cod.produto": string;
  oc: string;
  "oc.item": string;
  qtd: string;
}

interface ProductOpenGridProps {
  sequencial: string;
  gradeCod: string;
  qtd: number;
}

interface GridProps {
  codigo: number;
  descricao: string;
  c1: string;
  c2: string;
  c3: string;
  c4: string;
  c5: string;
  c6: string;
  c7: string;
  c8: string;
  c9: string;
  c10: string;
  c11: string;
  c12: string;
  c13: string;
  c14: string;
  c15: string;
  c16: string;
  c17: string;
  c18: string;
  c19: string;
}

interface ProductProps {
  codigo: number;
  qtdEmbalagem: number;
  referencia: string;
}

interface OcProps {
  dtPrazoEnrega: Date;
}

interface NormalizedOrder {
  ID: string;
  Referência: string;
  Quantidade: number;
  Grade: string;
  Tamanho: string;
  "QTD embalagem": number;

  "cod.produto": string;
  oc: string;
  "oc.item": string;
  qtd: string;
}

export async function POST(request: NextRequest) {
  const data = await request.formData();
  const file: File | null = data.get("file") as unknown as File;

  if (!file) {
    return NextResponse.json({ success: false });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const workbook = XLSX.read(buffer, { type: "buffer" });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const sheetData = XLSX.utils.sheet_to_json<FileProps>(sheet);

  let normalized: NormalizedOrder[] = [];
  let count = 0;

  for (const row of sheetData) {
    const getProduct = (
      await dbSiger.$ExecuteQuery<ProductProps>(`
        select * from 01010s005.dev_produto p
        where p.codigo = ${row["cod.produto"]};
      `)
    )[0];

    const items = await dbSiger.$ExecuteQuery<ProductOpenGridProps>(` 
        select e.sequencial, e.gradeCod, e.qtd1 as "qtd" from 01010s005.dev_ean_grade e 
        where e.produtoCod  = ${row["cod.produto"]};`);

    const grid = (
      await dbSiger.$ExecuteQuery<GridProps>(` 
        select g.codigo, g.descricao,c1,c2,c3,c4,c5,c6,c7,c8,c9,c10,c11,c12,c13,c14,c15,c16,c17,c18,c19 from 01010s005.dev_grade_produto g 
        where g.codigo = ${items[0].gradeCod}
        limit 1;`)
    )[0];

    const multiple = Number(row.qtd) / getProduct.qtdEmbalagem;

    for (const item of items) {
      normalized.push({
        ID: `${row.oc}-${row["oc.item"]}/${row["cod.produto"]}`,
        Referência: getProduct.referencia,
        Quantidade: item.qtd * multiple,
        // @ts-ignore
        Tamanho: grid[`c${item.sequencial}`],
        Grade: `${grid.codigo} - ${grid.descricao}`,
        "QTD embalagem": getProduct.qtdEmbalagem,

        "cod.produto": row["cod.produto"],
        oc: row.oc,
        "oc.item": row["oc.item"],
        qtd: row.qtd,
      });
    }
    count++;
    console.log(`Produto (${row["cod.produto"]}) ${count}/${sheetData.length}`);
  }

  return NextResponse.json(normalized);
}
