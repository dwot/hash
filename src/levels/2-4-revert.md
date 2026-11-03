---
id: revert
chapter: 2
order: 4
kind: lesson
checks: state
title: Undo in public
---
The commit "Switch to metric" was a mistake, and the rest of the team already has it. Undo its changes with a **new commit**, leaving the history as it is. The curry that came after it stays.

+++ setup
repo recipes
printf 'Pancakes\n\n2 eggs\n1 cup flour\n1 cup milk\n' > pancakes.txt
printf 'Tomato soup\n\n6 tomatoes\n1 onion\n2 cups stock\n' > soup.txt
commit "Add the first recipes"
printf 'Pancakes\n\n2 eggs\n125 g flour\n250 ml milk\n' > pancakes.txt
printf 'Tomato soup\n\n6 tomatoes\n1 onion\n500 ml stock\n' > soup.txt
commit "Switch to metric"
printf 'Chickpea curry\n\n2 tins chickpeas\n1 tin coconut milk\n' > curry.txt
commit "Add a curry"

+++ check
cd recipes 2>/dev/null || { echo "recipes/ is gone"; exit 1; }
subjects=$(git log --reverse --format=%s | head -n 3 | paste -sd'|')
if [ "$subjects" != "Add the first recipes|Switch to metric|Add a curry" ]; then
  echo "the history has changed: the first three commits should still be there, as they were. Rewriting shared history leaves the team's copies disagreeing with yours. Start over, and add a commit instead"
  exit 1
fi
n=$(git rev-list --count HEAD)
[ "$n" -ge 4 ] || { echo "there's no new commit yet"; exit 1; }
fail=0
[ "$n" = 4 ] || { echo "there should be one new commit; there are $((n - 3))"; fail=1; }
git diff --quiet HEAD~$((n - 1)) HEAD -- pancakes.txt soup.txt || { echo "the recipes aren't back to cups yet: git diff HEAD~3 -- pancakes.txt soup.txt shows what's different"; fail=1; }
git cat-file -e HEAD:curry.txt 2>/dev/null || { echo "the curry is gone: only the metric commit should be undone"; fail=1; }
left=$(git status --porcelain)
[ -z "$left" ] || { echo "there are changes left over that aren't committed:"; echo "$left"; fail=1; }
exit $fail

+++ solution
cd recipes
git revert --no-edit HEAD~1

+++ tools
- `git log --oneline`: find the commit's hash
- `git revert <commit>`: makes a new commit that does the opposite of that one
- `--no-edit`: use git's message ("Revert ...") instead of opening the editor

A commit can be named by its hash, like `a1b2c3d`, or by where it is: `HEAD~1` is one before the latest.

+++ steps
Find the commit: `cd recipes`, then `git log --oneline`

"Switch to metric" is second from the top: you can call it `HEAD~1`, or use its hash.

---
Revert it: `git revert --no-edit HEAD~1`, then press **Check**.

The graph shows a new commit on top, "Revert "Switch to metric"", with the old ones untouched. `cat pancakes.txt` is back to cups.

+++ debrief
**Revert adds; it never removes.** Everyone who has the old commits can take the new one without trouble, because nothing they have has changed. That's why it's the safe undo for anything shared.

**Compare that with `git reset`**, next level, which moves the branch back and drops commits. Fine for your own work, trouble for shared work.

**Without `--no-edit`**, git opens nano with a message ready. Saying *why* it was reverted is good practice: <kbd>Ctrl</kbd>+<kbd>O</kbd>, <kbd>Enter</kbd> to save, <kbd>Ctrl</kbd>+<kbd>X</kbd> to close.

**Options worth knowing**

- `git revert a1b2c3d e4f5a6b`: several commits, one revert each
- `git revert --no-commit ...`: make the changes, let you commit them yourself
- If later commits changed the same lines, revert stops with a conflict (chapter 4)

+++ sheet
```bash
git revert HEAD~1          # new commit undoing that one
git revert --no-edit abc12 # ...with git's message
```

+++ tip
Shared commits: revert. Your own unshared commits: reset or amend.
