"use client";

import { Button } from "@/components/ui/button";
import { deleteMajorTask } from "../actions";

export function DeleteTaskButton({ id }: { id: number }) {
  return (
    <form
      action={async () => {
        if (confirm("이 사업과 모든 회차 보고를 삭제하시겠습니까?")) {
          await deleteMajorTask(id);
        }
      }}
    >
      <Button type="submit" variant="destructive" size="sm">
        삭제
      </Button>
    </form>
  );
}
