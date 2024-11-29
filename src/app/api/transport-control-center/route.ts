import { dbPortal } from "@/services/dbPortal";
import { dbSiger } from "@/services/dbSiger";
import { format } from "date-fns";
import { NextRequest, NextResponse } from "next/server";

interface RequestProps {
  dateStart: Date;
  dateEnd: Date;
}

interface ResponseProps {
  EMPRESA: string;
  NF: string;
  VALOR_NOTA: number;
  DATA_FATURAMENTO: Date;
  UF: string;
  CIDADE: string;
  COD_CLIENTE: number;
  CLIENTE: string;
  COD_TRANSPORTADORA: number;
  TRANSPORTADORA: string;
  COD_MARCA: number;
  MARCA: string;

  DEVOLUÇÃO_PORTAL?: string;
  TÍTULOS_SUSTADO?: string;
  TÍTULOS_PROTESTO?: string;
}

type InvoiceProps = {
  EMPRESA: string;
  NF: string;
  VALOR_NOTA: number;
  DATA_FATURAMENTO: Date;
  UF: string;
  CIDADE: string;
  COD_CLIENTE: number;
  CLIENTE: string;
  COD_TRANSPORTADORA: number;
  TRANSPORTADORA: string;
  COD_MARCA: number;
  MARCA: string;
};
type DevolutionProps = {
  id: number;
  numberInvoice: string;
};
type Billet = {
  locCob: number;
  situacao: number;
  situacaoDescricao: string;
};

export async function POST(request: NextRequest) {
  const { dateStart, dateEnd } = (await request.json()) as RequestProps;

  const invoices = await dbSiger.$ExecuteQuery<InvoiceProps>(`
    select
      n.sigemp as "EMPRESA",
      n.nota as "NF",
      p.vlrNota as "VALOR_NOTA",
      p.dtFaturamento as "DATA_FATURAMENTO",
      c.uf as "UF",
      c.cidade as "CIDADE",
      p.clienteCod as "COD_CLIENTE",
      c.razaoSocial as "CLIENTE",
      p.transportadoraCod as "COD_TRANSPORTADORA",
      t.descricao as "TRANSPORTADORA",
      n.marcaCod as "COD_MARCA",
      n.marcaDesc as "MARCA"
    from ( select distinct n1.sigemp,n1.nota,n1.pedido,n1.marcaCod,n1.marcaDesc	from 01010s005.dev_pedidos_notas n1  ) as n
    inner join 01010s005.dev_pedidos p on p.sigemp = n.sigemp and p.codigo = n.pedido
    inner join 01010s005.dev_cliente c on c.clienteCod = p.clienteCod
    inner join 01010s005.dev_transportadora t on p.transportadoraCod = t.transportadoraCod
    where
      p.dtFaturamento BETWEEN
        CAST('${format(dateStart, "yyyy-MM-dd")}' AS DATE)
        AND
        CAST('${format(dateEnd, "yyyy-MM-dd")}' AS DATE)

    `);

  let normalized: ResponseProps[] = invoices.map((item) => ({
    ...item,
    DEVOLUÇÃO_PORTAL: "",
    TÍTULOS_SUSTADO: "",
    TÍTULOS_PROTESTO: "",
  }));

  if (normalized.filter((item) => item.NF).length >= 1) {
    const listDevolution = await dbPortal.$ExecuteQuery<DevolutionProps>(`
          select d.id,d."numberInvoice" from devolution d 
          where d."numberInvoice" in (${normalized
            .filter((item) => item.NF)
            .map((item) => `'${item.NF}'`)
            .join(",")})
        `);

    for (const devolution of listDevolution) {
      const find = normalized.find(
        (f) => Number(f.NF) === Number(devolution.numberInvoice)
      );

      if (find) {
        find.DEVOLUÇÃO_PORTAL = devolution.id.toString();
      }
    }
  }

  normalized = await Promise.all(
    normalized.map(async (item) => {
      const billet = await dbSiger.$ExecuteQuery<Billet>(`
        select t.locCob, t.situacao, t.situacaoDescricao  from 01010s005.dev_titulo t
        where t.numero = ${item.NF}  ;
      `);

      const BILLET_SUSTADO = billet.filter(
        (f) => f.locCob === 49 || f.locCob === 63
      );
      const BILLET_PROTESTO = billet.filter((f) => f.situacao === 14);

      return {
        ...item,
        TÍTULOS_SUSTADO: BILLET_SUSTADO.length >= 1 ? "SUSTADO" : "",
        TÍTULOS_PROTESTO: BILLET_PROTESTO.length >= 1 ? "EM PROTESTO" : "",
      };
    })
  );

  return NextResponse.json(normalized);
}
