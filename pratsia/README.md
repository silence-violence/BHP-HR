# Pratsia — employment site

Static site (no build step) helping Ukrainian citizens find jobs in Croatia.

## Files
- `index.html` — page structure
- `css/style.css` — styling (Ukrainian blue/yellow + Croatian šahovnica accents)
- `js/data.js` — **all translations (hr/uk/ru) and the job catalogue live here.** Add, edit, or remove categories/jobs by editing the `CATEGORIES` array — each job needs `title`, `desc`, and `reqs` in all three languages.
- `js/app.js` — renders categories/jobs, language switching, and handles form submission

## How applications are emailed
Each job's "apply" form submits directly to `elza@pratsia.hr` via [FormSubmit.co](https://formsubmit.co) (no backend server needed), using their AJAX endpoint so the page doesn't redirect. The email subject line is automatically set to the job title.

**One-time activation step:** the first time any form on the live site is submitted, FormSubmit sends a confirmation email to `elza@pratsia.hr`. Someone must click the confirmation link in that email once — after that, all forms on the domain deliver normally.

The CV upload field accepts PDF, DOCX, and JPG only (validated both by the `accept` attribute and in JavaScript), max 5 MB.

## Viewing locally
Just open `index.html` in a browser, or serve the folder with any static file server. Form submission requires the site to be served over HTTP(S) (not `file://`) and reachable from the internet, since FormSubmit needs to receive the request.
