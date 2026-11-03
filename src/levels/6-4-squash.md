---
id: squash
chapter: 6
order: 4
kind: lesson
checks: state
title: Squash
---
The `curry` branch has four commits called "wip", "wip", "more wip" and "done?". Nobody wants to review that. Squash them into **one** commit with the message `Add a curry`, keeping the finished recipe exactly as it is. Leave `main` alone.

+++ setup
repo recipes
printf 'Pancakes\n\n2 eggs\n1 cup flour\n1 cup milk\n' > pancakes.txt
commit "Add pancakes"
git switch -q -c curry
printf 'Chickpea curry\n' > curry.txt; commit "wip"
printf 'Chickpea curry\n\n2 tins chickpeas\n' > curry.txt; commit "wip"
printf 'Chickpea curry\n\n2 tins chickpeas\n1 tin coconut milk\n' > curry.txt; commit "more wip"
printf 'Chickpea curry\n\n2 tins chickpeas\n1 tin coconut milk\n2 tbsp curry paste\n' > curry.txt; commit "done?"

+++ check
cd recipes 2>/dev/null || { echo "recipes/ is gone"; exit 1; }
[ -d .git/rebase-merge ] && { echo "a rebase is still in progress: git status says what's next"; exit 1; }
fail=0
[ "$(git log -1 --format=%s main)" = "Add pancakes" ] && [ "$(git rev-list --count main)" = 1 ] || { echo "main has changed: only curry should"; fail=1; }
n=$(git rev-list --count main..curry)
[ "$n" = 1 ] || { echo "curry should have one commit of its own; it has $n"; fail=1; }
msg=$(git log -1 --format=%B curry | sed '/^$/d')
[ "$msg" = "Add a curry" ] || { echo "the message should be just: Add a curry. It's:"; echo "$msg"; fail=1; }
want=$(printf 'Chickpea curry\n\n2 tins chickpeas\n1 tin coconut milk\n2 tbsp curry paste')
[ "$(git show curry:curry.txt 2>/dev/null)" = "$want" ] || { echo "curry.txt isn't the finished recipe any more"; fail=1; }
git merge-base --is-ancestor main curry || { echo "curry should still start from main"; fail=1; }
exit $fail

+++ solution
cd recipes
GIT_SEQUENCE_EDITOR="sed -i '2,\$s/^pick/fixup/'" git rebase -i main
git commit --amend -m "Add a curry"

+++ tools
- `git rebase -i main`: opens a to-do list of the branch's commits in nano. Change the word at the start of each line to say what to do with it, save, and close
- `pick`: keep it. `fixup` (or `f`): fold it into the one above, dropping its message. `squash` (`s`): fold it in, and edit the combined message. `reword` (`r`): keep it, change its message
- `git commit --amend -m "..."`: change the last commit's message afterwards

+++ steps
Open the to-do list: `cd recipes`, then `git rebase -i main`

Four lines, oldest first, each starting `pick`.

---
Leave the first line as `pick`, and change `pick` to `fixup` on the other three. In nano, move with the arrow keys and type over the word. <kbd>Ctrl</kbd>+<kbd>O</kbd>, <kbd>Enter</kbd> saves; <kbd>Ctrl</kbd>+<kbd>X</kbd> closes, and the rebase runs.

The graph shows one commit on `curry`, still called "wip".

---
Fix the message: `git commit --amend -m "Add a curry"`, then press **Check**.

+++ debrief
**Interactive rebase is history editing.** The to-do list is a script: git replays each line in order, so you can also **reorder** lines (move the line), **drop** a commit (delete its line), or **reword** and **edit** as you go. The boss uses most of these.

**Squash or fixup?** `squash` keeps all the messages and opens the editor to combine them; `fixup` keeps only the first. Use `reword` on the first line to fix its message in the same go.

**Another way:** `git reset --soft main`, then `git commit -m "Add a curry"`. It moves the branch back to `main`, keeps all the changes added, and commits them as one.

**Commit early, tidy before sharing.** Plenty of small "wip" commits are a safety net while working. Squash them before anyone else sees them.

+++ sheet
```bash
git rebase -i main       # edit this branch's commits
# pick   keep    reword  keep, new message
# fixup  fold into the one above (drop msg)
# squash fold in, combine messages
# drop   remove  (or delete the line)
git reset --soft main    # all changes, ready for 1 commit
```

+++ tip
Squash your wip commits before anyone reviews them.
