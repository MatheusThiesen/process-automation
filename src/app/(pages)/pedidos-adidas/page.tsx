"use client";

import { Dropzone } from "@/components/Dropzone";
import { Button } from "@/components/ui/button";
import { exportXlsx } from "@/lib/export-xlsx";
import axios from "axios";
import {
  ArrowLeft,
  FileDown,
  File as FileIcon,
  LoaderCircle,
  X,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface FileProps {
  "cod.produto": string;
  oc: string;
  "oc.item": string;
  qtd: string;
}

interface LoadingDataProps {
  total: number;
  current: number;
  oc: string;
}

export default function Home() {
  const [file, setFile] = useState<File | undefined>();
  const [loading, setLoading] = useState(false);

  const [loadingData, setLoadingData] = useState<LoadingDataProps>(
    {} as LoadingDataProps
  );

  async function handleFileUpload() {
    try {
      if (file) {
        setLoading(true);
        const formData = new FormData();
        formData.append("file", file);

        const readingFile = await axios.post<FileProps[]>(
          "/api/reading-file-xlsx",
          formData
        );

        let normalized: any[] = [];

        let count = 0;
        for (const readingData of readingFile.data) {
          count++;

          setLoadingData({
            current: count,
            oc: `${readingData.oc} ${readingData["oc.item"]}`,
            total: readingFile.data.length,
          });

          const response = await axios.post(
            "/api/normalized-order",
            readingData
          );
          normalized = [...normalized, ...response.data];
        }

        await exportXlsx({
          data: normalized,
          filename: "Pedido-de-compre-adidas",
        });

        setFile(undefined);
        setLoading(false);
      }
    } catch (error) {
      console.log(error);
      alert("Ocorreu erro");
      setLoading(false);
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
        <div className="flex justify-between items-center mb-4">
          <Button className="mr-5">
            <Link href="/">
              <ArrowLeft />
            </Link>
          </Button>

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
            disabled={loading}
          >
            {loading ? (
              <div className="flex">
                <LoaderCircle className="animate-spin" />

                <span className="ml-2">{`${loadingData.current}/${loadingData.total}`}</span>
              </div>
            ) : (
              "GERAR"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
