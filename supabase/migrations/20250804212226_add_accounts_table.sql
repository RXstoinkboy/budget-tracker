alter table "public"."requisitions" drop constraint "requisitions_pkey";

drop index if exists "public"."requisitions_pkey";

create table "public"."accounts" (
    "id" text not null,
    "created_at" timestamp with time zone not null default now(),
    "requisition_id" text not null,
    "user_id" uuid not null,
    "status" text
);


alter table "public"."accounts" enable row level security;

alter table "public"."requisitions" add column "status" text not null default 'pending'::text;

CREATE UNIQUE INDEX accounts_pkey ON public.accounts USING btree (id, requisition_id);

CREATE INDEX idx_requisitions_status ON public.requisitions USING btree (status);

CREATE UNIQUE INDEX requisitions_pkey ON public.requisitions USING btree (requisition_id);

alter table "public"."accounts" add constraint "accounts_pkey" PRIMARY KEY using index "accounts_pkey";

alter table "public"."requisitions" add constraint "requisitions_pkey" PRIMARY KEY using index "requisitions_pkey";

alter table "public"."accounts" add constraint "accounts_requisition_id_fkey" FOREIGN KEY (requisition_id) REFERENCES requisitions(requisition_id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."accounts" validate constraint "accounts_requisition_id_fkey";

alter table "public"."accounts" add constraint "accounts_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."accounts" validate constraint "accounts_user_id_fkey";

alter table "public"."requisitions" add constraint "check_requisition_status" CHECK ((status = ANY (ARRAY['pending'::text, 'linked'::text, 'expired'::text, 'error'::text, 'user_cancelled'::text]))) not valid;

alter table "public"."requisitions" validate constraint "check_requisition_status";

grant delete on table "public"."accounts" to "anon";

grant insert on table "public"."accounts" to "anon";

grant references on table "public"."accounts" to "anon";

grant select on table "public"."accounts" to "anon";

grant trigger on table "public"."accounts" to "anon";

grant truncate on table "public"."accounts" to "anon";

grant update on table "public"."accounts" to "anon";

grant delete on table "public"."accounts" to "authenticated";

grant insert on table "public"."accounts" to "authenticated";

grant references on table "public"."accounts" to "authenticated";

grant select on table "public"."accounts" to "authenticated";

grant trigger on table "public"."accounts" to "authenticated";

grant truncate on table "public"."accounts" to "authenticated";

grant update on table "public"."accounts" to "authenticated";

grant delete on table "public"."accounts" to "service_role";

grant insert on table "public"."accounts" to "service_role";

grant references on table "public"."accounts" to "service_role";

grant select on table "public"."accounts" to "service_role";

grant trigger on table "public"."accounts" to "service_role";

grant truncate on table "public"."accounts" to "service_role";

grant update on table "public"."accounts" to "service_role";

create policy "Enable delete for users based on user_id"
on "public"."accounts"
as permissive
for delete
to public
using ((( SELECT auth.uid() AS uid) = user_id));


create policy "Enable insert for users based on user_id"
on "public"."accounts"
as permissive
for insert
to public
with check ((( SELECT auth.uid() AS uid) = user_id));


create policy "Enable update for users based on user_id"
on "public"."accounts"
as permissive
for update
to public
using ((( SELECT auth.uid() AS uid) = user_id))
with check ((( SELECT auth.uid() AS uid) = user_id));


create policy "Enable users to view their own data only"
on "public"."accounts"
as permissive
for select
to authenticated
using ((( SELECT auth.uid() AS uid) = user_id));



