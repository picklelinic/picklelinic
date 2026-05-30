"use client";

import { Button } from "@/components/ui/button";
import { toggleKeyPolicy } from "../actions";

export function KeyPolicyToggle({ itemId, isKey }: { itemId: number; isKey: boolean }) {
  return (
    <form action={toggleKeyPolicy.bind(null, itemId)}>
      <Button type="submit" variant={isKey ? "default" : "outline"} size="sm">
        {isKey ? "주요사업 해제" : "★ 주요사업 지정"}
      </Button>
    </form>
  );
}
