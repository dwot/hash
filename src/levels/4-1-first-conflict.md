---
id: first-conflict
chapter: 4
order: 1
kind: lesson
checks: state
title: Both changed it
---
Merge the `red-onion` branch into `main`. Both branches changed the same line of `soup.txt`, so git will stop and ask you what it should say.

The answer is to have both changes: the line should read `2 red onions`.

+++ setup
repo recipes
printf 'Tomato soup\n\n6 tomatoes\n1 onion\n2 cups stock\n' > soup.txt
commit "Add soup"
git switch -q -c red-onion
sed -i 's/^1 onion$/1 red onion/' soup.txt; commit "Red onion is sweeter"
git switch -q main
sed -i 's/^1 onion$/2 onions/' soup.txt; commit "More onion"

+++ check
cd recipes 2>/dev/null || { echo "recipes/ is gone"; exit 1; }
if [ -f .git/MERGE_HEAD ]; then
  if git diff --name-only --diff-filter=U | grep -q .; then echo "the merge is still waiting: soup.txt is in conflict"
  else echo "the conflict is resolved, but the merge isn't finished: git commit"; fi
  exit 1
fi
fail=0
git rev-parse -q --verify HEAD^2 >/dev/null && [ "$(git rev-parse HEAD^2)" = "$(git rev-parse red-onion)" ] || { echo "main doesn't have a merge of red-onion yet: git merge red-onion"; exit 1; }
if git show HEAD:soup.txt | grep -qE '^(<<<<<<<|=======|>>>>>>>)'; then
  echo "the conflict markers (<<<<<<<, =======, >>>>>>>) went into the commit. They need taking out, leaving only the soup"
  fail=1
fi
want=$(printf 'Tomato soup\n\n6 tomatoes\n2 red onions\n2 cups stock')
have=$(git show HEAD:soup.txt)
[ "$have" = "$want" ] || [ $fail = 1 ] || { echo "soup.txt should be the recipe with the line 2 red onions; it's:"; echo "$have"; fail=1; }
left=$(git status --porcelain)
[ -z "$left" ] || { echo "there are changes left over that aren't committed:"; echo "$left"; fail=1; }
exit $fail

+++ solution
cd recipes
git merge red-onion
printf 'Tomato soup\n\n6 tomatoes\n2 red onions\n2 cups stock\n' > soup.txt
git add soup.txt
git commit --no-edit

+++ tools
- `git merge red-onion`: starts the merge, and stops at the conflict
- `nano soup.txt`: edit the file. <kbd>Ctrl</kbd>+<kbd>K</kbd> cuts a whole line; <kbd>Ctrl</kbd>+<kbd>O</kbd>, <kbd>Enter</kbd> saves; <kbd>Ctrl</kbd>+<kbd>X</kbd> closes
- `git add soup.txt`: marks the conflict as resolved
- `git commit --no-edit`: finishes the merge with git's message

`git status` says what's left to do at every step.

+++ steps
Start the merge: `cd recipes`, then `git merge red-onion`

Git says **CONFLICT** and stops. The prompt says `MERGING`.

---
Look at the file: `cat soup.txt`

```
<<<<<<< HEAD
2 onions
=======
1 red onion
>>>>>>> red-onion
```

Above `=======` is your side (`main`, where HEAD is); below it, the branch's.

---
Edit it: `nano soup.txt`. Delete the three marker lines and both onion lines, and type `2 red onions` in their place. Save and close.

`cat soup.txt` should show a normal recipe again.

---
Mark it resolved and finish: `git add soup.txt`, then `git commit --no-edit`, then press **Check**.

+++ debrief
**A conflict is git asking, not failing.** Git merges line by line. When both sides changed the same lines differently, there's no right answer it can work out, so it writes both into the file and leaves the choice to you.

**The markers are plain text.** Git doesn't check what you leave in the file. `git add` means "resolved, as it is now", markers and all, so read the file before adding it. `git diff --check` warns about leftover markers.

**`--no-edit`** takes git's "Merge branch 'red-onion'" message. Without it, nano opens with that message ready to change.

**See both sides and the original**: `git config --global merge.conflictStyle zdiff3` adds a `|||||||` section with the line as it was before either change. Many people find conflicts much easier to read that way.

+++ sheet
```bash
git merge name         # stops at a conflict
git status             # which files are in conflict
# edit: keep what's right, delete <<<<<<< ======= >>>>>>>
git add file           # mark it resolved
git commit --no-edit   # finish the merge
```

+++ tip
Above ======= is yours (HEAD); below is theirs.
