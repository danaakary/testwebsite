# Nexus – React Parallax Demo with a Network Globe

A Vite + React demo site with:
- **Hero section**: a spinning, high-density dotted globe (about 1,600 dots). Nearby dots are linked into a mesh, and glowing arcs shoot between random dots. You can drag the globe to spin it.
- **Parallax** star layers, banner bands and stats, plus scroll-reveal animations
- **Sections**: Features, Services, Network stats, Contact and Footer
- **Demo contact form** with client-side validation and a simulated submit. No data is sent.
- **Azure Static Web Apps** config and a **GitHub Actions** deployment workflow

## Run locally
```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # outputs to /dist
npm run preview
```

## Deploy to Azure Static Web Apps (GitHub Actions)

1. **Push this folder to a GitHub repo** (branch `main`).
2. **Create the Static Web App** in the Azure portal (*Create a resource > Static Web App*):
   - Plan: **Free** (or Standard)
   - Deployment source: **Other**. This repo already contains the workflow, so Azure does not need to generate one.
3. **Copy the deployment token.** Open the Static Web App, select *Overview*, then select **Manage deployment token**, and copy the token.
4. **Add the token to GitHub.** In the repo, go to *Settings > Secrets and variables > Actions > New repository secret*:
   - Name: `AZURE_STATIC_WEB_APPS_API_TOKEN`
   - Value: the token you copied
5. **Push to `main`.** The workflow `.github/workflows/azure-static-web-apps.yml` builds and deploys the site.
   Pull requests automatically get a **staging/preview URL**, and that environment is closed when the PR is closed.

> Option: if you pick **GitHub** as the deployment source in the portal, Azure creates its own workflow file and secret, named something like `AZURE_STATIC_WEB_APPS_API_TOKEN_<NAME>`. If you go that way, keep only one workflow and set `app_location: "/"` and `output_location: "dist"`.

### Azure CLI alternative
```bash
az staticwebapp create -n nexus-demo -g rg-nexus-demo -l westeurope --sku Free
az staticwebapp secrets list -n nexus-demo -g rg-nexus-demo --query "properties.apiKey" -o tsv
```

## Tuning the globe
In `src/App.jsx`:
```jsx
<Globe dotCount={2000} linkDistance={0.1} maxArcs={60} speed={0.002} />
```
- `dotCount`: higher means a denser globe. Above about 2,500, performance drops on low-end devices.
- `linkDistance`: higher means more mesh lines between dots.
- `maxArcs`: the number of shooting lines visible at the same time.

## Making the contact form real
Replace the simulated `setTimeout` in `src/components/ContactForm.jsx` with a `fetch('/api/contact', …)` call. Then add an Azure Functions API under `/api` and set `api_location: "api"` in the workflow.

## Structure
```
├── .github/workflows/azure-static-web-apps.yml
├── public/ (favicon, staticwebapp.config.json)
├── src/
│   ├── components/Globe.jsx
│   ├── components/ContactForm.jsx
│   ├── hooks.js        (parallax + reveal)
│   ├── App.jsx
│   └── styles.css
├── staticwebapp.config.json
├── index.html
└── vite.config.js
```
