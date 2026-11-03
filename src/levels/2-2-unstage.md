---
id: unstage
chapter: 2
order: 2
kind: lesson
checks: state
title: Unstage
---
You ran `git add .` a bit too quickly. Along with the new recipe went `.env`, which has a password in it and must never be committed.

Take `.env` back out of the next commit, without deleting it, and commit the recipe.

+++ setup
repo recipes
printf 'Pancakes\n\n2 eggs\n1 cup flour\n1 cup milk\n' > pancakes.txt
commit "Add pancakes"
printf 'Chickpea curry\n\n2 tins chickpeas\n1 tin coconut milk\n' > curry.txt
printf 'SHOP_USER=sam\nSHOP_PASSWORD=correct-horse-battery\n' > .env
git add .

+++ check
cd recipes 2>/dev/null || { echo "recipes/ is gone"; exit 1; }
fail=0
if git cat-file -e HEAD:.env 2>/dev/null; then
  echo ".env is in a commit: the password is in the history now. Start over and take it out before committing"
  fail=1
fi
git cat-file -e HEAD:curry.txt 2>/dev/null || { echo "curry.txt isn't committed yet"; fail=1; }
if [ ! -f .env ]; then
  echo ".env has been deleted: it should stay in the folder, just not in git"
  fail=1
elif git diff --cached --name-only | grep -qx .env; then
  echo ".env is still added, ready to be committed"
  fail=1
fi
left=$(git status --porcelain | grep -v -e ' \.env$' -e '^?? \.gitignore$')
[ -z "$left" ] || { echo "there are changes left over that aren't committed:"; echo "$left"; fail=1; }
exit $fail

+++ solution
cd recipes
git restore --staged .env
git commit -m "Add a curry"

+++ tools
- `git status`: lists what's added under **Changes to be committed**, and says how to unstage
- `git restore --staged file`: takes a file out of the next commit, and leaves the file alone
- `git commit -m "message"`

Bonus: add `.env` to `.gitignore` so it can't happen again.

+++ steps
See what's added: `cd recipes`, then `git status`

Both `.env` and `curry.txt` are under **Changes to be committed**. Git's hint says how to unstage.

---
Unstage the password file: `git restore --staged .env`

`git status` now lists it as untracked, and it's still in the folder (`ls -a`).

---
Commit the recipe: `git commit -m "Add a curry"`, then press **Check**.

+++ debrief
**The staging area is a draft of the next commit.** `git add` puts things in, `git restore --staged` takes them out again, and nothing is final until you commit.

**Once a password is committed, treat it as leaked.** Deleting it in a later commit leaves it in the history, and anyone with a copy has it. Change the password, then clean the history (chapter 6's tools, or `git filter-repo`).

**Older commands:** `git reset HEAD .env` and `git rm --cached .env` both unstage it too. `git rm` without `--cached` deletes the file.

**Better still**, ignore it from the start: `echo .env >> .gitignore`.

+++ sheet
```bash
git restore --staged file   # out of the next commit
                            # (the file is untouched)
git diff --staged           # what's added so far
```

+++ tip
A committed password is a leaked password: change it.
