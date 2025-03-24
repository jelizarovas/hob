# HOB

[Link](jelizarovas.github.io/hob/)

PDF Generation Codebase (Separate Codebase)
This project uses a separate codebase for the PDF generation Cloud Function (generateAgreementSheetPdf). The reasons for this separation are:

Isolated Dependencies & Build Process:
The PDF function relies on dependencies (such as Puppeteer, chrome‑aws‑lambda, and React) and requires a build step (using esbuild) to transpile JSX (from our AgreementSheet template) into plain JavaScript. Isolating this function lets us manage these dependencies and build settings separately from the rest of the Cloud Functions.

Independent Deployment:
Using Firebase's multi-codebase support, we can deploy and update the PDF generation function without affecting other functions. This allows faster iterations on just the PDF function when needed.

Optimized for Node 20 & Cloud Functions:
The PDF codebase is configured specifically to target Node 20 and uses a bundler (esbuild) for fast, optimized builds.

Directory Structure
less
Copy
project-root/
├── functions/
│ ├── src/ // Source code for default functions
│ ├── pdf/ // [PDF Codebase] Contains built PDF function code
│ │ ├── generateAgreementSheetPdf.js // Built bundle from esbuild
│ │ └── index.js // Minimal file that exports the PDF function
│ └── package.json // Main package file for functions (default codebase)
├── src/ // Main application source
│ └── components/
│ └── templates/
│ └── AgreementSheet.jsx // PDF template component (JSX)
└── firebase.json // Multi-codebase configuration for functions
Multi-Codebase Configuration
Our firebase.json file in the project root includes a multi-codebase configuration. For example:

json
Copy
{
"functions": [
{
"source": "functions",
"codebase": "default"
},
{
"source": "functions/pdf",
"codebase": "pdf"
}
]
}
This tells Firebase to deploy functions in the functions/pdf folder under the codebase named pdf.

How to Build and Deploy the PDF Function
Install Dependencies for the PDF Codebase
Navigate to the functions folder and install dependencies (if not already done):

bash
Copy
cd functions
npm install
Then, navigate to the PDF codebase folder (if it has its own package.json) or ensure your main functions dependencies are up to date.

Build the PDF Function
From the functions folder, run:

bash
Copy
npm run build:pdf
This command uses esbuild to bundle and transpile the source code (src/generateAgreementSheetPdf.js) into a single output file in the pdf folder:

json
Copy
"build:pdf": "esbuild src/generateAgreementSheetPdf.js --bundle --platform=node --target=node20 --loader:.jsx=jsx --outfile=pdf/generateAgreementSheetPdf.js"
Make sure that your AgreementSheet component is imported correctly (using the correct extension, e.g. .jsx).

Deploy the PDF Function
After building, deploy the function by running:

bash
Copy
firebase deploy --only functions:pdf:generateAgreementSheetPdf
Alternatively, if you have a combined script, you can use:

bash
Copy
npm run deploy:pdf
(A typical deploy script might run the build first, then deploy using the fully qualified function name from the PDF codebase.)

Maintenance Notes
Updating Dependencies:
Maintain the dependencies for the PDF function separately (in the functions/pdf/package.json if using multi-codebase). If you add new dependencies or update versions, run npm install in the appropriate folder.

Build Step Required:
Since the PDF function uses JSX (from AgreementSheet.jsx), it must be transpiled. Ensure you run the build step (npm run build:pdf) before deploying any changes.

Testing Locally:
You can test your built function locally by running the bundled file (for example, using a local server or by invoking the Cloud Function locally with Firebase Emulator Suite).

gcloud run services add-iam-policy-binding generateagreementsheetpdf \
 --member="allUsers" \
 --role="roles/run.invoker" \
 --platform=managed \
 --region=us-central1
