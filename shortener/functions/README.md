# URL Shortener

This project is a Firebase-based URL shortener. It uses Cloud Functions to handle redirection logic based on incoming slugs. The solution enforces lowercase slugs, forwards specific subdirectories and stock lookups using Algolia, and checks for expiration dates on links. If no matching link is found or if a link is expired, it redirects to the default site at [burienhonda.com](https://burienhonda.com).

## Features

- **Case Enforcement:** All slugs are converted to lowercase.
- **Default Redirect:** Redirects to [burienhonda.com](https://burienhonda.com) if no slug is provided or a link is expired.
- **Directory Forwards:** Routes URLs like `go.hofb.app/quote/64443` to `https://proposals.hofb.app/64443`.
- **Stock Number Searches:** If a slug starts with `#`, it performs an Algolia search for the corresponding stock and redirects to the inventory page.
- **Standard URL Lookup:** Looks up the short URL in Firestore and, if found, updates the click counter and the `lastAccessed` timestamp.
- **HTTP Method Preservation:** Uses a 307 redirect for non‑GET requests so the original method and payload are maintained.

## Prerequisites

- Node.js installed.
- Firebase CLI installed (`npm install -g firebase-tools`).
- Firebase project configured.
- Algolia client installed and configured (see the Cloud Function code for details).
- Firestore with a collection named `links` (ensure your documents include the expected fields like `destination`, `clickCount`, `createdOn`, `expirationDate`, etc.).

## Deployment Commands

1. **Initial Deployment**  
    Deploy both Hosting and Cloud Functions (codebase for the shortener):

   ```bash
   firebase deploy --only hosting:gohofb,functions:shortener
   ```

   This command deploys the hosting site named gohofb (which will respond at https://gohofb.web.app) and the Cloud Functions for your shortener (with your function redirectHandler).

Deploying Updates to the Shortener Function

Whenever you make changes to the Cloud Functions code, deploy only the shortener functions with:

bash
Copy
firebase deploy --only functions:shortener
Local Testing & Debugging
Use the Firebase Emulator Suite to test your functions locally if needed. For example:

bash
Copy
firebase emulators:start --only functions,hosting
Check logs using the Firebase CLI or in the Firebase Console to verify that clicks, redirects, and updates work as expected.

Additional Notes
Lowercase Enforcement: When creating links, ensure that the slugs are stored in lowercase. This Cloud Function converts incoming slugs to lowercase for a consistent lookup.

Expiration Date: If a link document includes an expirationDate (as a Firestore Timestamp), and if that date has passed, the Cloud Function will redirect the user to burienhonda.com (or you could choose to show an expired message).

Algolia Integration: The function uses Algolia to search for stock numbers if the slug starts with a # symbol. Make sure to replace the placeholder values in the Cloud Function code with your Algolia App ID, API key, and index name.
