---
id: catch-up
chapter: 5
order: 3
kind: lesson
checks: state
title: What did they do?
---
Alex has pushed new work to the server. Fetch it and look at what changed before you take it, then bring it into your `main`.

+++ setup
server recipes
alex recipes eval '
  printf "Pancakes\n\n2 eggs\n1 cup flour\n1 cup milk\n" > pancakes.txt
  printf "Tomato soup\n\n6 tomatoes\n1 onion\n2 cups stock\n" > soup.txt
  commit "Add the first recipes"
  git push -q origin main'
git clone -q server:recipes.git
alex recipes eval '
  echo "1 handful basil" >> soup.txt
  commit "Basil in the soup"
  printf "Lemon cake\n\n3 eggs\n1 cup sugar\n2 lemons\n" > cake.txt
  commit "Add a lemon cake"
  git push -q origin main'

+++ check
cd recipes 2>/dev/null || { echo "recipes/ is gone"; exit 1; }
srv="git --git-dir=../server/recipes.git"
fail=0
if [ "$(git rev-parse HEAD)" != "$($srv rev-parse main)" ]; then
  if [ "$(git rev-parse origin/main)" = "$($srv rev-parse main)" ]; then
    echo "you've fetched Alex's commits (origin/main has them), but your main hasn't taken them yet: git merge"
  else
    echo "your main doesn't have Alex's new commits yet"
  fi
  fail=1
fi
left=$(git status --porcelain)
[ -z "$left" ] || { echo "there are changes left over:"; echo "$left"; fail=1; }
exit $fail

+++ solution
cd recipes
git fetch
git log --oneline main..origin/main
git merge

+++ tools
- `git fetch`: downloads new commits from the server and moves `origin/main`. Your files and your `main` don't change
- `git log main..origin/main`: commits on the server that your `main` doesn't have; `git diff main origin/main` the changes
- `git merge`: brings `origin/main` into `main` (the branch it tracks)
- `git pull`: fetch and merge in one go

+++ steps
Download: `cd recipes`, then `git fetch`

The graph shows `origin/main` two commits above `main`. Your files haven't changed yet.

---
Look: `git log --oneline main..origin/main`, and `git diff main origin/main`

`main..origin/main` means "on origin/main, not on main".

---
Take it: `git merge`, then press **Check**.

It's a fast-forward, like chapter 3's.

+++ debrief
**`git pull` = `git fetch` + `git merge`.** Pull is quicker; fetch first lets you look before anything changes in your files. With both, nothing on the server ever changes.

**Fetching is always safe.** It only updates `origin/...`, git's notes about the server. Your branches and files stay as they are, so fetch whenever you like.

**The `..` range** works everywhere: `git log a..b` is "commits on b that aren't on a". `git log origin/main..main` is what you haven't pushed.

**Options worth knowing**

- `git fetch --prune`: also forget branches deleted on the server
- `git status` after a fetch says how far behind you are
- `git pull --ff-only`: pull only if it's a fast-forward

+++ sheet
```bash
git fetch                  # download; change nothing else
git log main..origin/main  # what's new on the server
git merge                  # take it into this branch
git pull                   # fetch + merge
```

+++ tip
git fetch is always safe: it only moves origin/...
