---
id: amend
chapter: 2
order: 3
kind: lesson
checks: state
title: Fix the last commit
---
You just committed a new recipe, and spotted two mistakes straight away: the message says "recipie", and you forgot to include your change to `index.txt`.

Fix the last commit so it has both files and a correct message. Don't add a second commit.

+++ setup
repo recipes
printf 'Recipes\n\npancakes.txt\n' > index.txt
printf 'Pancakes\n\n2 eggs\n1 cup flour\n1 cup milk\n' > pancakes.txt
commit "Add pancakes"
printf 'Chickpea curry\n\n2 tins chickpeas\n1 tin coconut milk\n' > curry.txt
commit "Add a curry recipie" curry.txt
printf 'Recipes\n\ncurry.txt\npancakes.txt\n' > index.txt

+++ check
cd recipes 2>/dev/null || { echo "recipes/ is gone"; exit 1; }
fail=0
n=$(git rev-list --count HEAD)
if [ "$n" -gt 2 ]; then
  echo "there's a new commit on top: fix the last commit instead (git reset --soft HEAD~1 takes the new one off, keeping its changes)"
  fail=1
elif [ "$n" -lt 2 ]; then
  echo "the curry commit is gone"
  fail=1
fi
msg=$(git log -1 --format=%s)
case $msg in *recipie*) echo "the message still says \"recipie\": $msg"; fail=1 ;; esac
[ -n "$msg" ] || { echo "the message is empty"; fail=1; }
git cat-file -e HEAD:curry.txt 2>/dev/null || { echo "curry.txt isn't in the last commit"; fail=1; }
git diff --quiet HEAD -- index.txt || { echo "the index.txt change isn't in the last commit"; fail=1; }
git diff-tree --no-commit-id --name-only -r HEAD | grep -qx index.txt || [ $fail = 1 ] || { echo "index.txt isn't in the last commit"; fail=1; }
left=$(git status --porcelain)
[ -z "$left" ] || { echo "there are changes left over:"; echo "$left"; fail=1; }
exit $fail

+++ solution
cd recipes
git add index.txt
git commit --amend -m "Add a curry recipe"

+++ tools
- `git add file`: add the forgotten change first
- `git commit --amend -m "new message"`: replaces the last commit with one that has whatever's added now, and the new message
- `git log --oneline`, `git show`: check the result

Without `-m`, `--amend` opens the old message in nano to edit: <kbd>Ctrl</kbd>+<kbd>O</kbd>, <kbd>Enter</kbd> saves, <kbd>Ctrl</kbd>+<kbd>X</kbd> closes.

+++ steps
Add the forgotten file: `cd recipes`, then `git add index.txt`

---
Replace the last commit: `git commit --amend -m "Add a curry recipe"`, then press **Check**.

`git log --oneline` still shows two commits, and `git show --stat` lists both files in the last one.

+++ debrief
**`--amend` doesn't edit a commit; it replaces it.** Commits never change. Git makes a new one, with a new hash, and moves the branch to it. Watch the hash change in the graph.

**So amend only what you haven't shared.** If someone else already has the old commit, their copy and yours now disagree (chapter 5). For shared commits, add a new commit or use `git revert`, next.

**Options worth knowing**

- `git commit --amend --no-edit`: add what's staged, keep the message
- `git commit --amend`: edit the message in your editor
- `git reset --soft HEAD~1`: undo the last commit entirely, keeping its changes added

+++ sheet
```bash
git commit --amend -m "msg"   # replace the last commit
git commit --amend --no-edit  # ...keeping its message
git reset --soft HEAD~1       # undo it, keep changes
```

+++ tip
Amend only commits nobody else has yet.
