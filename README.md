<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Solo Travel App

This is a React application for planning solo travel itineraries, managing expenses, and organizing tickets.

## Features

- **Itinerary Planning**: Create and manage daily activities.
- **Expense Tracker**: Track spending in multiple currencies.
- **Wallet**: Store and organize travel tickets and bookings.
- **AI Chat**: Get travel recommendations (requires Gemini API Key).
- **Map View**: Visualize your activities on a map.

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- A Google Gemini API Key (for AI features)

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd solotravel
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure Environment Variables:
   Create a `.env.local` file in the root directory and add your Gemini API key:
   ```env
   GEMINI_API_KEY=your_api_key_here
   ```

### 🏃‍♂️ Running Locally

Start the development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

### 🏗️ Building for Production

Build the app for production:
```bash
npm run build
```
Preview the production build:
```bash
npm run preview
```

## 📦 Deployment via GitHub Actions

This project is configured to automatically deploy to **GitHub Pages** when you push to the `main` branch.

### 🔐 Setup Environment Secrets

Since the project uses the Gemini AI API, you must add your API key to GitHub Secrets for the deployment to work:

1.  Go to your repository on GitHub.
2.  Navigate to **Settings** > **Secrets and variables** > **Actions**.
3.  Click **New repository secret**.
4.  Name: `GEMINI_API_KEY`
5.  Value: (Paste your Gemini API key here)
6.  Click **Add secret**.

### 🚀 Automated Deployment

1. Go to your repository **Settings** > **Pages**.
2. Under "Build and deployment" > "Source", ensure **GitHub Actions** is selected.
3. Push your changes to the `main` branch.
4. The `.github/workflows/deploy.yml` action will trigger, build the project with your secrets, and deploy it to GitHub Pages.

> [!NOTE]
> Refer to `.env.example` for the environment variables required for local development.

## 📁 Project Structure

- `src/components`: UI components (Itinerary, Expense, Wallet, etc.)
- `src/services`: API services (Gemini)
- `src/types.ts`: TypeScript definitions
- `vite.config.ts`: Vite configuration

## 📄 License

[MIT](LICENSE)
