---
id: fast-forward
chapter: 3
order: 3
kind: lesson
checks: state
title: Fast-forward
---
The `curry` branch is finished and tested. Bring its work into `main`.

+++ setup
repo recipes
printf 'Recipes\n\npancakes.txt\n' > index.txt
printf 'Pancakes\n\n2 eggs\n1 cup flour\n1 cup milk\n' > pancakes.txt
commit "Add pancakes"
git switch -q -c curry
printf 'Chickpea curry\n\n2 tins chickpeas\n' > curry.txt
commit "Start a curry"
echo "1 tin coconut milk" >> curry.txt
printf 'Recipes\n\ncurry.txt\npancakes.txt\n' > index.txt
commit "Finish the curry"
git switch -q main

+++ check
cd recipes 2>/dev/null || { echo "recipes/ is gone"; exit 1; }
fail=0
git rev-parse -q --verify refs/heads/curry >/dev/null || { echo "the curry branch has been deleted: keep it for now"; exit 1; }
git merge-base --is-ancestor curry main || { echo "main doesn't have the curry commits yet"; fail=1; }
git cat-file -e main:curry.txt 2>/dev/null || [ $fail = 1 ] || { echo "curry.txt isn't on main"; fail=1; }
[ "$(git symbolic-ref -q --short HEAD)" = main ] || { echo "you're not on main"; fail=1; }
left=$(git status --porcelain)
[ -z "$left" ] || { echo "there are changes left over that aren't committed:"; echo "$left"; fail=1; }
exit $fail

+++ solution
cd recipes
git merge curry

+++ tools
- `git merge name`: brings another branch's commits into the branch you're on
- `git branch`: check you're on `main` first: you merge *into* where you are

+++ steps
Make sure you're on main: `cd recipes`, then `git branch`

---
Merge: `git merge curry`, then press **Check**.

Git says **Fast-forward**: in the graph, `main` has jumped up to where `curry` is.

+++ debrief
**A fast-forward is the simplest merge.** `main` hadn't moved since `curry` started, so there was nothing to combine: git just moved `main` forward to `curry`'s latest commit. No new commit is made.

**When both branches have moved**, git can't just slide one forward. It makes a merge commit with two parents. That's the boss.

**Options worth knowing**

- `git merge --ff-only curry`: merge only if it's a fast-forward, and stop otherwise
- `git merge --no-ff curry`: always make a merge commit, so the history shows a branch was merged
- `git branch --merged`: branches whose work is already in this one

+++ sheet
```bash
git merge name          # bring name into this branch
git merge --ff-only n   # only if it's a fast-forward
git merge --no-ff n     # always make a merge commit
```

+++ tip
You merge into the branch you're on: switch to it first.
