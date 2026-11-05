# How to Deploy InvestIQ to Cloud & Install on Phone (100% Free)

By deploying InvestIQ to the cloud:
- **Your laptop does NOT need to be on.**
- The app runs 24/7 on the internet.
- You can access it from anywhere in the world on your phone over 4G/5G/Wi-Fi.
- You can install it on your phone like a native app with an app icon and full-screen view!

---

## Method 1: Deploy Free to Render (Recommended — 3 Minutes)

[Render.com](https://render.com/) gives you free hosting for both Python backends and React frontends.

### Step 1: Push Code to GitHub
1. Create a free GitHub repository (e.g. `investiq`).
2. Run these commands inside your project folder:
   ```bash
   cd C:\Users\saibh\.gemini\antigravity\scratch\investiq
   git init
   git add .
   git commit -m "Deploy InvestIQ"
   git remote add origin https://github.com/YOUR_USERNAME/investiq.git
   git push -u origin main
   ```

### Step 2: Deploy on Render
1. Go to [https://dashboard.render.com/](https://dashboard.render.com/) and sign up with GitHub.
2. Click **New +** $\rightarrow$ select **Blueprint**.
3. Select your `investiq` repository.
4. Render will automatically read the included `render.yaml` file and launch:
   * **`investiq-backend`**: Your Python FastAPI calculation engine.
   * **`investiq-frontend`**: Your React Groww-style dashboard.
5. In 2 minutes, you will receive your live HTTPS links:
   * Frontend: `https://investiq-frontend.onrender.com`
   * Backend: `https://investiq-backend.onrender.com`

---

## Method 2: Deploy on Railway (Even Simpler — 2 Minutes)
1. Go to [https://railway.app/](https://railway.app/).
2. Click **Deploy from GitHub repo** $\rightarrow$ select `investiq`.
3. Railway automatically detects Python and Vite and starts both services instantly!

---

## How to Install the App on Your Phone (Once Deployed)

Once your cloud link is live (e.g. `https://investiq-frontend.onrender.com`):

### On Android (Chrome):
1. Open the URL in Chrome on your phone.
2. Chrome will show a banner at the bottom: **"Add InvestIQ to Home Screen"** or tap the **3 vertical dots menu** in the top right.
3. Tap **"Install App"** or **"Add to Home Screen"**.
4. An **InvestIQ app icon** will appear on your phone home screen!
5. Tap it: it opens full-screen without any address bar, just like Groww!

### On iPhone (Safari):
1. Open the URL in Safari on your iPhone.
2. Tap the **Share** button (the square with an arrow pointing up at the bottom).
3. Scroll down and tap **"Add to Home Screen"**.
4. Tap **"Add"** in the top right.
5. The **InvestIQ app** is now on your iPhone home screen!
