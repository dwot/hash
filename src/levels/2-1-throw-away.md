---
id: throw-away
chapter: 2
order: 1
kind: lesson
checks: state
title: Throw it away
---
You've been editing two recipes. The pancake changes are good, but the soup has gone badly wrong. Put `soup.txt` back the way it was in the last commit, and keep your pancake changes.

+++ setup
repo recipes
printf 'Pancakes\n\n2 eggs\n1 cup flour\n1 cup milk\n' > pancakes.txt
printf 'Tomato soup\n\n6 tomatoes\n1 onion\n2 cups stock\n1 handful basil\n' > soup.txt
commit "Add the first recipes"
printf 'Pancakes\n\n2 eggs\n1 cup flour\n1 cup milk\n1 pinch salt\n1 tsp vanilla\n' > pancakes.txt
printf 'Tomato soup\n\n6 tomatoes\n1 onion\n2 cups stock\n1 handful basil\n1 tin pineapple\n3 tbsp chocolate sauce\n' > soup.txt

+++ check
cd recipes 2>/dev/null || { echo "recipes/ is gone"; exit 1; }
fail=0
[ "$(git rev-list --count HEAD)" = 1 ] || { echo "there's a new commit: this level is about your files, not the history"; fail=1; }
git diff --quiet HEAD -- soup.txt || { echo "soup.txt still isn't what was committed"; fail=1; }
if ! grep -q "vanilla" pancakes.txt 2>/dev/null; then
  echo "the pancake changes are gone too: only soup.txt should go back"
  fail=1
fi
exit $fail

+++ solution
cd recipes
git restore soup.txt

+++ tools
- `git restore file`: puts a file back the way it was when it was last added or committed, throwing your changes away
- `git diff file`: see what you'd be throwing away first

Name the file: without one, `git restore` won't do anything, and `git restore .` would throw away the pancakes too.

+++ steps
Look at what's changed: `cd recipes`, then `git diff`

The soup has pineapple and chocolate in it. The pancakes have salt and vanilla.

---
Throw away the soup changes: `git restore soup.txt`, then press **Check**.

`git diff` now only shows the pancakes.

+++ debrief
**`git restore` can't be undone.** The changes you throw away were never committed, so git has no copy of them. Look with `git diff file` first.

**Older commands do the same thing.** You'll see `git checkout -- soup.txt` in lots of guides; it's the same as `git restore soup.txt`. `restore` was added in 2019 because `checkout` did too many different jobs.

**Options worth knowing**

- `git restore .`: throw away every change in this folder
- `git restore --source=HEAD~2 soup.txt`: the file as it was two commits ago
- `git restore -p soup.txt`: go through the changes a piece at a time

+++ sheet
```bash
git restore file            # throw away changes to file
git restore .               # ...to everything here
git restore --source=HEAD~2 file   # as it was 2 commits ago
```

+++ tip
Restored changes are gone for good: look with git diff first.
