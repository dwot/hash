---
id: clone
chapter: 5
order: 1
kind: lesson
checks: state
title: Get a copy
---
Your team keeps its recipes on a server, as `server:recipes.git`. Make your own copy to work in: clone it into `~/work/recipes`.

Here, the `server/` folder stands in for GitHub or GitLab. Leave it alone and talk to it with git, as you would a real one.

+++ setup
server recipes
alex recipes eval '
  printf "Pancakes\n\n2 eggs\n1 cup flour\n1 cup milk\n" > pancakes.txt
  printf "Tomato soup\n\n6 tomatoes\n1 onion\n2 cups stock\n" > soup.txt
  commit "Add the first recipes"
  printf "Chickpea curry\n\n2 tins chickpeas\n1 tin coconut milk\n" > curry.txt
  commit "Add a curry"
  git push -q origin main'

+++ check
[ -d recipes/.git ] || { echo "there's no repository in ~/work/recipes yet"; exit 1; }
cd recipes
fail=0
url=$(git remote get-url origin 2>/dev/null) || { echo "recipes has no remote called origin: it should be a clone"; exit 1; }
case $url in server:recipes.git|server:recipes|/home/player/work/server/recipes.git) ;; *) echo "origin is $url, not server:recipes.git"; fail=1 ;; esac
[ "$(git rev-parse -q --verify HEAD)" = "$(git --git-dir=../server/recipes.git rev-parse main)" ] || { echo "your main isn't the same as the server's"; fail=1; }
exit $fail

+++ solution
git clone server:recipes.git

+++ tools
- `git clone <url>`: copies a repository, its whole history, into a new folder named after it
- `git remote -v`: inside the copy, where it came from

Run it from `~/work`, where you start.

+++ steps
Clone it: `git clone server:recipes.git`

Git makes `recipes/`, named after the repository.

---
Look inside: `cd recipes`, then `git log --oneline` and `git remote -v`, then press **Check**.

The graph shows `origin/main` next to `main`: git's note of where `main` is on the server.

+++ debrief
**A clone is a full copy.** Every commit and every file's history comes down, so `git log`, `git diff` and the rest work offline. The server is just another copy that everyone agrees to share through.

**`origin`** is the name git gives the place you cloned from. **`origin/main`** is where `main` was on the server the last time you talked to it. It only moves when you fetch, pull or push.

**Real URLs** look like `https://github.com/you/recipes.git` or `git@github.com:you/recipes.git`. This course's `server:` is set up to mean the `server/` folder (`git config --list | grep server` shows how).

**Options worth knowing**

- `git clone url other-name`: into a folder with another name
- `git clone --depth 1 url`: just the latest commit, for big repositories

+++ sheet
```bash
git clone url          # copy a repository into ./name
git clone url dir      # ...into ./dir
git remote -v          # where origin points
```

+++ tip
origin/main is where main was on the server when you last checked.
