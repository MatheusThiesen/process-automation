"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <div className="h-screen flex justify-center items-center flex-col p-4">
      <div className="max-w-[600px] w-full">
        <div className="flex justify-center items-center mb-4">
          <h1 className="text-2xl font-bold ">Automações</h1>
        </div>

        <div>
          <Button className="mt-10 w-full" size={"lg"}>
            <Link href="/pedidos-adidas">PEDIDOS ADIDAS</Link>
          </Button>
          <Button className="mt-5 w-full" size={"lg"}>
            <Link href="/centro-controle-transportes">
              CENTRO DE CONTROLE DE TRANSPORTES
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
