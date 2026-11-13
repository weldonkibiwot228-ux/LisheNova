# LisheNova Community setup

## What is included
- `community.html`: separate public community page; it does not alter the meal planner.
- `community-backend.gs`: Google Apps Script backend. New posts are stored as **pending** and are not visible in the public feed until the CEO approves them.
- Homepage navigation link to the new page.

## Connect the Google Sheet
1. Open the Google spreadsheet you want to use for community submissions.
2. Copy its spreadsheet ID from the URL (the long value between `/d/` and `/edit`).
3. Open the Apps Script project you use for LisheNova, or create a separate project at https://script.google.com/.
4. Add a new script file and paste the complete contents of `community-backend.gs`.
5. In Project Settings > Script properties, add:
   - `SHEET_ID`: the spreadsheet ID from step 2.
   - `ADMIN_KEY`: create a long private key. Do not share it or put it in the public website code.
6. Save. In the function selector, choose `initializeCommunitySheet` and run it once. Approve Google's requested permissions. This creates a `CommunityPosts` tab.
7. Deploy > New deployment > Web app. Set **Execute as: Me** and **Who has access: Anyone**. Deploy and copy the URL ending in `/exec`.
8. Open `community.html` and set `DEFAULT_ENDPOINT` to that URL, then save the file. Alternatively, add the URL to local storage using browser dev tools; editing DEFAULT_ENDPOINT is the simpler method.
9. Test a sample post. Confirm it appears in the `CommunityPosts` sheet with status `pending`, then use the CEO moderation panel on the Community page to approve it.

## Important
- Do not put `ADMIN_KEY` in the public HTML. The CEO enters it only in the moderation panel.
- Public visitors can submit posts and read approved posts only. They cannot read pending or rejected posts.
- If you change the Apps Script code after deployment, edit the deployment and select a new version.
- This initial version supports moderated text posts only. Image uploads, member accounts, comments and likes are not included.
