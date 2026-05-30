"use client";

import { Button } from "@/components/ui/button";
import { deletePolicy } from "../actions";

export function DeletePolicyButton({ id }: { id: number }) {
  return (
    <form
      action={async () => {
        if (confirm("이 정책을 삭제하시겠습니까? 되돌릴 수 없습니다.")) {
          await deletePolicy(id);
        }
      }}
    >
      <Button type="submit" variant="destructive" size="sm">
        삭제
      </Button>
    </form>
  );
}
