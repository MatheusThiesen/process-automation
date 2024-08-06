"use client";

import { DatePickerWithRange } from "@/components/date-range-picker";
import { Button } from "@/components/ui/button";
import { exportXlsx } from "@/lib/export-xlsx";
import axios from "axios";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { DateRange } from "react-day-picker";

export default function Home() {
  const [date, setDate] = useState<DateRange | undefined>({
    from: undefined,
    to: undefined,
  });

  const [isLoading, setIsLoading] = useState(false);

  async function handleExport() {
    setIsLoading(true);

    try {
      const response = await axios.post("/api/transport-control-center", {
        dateStart: date?.from,
        dateEnd: date?.to,
      });

      await exportXlsx({
        data: response.data,
        filename: `centro-controle-transportes`,
      });
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
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

          <h1 className="text-2xl font-bold ">
            Centro de controle de transportes
          </h1>

          <div></div>
        </div>

        <div className="flex flex-col justify-center align-middle mt-6">
          <label htmlFor="">Data de faturamento</label>
          <DatePickerWithRange date={date} onChangeDate={setDate} />

          <Button
            className="mt-10 w-full"
            size={"lg"}
            onClick={handleExport}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              "GERAR"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
