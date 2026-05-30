"use client";

import { Button } from "@/components/ui/button";
import { deleteCycleItem } from "../actions";

export function DeleteCycleButton({ id }: { id: number }) {
  return (
    <form
      action={async () => {
        if (confirm("이 사업과 모든 분기 보고를 삭제하시겠습니까?")) {
          await deleteCycleItem(id);
        }
      }}
    >
      <Button type="submit" variant="destructive" size="sm">삭제</Button>
    </form>
  );
}
