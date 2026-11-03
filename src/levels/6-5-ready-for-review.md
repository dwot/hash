---
id: ready-for-review
chapter: 6
order: 5
kind: boss
checks: state
title: Ready for review
---
Your `salads` branch works, but its history is a mess, and `main` has moved on since you started. Before asking for a review, make `salads`:

1. start from the latest `main`
2. have exactly **two** commits, in this order:
   - `Add a summer salad`, with only `salad.txt` (typo fixed)
   - `Add a lemon dressing`, with only `dressing.txt` (finished)

The files should end up as they are on `salads` now. Leave `main` alone.

+++ setup
repo recipes
printf 'Recipes\n' > README.md
commit "Start the recipes"
git switch -q -c salads
printf 'Summer salad\n\n1 cucmber\n4 tomatoes\n1 block feta\n' > salad.txt; commit "add salad"
printf 'Lemon dressing\n\n3 tbsp olive oil\n' > dressing.txt; commit "dressing WIP"
sed -i 's/cucmber/cucumber/' salad.txt; commit "fix typo"
printf 'Lemon dressing\n\n3 tbsp olive oil\n1 lemon\n1 pinch salt\n' > dressing.txt; commit "finish dressing"
git switch -q main
printf 'Recipes\n\nsalad.txt and dressing.txt coming soon.\n' > README.md; commit "Mention the salad"
git switch -q salads

+++ check
cd recipes 2>/dev/null || { echo "recipes/ is gone"; exit 1; }
[ -d .git/rebase-merge ] && { echo "a rebase is still in progress: git status says what's next"; exit 1; }
fail=0
[ "$(git log -1 --format=%s main)" = "Mention the salad" ] && [ "$(git rev-list --count main)" = 2 ] || { echo "main has changed: only salads should"; fail=1; }
git merge-base --is-ancestor main salads || { echo "salads doesn't start from the latest main yet"; fail=1; }
[ -z "$(git rev-list --merges main..salads)" ] || { echo "there's a merge commit on salads"; fail=1; }
n=$(git rev-list --count main..salads)
if [ "$n" != 2 ]; then
  echo "salads should have two commits of its own; it has $n:"
  git log --reverse --format='  %s' main..salads
  exit 1
fi
first=$(git rev-parse salads~1) second=$(git rev-parse salads)
files() { git diff-tree --no-commit-id --name-only -r "$1" | paste -sd' '; }
[ "$(git log -1 --format=%B "$first" | sed '/^$/d')" = "Add a summer salad" ] || { echo "the first commit's message should be just: Add a summer salad"; fail=1; }
[ "$(git log -1 --format=%B "$second" | sed '/^$/d')" = "Add a lemon dressing" ] || { echo "the second commit's message should be just: Add a lemon dressing"; fail=1; }
[ "$(files "$first")" = salad.txt ] || { echo "the first commit should hold only salad.txt; it has: $(files "$first")"; fail=1; }
[ "$(files "$second")" = dressing.txt ] || { echo "the second commit should hold only dressing.txt; it has: $(files "$second")"; fail=1; }
git show "$first:salad.txt" 2>/dev/null | grep -qx "1 cucumber" || { echo "the salad commit still has the typo"; fail=1; }
git show salads:dressing.txt 2>/dev/null | grep -qx "1 pinch salt" || { echo "the dressing isn't finished"; fail=1; }
git show salads:README.md 2>/dev/null | grep -q "coming soon" || { echo "salads doesn't have main's latest README"; fail=1; }
exit $fail

+++ solution
cd recipes
printf 'pick salads~3\nfixup salads~1\nexec git commit -q --amend -m "Add a summer salad"\npick salads~2\nfixup salads\nexec git commit -q --amend -m "Add a lemon dressing"\n' > /tmp/todo
GIT_SEQUENCE_EDITOR="cp /tmp/todo" git rebase -i main

+++ tools
- `git rebase -i main`: replays `salads` onto the latest `main`, and lets you edit the commits on the way
- In the to-do list: move a line to reorder; `fixup` folds a commit into the one above it; `reword` changes a message (git opens nano for it as it gets there)
- nano: <kbd>Ctrl</kbd>+<kbd>K</kbd> cuts the line you're on, <kbd>Ctrl</kbd>+<kbd>U</kbd> pastes it above the cursor
- `git rebase --abort` gets you back to the start, any time

+++ steps
Start: `cd recipes`, then `git rebase -i main`

Four lines: add salad, dressing WIP, fix typo, finish dressing.

---
Put "fix typo" under "add salad": go to its line, <kbd>Ctrl</kbd>+<kbd>K</kbd>, go to the "dressing WIP" line, <kbd>Ctrl</kbd>+<kbd>U</kbd>.

Order now: add salad, fix typo, dressing WIP, finish dressing.

---
Set the words: `reword` on "add salad", `fixup` on "fix typo", `reword` on "dressing WIP", `fixup` on "finish dressing". Save and close.

---
Git opens nano twice, once per `reword`. Replace the message with `Add a summer salad`, then `Add a lemon dressing`, saving and closing each time.

---
Check the result in the graph, or with `git log --oneline --stat main..`, then press **Check**.

+++ debrief
**That's a review-ready branch**: on top of the latest `main`, one commit per idea, each with a clear message. Reviewers read the history as a story, and `git revert` can take back either commit on its own.

**`--autosquash`** saves the reordering: make fix commits with `git commit --fixup <commit>`, and `git rebase -i --autosquash main` puts each one under its target, already set to `fixup`.

**Only before sharing.** If `salads` had been pushed already, rewriting it means `git push --force-with-lease`, and anyone who'd pulled it has to recover. Tidy first, then push.

**`exec`** lines in the to-do list run a command between commits, `exec npm test` for example, so a broken commit stops the rebase.
