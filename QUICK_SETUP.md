# Quick GitHub Setup

Your repository is ready to push! Follow these 3 simple steps:

## Step 1: Create Repository on GitHub
Visit: **https://github.com/new**

- Repository name: `budget-tracker`
- Description: `A modern, responsive budget tracker web application`
- Choose Public or Private
- **IMPORTANT**: Do NOT check any boxes (no README, .gitignore, or license)
- Click "Create repository"

## Step 2: Copy Your Repository URL
After creating, GitHub will show you a URL like:
```
https://github.com/YOUR_USERNAME/budget-tracker.git
```

## Step 3: Run These Commands
Replace `YOUR_USERNAME` with your actual GitHub username:

```powershell
git remote add origin https://github.com/YOUR_USERNAME/budget-tracker.git
git push -u origin main
```

That's it! Your repository will be live on GitHub. 🎉

---

**Alternative**: If you installed GitHub CLI, you can run:
```powershell
gh repo create budget-tracker --public --source=. --remote=origin --push
```

