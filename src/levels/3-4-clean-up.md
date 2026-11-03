---
id: clean-up
chapter: 3
order: 4
kind: lesson
checks: state
title: Clean up
---
Old branches are piling up. Delete every branch whose work is already merged into `main`. Keep any branch that still has something `main` doesn't.

+++ setup
repo recipes
printf 'Pancakes\n\n2 eggs\n1 cup flour\n1 cup milk\n' > pancakes.txt
printf 'Tomato soup\n\n6 tomatoes\n1 onion\n2 cups stock\n' > soup.txt
commit "Add the first recipes"
git switch -q -c typo-fix
sed -i 's/Tomato soup/Tomato Soup/' soup.txt; commit "Capital S"
git switch -q main; git merge -q typo-fix
git switch -q -c curry
printf 'Chickpea curry\n\n2 tins chickpeas\n' > curry.txt; commit "Add a curry"
git switch -q main; git merge -q curry
git switch -q -c gluten-free
sed -i 's/1 cup flour/1 cup rice flour/' pancakes.txt; commit "Try rice flour"
git switch -q main
git switch -q -c salt
echo "1 pinch salt" >> pancakes.txt; commit "Salt the pancakes"
git switch -q main; git merge -q salt
git switch -q -c vegan main~1
sed -i 's/2 eggs/2 flax eggs/' pancakes.txt; commit "Flax eggs"
git switch -q main

+++ check
cd recipes 2>/dev/null || { echo "recipes/ is gone"; exit 1; }
fail=0
for b in typo-fix curry salt; do
  git rev-parse -q --verify "refs/heads/$b" >/dev/null && { echo "$b is merged, and still here"; fail=1; }
done
for b in gluten-free vegan; do
  if ! git rev-parse -q --verify "refs/heads/$b" >/dev/null; then
    echo "$b has been deleted, but its work isn't in main: it's lost from the graph now (git reflog can still find it)"
    fail=1
  fi
done
git rev-parse -q --verify refs/heads/main >/dev/null || { echo "main is gone!"; fail=1; }
exit $fail

+++ solution
cd recipes
git branch -d typo-fix curry salt

+++ tools
- `git branch --merged`: branches whose work is all in the branch you're on
- `git branch --no-merged`: the ones that still have something it doesn't
- `git branch -d name...`: deletes branches, and refuses if one isn't merged
- `git branch -D name`: deletes even if it isn't merged. Careful

+++ steps
List what's merged: `cd recipes`, then `git branch --merged`

`main` is in the list too, because it's the one you're on: leave that one.

---
Check the others: `git branch --no-merged`

These two have commits `main` doesn't. Keep them.

---
Delete the merged ones: `git branch -d typo-fix curry salt`, then press **Check**.

+++ debrief
**Deleting a branch deletes a name, not commits.** Merged branches' commits are in `main`'s history, so nothing is lost. That's why `-d` checks first and refuses an unmerged branch: its commits would have nothing pointing to them any more.

**`-D` skips the check.** Use it when you really are abandoning the work. Even then, `git reflog` can find the commits for a few weeks (chapter 7).

**Options worth knowing**

- `git branch -m old new`: rename a branch
- `git branch --merged main`: merged into main, wherever you are

+++ sheet
```bash
git branch --merged      # safe to delete
git branch --no-merged   # still has its own work
git branch -d name       # delete (only if merged)
git branch -D name       # delete anyway
git branch -m old new    # rename
```

+++ tip
git branch -d refuses unmerged branches, which is the point.
