---
id: rebase
chapter: 6
order: 3
kind: lesson
checks: state
title: Replay
---
You started the `salads` branch a while ago, and `main` has moved on since. Before anyone reviews it, replay `salads` on top of the latest `main`, so it reads as if you'd started today. No merge commit; leave `main` as it is.

+++ setup
repo recipes
printf 'Recipes\n' > README.md
printf 'Tomato soup\n\n6 tomatoes\n1 onion\n2 cups stock\n' > soup.txt
commit "Add soup"
git switch -q -c salads
printf 'Summer salad\n\n1 cucumber\n4 tomatoes\n' > salad.txt; commit "Add a summer salad"
echo "1 block feta" >> salad.txt; commit "Feta in the salad"
git switch -q main
printf 'Recipes\n\nSoups and salads.\n' > README.md; commit "Describe the recipes"
echo "1 handful basil" >> soup.txt; commit "Basil in the soup"
git switch -q salads

+++ check
cd recipes 2>/dev/null || { echo "recipes/ is gone"; exit 1; }
[ -d .git/rebase-merge ] || [ -d .git/rebase-apply ] && { echo "a rebase is still in progress"; exit 1; }
fail=0
[ "$(git log -1 --format=%s main)" = "Basil in the soup" ] && [ "$(git rev-list --count main)" = 3 ] || { echo "main has changed: only salads should move"; fail=1; }
git merge-base --is-ancestor main salads || { echo "salads doesn't start from the latest main yet"; fail=1; }
[ -z "$(git rev-list --merges main..salads)" ] || { echo "there's a merge commit on salads: replay it instead, with git rebase"; fail=1; }
subjects=$(git log --reverse --format=%s main..salads | paste -sd'|')
[ "$subjects" = "Add a summer salad|Feta in the salad" ] || [ $fail = 1 ] || { echo "salads should be your two commits on top of main; it's: $subjects"; fail=1; }
git show salads:salad.txt 2>/dev/null | grep -qx "1 block feta" || { echo "the salad lost its feta"; fail=1; }
exit $fail

+++ solution
cd recipes
git rebase main

+++ tools
- `git rebase main`: on `salads`, takes your commits off, moves to the tip of `main`, and puts them back on top, one by one
- `git log --oneline --graph --all`, or the graph, to see the before and after

+++ steps
Look at the graph first: `salads` branches off below `main`'s two newest commits.

---
Replay: `cd recipes`, then `git rebase main` (you're already on `salads`), then press **Check**.

The graph is one straight line now: `main`'s commits, then yours. Your two commits have new hashes.

+++ debrief
**Rebase rewrites commits.** Each of yours is replayed onto the new base and becomes a new commit (new parent, new hash). The old ones are dropped from the branch. That's why the rule is: **rebase only commits nobody else has**. Others' copies would still have the old ones.

**Merge or rebase?** Merging `main` into `salads` keeps the true history, with a merge commit. Rebasing gives a straight, readable line. Both are fine; teams pick one.

**Conflicts during a rebase** stop at the commit that conflicts. Resolve, `git add`, then `git rebase --continue`. Note: during a rebase, *ours* is the branch you're replaying onto and *theirs* is your own commit, the opposite of a merge.

**Options worth knowing**

- `git rebase --abort`: back to before you started
- `git pull --rebase` (chapter 5) is a fetch plus this

+++ sheet
```bash
git rebase main          # replay this branch onto main
git rebase --continue    # after resolving a conflict
git rebase --abort       # give up, back to before
```

+++ tip
Rebase only commits you haven't shared.
