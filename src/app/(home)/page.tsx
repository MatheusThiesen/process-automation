"use client";

import { Dropzone } from "@/components/Dropzone";
import { Button } from "@/components/ui/button";
import { exportXlsx } from "@/lib/export-xlsx";
import axios from "axios";
import { FileDown, File as FileIcon, X } from "lucide-react";
import { useState } from "react";

export default function Home() {
  const [file, setFile] = useState<File | undefined>();

  async function handleFileUpload() {
    if (file) {
      const formData = new FormData();
      formData.append("file", file);

      const response = await axios.post("/api/normalized-order", formData);

      await exportXlsx({
        data: response.data,
        filename: "Pedido-de-compre-adidas",
      });

      setFile(undefined);
    }
  }

  async function handleExportExample() {
    await exportXlsx({
      data: [
        {
          "cod.produto": "",
          oc: "",
          "oc.item": "",
          qtd: "",
        },
      ],
      filename: "arquivo-exemplo",
    });
  }

  return (
    <div className="h-screen flex justify-center items-center flex-col p-4">
      <div className="max-w-[600px] w-full">
        <div className="flex justify-center items-center mb-4">
          <h1 className="text-2xl font-bold ">Gerador pedido Adidas</h1>

          <Button className="ml-5" onClick={handleExportExample}>
            <FileDown />
          </Button>
        </div>

        <div>
          {!file && (
            <Dropzone
              onFileUploaded={(files) => {
                setFile(files[0]);
              }}
            />
          )}

          {file && (
            <div className="flex items-center justify-between bg-slate-800 rounded-md p-2">
              <div className="flex items-center">
                <FileIcon className="size-8 mr-2" />
                <span>{file.name}</span>
              </div>

              <Button
                variant="link"
                type="button"
                onClick={() => {
                  setFile(undefined);
                }}
              >
                <X />
              </Button>
            </div>
          )}

          <Button
            className="mt-10 w-full"
            size={"lg"}
            onClick={handleFileUpload}
          >
            GERAR
          </Button>
        </div>
      </div>
    </div>
  );
}
