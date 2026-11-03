---
id: not-everything
chapter: 1
order: 3
kind: lesson
checks: state
title: Not everything
---
You've written a new recipe, `curry.txt`. Commit it.

The `build/` folder is made fresh by a script every time, so it doesn't belong in the history. Make git ignore it for good, and commit that setting too.

+++ setup
repo recipes
printf '# Recipes\n\nThings worth cooking twice. Run ./build.sh to make the website.\n' > README.md
printf 'Pancakes\n\n2 eggs\n1 cup flour\n1 cup milk\n' > pancakes.txt
printf 'Tomato soup\n\n6 tomatoes\n1 onion\n2 cups stock\n' > soup.txt
printf '#!/bin/sh\nmkdir -p build\nfor f in *.txt; do sed "1s/^/<h1>/" "$f" > "build/${f%%.txt}.html"; done\n' > build.sh
chmod +x build.sh
commit "Add the first recipes and the website script"
printf 'Chickpea curry\n\n2 tins chickpeas\n1 tin coconut milk\n2 tbsp curry paste\n' > curry.txt
./build.sh

+++ check
cd recipes 2>/dev/null || { echo "recipes/ is gone"; exit 1; }
fail=0
git cat-file -e HEAD:curry.txt 2>/dev/null || { echo "curry.txt isn't committed yet"; fail=1; }
if git ls-tree -r --name-only HEAD | grep -q '^build/'; then
  echo "build/ is in the history. Ignoring a folder doesn't take out what's already committed: git rm -r --cached build takes it out of git and leaves the files"
  fail=1
fi
if ! git check-ignore -q build/curry.html; then
  echo "git isn't ignoring build/ yet: git status still lists it"
  fail=1
fi
if [ -f .gitignore ] && ! git cat-file -e HEAD:.gitignore 2>/dev/null; then
  echo ".gitignore isn't committed yet"
  fail=1
elif [ ! -f .gitignore ] && [ $fail = 0 ]; then
  echo "build/ is ignored, but not in a file that's committed: put it in .gitignore"
  fail=1
fi
left=$(git status --porcelain)
[ -z "$left" ] || { echo "there are changes left over that aren't committed:"; echo "$left"; fail=1; }
exit $fail

+++ solution
cd recipes
echo "build/" > .gitignore
git add .gitignore curry.txt
git commit -m "Add curry, and ignore the built website"

+++ tools
- `.gitignore`: a file listing names git should act as if it can't see. A line `build/` covers that whole folder
- `git add file1 file2`: add just those files
- `git status`: check what's left before you commit

Make the file with `echo "build/" > .gitignore`, or `nano .gitignore`.

+++ steps
Go in and look: `cd recipes`, then `git status`

Two things are untracked: `curry.txt`, and `build/`, which you don't want.

---
Tell git to ignore the folder: `echo "build/" > .gitignore`

Run `git status` again: `build/` is gone from the list, and `.gitignore` has appeared.

---
Add the two files you want: `git add .gitignore curry.txt`

---
Commit: `git commit -m "Add curry, and ignore the built website"`, then press **Check**.

+++ debrief
**`.gitignore` is for things you make, not things you write.** Build output, downloaded packages (`node_modules/`), logs, editor settings. Committing it means everyone working on the project ignores the same things.

**Ignoring only works on files that aren't tracked yet.** If `build/` had been committed first, adding it to `.gitignore` wouldn't take it out. `git rm -r --cached build` does that, and leaves the files on disk.

**Patterns**

- `build/`: a folder, wherever it is
- `*.log`: every file ending `.log`
- `/notes.txt`: only at the top of the repository
- `!keep.log`: an exception to a pattern above it

`git check-ignore -v build/soup.html` says which line is ignoring a file.

+++ sheet
```bash
echo "build/" >> .gitignore   # ignore a folder for good
git add a.txt b.txt           # add just these files
git rm -r --cached build      # untrack, keep the files
git check-ignore -v file      # why is this ignored?
```

+++ tip
Commit .gitignore, so everyone ignores the same things.
