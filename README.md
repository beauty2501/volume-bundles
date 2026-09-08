# volume-bundles

buy more, save more widget

## Connect this repo to a remote and push

This project starts on local `main` with no remote and no commits. Add a remote, make the first commit, then push and set upstream.

### 1. Add the remote

Use your real repo URL:

```bash
git remote add origin https://github.com/YOUR_USER/YOUR_REPO.git
```

SSH example:

```bash
git remote add origin git@github.com:YOUR_USER/YOUR_REPO.git
```

### 2. Commit everything you want to push

Required — `main` has no commits yet:

```bash
git add .
git commit -m "Initial commit"
```

Do not commit secrets (`.env`, credentials). Prefer adding `.cursor/` to `.gitignore` instead of committing it.

### 3. Push and connect this branch

If the remote repo is empty and uses `main`:

```bash
git push -u origin main
```

If the remote already has commits (README, license, etc.):

```bash
git pull origin main --rebase
git push -u origin main
```

`-u` sets tracking so later you only need `git push` / `git pull`.

### 4. Confirm tracking

```bash
git status
git branch -vv
```

You should see `main` tracking `origin/main`.
