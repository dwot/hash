---
id: detached
chapter: 7
order: 4
kind: lesson
checks: state
title: Detached
---
You checked out an old commit to look around, liked what you saw, and made two commits there: a bread pudding. The prompt shows a hash instead of a branch name, because HEAD is **detached**: those commits aren't on any branch, and switching away would leave them behind.

Keep them: put them on a new branch called `pudding`. Leave `main` as it is.

+++ setup
repo recipes
printf 'Pancakes\n\n2 eggs\n1 cup flour\n1 cup milk\n' > pancakes.txt
commit "Add pancakes"
printf 'Tomato soup\n\n6 tomatoes\n1 onion\n2 cups stock\n' > soup.txt
commit "Add soup"
printf 'Chickpea curry\n\n2 tins chickpeas\n' > curry.txt
commit "Add a curry"
git switch -q --detach HEAD~2
printf 'Bread pudding\n\n6 slices bread\n2 eggs\n' > pudding.txt
commit "Start a bread pudding"
echo "1 cup raisins" >> pudding.txt
commit "Raisins in the pudding"

+++ check
cd recipes 2>/dev/null || { echo "recipes/ is gone"; exit 1; }
fail=0
[ "$(git log -1 --format=%s main)" = "Add a curry" ] || { echo "main has changed: the pudding belongs on its own branch"; fail=1; }
if ! git rev-parse -q --verify refs/heads/pudding >/dev/null; then
  echo "there's no branch called pudding yet"
  exit 1
fi
[ "$(git log -1 --format=%s pudding)" = "Raisins in the pudding" ] || { echo "pudding should end at \"Raisins in the pudding\"; it ends at \"$(git log -1 --format=%s pudding)\""; fail=1; }
git log --format=%s pudding | grep -qx "Start a bread pudding" || { echo "pudding doesn't have \"Start a bread pudding\""; fail=1; }
exit $fail

+++ solution
cd recipes
git switch -c pudding

+++ tools
- `git status`: says **HEAD detached at ...**
- `git switch -c name`: makes a branch where you are, and switches to it, so HEAD is on a branch again
- `git branch name`: makes the branch but stays detached

+++ steps
See the state: `cd recipes`, then `git status`

In the graph, the pudding commits branch off below `main`, labelled only `HEAD`.

---
Give them a branch: `git switch -c pudding`, then press **Check**.

The prompt says `(pudding)` again, and the graph labels the branch.

+++ debrief
**Detached HEAD means HEAD points at a commit, not a branch.** It happens when you switch to a hash, a tag, or `origin/main`. Looking around is perfectly safe. Commits made there have no branch to move, so once you switch away, nothing points to them except the reflog.

**Git warns you** when you leave: "Warning: you are leaving 2 commits behind", with the command to save them. If you've already left, `git reflog` finds them (last level), and `git branch pudding <hash>` saves them.

**Options worth knowing**

- `git switch --detach v1.0`: look at an old version on purpose
- `git switch -`: back to the branch you came from

+++ sheet
```bash
git switch --detach abc123  # look at an old commit
git switch -c name          # keep commits made there
git branch name abc123      # save a commit you left
```

+++ tip
Detached HEAD is fine for looking; make a branch before committing.
