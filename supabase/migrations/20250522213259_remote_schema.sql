revoke select on table "auth"."schema_migrations" from "postgres";

CREATE TRIGGER create_categories_for_new_user AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION insert_default_categories_for_user();


