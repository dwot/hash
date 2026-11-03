---
id: switching
chapter: 3
order: 2
kind: lesson
checks: state
title: Switching
---
Someone started a stew on the `winter` branch. Switch to it, finish the stew by adding the line `2 carrots` to `stew.txt` and committing, then switch back to `main`.

+++ setup
repo recipes
printf 'Pancakes\n\n2 eggs\n1 cup flour\n1 cup milk\n' > pancakes.txt
printf 'Tomato soup\n\n6 tomatoes\n1 onion\n2 cups stock\n' > soup.txt
commit "Add the first recipes"
git switch -q -c winter
printf 'Beef stew\n\n500 g beef\n2 potatoes\n' > stew.txt
commit "Start a stew"
git switch -q main
printf 'Recipes for every season.\n' > README.md
commit "Add a README"

+++ check
cd recipes 2>/dev/null || { echo "recipes/ is gone"; exit 1; }
fail=0
[ "$(git log -1 --format=%s main)" = "Add a README" ] || { echo "main has a new commit: the stew belongs on winter"; fail=1; }
git show winter:stew.txt 2>/dev/null | grep -qx "2 carrots" || { echo "stew.txt on winter doesn't have the line 2 carrots yet"; fail=1; }
[ "$(git rev-list --count winter)" = 3 ] || [ $fail = 1 ] || { echo "winter should have one new commit, with the carrots"; fail=1; }
[ "$(git symbolic-ref -q --short HEAD)" = main ] || { echo "switch back to main at the end"; fail=1; }
left=$(git status --porcelain)
[ -z "$left" ] || { echo "there are changes left over that aren't committed:"; echo "$left"; fail=1; }
exit $fail

+++ solution
cd recipes
git switch winter
echo "2 carrots" >> stew.txt
git commit -am "Carrots in the stew"
git switch main

+++ tools
- `git switch name`: switches to a branch that exists. Your files change to match it
- `git branch`: lists the branches
- `echo "line" >> file`, then `git commit -am "message"`

Try `ls` on each branch.

+++ steps
Switch: `cd recipes`, then `git switch winter`

`ls` now shows `stew.txt`, and `README.md` has gone: that came later, on `main`.

---
Finish the stew: `echo "2 carrots" >> stew.txt`, then `git commit -am "Carrots in the stew"`

---
Go back: `git switch main`, then press **Check**.

`stew.txt` disappears again. It's safe on `winter`.

+++ debrief
**Switching swaps your files for the branch's.** Files that only exist on the other branch appear, and ones that only exist on this one disappear. Nothing is lost: it's all in the commits.

**Uncommitted changes come with you** when you switch, if they don't clash with the other branch. If they would, git refuses and says so: commit them first, or put them aside with `git stash` (chapter 6).

**Options worth knowing**

- `git switch -`: back to the branch you were on before
- `git log --oneline --all --graph`: the graph beside the terminal, in text
- `git checkout winter`: the older way to switch

+++ sheet
```bash
git switch name       # switch to a branch
git switch -          # back to the previous one
git log --oneline --all --graph   # every branch, drawn
```

+++ tip
git switch - jumps back to the branch you were just on.
