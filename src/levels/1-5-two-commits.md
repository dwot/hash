---
id: two-commits
chapter: 1
order: 5
kind: boss
checks: state
title: Two tidy commits
---
You've done two unrelated things in one sitting:

- fixed the pancake recipe, in `pancakes.txt`
- started a curry: `curry.txt`, and its line in `index.txt`

Save them as **two commits**, one for each, so each commit holds only its own files. You've also been jotting in `todo.txt`; that's not ready, so leave it out of both.

+++ setup
repo recipes
printf 'Recipes\n\npancakes.txt\nsoup.txt\n' > index.txt
printf 'Pancakes\n\n2 eggs\n1 cup flour\n1 cup mlik\n' > pancakes.txt
printf 'Tomato soup\n\n6 tomatoes\n1 onion\n2 cups stock\n' > soup.txt
printf 'To do\n\n- try a curry\n' > todo.txt
commit "Add the first recipes"
printf 'Pancakes\n\n2 eggs\n1 cup flour\n1 cup milk\n' > pancakes.txt
printf 'Chickpea curry\n\n2 tins chickpeas\n1 tin coconut milk\n2 tbsp curry paste\n' > curry.txt
printf 'Recipes\n\ncurry.txt\npancakes.txt\nsoup.txt\n' > index.txt
printf 'To do\n\n- try a curry (started!)\n- ask about the secret ingredient\n' > todo.txt

+++ check
cd recipes 2>/dev/null || { echo "recipes/ is gone"; exit 1; }
n=$(git rev-list --count HEAD 2>/dev/null)
files() { git diff-tree --no-commit-id --name-only -r "$1" | sort | paste -sd' '; }
if [ "$n" -lt 3 ]; then
  echo "there should be two new commits; there's $((n - 1))"
  [ "$n" = 2 ] && echo "the new commit has: $(files HEAD)"
  exit 1
fi
if [ "$n" -gt 3 ]; then
  echo "there are $((n - 1)) new commits; there should be just two"
  for c in $(git rev-list --reverse HEAD | tail -n +2); do echo "  $(git log -1 --format=%s "$c"): $(files "$c")"; done
  exit 1
fi
a=$(files HEAD~1) b=$(files HEAD)
fail=0
case "$a|$b" in
  "pancakes.txt|curry.txt index.txt"|"curry.txt index.txt|pancakes.txt") ;;
  *)
    echo "each commit should hold one change: pancakes.txt in one, curry.txt and index.txt in the other"
    echo "  first: $a"
    echo "  second: $b"
    fail=1 ;;
esac
git cat-file -e HEAD:todo.txt && ! git diff --quiet HEAD~2 HEAD -- todo.txt && { echo "todo.txt went into a commit: it should be left out"; fail=1; }
left=$(git status --porcelain)
[ "$left" = " M todo.txt" ] || { echo "only todo.txt should be left uncommitted, and not added; git status -s says:"; echo "$left"; fail=1; }
exit $fail

+++ solution
cd recipes
git add pancakes.txt
git commit -m "Fix the milk in the pancakes"
git add curry.txt index.txt
git commit -m "Add a curry"

+++ tools
- `git status`, `git diff`: see what's changed, and where
- `git add file1 file2`: add just those files
- `git commit -m "message"`: commits only what's added
- `git diff --staged`: what the next commit will hold

Add one change's files, commit, then add the other's and commit again.

+++ steps
Look first: `cd recipes`, then `git status`

Four files: three changed (`index.txt`, `pancakes.txt`, `todo.txt`) and one new (`curry.txt`).

---
Add just the pancake fix: `git add pancakes.txt`

`git status` now shows it under **Changes to be committed**, and the rest still waiting.

---
Commit it: `git commit -m "Fix the milk in the pancakes"`

---
Now the curry, both files: `git add curry.txt index.txt`

---
Commit it: `git commit -m "Add a curry"`, then press **Check**.

`todo.txt` is still changed and not added, which is what you want.

+++ debrief
**One idea per commit.** It makes the history readable (`git log` tells a story), and it makes undoing easy: chapter 2's `git revert` takes back a whole commit, so it helps if a commit is one thing.

**`git commit -a` adds every changed tracked file** before committing. Handy, but here it would have swept up `todo.txt` and the pancakes with the curry.

**Splitting changes inside one file** works too: `git add -p file` goes through it a piece at a time and asks which pieces to add.

**If you added the wrong thing**, `git restore --staged file` takes it back out before you commit. Chapter 2 is all about undoing.
