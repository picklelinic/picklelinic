"use client";

import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

/** 브라우저 인쇄 → PDF 저장 (행정 보고서 출력 F13-03) */
export function PrintButton({ label = "인쇄 / PDF" }: { label?: string }) {
  return (
    <Button type="button" variant="outline" size="sm" onClick={() => window.print()}>
      <Printer className="size-4" />
      {label}
    </Button>
  );
}
