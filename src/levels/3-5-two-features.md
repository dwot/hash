---
id: two-features
chapter: 3
order: 5
kind: boss
checks: state
title: Two features
---
Two branches are finished: `dessert` and `breakfast`. Bring both into `main`, then delete both branches.

`main` has moved on since they started, so this time git can't just slide `main` forward.

+++ setup
repo recipes
printf 'Recipes\n' > README.md
printf 'Tomato soup\n\n6 tomatoes\n1 onion\n2 cups stock\n' > soup.txt
commit "Add soup"
git switch -q -c dessert
printf 'Lemon cake\n\n3 eggs\n1 cup sugar\n2 lemons\n' > cake.txt; commit "Add a lemon cake"
git switch -q -c breakfast main
printf 'Porridge\n\n1 cup oats\n2 cups milk\n' > porridge.txt; commit "Add porridge"
echo "1 pinch salt" >> porridge.txt; commit "Salt the porridge"
git switch -q main
printf 'Recipes\n\nSoups, breakfasts and desserts.\n' > README.md; commit "Describe the recipes"

+++ check
cd recipes 2>/dev/null || { echo "recipes/ is gone"; exit 1; }
fail=0
[ "$(git symbolic-ref -q --short HEAD)" = main ] || { echo "you're not on main"; fail=1; }
subjects=$(git log --format=%s main)
for s in "Add a lemon cake" "Add porridge" "Salt the porridge" "Describe the recipes"; do
  printf '%s\n' "$subjects" | grep -qxF "$s" || { echo "main doesn't have the commit \"$s\""; fail=1; }
done
for f in cake.txt porridge.txt soup.txt; do
  git cat-file -e "main:$f" 2>/dev/null || { echo "$f isn't on main"; fail=1; }
done
git show main:README.md 2>/dev/null | grep -q "desserts" || { echo "README.md on main lost its description"; fail=1; }
for b in dessert breakfast; do
  git rev-parse -q --verify "refs/heads/$b" >/dev/null && { echo "the $b branch is still here"; fail=1; }
done
left=$(git status --porcelain)
[ -z "$left" ] || { echo "there are changes left over that aren't committed:"; echo "$left"; fail=1; }
[ -d .git/MERGE_HEAD ] || [ -f .git/MERGE_HEAD ] && { echo "a merge is still in progress: finish it with git commit"; fail=1; }
exit $fail

+++ solution
cd recipes
git merge --no-edit dessert
git merge --no-edit breakfast
git branch -d dessert breakfast

+++ tools
- `git merge name`: merges a branch into the one you're on. When both have moved, it makes a **merge commit**
- `--no-edit`: use git's message for the merge commit. Without it, nano opens with the message ready: <kbd>Ctrl</kbd>+<kbd>O</kbd>, <kbd>Enter</kbd>, then <kbd>Ctrl</kbd>+<kbd>X</kbd>
- `git branch -d name...`: deletes merged branches

+++ steps
On main: `cd recipes`. Merge the first: `git merge --no-edit dessert`

Git says **Merge made by the 'ort' strategy**. The graph shows a merge commit with two lines coming into it.

---
Merge the second: `git merge --no-edit breakfast`

---
Both are merged, so delete them: `git branch -d dessert breakfast`, then press **Check**.

+++ debrief
**A merge commit has two parents**: the commit `main` was on, and the other branch's. It's how git records "these two lines of work came together here". `git log --graph` and the graph panel draw it as two lines joining.

**Why no conflicts?** The branches changed different files, so git could combine them line by line on its own. When two branches change the same lines, git stops and asks you. That's chapter 4.

**`ort`** is the name of git's merge strategy (it used to be `recursive`). You'll rarely need to choose one.

**Options worth knowing**

- `git log --merges`: only merge commits
- `git log --first-parent`: main's own history, one commit per merge
- `git merge --abort`: back out of a merge that's stopped halfway
