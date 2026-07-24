CREATE TABLE "site_content" (
	"id" integer PRIMARY KEY,
	"data" text NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
