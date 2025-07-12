

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE EXTENSION IF NOT EXISTS "pgsodium";






COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."get_transaction_sums_by_category"("start_date" "date" DEFAULT NULL::"date", "end_date" "date" DEFAULT NULL::"date") RETURNS TABLE("category_id" "uuid", "total_amount" numeric)
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        t.category_id,  -- Specify the table alias
        SUM(t.amount) AS total_amount  -- Adjust 'amount' to your actual column name
    FROM 
        public.transactions t  -- Use an alias for the table
    WHERE 
        (start_date IS NULL OR t.transaction_date >= start_date)  -- Filter by start date
        AND (end_date IS NULL OR t.transaction_date <= end_date)  -- Filter by end date
    GROUP BY 
        t.category_id;  -- Specify the table alias
END;
$$;


ALTER FUNCTION "public"."get_transaction_sums_by_category"("start_date" "date", "end_date" "date") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."insert_default_categories_for_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$DECLARE
    food_id uuid;
    house_id uuid;
BEGIN
    -- Insert default transactions
    INSERT INTO public.categories (id, name, icon, icon_color, type, user_id, created_at, updated_at)
    VALUES 
        (gen_random_uuid(), 'Other expenses', 'circle', '#FFFFFF', 'expense', NEW.id, NOW(), NOW());

    INSERT INTO public.categories (id, name, icon, icon_color, type, user_id, created_at, updated_at)
    VALUES 
        (gen_random_uuid(), 'Income', 'circle-dollar', '#FFFFFF', 'income', NEW.id, NOW(), NOW());

    -- Insert parent categories first
    INSERT INTO public.categories (id, name, icon, icon_color, type, user_id, created_at, updated_at)
    VALUES 
        (gen_random_uuid(), 'Food', 'food', '#FF5733', 'expense', NEW.id, NOW(), NOW())
    RETURNING id INTO food_id;

    INSERT INTO public.categories (id, name, icon, icon_color, type, user_id, created_at, updated_at)
    VALUES 
        (gen_random_uuid(), 'House', 'house', '#3498DB', 'expense', NEW.id, NOW(), NOW())
    RETURNING id INTO house_id;

    -- Insert subcategories for Food
    INSERT INTO public.categories (id, name, icon, icon_color, type, user_id, parent_id, created_at, updated_at)
    VALUES 
        (gen_random_uuid(), 'Snacks', 'snacks', '#E67E22', 'expense', NEW.id, food_id, NOW(), NOW()),
        (gen_random_uuid(), 'Eating Out', 'eating_out', '#9B59B6', 'expense', NEW.id, food_id, NOW(), NOW()),
        (gen_random_uuid(), 'Groceries', 'groceries', '#27AE60', 'expense', NEW.id, food_id, NOW(), NOW());

    -- Insert subcategories for House
    INSERT INTO public.categories (id, name, icon, icon_color, type, user_id, parent_id, created_at, updated_at)
    VALUES 
        (gen_random_uuid(), 'Bills', 'bills', '#F1C40F', 'expense', NEW.id, house_id, NOW(), NOW()),
        (gen_random_uuid(), 'Mortgage', 'mortgage', '#8E44AD', 'expense', NEW.id, house_id, NOW(), NOW()),
        (gen_random_uuid(), 'Cleaning Utensils', 'cleaning_utensils', '#16A085', 'expense', NEW.id, house_id, NOW(), NOW()),
        (gen_random_uuid(), 'House Equipment', 'house_equipment', '#2ECC71', 'expense', NEW.id, house_id, NOW(), NOW());

    RETURN NEW;
END;$$;


ALTER FUNCTION "public"."insert_default_categories_for_user"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."budget" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "start_date" "date" NOT NULL,
    "end_date" "date" NOT NULL,
    "category_id" "uuid",
    "amount" numeric NOT NULL,
    "user_id" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    "description" "text"
);


ALTER TABLE "public"."budget" OWNER TO "postgres";


COMMENT ON TABLE "public"."budget" IS 'budget plans for agiven period';



CREATE TABLE IF NOT EXISTS "public"."categories" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "name" character varying NOT NULL,
    "updated_at" timestamp with time zone DEFAULT ("now"() AT TIME ZONE 'utc'::"text"),
    "parent_id" "uuid",
    "icon" "text" NOT NULL,
    "icon_color" "text" NOT NULL,
    "type" "text" NOT NULL,
    "user_id" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    "default" boolean DEFAULT false,
    CONSTRAINT "categories_type_check" CHECK (("type" = ANY (ARRAY['expense'::"text", 'income'::"text"])))
);


ALTER TABLE "public"."categories" OWNER TO "postgres";


COMMENT ON TABLE "public"."categories" IS 'each transaction can be assigned to one of the categories';



COMMENT ON COLUMN "public"."categories"."type" IS 'either expense or income column';



CREATE TABLE IF NOT EXISTS "public"."gocardless_sessions" (
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp without time zone DEFAULT "now"() NOT NULL,
    "access_token" "text" NOT NULL,
    "refresh_token" "text" NOT NULL,
    "user_id" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    "access_expires" timestamp without time zone NOT NULL,
    "refresh_expires" timestamp without time zone NOT NULL
);


ALTER TABLE "public"."gocardless_sessions" OWNER TO "postgres";


COMMENT ON TABLE "public"."gocardless_sessions" IS 'table storing current current go cardless session data';



CREATE TABLE IF NOT EXISTS "public"."requisitions" (
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "requisition_id" "text" NOT NULL,
    "institution_id" "text" NOT NULL,
    "user_id" "uuid" DEFAULT "auth"."uid"() NOT NULL
);


ALTER TABLE "public"."requisitions" OWNER TO "postgres";


COMMENT ON TABLE "public"."requisitions" IS 'table storinhg requisition ids associated to the user';



CREATE TABLE IF NOT EXISTS "public"."transactions" (
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "name" character varying NOT NULL,
    "amount" numeric NOT NULL,
    "expense" boolean DEFAULT true NOT NULL,
    "receipt_url" "text",
    "description" "text",
    "transaction_date" "date" NOT NULL,
    "user_id" "uuid" DEFAULT "auth"."uid"(),
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "category_id" "uuid"
);


ALTER TABLE "public"."transactions" OWNER TO "postgres";


COMMENT ON TABLE "public"."transactions" IS 'transactions done by user (manual + from integrations)';



ALTER TABLE ONLY "public"."budget"
    ADD CONSTRAINT "budget_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."categories"
    ADD CONSTRAINT "categories_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."gocardless_sessions"
    ADD CONSTRAINT "gocardless_sessions_pkey" PRIMARY KEY ("user_id");



ALTER TABLE ONLY "public"."requisitions"
    ADD CONSTRAINT "requisitions_pkey" PRIMARY KEY ("institution_id", "user_id");



ALTER TABLE ONLY "public"."transactions"
    ADD CONSTRAINT "transactions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."budget"
    ADD CONSTRAINT "budget_category_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON UPDATE CASCADE ON DELETE SET NULL;



ALTER TABLE ONLY "public"."categories"
    ADD CONSTRAINT "categories_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "public"."categories"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."gocardless_sessions"
    ADD CONSTRAINT "gocardless-session_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."requisitions"
    ADD CONSTRAINT "requisitions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."transactions"
    ADD CONSTRAINT "transactions_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE SET NULL;



CREATE POLICY "Authenticated users can delete their own budgets" ON "public"."budget" FOR DELETE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Authenticated users can delete their own categories" ON "public"."categories" FOR DELETE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Authenticated users can delete their own gocardless sessions" ON "public"."gocardless_sessions" FOR DELETE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Authenticated users can delete their own requisitions" ON "public"."requisitions" FOR DELETE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Authenticated users can delete their own transactions" ON "public"."transactions" FOR DELETE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Authenticated users can insert budgets" ON "public"."budget" FOR INSERT TO "authenticated" WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Authenticated users can insert categories" ON "public"."categories" FOR INSERT TO "authenticated" WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Authenticated users can insert gocardless sessions" ON "public"."gocardless_sessions" FOR INSERT TO "authenticated" WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Authenticated users can insert requisitions" ON "public"."requisitions" FOR INSERT TO "authenticated" WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Authenticated users can insert transactions" ON "public"."transactions" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Authenticated users can select their own budgets" ON "public"."budget" FOR SELECT TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Authenticated users can select their own categories" ON "public"."categories" FOR SELECT TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Authenticated users can select their own gocardless sessions" ON "public"."gocardless_sessions" FOR SELECT TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Authenticated users can select their own requisitions" ON "public"."requisitions" FOR SELECT TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Authenticated users can select their own transactions" ON "public"."transactions" FOR SELECT TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Authenticated users can update their own budgets" ON "public"."budget" FOR UPDATE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Authenticated users can update their own categories" ON "public"."categories" FOR UPDATE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Authenticated users can update their own gocardless sessions" ON "public"."gocardless_sessions" FOR UPDATE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Authenticated users can update their own requisitions" ON "public"."requisitions" FOR UPDATE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Authenticated users can update their own transactions" ON "public"."transactions" FOR UPDATE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id")) WITH CHECK (true);



ALTER TABLE "public"."budget" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."categories" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."gocardless_sessions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."requisitions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."transactions" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";




















































































































































































GRANT ALL ON FUNCTION "public"."get_transaction_sums_by_category"("start_date" "date", "end_date" "date") TO "anon";
GRANT ALL ON FUNCTION "public"."get_transaction_sums_by_category"("start_date" "date", "end_date" "date") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_transaction_sums_by_category"("start_date" "date", "end_date" "date") TO "service_role";



GRANT ALL ON FUNCTION "public"."insert_default_categories_for_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."insert_default_categories_for_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."insert_default_categories_for_user"() TO "service_role";



























GRANT ALL ON TABLE "public"."budget" TO "anon";
GRANT ALL ON TABLE "public"."budget" TO "authenticated";
GRANT ALL ON TABLE "public"."budget" TO "service_role";



GRANT ALL ON TABLE "public"."categories" TO "anon";
GRANT ALL ON TABLE "public"."categories" TO "authenticated";
GRANT ALL ON TABLE "public"."categories" TO "service_role";



GRANT ALL ON TABLE "public"."gocardless_sessions" TO "anon";
GRANT ALL ON TABLE "public"."gocardless_sessions" TO "authenticated";
GRANT ALL ON TABLE "public"."gocardless_sessions" TO "service_role";



GRANT ALL ON TABLE "public"."requisitions" TO "anon";
GRANT ALL ON TABLE "public"."requisitions" TO "authenticated";
GRANT ALL ON TABLE "public"."requisitions" TO "service_role";



GRANT ALL ON TABLE "public"."transactions" TO "anon";
GRANT ALL ON TABLE "public"."transactions" TO "authenticated";
GRANT ALL ON TABLE "public"."transactions" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";






























RESET ALL;
