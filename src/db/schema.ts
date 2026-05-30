/*
 * Database schema — 서천군 정책관리 ERP
 * Phase 1: 인증·권한, 조직(부서/팀), 기준정보(공통코드·읍면), 감사 로그.
 * 후속 단계(정책/주요업무/순기표/공약/공모 등)는 별도 마이그레이션으로 확장한다.
 */
import {
  pgTable,
  pgEnum,
  serial,
  integer,
  varchar,
  text,
  boolean,
  timestamp,
  jsonb,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";

/* ---------------- Enums ---------------- */
// 3단계 권한: 관리자 / 중간관리자 / 일반 사용자
export const userRoleEnum = pgEnum("user_role", ["admin", "manager", "user"]);

// 공통코드 분류 카테고리 (분야/유형/재원/추진단계/군정목표 등)
export const codeCategoryEnum = pgEnum("code_category", [
  "field", // 분야
  "project_type", // 사업 성격(유형)
  "fund_source", // 재원구분
  "progress_stage", // 추진단계(상태)
  "policy_goal", // 군정 목표/시책 체계
]);

// 정책 상태: 구상(검토 전) / 시행(현재 시행 중)
export const policyStatusEnum = pgEnum("policy_status", ["draft", "active"]);

// 사업제안 검토 상태
export const ideaStatusEnum = pgEnum("idea_status", [
  "proposed", // 제안됨
  "reviewing", // 검토중
  "adopted", // 채택
  "rejected", // 반려
]);

/* ---------------- 조직: 부서 / 팀 ---------------- */
export const departments = pgTable(
  "departments",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 100 }).notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("departments_name_uq").on(t.name)],
);

export const teams = pgTable(
  "teams",
  {
    id: serial("id").primaryKey(),
    departmentId: integer("department_id")
      .notNull()
      .references(() => departments.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 100 }).notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("teams_department_idx").on(t.departmentId),
    uniqueIndex("teams_dept_name_uq").on(t.departmentId, t.name),
  ],
);

/* ---------------- 사용자 ---------------- */
export const users = pgTable(
  "users",
  {
    id: serial("id").primaryKey(),
    username: varchar("username", { length: 50 }).notNull(), // 로그인 ID
    name: varchar("name", { length: 50 }).notNull(),
    email: varchar("email", { length: 255 }),
    passwordHash: text("password_hash").notNull(),
    role: userRoleEnum("role").notNull().default("user"),
    departmentId: integer("department_id").references(() => departments.id, {
      onDelete: "set null",
    }),
    teamId: integer("team_id").references(() => teams.id, { onDelete: "set null" }),
    isSecretary: boolean("is_secretary").notNull().default(false), // 부서 서무 여부
    isActive: boolean("is_active").notNull().default(true),
    lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("users_username_uq").on(t.username),
    index("users_department_idx").on(t.departmentId),
    index("users_role_idx").on(t.role),
  ],
);

/* ---------------- 기준정보: 읍면(행정구역) ---------------- */
export const towns = pgTable(
  "towns",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 50 }).notNull(), // 예: 장항읍
    kind: varchar("kind", { length: 10 }).notNull().default("면"), // 읍/면/광역
    sortOrder: integer("sort_order").notNull().default(0),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("towns_name_uq").on(t.name)],
);

/* ---------------- 기준정보: 공통코드 ---------------- */
export const codes = pgTable(
  "codes",
  {
    id: serial("id").primaryKey(),
    category: codeCategoryEnum("category").notNull(),
    code: varchar("code", { length: 50 }).notNull(), // 머신용 키
    label: varchar("label", { length: 100 }).notNull(), // 표시 라벨
    parentId: integer("parent_id"), // 계층형(군정목표 대→세부 등)
    sortOrder: integer("sort_order").notNull().default(0),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("codes_category_code_uq").on(t.category, t.code),
    index("codes_category_idx").on(t.category),
    index("codes_parent_idx").on(t.parentId),
  ],
);

/* ---------------- 감사 로그 ---------------- */
export const auditLogs = pgTable(
  "audit_logs",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").references(() => users.id, { onDelete: "set null" }),
    action: varchar("action", { length: 20 }).notNull(), // create/update/delete/login
    entity: varchar("entity", { length: 50 }).notNull(), // 대상 테이블/리소스
    entityId: varchar("entity_id", { length: 50 }),
    detail: jsonb("detail"), // 변경 내용 스냅샷
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("audit_user_idx").on(t.userId),
    index("audit_entity_idx").on(t.entity, t.entityId),
    index("audit_created_idx").on(t.createdAt),
  ],
);

/* ---------------- 정책 아카이브 (Phase 2) ---------------- */
export const policies = pgTable(
  "policies",
  {
    id: serial("id").primaryKey(),
    title: varchar("title", { length: 200 }).notNull(),
    status: policyStatusEnum("status").notNull().default("draft"), // 구상/시행
    summary: text("summary"), // 한 줄 요약
    content: text("content"), // 상세 내용
    // 분류 (공통코드 codes 참조)
    fieldId: integer("field_id").references(() => codes.id, { onDelete: "set null" }),
    projectTypeId: integer("project_type_id").references(() => codes.id, {
      onDelete: "set null",
    }),
    // 담당 조직 / 지역
    departmentId: integer("department_id").references(() => departments.id, {
      onDelete: "set null",
    }),
    teamId: integer("team_id").references(() => teams.id, { onDelete: "set null" }),
    townId: integer("town_id").references(() => towns.id, { onDelete: "set null" }),
    // 사업비(천원), 기간
    budgetThousand: integer("budget_thousand"),
    startDate: varchar("start_date", { length: 10 }), // YYYY-MM-DD
    endDate: varchar("end_date", { length: 10 }),
    // 작성자
    authorId: integer("author_id").references(() => users.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("policies_status_idx").on(t.status),
    index("policies_field_idx").on(t.fieldId),
    index("policies_dept_idx").on(t.departmentId),
    index("policies_town_idx").on(t.townId),
    index("policies_created_idx").on(t.createdAt),
  ],
);

// 정책 상태 변경 이력 (구상→시행 전환 등)
export const policyHistory = pgTable(
  "policy_history",
  {
    id: serial("id").primaryKey(),
    policyId: integer("policy_id")
      .notNull()
      .references(() => policies.id, { onDelete: "cascade" }),
    fromStatus: policyStatusEnum("from_status"),
    toStatus: policyStatusEnum("to_status").notNull(),
    note: text("note"),
    changedBy: integer("changed_by").references(() => users.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("policy_history_policy_idx").on(t.policyId)],
);

// 정책별 의견(댓글)
export const policyComments = pgTable(
  "policy_comments",
  {
    id: serial("id").primaryKey(),
    policyId: integer("policy_id")
      .notNull()
      .references(() => policies.id, { onDelete: "cascade" }),
    authorId: integer("author_id").references(() => users.id, { onDelete: "set null" }),
    body: text("body").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("policy_comments_policy_idx").on(t.policyId)],
);

/* ---------------- 의견 / 사업제안 (Phase 2) ---------------- */
// 분야별 사업 제안 게시판
export const ideas = pgTable(
  "ideas",
  {
    id: serial("id").primaryKey(),
    title: varchar("title", { length: 200 }).notNull(),
    body: text("body").notNull(),
    fieldId: integer("field_id").references(() => codes.id, { onDelete: "set null" }),
    projectTypeId: integer("project_type_id").references(() => codes.id, {
      onDelete: "set null",
    }),
    expectedEffect: text("expected_effect"), // 기대효과
    status: ideaStatusEnum("status").notNull().default("proposed"),
    authorId: integer("author_id").references(() => users.id, { onDelete: "set null" }),
    voteCount: integer("vote_count").notNull().default(0), // 추천 수(denormalized)
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("ideas_field_idx").on(t.fieldId),
    index("ideas_status_idx").on(t.status),
    index("ideas_votes_idx").on(t.voteCount),
    index("ideas_created_idx").on(t.createdAt),
  ],
);

// 사업제안 추천/공감 (사용자별 1회)
export const ideaVotes = pgTable(
  "idea_votes",
  {
    id: serial("id").primaryKey(),
    ideaId: integer("idea_id")
      .notNull()
      .references(() => ideas.id, { onDelete: "cascade" }),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("idea_votes_uq").on(t.ideaId, t.userId)],
);

/* ---------------- Inferred types ---------------- */
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Department = typeof departments.$inferSelect;
export type Team = typeof teams.$inferSelect;
export type Town = typeof towns.$inferSelect;
export type Code = typeof codes.$inferSelect;
export type UserRole = (typeof userRoleEnum.enumValues)[number];
export type CodeCategory = (typeof codeCategoryEnum.enumValues)[number];
export type Policy = typeof policies.$inferSelect;
export type NewPolicy = typeof policies.$inferInsert;
export type PolicyComment = typeof policyComments.$inferSelect;
export type Idea = typeof ideas.$inferSelect;
export type NewIdea = typeof ideas.$inferInsert;
export type PolicyStatus = (typeof policyStatusEnum.enumValues)[number];
export type IdeaStatus = (typeof ideaStatusEnum.enumValues)[number];
