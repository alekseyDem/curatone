import type { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'

// Run the whole DDL block through the pg pool's SIMPLE query protocol
// (drizzle's execute uses prepared statements, which reject multi-command SQL).
type PoolLike = { pool: { query: (text: string) => Promise<unknown> } }

export async function up({ payload }: MigrateUpArgs): Promise<void> {
  await (payload.db as unknown as PoolLike).pool.query(`
   CREATE TYPE "public"."enum_exhibitions_categories" AS ENUM('painting', 'drawing', 'photography', 'digital-art', 'mixed-media', 'illustration', 'modern-art', 'sculpture', 'ceramics');
  CREATE TYPE "public"."enum_exhibitions_type" AS ENUM('competition', 'personal', 'group', 'featured');
  CREATE TYPE "public"."enum_exhibitions_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_exhibitions_payments_currency" AS ENUM('usd', 'eur');
  CREATE TYPE "public"."enum__exhibitions_v_version_categories" AS ENUM('painting', 'drawing', 'photography', 'digital-art', 'mixed-media', 'illustration', 'modern-art', 'sculpture', 'ceramics');
  CREATE TYPE "public"."enum__exhibitions_v_version_type" AS ENUM('competition', 'personal', 'group', 'featured');
  CREATE TYPE "public"."enum__exhibitions_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__exhibitions_v_version_payments_currency" AS ENUM('usd', 'eur');
  CREATE TYPE "public"."enum_submissions_category" AS ENUM('painting', 'drawing', 'photography', 'digital-art', 'mixed-media', 'illustration', 'modern-art', 'sculpture', 'ceramics');
  CREATE TYPE "public"."enum_submissions_award_tier" AS ENUM('platinum', 'gold', 'silver');
  CREATE TYPE "public"."enum_journal_articles_status" AS ENUM('submitted', 'under-review', 'accepted', 'rejected', 'published');
  CREATE TYPE "public"."enum_journal_articles_article_type" AS ENUM('research', 'expert-insight', 'visual-essay', 'interview');
  CREATE TYPE "public"."enum_blog_posts_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__blog_posts_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_pages_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__pages_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_jury_members_membership_tier" AS ENUM('jury', 'expert');
  CREATE TYPE "public"."enum_participants_role" AS ENUM('participant', 'jury', 'admin', 'member');
  CREATE TYPE "public"."enum_users_role" AS ENUM('admin', 'editor');
  CREATE TABLE "exhibitions_categories" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_exhibitions_categories",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "exhibitions_works" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"title" varchar,
  	"author_id" integer,
  	"year" varchar,
  	"medium" varchar,
  	"description" varchar
  );
  
  CREATE TABLE "exhibitions" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"slug" varchar,
  	"type" "enum_exhibitions_type" DEFAULT 'competition',
  	"status" "enum_exhibitions_status" DEFAULT 'closed',
  	"theme" jsonb,
  	"cover_image_id" integer,
  	"dates_start" timestamp(3) with time zone,
  	"dates_early_deadline" timestamp(3) with time zone,
  	"dates_regular_deadline" timestamp(3) with time zone,
  	"dates_deadline" timestamp(3) with time zone,
  	"dates_results_date" timestamp(3) with time zone,
  	"artist_id" integer,
  	"interview_excerpt" jsonb,
  	"related_competition_id" integer,
  	"result_stats_works_count" numeric,
  	"result_stats_countries_count" numeric,
  	"catalog_embed_url" varchar,
  	"catalog_pdf_id" integer,
  	"catalog_amazon_url" varchar,
  	"fee_note" varchar,
  	"awards_note" varchar,
  	"payments_entry_fee" numeric DEFAULT 0,
  	"payments_finalist_fee" numeric DEFAULT 0,
  	"payments_currency" "enum_exhibitions_payments_currency" DEFAULT 'usd',
  	"payments_judging_token" varchar,
  	"hide_authors_until_results" boolean DEFAULT true,
  	"seo_seo_title" varchar,
  	"seo_seo_description" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_exhibitions_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_exhibitions_v_version_categories" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__exhibitions_v_version_categories",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_exhibitions_v_version_works" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"title" varchar,
  	"author_id" integer,
  	"year" varchar,
  	"medium" varchar,
  	"description" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_exhibitions_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_slug" varchar,
  	"version_type" "enum__exhibitions_v_version_type" DEFAULT 'competition',
  	"version_status" "enum__exhibitions_v_version_status" DEFAULT 'closed',
  	"version_theme" jsonb,
  	"version_cover_image_id" integer,
  	"version_dates_start" timestamp(3) with time zone,
  	"version_dates_early_deadline" timestamp(3) with time zone,
  	"version_dates_regular_deadline" timestamp(3) with time zone,
  	"version_dates_deadline" timestamp(3) with time zone,
  	"version_dates_results_date" timestamp(3) with time zone,
  	"version_artist_id" integer,
  	"version_interview_excerpt" jsonb,
  	"version_related_competition_id" integer,
  	"version_result_stats_works_count" numeric,
  	"version_result_stats_countries_count" numeric,
  	"version_catalog_embed_url" varchar,
  	"version_catalog_pdf_id" integer,
  	"version_catalog_amazon_url" varchar,
  	"version_fee_note" varchar,
  	"version_awards_note" varchar,
  	"version_payments_entry_fee" numeric DEFAULT 0,
  	"version_payments_finalist_fee" numeric DEFAULT 0,
  	"version_payments_currency" "enum__exhibitions_v_version_payments_currency" DEFAULT 'usd',
  	"version_payments_judging_token" varchar,
  	"version_hide_authors_until_results" boolean DEFAULT true,
  	"version_seo_seo_title" varchar,
  	"version_seo_seo_description" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__exhibitions_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "submissions" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"competition_id" integer NOT NULL,
  	"author_id" integer NOT NULL,
  	"title" varchar,
  	"category" "enum_submissions_category",
  	"medium" varchar,
  	"year" varchar,
  	"dimensions" varchar,
  	"statement" varchar,
  	"image_id" integer,
  	"public_image_id" integer,
  	"is_finalist" boolean DEFAULT false,
  	"award_tier" "enum_submissions_award_tier",
  	"score" numeric,
  	"jury_citation" varchar,
  	"certificate_number" varchar,
  	"slug" varchar,
  	"submitted_at" timestamp(3) with time zone,
  	"payment_entry_paid" boolean DEFAULT false,
  	"payment_finalist_fee_paid" boolean DEFAULT false,
  	"payment_stripe_session_id" varchar,
  	"payment_pay_token" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "journal_articles_keywords" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"keyword" varchar NOT NULL
  );
  
  CREATE TABLE "journal_articles_references" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"reference" varchar NOT NULL
  );
  
  CREATE TABLE "journal_articles" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"status" "enum_journal_articles_status" DEFAULT 'submitted' NOT NULL,
  	"author_id" integer NOT NULL,
  	"authors_display" varchar,
  	"affiliation" varchar,
  	"orcid" varchar,
  	"article_type" "enum_journal_articles_article_type",
  	"abstract" varchar,
  	"full_text" jsonb,
  	"uploaded_file_id" integer,
  	"published_pdf_id" integer,
  	"cover_letter" varchar,
  	"doi" varchar,
  	"volume" varchar,
  	"issue" varchar,
  	"published_date" timestamp(3) with time zone,
  	"license_agreed" boolean,
  	"originality_confirmed" boolean,
  	"certificate_certificate_issued" boolean DEFAULT false,
  	"certificate_certificate_paid" boolean DEFAULT false,
  	"certificate_selected_note" varchar,
  	"certificate_certificate_fee" numeric DEFAULT 30,
  	"certificate_stripe_session_id" varchar,
  	"certificate_pay_token" varchar,
  	"seo_seo_title" varchar,
  	"seo_seo_description" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "blog_posts_tags" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"tag" varchar
  );
  
  CREATE TABLE "blog_posts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"slug" varchar,
  	"author_name" varchar,
  	"excerpt" varchar,
  	"cover_image_id" integer,
  	"body" jsonb,
  	"published_date" timestamp(3) with time zone,
  	"show_open_call_cta" boolean DEFAULT true,
  	"seo_seo_title" varchar,
  	"seo_seo_description" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_blog_posts_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_blog_posts_v_version_tags" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"tag" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_blog_posts_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_slug" varchar,
  	"version_author_name" varchar,
  	"version_excerpt" varchar,
  	"version_cover_image_id" integer,
  	"version_body" jsonb,
  	"version_published_date" timestamp(3) with time zone,
  	"version_show_open_call_cta" boolean DEFAULT true,
  	"version_seo_seo_title" varchar,
  	"version_seo_seo_description" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__blog_posts_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "pages_sections" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"body" jsonb
  );
  
  CREATE TABLE "pages" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"slug" varchar,
  	"intro" varchar,
  	"seo_seo_title" varchar,
  	"seo_seo_description" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_pages_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_pages_v_version_sections" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"body" jsonb,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_slug" varchar,
  	"version_intro" varchar,
  	"version_seo_seo_title" varchar,
  	"version_seo_seo_description" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__pages_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "press_mentions" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"publication" varchar NOT NULL,
  	"logo_id" integer,
  	"article_title" varchar,
  	"date" timestamp(3) with time zone,
  	"url" varchar NOT NULL,
  	"order" numeric DEFAULT 100,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "jury_members_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"url" varchar NOT NULL
  );
  
  CREATE TABLE "jury_members" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"slug" varchar,
  	"photo_id" integer,
  	"role" varchar,
  	"country" varchar,
  	"short_credential" varchar,
  	"bio" jsonb,
  	"member_since" timestamp(3) with time zone,
  	"active" boolean DEFAULT true,
  	"membership_tier" "enum_jury_members_membership_tier",
  	"membership_start" timestamp(3) with time zone,
  	"membership_end" timestamp(3) with time zone,
  	"order" numeric DEFAULT 100,
  	"show_on_homepage" boolean DEFAULT false,
  	"on_editorial_board" boolean DEFAULT false,
  	"affiliation" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "jury_members_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"exhibitions_id" integer
  );
  
  CREATE TABLE "participants_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"url" varchar NOT NULL
  );
  
  CREATE TABLE "participants" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"slug" varchar,
  	"email" varchar,
  	"country" varchar,
  	"portrait_id" integer,
  	"about_artist" jsonb,
  	"role" "enum_participants_role" DEFAULT 'participant',
  	"profile_published" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"alt" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric,
  	"sizes_thumbnail_url" varchar,
  	"sizes_thumbnail_width" numeric,
  	"sizes_thumbnail_height" numeric,
  	"sizes_thumbnail_mime_type" varchar,
  	"sizes_thumbnail_filesize" numeric,
  	"sizes_thumbnail_filename" varchar,
  	"sizes_card_url" varchar,
  	"sizes_card_width" numeric,
  	"sizes_card_height" numeric,
  	"sizes_card_mime_type" varchar,
  	"sizes_card_filesize" numeric,
  	"sizes_card_filename" varchar,
  	"sizes_large_url" varchar,
  	"sizes_large_width" numeric,
  	"sizes_large_height" numeric,
  	"sizes_large_mime_type" varchar,
  	"sizes_large_filesize" numeric,
  	"sizes_large_filename" varchar
  );
  
  CREATE TABLE "private_media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"alt" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric
  );
  
  CREATE TABLE "users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"role" "enum_users_role" DEFAULT 'editor' NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"exhibitions_id" integer,
  	"submissions_id" integer,
  	"journal_articles_id" integer,
  	"blog_posts_id" integer,
  	"pages_id" integer,
  	"press_mentions_id" integer,
  	"jury_members_id" integer,
  	"participants_id" integer,
  	"media_id" integer,
  	"private_media_id" integer,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "homepage_stats" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar NOT NULL,
  	"label" varchar NOT NULL
  );
  
  CREATE TABLE "homepage_testimonials" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"quote" varchar NOT NULL,
  	"name" varchar NOT NULL,
  	"attribution" varchar
  );
  
  CREATE TABLE "homepage_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"question" varchar NOT NULL,
  	"answer" varchar NOT NULL
  );
  
  CREATE TABLE "homepage" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"hero_eyebrow" varchar DEFAULT 'International curatorial platform · Berlin',
  	"hero_title" varchar DEFAULT 'Juried competitions. Peer-reviewed publication. Documented recognition.',
  	"hero_lede" varchar DEFAULT 'Curatone runs curated international art competitions every seven weeks, publishes a peer-reviewed journal with DOI-registered articles, and maintains a jury of credentialed art professionals. Every result becomes part of a public, verifiable record.',
  	"hero_featured_competition_id" integer,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "exhibitions_categories" ADD CONSTRAINT "exhibitions_categories_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."exhibitions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "exhibitions_works" ADD CONSTRAINT "exhibitions_works_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "exhibitions_works" ADD CONSTRAINT "exhibitions_works_author_id_participants_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."participants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "exhibitions_works" ADD CONSTRAINT "exhibitions_works_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."exhibitions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "exhibitions" ADD CONSTRAINT "exhibitions_cover_image_id_media_id_fk" FOREIGN KEY ("cover_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "exhibitions" ADD CONSTRAINT "exhibitions_artist_id_participants_id_fk" FOREIGN KEY ("artist_id") REFERENCES "public"."participants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "exhibitions" ADD CONSTRAINT "exhibitions_related_competition_id_exhibitions_id_fk" FOREIGN KEY ("related_competition_id") REFERENCES "public"."exhibitions"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "exhibitions" ADD CONSTRAINT "exhibitions_catalog_pdf_id_media_id_fk" FOREIGN KEY ("catalog_pdf_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_exhibitions_v_version_categories" ADD CONSTRAINT "_exhibitions_v_version_categories_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_exhibitions_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_exhibitions_v_version_works" ADD CONSTRAINT "_exhibitions_v_version_works_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_exhibitions_v_version_works" ADD CONSTRAINT "_exhibitions_v_version_works_author_id_participants_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."participants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_exhibitions_v_version_works" ADD CONSTRAINT "_exhibitions_v_version_works_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_exhibitions_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_exhibitions_v" ADD CONSTRAINT "_exhibitions_v_parent_id_exhibitions_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."exhibitions"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_exhibitions_v" ADD CONSTRAINT "_exhibitions_v_version_cover_image_id_media_id_fk" FOREIGN KEY ("version_cover_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_exhibitions_v" ADD CONSTRAINT "_exhibitions_v_version_artist_id_participants_id_fk" FOREIGN KEY ("version_artist_id") REFERENCES "public"."participants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_exhibitions_v" ADD CONSTRAINT "_exhibitions_v_version_related_competition_id_exhibitions_id_fk" FOREIGN KEY ("version_related_competition_id") REFERENCES "public"."exhibitions"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_exhibitions_v" ADD CONSTRAINT "_exhibitions_v_version_catalog_pdf_id_media_id_fk" FOREIGN KEY ("version_catalog_pdf_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "submissions" ADD CONSTRAINT "submissions_competition_id_exhibitions_id_fk" FOREIGN KEY ("competition_id") REFERENCES "public"."exhibitions"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "submissions" ADD CONSTRAINT "submissions_author_id_participants_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."participants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "submissions" ADD CONSTRAINT "submissions_image_id_private_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."private_media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "submissions" ADD CONSTRAINT "submissions_public_image_id_media_id_fk" FOREIGN KEY ("public_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "journal_articles_keywords" ADD CONSTRAINT "journal_articles_keywords_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."journal_articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "journal_articles_references" ADD CONSTRAINT "journal_articles_references_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."journal_articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "journal_articles" ADD CONSTRAINT "journal_articles_author_id_participants_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."participants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "journal_articles" ADD CONSTRAINT "journal_articles_uploaded_file_id_private_media_id_fk" FOREIGN KEY ("uploaded_file_id") REFERENCES "public"."private_media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "journal_articles" ADD CONSTRAINT "journal_articles_published_pdf_id_media_id_fk" FOREIGN KEY ("published_pdf_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "blog_posts_tags" ADD CONSTRAINT "blog_posts_tags_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."blog_posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "blog_posts" ADD CONSTRAINT "blog_posts_cover_image_id_media_id_fk" FOREIGN KEY ("cover_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_blog_posts_v_version_tags" ADD CONSTRAINT "_blog_posts_v_version_tags_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_blog_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_blog_posts_v" ADD CONSTRAINT "_blog_posts_v_parent_id_blog_posts_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."blog_posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_blog_posts_v" ADD CONSTRAINT "_blog_posts_v_version_cover_image_id_media_id_fk" FOREIGN KEY ("version_cover_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_sections" ADD CONSTRAINT "pages_sections_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_version_sections" ADD CONSTRAINT "_pages_v_version_sections_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_parent_id_pages_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "press_mentions" ADD CONSTRAINT "press_mentions_logo_id_media_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "jury_members_links" ADD CONSTRAINT "jury_members_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."jury_members"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "jury_members" ADD CONSTRAINT "jury_members_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "jury_members_rels" ADD CONSTRAINT "jury_members_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."jury_members"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "jury_members_rels" ADD CONSTRAINT "jury_members_rels_exhibitions_fk" FOREIGN KEY ("exhibitions_id") REFERENCES "public"."exhibitions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "participants_links" ADD CONSTRAINT "participants_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."participants"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "participants" ADD CONSTRAINT "participants_portrait_id_media_id_fk" FOREIGN KEY ("portrait_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_exhibitions_fk" FOREIGN KEY ("exhibitions_id") REFERENCES "public"."exhibitions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_submissions_fk" FOREIGN KEY ("submissions_id") REFERENCES "public"."submissions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_journal_articles_fk" FOREIGN KEY ("journal_articles_id") REFERENCES "public"."journal_articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_blog_posts_fk" FOREIGN KEY ("blog_posts_id") REFERENCES "public"."blog_posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_press_mentions_fk" FOREIGN KEY ("press_mentions_id") REFERENCES "public"."press_mentions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_jury_members_fk" FOREIGN KEY ("jury_members_id") REFERENCES "public"."jury_members"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_participants_fk" FOREIGN KEY ("participants_id") REFERENCES "public"."participants"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_private_media_fk" FOREIGN KEY ("private_media_id") REFERENCES "public"."private_media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_stats" ADD CONSTRAINT "homepage_stats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_testimonials" ADD CONSTRAINT "homepage_testimonials_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_faq" ADD CONSTRAINT "homepage_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage" ADD CONSTRAINT "homepage_hero_featured_competition_id_exhibitions_id_fk" FOREIGN KEY ("hero_featured_competition_id") REFERENCES "public"."exhibitions"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "exhibitions_categories_order_idx" ON "exhibitions_categories" USING btree ("order");
  CREATE INDEX "exhibitions_categories_parent_idx" ON "exhibitions_categories" USING btree ("parent_id");
  CREATE INDEX "exhibitions_works_order_idx" ON "exhibitions_works" USING btree ("_order");
  CREATE INDEX "exhibitions_works_parent_id_idx" ON "exhibitions_works" USING btree ("_parent_id");
  CREATE INDEX "exhibitions_works_image_idx" ON "exhibitions_works" USING btree ("image_id");
  CREATE INDEX "exhibitions_works_author_idx" ON "exhibitions_works" USING btree ("author_id");
  CREATE UNIQUE INDEX "exhibitions_slug_idx" ON "exhibitions" USING btree ("slug");
  CREATE INDEX "exhibitions_cover_image_idx" ON "exhibitions" USING btree ("cover_image_id");
  CREATE INDEX "exhibitions_artist_idx" ON "exhibitions" USING btree ("artist_id");
  CREATE INDEX "exhibitions_related_competition_idx" ON "exhibitions" USING btree ("related_competition_id");
  CREATE INDEX "exhibitions_catalog_catalog_pdf_idx" ON "exhibitions" USING btree ("catalog_pdf_id");
  CREATE INDEX "exhibitions_updated_at_idx" ON "exhibitions" USING btree ("updated_at");
  CREATE INDEX "exhibitions_created_at_idx" ON "exhibitions" USING btree ("created_at");
  CREATE INDEX "exhibitions__status_idx" ON "exhibitions" USING btree ("_status");
  CREATE INDEX "_exhibitions_v_version_categories_order_idx" ON "_exhibitions_v_version_categories" USING btree ("order");
  CREATE INDEX "_exhibitions_v_version_categories_parent_idx" ON "_exhibitions_v_version_categories" USING btree ("parent_id");
  CREATE INDEX "_exhibitions_v_version_works_order_idx" ON "_exhibitions_v_version_works" USING btree ("_order");
  CREATE INDEX "_exhibitions_v_version_works_parent_id_idx" ON "_exhibitions_v_version_works" USING btree ("_parent_id");
  CREATE INDEX "_exhibitions_v_version_works_image_idx" ON "_exhibitions_v_version_works" USING btree ("image_id");
  CREATE INDEX "_exhibitions_v_version_works_author_idx" ON "_exhibitions_v_version_works" USING btree ("author_id");
  CREATE INDEX "_exhibitions_v_parent_idx" ON "_exhibitions_v" USING btree ("parent_id");
  CREATE INDEX "_exhibitions_v_version_version_slug_idx" ON "_exhibitions_v" USING btree ("version_slug");
  CREATE INDEX "_exhibitions_v_version_version_cover_image_idx" ON "_exhibitions_v" USING btree ("version_cover_image_id");
  CREATE INDEX "_exhibitions_v_version_version_artist_idx" ON "_exhibitions_v" USING btree ("version_artist_id");
  CREATE INDEX "_exhibitions_v_version_version_related_competition_idx" ON "_exhibitions_v" USING btree ("version_related_competition_id");
  CREATE INDEX "_exhibitions_v_version_catalog_version_catalog_pdf_idx" ON "_exhibitions_v" USING btree ("version_catalog_pdf_id");
  CREATE INDEX "_exhibitions_v_version_version_updated_at_idx" ON "_exhibitions_v" USING btree ("version_updated_at");
  CREATE INDEX "_exhibitions_v_version_version_created_at_idx" ON "_exhibitions_v" USING btree ("version_created_at");
  CREATE INDEX "_exhibitions_v_version_version__status_idx" ON "_exhibitions_v" USING btree ("version__status");
  CREATE INDEX "_exhibitions_v_created_at_idx" ON "_exhibitions_v" USING btree ("created_at");
  CREATE INDEX "_exhibitions_v_updated_at_idx" ON "_exhibitions_v" USING btree ("updated_at");
  CREATE INDEX "_exhibitions_v_latest_idx" ON "_exhibitions_v" USING btree ("latest");
  CREATE INDEX "submissions_competition_idx" ON "submissions" USING btree ("competition_id");
  CREATE INDEX "submissions_author_idx" ON "submissions" USING btree ("author_id");
  CREATE INDEX "submissions_image_idx" ON "submissions" USING btree ("image_id");
  CREATE INDEX "submissions_public_image_idx" ON "submissions" USING btree ("public_image_id");
  CREATE UNIQUE INDEX "submissions_certificate_number_idx" ON "submissions" USING btree ("certificate_number");
  CREATE UNIQUE INDEX "submissions_slug_idx" ON "submissions" USING btree ("slug");
  CREATE INDEX "submissions_updated_at_idx" ON "submissions" USING btree ("updated_at");
  CREATE INDEX "submissions_created_at_idx" ON "submissions" USING btree ("created_at");
  CREATE INDEX "journal_articles_keywords_order_idx" ON "journal_articles_keywords" USING btree ("_order");
  CREATE INDEX "journal_articles_keywords_parent_id_idx" ON "journal_articles_keywords" USING btree ("_parent_id");
  CREATE INDEX "journal_articles_references_order_idx" ON "journal_articles_references" USING btree ("_order");
  CREATE INDEX "journal_articles_references_parent_id_idx" ON "journal_articles_references" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "journal_articles_slug_idx" ON "journal_articles" USING btree ("slug");
  CREATE INDEX "journal_articles_author_idx" ON "journal_articles" USING btree ("author_id");
  CREATE INDEX "journal_articles_uploaded_file_idx" ON "journal_articles" USING btree ("uploaded_file_id");
  CREATE INDEX "journal_articles_published_pdf_idx" ON "journal_articles" USING btree ("published_pdf_id");
  CREATE INDEX "journal_articles_updated_at_idx" ON "journal_articles" USING btree ("updated_at");
  CREATE INDEX "journal_articles_created_at_idx" ON "journal_articles" USING btree ("created_at");
  CREATE INDEX "blog_posts_tags_order_idx" ON "blog_posts_tags" USING btree ("_order");
  CREATE INDEX "blog_posts_tags_parent_id_idx" ON "blog_posts_tags" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "blog_posts_slug_idx" ON "blog_posts" USING btree ("slug");
  CREATE INDEX "blog_posts_cover_image_idx" ON "blog_posts" USING btree ("cover_image_id");
  CREATE INDEX "blog_posts_updated_at_idx" ON "blog_posts" USING btree ("updated_at");
  CREATE INDEX "blog_posts_created_at_idx" ON "blog_posts" USING btree ("created_at");
  CREATE INDEX "blog_posts__status_idx" ON "blog_posts" USING btree ("_status");
  CREATE INDEX "_blog_posts_v_version_tags_order_idx" ON "_blog_posts_v_version_tags" USING btree ("_order");
  CREATE INDEX "_blog_posts_v_version_tags_parent_id_idx" ON "_blog_posts_v_version_tags" USING btree ("_parent_id");
  CREATE INDEX "_blog_posts_v_parent_idx" ON "_blog_posts_v" USING btree ("parent_id");
  CREATE INDEX "_blog_posts_v_version_version_slug_idx" ON "_blog_posts_v" USING btree ("version_slug");
  CREATE INDEX "_blog_posts_v_version_version_cover_image_idx" ON "_blog_posts_v" USING btree ("version_cover_image_id");
  CREATE INDEX "_blog_posts_v_version_version_updated_at_idx" ON "_blog_posts_v" USING btree ("version_updated_at");
  CREATE INDEX "_blog_posts_v_version_version_created_at_idx" ON "_blog_posts_v" USING btree ("version_created_at");
  CREATE INDEX "_blog_posts_v_version_version__status_idx" ON "_blog_posts_v" USING btree ("version__status");
  CREATE INDEX "_blog_posts_v_created_at_idx" ON "_blog_posts_v" USING btree ("created_at");
  CREATE INDEX "_blog_posts_v_updated_at_idx" ON "_blog_posts_v" USING btree ("updated_at");
  CREATE INDEX "_blog_posts_v_latest_idx" ON "_blog_posts_v" USING btree ("latest");
  CREATE INDEX "pages_sections_order_idx" ON "pages_sections" USING btree ("_order");
  CREATE INDEX "pages_sections_parent_id_idx" ON "pages_sections" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "pages_slug_idx" ON "pages" USING btree ("slug");
  CREATE INDEX "pages_updated_at_idx" ON "pages" USING btree ("updated_at");
  CREATE INDEX "pages_created_at_idx" ON "pages" USING btree ("created_at");
  CREATE INDEX "pages__status_idx" ON "pages" USING btree ("_status");
  CREATE INDEX "_pages_v_version_sections_order_idx" ON "_pages_v_version_sections" USING btree ("_order");
  CREATE INDEX "_pages_v_version_sections_parent_id_idx" ON "_pages_v_version_sections" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_parent_idx" ON "_pages_v" USING btree ("parent_id");
  CREATE INDEX "_pages_v_version_version_slug_idx" ON "_pages_v" USING btree ("version_slug");
  CREATE INDEX "_pages_v_version_version_updated_at_idx" ON "_pages_v" USING btree ("version_updated_at");
  CREATE INDEX "_pages_v_version_version_created_at_idx" ON "_pages_v" USING btree ("version_created_at");
  CREATE INDEX "_pages_v_version_version__status_idx" ON "_pages_v" USING btree ("version__status");
  CREATE INDEX "_pages_v_created_at_idx" ON "_pages_v" USING btree ("created_at");
  CREATE INDEX "_pages_v_updated_at_idx" ON "_pages_v" USING btree ("updated_at");
  CREATE INDEX "_pages_v_latest_idx" ON "_pages_v" USING btree ("latest");
  CREATE INDEX "press_mentions_logo_idx" ON "press_mentions" USING btree ("logo_id");
  CREATE INDEX "press_mentions_updated_at_idx" ON "press_mentions" USING btree ("updated_at");
  CREATE INDEX "press_mentions_created_at_idx" ON "press_mentions" USING btree ("created_at");
  CREATE INDEX "jury_members_links_order_idx" ON "jury_members_links" USING btree ("_order");
  CREATE INDEX "jury_members_links_parent_id_idx" ON "jury_members_links" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "jury_members_slug_idx" ON "jury_members" USING btree ("slug");
  CREATE INDEX "jury_members_photo_idx" ON "jury_members" USING btree ("photo_id");
  CREATE INDEX "jury_members_updated_at_idx" ON "jury_members" USING btree ("updated_at");
  CREATE INDEX "jury_members_created_at_idx" ON "jury_members" USING btree ("created_at");
  CREATE INDEX "jury_members_rels_order_idx" ON "jury_members_rels" USING btree ("order");
  CREATE INDEX "jury_members_rels_parent_idx" ON "jury_members_rels" USING btree ("parent_id");
  CREATE INDEX "jury_members_rels_path_idx" ON "jury_members_rels" USING btree ("path");
  CREATE INDEX "jury_members_rels_exhibitions_id_idx" ON "jury_members_rels" USING btree ("exhibitions_id");
  CREATE INDEX "participants_links_order_idx" ON "participants_links" USING btree ("_order");
  CREATE INDEX "participants_links_parent_id_idx" ON "participants_links" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "participants_slug_idx" ON "participants" USING btree ("slug");
  CREATE INDEX "participants_portrait_idx" ON "participants" USING btree ("portrait_id");
  CREATE INDEX "participants_updated_at_idx" ON "participants" USING btree ("updated_at");
  CREATE INDEX "participants_created_at_idx" ON "participants" USING btree ("created_at");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE INDEX "media_sizes_thumbnail_sizes_thumbnail_filename_idx" ON "media" USING btree ("sizes_thumbnail_filename");
  CREATE INDEX "media_sizes_card_sizes_card_filename_idx" ON "media" USING btree ("sizes_card_filename");
  CREATE INDEX "media_sizes_large_sizes_large_filename_idx" ON "media" USING btree ("sizes_large_filename");
  CREATE INDEX "private_media_updated_at_idx" ON "private_media" USING btree ("updated_at");
  CREATE INDEX "private_media_created_at_idx" ON "private_media" USING btree ("created_at");
  CREATE UNIQUE INDEX "private_media_filename_idx" ON "private_media" USING btree ("filename");
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_exhibitions_id_idx" ON "payload_locked_documents_rels" USING btree ("exhibitions_id");
  CREATE INDEX "payload_locked_documents_rels_submissions_id_idx" ON "payload_locked_documents_rels" USING btree ("submissions_id");
  CREATE INDEX "payload_locked_documents_rels_journal_articles_id_idx" ON "payload_locked_documents_rels" USING btree ("journal_articles_id");
  CREATE INDEX "payload_locked_documents_rels_blog_posts_id_idx" ON "payload_locked_documents_rels" USING btree ("blog_posts_id");
  CREATE INDEX "payload_locked_documents_rels_pages_id_idx" ON "payload_locked_documents_rels" USING btree ("pages_id");
  CREATE INDEX "payload_locked_documents_rels_press_mentions_id_idx" ON "payload_locked_documents_rels" USING btree ("press_mentions_id");
  CREATE INDEX "payload_locked_documents_rels_jury_members_id_idx" ON "payload_locked_documents_rels" USING btree ("jury_members_id");
  CREATE INDEX "payload_locked_documents_rels_participants_id_idx" ON "payload_locked_documents_rels" USING btree ("participants_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_private_media_id_idx" ON "payload_locked_documents_rels" USING btree ("private_media_id");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");
  CREATE INDEX "homepage_stats_order_idx" ON "homepage_stats" USING btree ("_order");
  CREATE INDEX "homepage_stats_parent_id_idx" ON "homepage_stats" USING btree ("_parent_id");
  CREATE INDEX "homepage_testimonials_order_idx" ON "homepage_testimonials" USING btree ("_order");
  CREATE INDEX "homepage_testimonials_parent_id_idx" ON "homepage_testimonials" USING btree ("_parent_id");
  CREATE INDEX "homepage_faq_order_idx" ON "homepage_faq" USING btree ("_order");
  CREATE INDEX "homepage_faq_parent_id_idx" ON "homepage_faq" USING btree ("_parent_id");
  CREATE INDEX "homepage_hero_hero_featured_competition_idx" ON "homepage" USING btree ("hero_featured_competition_id");`)
}

export async function down({ payload }: MigrateDownArgs): Promise<void> {
  await (payload.db as unknown as PoolLike).pool.query(`
   DROP TABLE "exhibitions_categories" CASCADE;
  DROP TABLE "exhibitions_works" CASCADE;
  DROP TABLE "exhibitions" CASCADE;
  DROP TABLE "_exhibitions_v_version_categories" CASCADE;
  DROP TABLE "_exhibitions_v_version_works" CASCADE;
  DROP TABLE "_exhibitions_v" CASCADE;
  DROP TABLE "submissions" CASCADE;
  DROP TABLE "journal_articles_keywords" CASCADE;
  DROP TABLE "journal_articles_references" CASCADE;
  DROP TABLE "journal_articles" CASCADE;
  DROP TABLE "blog_posts_tags" CASCADE;
  DROP TABLE "blog_posts" CASCADE;
  DROP TABLE "_blog_posts_v_version_tags" CASCADE;
  DROP TABLE "_blog_posts_v" CASCADE;
  DROP TABLE "pages_sections" CASCADE;
  DROP TABLE "pages" CASCADE;
  DROP TABLE "_pages_v_version_sections" CASCADE;
  DROP TABLE "_pages_v" CASCADE;
  DROP TABLE "press_mentions" CASCADE;
  DROP TABLE "jury_members_links" CASCADE;
  DROP TABLE "jury_members" CASCADE;
  DROP TABLE "jury_members_rels" CASCADE;
  DROP TABLE "participants_links" CASCADE;
  DROP TABLE "participants" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "private_media" CASCADE;
  DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TABLE "homepage_stats" CASCADE;
  DROP TABLE "homepage_testimonials" CASCADE;
  DROP TABLE "homepage_faq" CASCADE;
  DROP TABLE "homepage" CASCADE;
  DROP TYPE "public"."enum_exhibitions_categories";
  DROP TYPE "public"."enum_exhibitions_type";
  DROP TYPE "public"."enum_exhibitions_status";
  DROP TYPE "public"."enum_exhibitions_payments_currency";
  DROP TYPE "public"."enum__exhibitions_v_version_categories";
  DROP TYPE "public"."enum__exhibitions_v_version_type";
  DROP TYPE "public"."enum__exhibitions_v_version_status";
  DROP TYPE "public"."enum__exhibitions_v_version_payments_currency";
  DROP TYPE "public"."enum_submissions_category";
  DROP TYPE "public"."enum_submissions_award_tier";
  DROP TYPE "public"."enum_journal_articles_status";
  DROP TYPE "public"."enum_journal_articles_article_type";
  DROP TYPE "public"."enum_blog_posts_status";
  DROP TYPE "public"."enum__blog_posts_v_version_status";
  DROP TYPE "public"."enum_pages_status";
  DROP TYPE "public"."enum__pages_v_version_status";
  DROP TYPE "public"."enum_jury_members_membership_tier";
  DROP TYPE "public"."enum_participants_role";
  DROP TYPE "public"."enum_users_role";`)
}
