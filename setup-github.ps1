# GitHub Repository Setup Script
# This script helps you create and connect your GitHub repository

Write-Host "=== Budget Tracker - GitHub Setup ===" -ForegroundColor Cyan
Write-Host ""

# Check if repository already exists on GitHub
$repoName = Read-Host "Enter your GitHub repository name (default: budget-tracker)"
if ([string]::IsNullOrWhiteSpace($repoName)) {
    $repoName = "budget-tracker"
}

$username = Read-Host "Enter your GitHub username"

# Check if gh CLI is available
$ghAvailable = $false
try {
    $null = gh --version 2>&1
    $ghAvailable = $true
} catch {
    $ghAvailable = $false
}

if ($ghAvailable) {
    Write-Host "GitHub CLI detected!" -ForegroundColor Green
    $useCLI = Read-Host "Do you want to create the repository using GitHub CLI? (y/n)"
    
    if ($useCLI -eq "y" -or $useCLI -eq "Y") {
        Write-Host "Checking GitHub authentication..." -ForegroundColor Yellow
        gh auth status
        
        $visibility = Read-Host "Repository visibility - Public or Private? (default: Public)"
        if ([string]::IsNullOrWhiteSpace($visibility)) {
            $visibility = "public"
        }
        
        Write-Host "Creating repository on GitHub..." -ForegroundColor Yellow
        gh repo create $repoName --$visibility --source=. --remote=origin --push
        
        Write-Host ""
        Write-Host "✅ Repository created and pushed successfully!" -ForegroundColor Green
        Write-Host "Repository URL: https://github.com/$username/$repoName" -ForegroundColor Cyan
    } else {
        Write-Host ""
        Write-Host "Manual setup instructions:" -ForegroundColor Yellow
        Write-Host "1. Create repository at: https://github.com/new" -ForegroundColor White
        Write-Host "2. Name it: $repoName" -ForegroundColor White
        Write-Host "3. DO NOT initialize with README, .gitignore, or license" -ForegroundColor White
        Write-Host "4. After creation, run the following commands:" -ForegroundColor White
        Write-Host ""
        Write-Host "   git remote add origin https://github.com/$username/$repoName.git" -ForegroundColor Green
        Write-Host "   git push -u origin main" -ForegroundColor Green
    }
} else {
    Write-Host "GitHub CLI not found. Using manual setup." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Please follow these steps:" -ForegroundColor Cyan
    Write-Host "1. Go to: https://github.com/new" -ForegroundColor White
    Write-Host "2. Repository name: $repoName" -ForegroundColor White
    Write-Host "3. Choose visibility (Public/Private)" -ForegroundColor White
    Write-Host "4. DO NOT initialize with README, .gitignore, or license" -ForegroundColor White
    Write-Host "5. Click 'Create repository'" -ForegroundColor White
    Write-Host ""
    
    $ready = Read-Host "Have you created the repository? (y/n)"
    if ($ready -eq "y" -or $ready -eq "Y") {
        Write-Host ""
        Write-Host "Setting up remote and pushing code..." -ForegroundColor Yellow
        
        git remote add origin "https://github.com/$username/$repoName.git"
        git branch -M main
        git push -u origin main
        
        Write-Host ""
        Write-Host "✅ Repository connected and pushed successfully!" -ForegroundColor Green
        Write-Host "View your repo at: https://github.com/$username/$repoName" -ForegroundColor Cyan
    } else {
        Write-Host ""
        Write-Host "After creating the repository, run these commands:" -ForegroundColor Yellow
        Write-Host "  git remote add origin https://github.com/$username/$repoName.git" -ForegroundColor Green
        Write-Host "  git push -u origin main" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "Setup complete! 🎉" -ForegroundColor Green

