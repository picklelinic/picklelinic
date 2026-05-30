CREATE TYPE "public"."grant_stage" AS ENUM('applied', 'selected', 'rejected', 'granted', 'executing');--> statement-breakpoint
CREATE TYPE "public"."pledge_status" AS ENUM('normal', 'partial', 'delayed', 'completed', 'changed');--> statement-breakpoint
CREATE TABLE "cycle_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(200) NOT NULL,
	"department_id" integer,
	"team_id" integer,
	"town_id" integer,
	"field_id" integer,
	"fund_source_id" integer,
	"budget_thousand" integer,
	"start_year" integer,
	"end_year" integer,
	"is_key_policy" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_by" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cycle_reports" (
	"id" serial PRIMARY KEY NOT NULL,
	"item_id" integer NOT NULL,
	"year" integer NOT NULL,
	"quarter" integer NOT NULL,
	"content" text,
	"progress" text,
	"future_plan" text,
	"budget_thousand" integer,
	"executed_thousand" integer,
	"note" text,
	"created_by" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "grants" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(300) NOT NULL,
	"agency" varchar(200),
	"department_id" integer,
	"field_id" integer,
	"stage" "grant_stage" DEFAULT 'applied' NOT NULL,
	"requested_thousand" integer,
	"selected_thousand" integer,
	"national_thousand" integer,
	"provincial_thousand" integer,
	"county_thousand" integer,
	"investment_review" varchar(50),
	"period_text" varchar(100),
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "kpis" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(300) NOT NULL,
	"department_id" integer,
	"field_id" integer,
	"year" integer NOT NULL,
	"unit" varchar(30),
	"target_value" integer,
	"actual_value" integer,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "major_task_reports" (
	"id" serial PRIMARY KEY NOT NULL,
	"task_id" integer NOT NULL,
	"year" integer NOT NULL,
	"round" integer NOT NULL,
	"goal" text,
	"budget_thousand" integer,
	"period_text" varchar(100),
	"location_text" varchar(200),
	"content" text,
	"progress" text,
	"future_plan" text,
	"problem" text,
	"effect" text,
	"refs" text,
	"created_by" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "major_tasks" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(200) NOT NULL,
	"department_id" integer,
	"team_id" integer,
	"town_id" integer,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_by" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pledges" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(300) NOT NULL,
	"level" integer DEFAULT 1 NOT NULL,
	"parent_id" integer,
	"department_id" integer,
	"status" "pledge_status" DEFAULT 'normal' NOT NULL,
	"progress_pct" integer DEFAULT 0 NOT NULL,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "schedules" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(200) NOT NULL,
	"category" varchar(30) NOT NULL,
	"due_date" varchar(10) NOT NULL,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "cycle_items" ADD CONSTRAINT "cycle_items_department_id_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cycle_items" ADD CONSTRAINT "cycle_items_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cycle_items" ADD CONSTRAINT "cycle_items_town_id_towns_id_fk" FOREIGN KEY ("town_id") REFERENCES "public"."towns"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cycle_items" ADD CONSTRAINT "cycle_items_field_id_codes_id_fk" FOREIGN KEY ("field_id") REFERENCES "public"."codes"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cycle_items" ADD CONSTRAINT "cycle_items_fund_source_id_codes_id_fk" FOREIGN KEY ("fund_source_id") REFERENCES "public"."codes"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cycle_items" ADD CONSTRAINT "cycle_items_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cycle_reports" ADD CONSTRAINT "cycle_reports_item_id_cycle_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."cycle_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cycle_reports" ADD CONSTRAINT "cycle_reports_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "grants" ADD CONSTRAINT "grants_department_id_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "grants" ADD CONSTRAINT "grants_field_id_codes_id_fk" FOREIGN KEY ("field_id") REFERENCES "public"."codes"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kpis" ADD CONSTRAINT "kpis_department_id_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kpis" ADD CONSTRAINT "kpis_field_id_codes_id_fk" FOREIGN KEY ("field_id") REFERENCES "public"."codes"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "major_task_reports" ADD CONSTRAINT "major_task_reports_task_id_major_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."major_tasks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "major_task_reports" ADD CONSTRAINT "major_task_reports_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "major_tasks" ADD CONSTRAINT "major_tasks_department_id_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "major_tasks" ADD CONSTRAINT "major_tasks_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "major_tasks" ADD CONSTRAINT "major_tasks_town_id_towns_id_fk" FOREIGN KEY ("town_id") REFERENCES "public"."towns"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "major_tasks" ADD CONSTRAINT "major_tasks_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pledges" ADD CONSTRAINT "pledges_department_id_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "cycle_items_dept_idx" ON "cycle_items" USING btree ("department_id");--> statement-breakpoint
CREATE INDEX "cycle_items_town_idx" ON "cycle_items" USING btree ("town_id");--> statement-breakpoint
CREATE INDEX "cycle_items_keypolicy_idx" ON "cycle_items" USING btree ("is_key_policy");--> statement-breakpoint
CREATE INDEX "cycle_items_endyear_idx" ON "cycle_items" USING btree ("end_year");--> statement-breakpoint
CREATE UNIQUE INDEX "cycle_reports_uq" ON "cycle_reports" USING btree ("item_id","year","quarter");--> statement-breakpoint
CREATE INDEX "cycle_reports_period_idx" ON "cycle_reports" USING btree ("year","quarter");--> statement-breakpoint
CREATE INDEX "grants_stage_idx" ON "grants" USING btree ("stage");--> statement-breakpoint
CREATE INDEX "grants_dept_idx" ON "grants" USING btree ("department_id");--> statement-breakpoint
CREATE INDEX "kpis_year_idx" ON "kpis" USING btree ("year");--> statement-breakpoint
CREATE INDEX "kpis_dept_idx" ON "kpis" USING btree ("department_id");--> statement-breakpoint
CREATE UNIQUE INDEX "major_task_reports_uq" ON "major_task_reports" USING btree ("task_id","year","round");--> statement-breakpoint
CREATE INDEX "major_task_reports_period_idx" ON "major_task_reports" USING btree ("year","round");--> statement-breakpoint
CREATE INDEX "major_tasks_dept_idx" ON "major_tasks" USING btree ("department_id");--> statement-breakpoint
CREATE INDEX "major_tasks_town_idx" ON "major_tasks" USING btree ("town_id");--> statement-breakpoint
CREATE INDEX "pledges_parent_idx" ON "pledges" USING btree ("parent_id");--> statement-breakpoint
CREATE INDEX "pledges_level_idx" ON "pledges" USING btree ("level");--> statement-breakpoint
CREATE INDEX "schedules_due_idx" ON "schedules" USING btree ("due_date");