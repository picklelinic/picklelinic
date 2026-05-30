CREATE TYPE "public"."idea_status" AS ENUM('proposed', 'reviewing', 'adopted', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."policy_status" AS ENUM('draft', 'active');--> statement-breakpoint
CREATE TABLE "idea_votes" (
	"id" serial PRIMARY KEY NOT NULL,
	"idea_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ideas" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(200) NOT NULL,
	"body" text NOT NULL,
	"field_id" integer,
	"project_type_id" integer,
	"expected_effect" text,
	"status" "idea_status" DEFAULT 'proposed' NOT NULL,
	"author_id" integer,
	"vote_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "policies" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(200) NOT NULL,
	"status" "policy_status" DEFAULT 'draft' NOT NULL,
	"summary" text,
	"content" text,
	"field_id" integer,
	"project_type_id" integer,
	"department_id" integer,
	"team_id" integer,
	"town_id" integer,
	"budget_thousand" integer,
	"start_date" varchar(10),
	"end_date" varchar(10),
	"author_id" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "policy_comments" (
	"id" serial PRIMARY KEY NOT NULL,
	"policy_id" integer NOT NULL,
	"author_id" integer,
	"body" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "policy_history" (
	"id" serial PRIMARY KEY NOT NULL,
	"policy_id" integer NOT NULL,
	"from_status" "policy_status",
	"to_status" "policy_status" NOT NULL,
	"note" text,
	"changed_by" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "idea_votes" ADD CONSTRAINT "idea_votes_idea_id_ideas_id_fk" FOREIGN KEY ("idea_id") REFERENCES "public"."ideas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "idea_votes" ADD CONSTRAINT "idea_votes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ideas" ADD CONSTRAINT "ideas_field_id_codes_id_fk" FOREIGN KEY ("field_id") REFERENCES "public"."codes"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ideas" ADD CONSTRAINT "ideas_project_type_id_codes_id_fk" FOREIGN KEY ("project_type_id") REFERENCES "public"."codes"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ideas" ADD CONSTRAINT "ideas_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "policies" ADD CONSTRAINT "policies_field_id_codes_id_fk" FOREIGN KEY ("field_id") REFERENCES "public"."codes"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "policies" ADD CONSTRAINT "policies_project_type_id_codes_id_fk" FOREIGN KEY ("project_type_id") REFERENCES "public"."codes"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "policies" ADD CONSTRAINT "policies_department_id_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "policies" ADD CONSTRAINT "policies_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "policies" ADD CONSTRAINT "policies_town_id_towns_id_fk" FOREIGN KEY ("town_id") REFERENCES "public"."towns"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "policies" ADD CONSTRAINT "policies_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "policy_comments" ADD CONSTRAINT "policy_comments_policy_id_policies_id_fk" FOREIGN KEY ("policy_id") REFERENCES "public"."policies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "policy_comments" ADD CONSTRAINT "policy_comments_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "policy_history" ADD CONSTRAINT "policy_history_policy_id_policies_id_fk" FOREIGN KEY ("policy_id") REFERENCES "public"."policies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "policy_history" ADD CONSTRAINT "policy_history_changed_by_users_id_fk" FOREIGN KEY ("changed_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "idea_votes_uq" ON "idea_votes" USING btree ("idea_id","user_id");--> statement-breakpoint
CREATE INDEX "ideas_field_idx" ON "ideas" USING btree ("field_id");--> statement-breakpoint
CREATE INDEX "ideas_status_idx" ON "ideas" USING btree ("status");--> statement-breakpoint
CREATE INDEX "ideas_votes_idx" ON "ideas" USING btree ("vote_count");--> statement-breakpoint
CREATE INDEX "ideas_created_idx" ON "ideas" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "policies_status_idx" ON "policies" USING btree ("status");--> statement-breakpoint
CREATE INDEX "policies_field_idx" ON "policies" USING btree ("field_id");--> statement-breakpoint
CREATE INDEX "policies_dept_idx" ON "policies" USING btree ("department_id");--> statement-breakpoint
CREATE INDEX "policies_town_idx" ON "policies" USING btree ("town_id");--> statement-breakpoint
CREATE INDEX "policies_created_idx" ON "policies" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "policy_comments_policy_idx" ON "policy_comments" USING btree ("policy_id");--> statement-breakpoint
CREATE INDEX "policy_history_policy_idx" ON "policy_history" USING btree ("policy_id");