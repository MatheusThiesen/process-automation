import { dbSiger } from "@/services/dbSiger";
import { NextRequest, NextResponse } from "next/server";

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
  const data = (await request.json()) as FileProps;

  if (!data) {
    return NextResponse.json({ success: false });
  }

  let normalized: NormalizedOrder[] = [] as NormalizedOrder[];

  const getProduct = (
    await dbSiger.$ExecuteQuery<ProductProps>(`
        select * from 01010s005.dev_produto p
        where p.codigo = ${data["cod.produto"]};
      `)
  )[0];

  const items = await dbSiger.$ExecuteQuery<ProductOpenGridProps>(` 
        select e.sequencial, e.gradeCod, e.qtd1 as "qtd" from 01010s005.dev_ean_grade e 
        where e.produtoCod  = ${data["cod.produto"]};`);

  const grid = (
    await dbSiger.$ExecuteQuery<GridProps>(` 
        select g.codigo, g.descricao,c1,c2,c3,c4,c5,c6,c7,c8,c9,c10,c11,c12,c13,c14,c15,c16,c17,c18,c19 from 01010s005.dev_grade_produto g 
        where g.codigo = ${items[0].gradeCod}
        limit 1;`)
  )[0];

  const multiple = Number(data.qtd) / getProduct.qtdEmbalagem;

  for (const item of items) {
    normalized.push({
      ID: `${data.oc}-${data["oc.item"]}/${data["cod.produto"]}`,
      Referência: getProduct.referencia,
      Quantidade: item.qtd * multiple,
      // @ts-ignore
      Tamanho: grid[`c${item.sequencial}`],
      Grade: `${grid.codigo} - ${grid.descricao}`,
      "QTD embalagem": getProduct.qtdEmbalagem,

      "cod.produto": data["cod.produto"],
      oc: data.oc,
      "oc.item": data["oc.item"],
      qtd: data.qtd,
    });
  }

  return NextResponse.json(normalized);
}
