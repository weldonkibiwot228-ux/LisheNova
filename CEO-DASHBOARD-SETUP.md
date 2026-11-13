# LisheNova CEO Dashboard setup

The public LisheNova homepage now links to `admin.html`. The dashboard page is separate from the meal planner, so existing meal-planning features are not replaced.

## One-time secure Google connection

The dashboard intentionally does not publish client feedback or place a Google password/API key in the public website. Complete this one-time Google Apps Script setup:

1. Sign in to Google as **weldonkibiwot228@gmail.com**.
2. Open https://script.google.com/home/start and create a new project named **LisheNova CEO Dashboard**.
3. In the Apps Script editor, replace the starter code with the complete contents of [google-apps-script/Code.gs](./google-apps-script/Code.gs).
4. Click **Deploy → New deployment**.
5. Select the gear icon and choose **Web app**.
6. Set **Execute as** to **User accessing the web app**.
7. Set **Who has access** to **Anyone with a Google account**.
8. Click **Deploy**, approve the Google permissions while signed in as the LisheNova owner, and copy the Web app URL ending in `/exec`.
9. Open the LisheNova CEO Dashboard: https://weldonkibiwot228-ux.github.io/lishenova/admin.html
10. Paste the Web app URL into the field and tap **Connect securely**.

The server checks the active Google account against the allowed owner email before returning any spreadsheet rows. Do not change that check or deploy the app to allow anonymous access.

## Feedback spreadsheet

The Apps Script is configured for the feedback spreadsheet ID already supplied for LisheNova:
`1QWHJ6a-JWZU2mmPm8ot7tvyaanHbh5AGPs3wOOKRlQY`

It looks for a response tab with a header row and returns the latest 200 non-empty submissions. If this is not the Google Form's response spreadsheet, update `SPREADSHEET_ID` in the Apps Script before deploying.

## Notes

- GitHub Pages may take a few minutes to publish new commits.
- The dashboard URL is not a security boundary; the Google-account check in Apps Script protects the data.
- If the Google deployment is changed, update the saved URL in the dashboard using **Clear saved connection** and connect again.
