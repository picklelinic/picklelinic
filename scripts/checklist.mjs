#!/usr/bin/env node
/*
 * 기능 체크리스트(docs/ERP_기능_체크리스트.json) 상태 관리 도구.
 *
 * 사용법:
 *   node scripts/checklist.mjs sync
 *       모든 항목 status 기준으로 meta.summary(done/total_tasks) 재계산.
 *       (Stop 훅이 매 턴 종료 시 자동 실행 → 문서 요약을 항상 정합화)
 *
 *   node scripts/checklist.mjs set <status> <ID...>
 *       지정한 작업 ID들의 status 를 변경 후 요약 재계산.
 *       status: todo | in_progress | done | hold
 *       예) node scripts/checklist.mjs set done F1-01 F1-03 F17-02
 *
 *   node scripts/checklist.mjs list [phase]
 *       현황 출력(선택적으로 특정 phase 만).
 *
 * 기능 구현이 완료되면 `set done <ID>` 로 표시하면 되고,
 * 요약 수치는 훅(또는 sync)이 자동으로 맞춘다.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const FILE = resolve(__dirname, "..", "docs", "ERP_기능_체크리스트.json");
const VALID = ["todo", "in_progress", "done", "hold"];

function load() {
  return JSON.parse(readFileSync(FILE, "utf8"));
}

function save(doc) {
  writeFileSync(FILE, JSON.stringify(doc, null, 2) + "\n", "utf8");
}

function allTasks(doc) {
  return doc.categories.flatMap((c) => c.tasks);
}

function recompute(doc) {
  const tasks = allTasks(doc);
  doc.meta.summary.total_tasks = tasks.length;
  doc.meta.summary.done = tasks.filter((t) => t.status === "done").length;
  doc.meta.summary.in_progress = tasks.filter((t) => t.status === "in_progress").length;
  return doc.meta.summary;
}

function cmdSync() {
  const doc = load();
  const s = recompute(doc);
  save(doc);
  console.log(`checklist synced: done ${s.done}/${s.total_tasks} (in_progress ${s.in_progress})`);
}

function cmdSet(status, ids) {
  if (!VALID.includes(status)) {
    console.error(`invalid status "${status}" (use: ${VALID.join(", ")})`);
    process.exit(1);
  }
  if (ids.length === 0) {
    console.error("no task IDs given");
    process.exit(1);
  }
  const doc = load();
  const byId = new Map(allTasks(doc).map((t) => [t.id, t]));
  const changed = [];
  const missing = [];
  for (const id of ids) {
    const t = byId.get(id);
    if (!t) {
      missing.push(id);
      continue;
    }
    if (t.status !== status) {
      t.status = status;
      changed.push(id);
    }
  }
  const s = recompute(doc);
  save(doc);
  if (changed.length) console.log(`set ${status}: ${changed.join(", ")}`);
  if (missing.length) console.warn(`not found: ${missing.join(", ")}`);
  console.log(`checklist: done ${s.done}/${s.total_tasks} (in_progress ${s.in_progress})`);
}

function cmdList(phaseArg) {
  const doc = load();
  const phase = phaseArg ? Number(phaseArg) : null;
  const mark = { done: "[x]", in_progress: "[~]", hold: "[!]", todo: "[ ]" };
  for (const c of doc.categories) {
    const tasks = phase == null ? c.tasks : c.tasks.filter((t) => t.phase === phase);
    if (tasks.length === 0) continue;
    console.log(`\n${c.id} ${c.name}`);
    for (const t of tasks) {
      console.log(`  ${mark[t.status] ?? "[?]"} ${t.id} (P${t.phase}) ${t.title}`);
    }
  }
  const s = recompute(doc);
  console.log(`\n총 ${s.total_tasks}건 · 완료 ${s.done} · 진행중 ${s.in_progress}`);
}

const [cmd, ...rest] = process.argv.slice(2);
switch (cmd) {
  case "sync":
    cmdSync();
    break;
  case "set":
    cmdSet(rest[0], rest.slice(1));
    break;
  case "list":
    cmdList(rest[0]);
    break;
  default:
    console.log("usage: checklist.mjs <sync | set <status> <ID...> | list [phase]>");
    process.exit(cmd ? 1 : 0);
}
