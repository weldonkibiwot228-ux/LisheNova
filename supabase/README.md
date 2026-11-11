# AfyaPlate Supabase setup

This folder is the backend foundation for the AfyaPlate website. It is separate from the existing homepage, meal planner, Kitchen Shop, CEO dashboard and Community page.

## 1. Create the database tables

1. Open the AfyaPlate production project in Supabase.
2. Open **SQL Editor** and create a new query.
3. Copy all of `schema.sql` into the editor and run it.
4. Confirm that the query succeeds.

The schema creates:
- `community_posts`: public submissions start as pending; only approved posts are public.
- `client_feedback`: visitors can submit feedback; only a registered CEO admin can read it.
- `ceo_admins`: an explicit allow-list of Supabase Auth user IDs.

Row Level Security is enabled on all three tables. The browser publishable key is not an authorization mechanism by itself; the policies are the security boundary.

## 2. Register the CEO account

1. In Supabase, open **Authentication → Users** and create/invite the founder's account using the founder email.
2. Complete the email confirmation/sign-in flow.
3. Copy the user's UUID from the Users list.
4. In SQL Editor, run the following after replacing the placeholder with that UUID:

```sql
insert into public.ceo_admins (user_id)
values ('PASTE-CEO-AUTH-USER-UUID-HERE')
on conflict (user_id) do nothing;
```

Do not put the CEO UUID, a database password, or any secret API key in public website files.

## 3. Browser configuration

The website can use the Supabase project URL and the **publishable** API key in browser code. Never use a secret key or service-role key in GitHub Pages or any client-side file.

Before enabling the public website integration, configure the Supabase Auth site URL and redirect allow-list for the live AfyaPlate GitHub Pages origin. Then test anonymous submissions and CEO-only reads with two separate sessions.

## 4. Important migration rule

Do not delete or disable the existing Apps Script / Google Forms connection until the Supabase version has been tested end-to-end and existing feedback records have been accounted for. This foundation does not yet migrate old Google Sheet rows.
