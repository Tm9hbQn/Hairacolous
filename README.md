אני אני לא # React + Vite


F

This template provides a minimal setup to get React working את  in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## Deploying to GitHub Pages

This repository is configured to deploy to GitHub Pages automatically using GitHub Actions.

To enable deployment:

1.  Go to **Settings** > **Pages** in your GitHub repository.
2.  Under **Build and deployment**, select **GitHub Actions** as the source.
3.  The deployment will trigger automatically on the next push to the `main` branch.

🚀 Deployment Instructions (Manual Steps Required)
This repository has been configured for automatic deployment via GitHub Actions. However, for security reasons, you must manually enable the deployment settings in your repository.
Please follow these 3 steps exactly:
1. Enable Actions for Pages
 * Go to your repository on GitHub.
 * Click the Settings tab (gear icon).
 * In the left sidebar, click Pages (under the "Code and automation" section).
 * Under Build and deployment > Source, change the dropdown from "Deploy from a branch" to GitHub Actions.
   * Note: If you don't see this option, ensure your repository is public or you have a pro account.
2. Grant Workflow Permissions
 * Still in Settings, click Actions > General in the left sidebar.
 * Scroll down to the Workflow permissions section.
 * Select Read and write permissions.
 * Click Save.
3. Trigger the First Deploy
 * Go to the Actions tab at the top of your repository.
 * You may see a workflow run labeled "Initial Commit" or similar.
   * If it's green: Click it, then click the link under "deploy" to see your site!
   * If it's not running: Make a small edit to this README.md file (add a space) and commit the change. This will trigger the "Deploy to GitHub Pages" workflow automatically.
