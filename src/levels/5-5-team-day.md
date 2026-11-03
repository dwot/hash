---
id: team-day
chapter: 5
order: 5
kind: boss
checks: state
title: A day on the team
---
A day's work on the team's recipes, in your clone `recipes/`:

1. Bring your `main` up to date: Alex has pushed since you cloned.
2. Starting from the up-to-date `main`, make a branch `salads` and commit `salad.txt` on it (it's written; it's in the folder).
3. Push `salads` to the server as a new branch, and set it up so that from now on, a plain `git push` or `git pull` on `salads` uses it.

Don't push anything to the server's `main`.

+++ setup
server recipes
alex recipes eval '
  printf "Pancakes\n\n2 eggs\n1 cup flour\n1 cup milk\n" > pancakes.txt
  printf "Tomato soup\n\n6 tomatoes\n1 onion\n2 cups stock\n" > soup.txt
  commit "Add the first recipes"
  git push -q origin main'
git clone -q server:recipes.git
alex recipes eval '
  printf "Recipes\n\npancakes.txt\nsoup.txt\nsalad.txt (Sam is writing it)\n" > index.txt
  commit "Add an index"
  git push -q origin main'
printf 'Summer salad\n\n1 cucumber\n4 tomatoes\n1 block feta\n' > recipes/salad.txt

+++ check
cd recipes 2>/dev/null || { echo "recipes/ is gone"; exit 1; }
srv="git --git-dir=../server/recipes.git"
fail=0
[ "$($srv log -1 --format=%s main)" = "Add an index" ] || { echo "the server's main has changed: only salads should be pushed"; fail=1; }
[ "$(git rev-parse main)" = "$($srv rev-parse main)" ] || { echo "your main isn't up to date with the server's: git pull on main"; fail=1; }
if ! git rev-parse -q --verify refs/heads/salads >/dev/null; then echo "there's no salads branch yet"; exit 1; fi
git cat-file -e salads:salad.txt 2>/dev/null || { echo "salad.txt isn't committed on salads"; fail=1; }
git merge-base --is-ancestor "$($srv rev-parse main)" salads || { echo "salads should start from the up-to-date main, with Alex's index in it"; fail=1; }
if ! $srv rev-parse -q --verify refs/heads/salads >/dev/null; then
  echo "the server has no salads branch yet"
  fail=1
elif [ "$($srv rev-parse salads)" != "$(git rev-parse salads)" ]; then
  echo "the server's salads isn't the same as yours: push again"
  fail=1
fi
up=$(git rev-parse --abbrev-ref salads@{upstream} 2>/dev/null)
[ "$up" = origin/salads ] || { echo "salads isn't linked to origin/salads, so a plain git push won't know where to go: git push -u"; fail=1; }
git cat-file -e main:salad.txt 2>/dev/null && { echo "salad.txt went onto main: it belongs on salads"; fail=1; }
exit $fail

+++ solution
cd recipes
git pull
git switch -c salads
git add salad.txt
git commit -m "Add a summer salad"
git push -u origin salads

+++ tools
- `git pull`: on `main`, catch up with the server
- `git switch -c salads`: a new branch from where you are
- `git push -u origin salads`: makes `salads` on the server and links yours to it (`-u` is `--set-upstream`)
- `git branch -vv`: shows which branch each one is linked to

+++ steps
Catch up: `cd recipes`, then `git pull`

Alex's "Add an index" arrives. `salad.txt` is untracked, so it stays where it is.

---
Branch and commit: `git switch -c salads`, `git add salad.txt`, `git commit -m "Add a summer salad"`

---
Try a plain `git push`

Git refuses: **The current branch salads has no upstream branch**, and suggests the fix.

---
Push and link: `git push -u origin salads`, then press **Check**.

The graph shows `origin/salads` next to `salads`. `git branch -vv` shows the link.

+++ debrief
**This is most of a day with git on a team**: pull, branch, commit, push the branch. On GitHub or GitLab, the next step is opening a pull (or merge) request for `salads`, and someone reviews and merges it into `main` on the server.

**`-u` is needed once per branch.** After that, `git push` and `git pull` on `salads` know where to go, and `git status` says how far ahead or behind it is.

**Options worth knowing**

- `git config --global push.autoSetupRemote true`: a plain `git push` does the `-u` for you
- `git push origin --delete salads`: delete the branch on the server
- `git switch salads` in a fresh clone makes a local branch from `origin/salads`
