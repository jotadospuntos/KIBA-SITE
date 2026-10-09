CREATE TYPE "public"."blog_post_status" AS ENUM('draft', 'published');--> statement-breakpoint
CREATE TABLE "blog_categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "blog_categories_name_unique" UNIQUE("name")
);
--> statement-breakpoint
ALTER TABLE "blog_categories" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "blog_post_revisions" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "blog_post_revisions_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"post_id" uuid NOT NULL,
	"saved_at" timestamp with time zone DEFAULT now() NOT NULL,
	"saved_by" text NOT NULL,
	"snapshot" jsonb NOT NULL
);
--> statement-breakpoint
ALTER TABLE "blog_post_revisions" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "blog_posts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"excerpt" text DEFAULT '' NOT NULL,
	"search_description" text DEFAULT '' NOT NULL,
	"category_id" uuid,
	"author" text NOT NULL,
	"cover_image_url" text,
	"cover_image_alt" text DEFAULT '' NOT NULL,
	"body" jsonb NOT NULL,
	"status" "blog_post_status" DEFAULT 'draft' NOT NULL,
	"publish_at" timestamp with time zone,
	"created_by" text NOT NULL,
	"updated_by" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "blog_posts_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "blog_posts" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "blog_post_revisions" ADD CONSTRAINT "blog_post_revisions_post_id_blog_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."blog_posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blog_posts" ADD CONSTRAINT "blog_posts_category_id_blog_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."blog_categories"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "blog_post_revisions_post_idx" ON "blog_post_revisions" USING btree ("post_id","saved_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "blog_posts_public_idx" ON "blog_posts" USING btree ("status","publish_at" DESC NULLS LAST);