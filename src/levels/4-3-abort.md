---
id: abort
chapter: 4
order: 3
kind: lesson
checks: state
title: Not now
---
You started merging `big-rewrite` into `main` and walked into conflicts in three files. It's not the time to sort them out. Back out of the merge, so `main` and your files are exactly as they were before you started.

+++ setup
repo recipes
printf 'Pancakes\n\n2 eggs\n1 cup flour\n1 cup milk\n' > pancakes.txt
printf 'Tomato soup\n\n6 tomatoes\n1 onion\n2 cups stock\n' > soup.txt
printf 'Recipes\n\npancakes.txt\nsoup.txt\n' > index.txt
commit "Add the first recipes"
git switch -q -c big-rewrite
printf 'PANCAKES (serves 4)\n\n4 eggs\n2 cups flour\n2 cups milk\n' > pancakes.txt
printf 'TOMATO SOUP (serves 4)\n\n12 tomatoes\n2 onions\n4 cups stock\n' > soup.txt
printf 'RECIPES\n\n- pancakes.txt\n- soup.txt\n' > index.txt
commit "Rewrite everything for four people"
git switch -q main
printf 'Pancakes\n\n2 eggs\n1 cup flour\n1 cup oat milk\n' > pancakes.txt
printf 'Tomato soup\n\n6 tomatoes\n1 red onion\n2 cups stock\n' > soup.txt
printf 'Recipes\n\nSee each file.\n' > index.txt
commit "Small fixes"
git merge -q big-rewrite >/dev/null 2>&1

+++ check
cd recipes 2>/dev/null || { echo "recipes/ is gone"; exit 1; }
fail=0
[ -f .git/MERGE_HEAD ] && { echo "the merge is still going: git status says so too"; exit 1; }
[ "$(git log -1 --format=%s main)" = "Small fixes" ] || { echo "main has moved: it should still be on \"Small fixes\", with no merge"; fail=1; }
git rev-parse -q --verify refs/heads/big-rewrite >/dev/null || { echo "big-rewrite has been deleted: you'll want it another day"; fail=1; }
left=$(git status --porcelain)
[ -z "$left" ] || { echo "your files aren't back as they were:"; echo "$left"; fail=1; }
exit $fail

+++ solution
cd recipes
git merge --abort

+++ tools
- `git status`: says a merge is in progress, and how to get out of it
- `git merge --abort`: stops the merge and puts everything back as it was before it started

+++ steps
See where you are: `cd recipes`, then `git status`

**You have unmerged paths**, and a hint: `(use "git merge --abort" to abort the merge)`.

---
Back out: `git merge --abort`, then press **Check**.

The prompt loses `MERGING`, and `cat soup.txt` is plain again.

+++ debrief
**Nothing is final until the merge commit.** While a merge is in progress, `git merge --abort` returns to the moment before you typed `git merge`. Come back to it later with the same command.

**Other "in progress" states** have the same escape: `git rebase --abort`, `git cherry-pick --abort`, `git revert --abort`. The prompt shows which you're in.

**`git reset --hard`** would get you out too, but it also throws away any changes you had before you started merging. `--abort` keeps them where it can.

+++ sheet
```bash
git merge --abort      # back out of a merge in progress
git rebase --abort     # ...a rebase
git cherry-pick --abort
```

+++ tip
The prompt shows MERGING, REBASING and so on while one is in progress.
