---
id: back-to-good
chapter: 2
order: 5
kind: boss
checks: state
title: Back to good
---
You spent the afternoon trying to halve every recipe, in three commits nobody else has seen. It didn't work. Put `main` back on the last good commit, "Every recipe tested", as if the three never happened.

One thing from the afternoon is worth keeping: `notes.txt`. Leave it in the folder, **uncommitted**, so you can come back to it.

+++ setup
repo recipes
printf 'Pancakes\n\n2 eggs\n1 cup flour\n1 cup milk\n' > pancakes.txt
printf 'Tomato soup\n\n6 tomatoes\n1 onion\n2 cups stock\n' > soup.txt
commit "Add the first recipes"
printf 'Chickpea curry\n\n2 tins chickpeas\n1 tin coconut milk\n' > curry.txt
commit "Add a curry"
printf 'Recipes\n\nAll cooked and checked on Sunday.\n' > README.md
commit "Every recipe tested"
printf 'Pancakes\n\n1 egg\n0.5 cup flour\n0.5 cup milk\n' > pancakes.txt
commit "Halve the pancakes"
printf 'Tomato soup\n\n3 tomatoes\n0.5 onion\n1 cup stock\n' > soup.txt
commit "Halve the soup"
printf 'Halving notes\n\n- eggs do not halve: use 1 egg and a splash more milk\n- half an onion is fine, freeze the rest\n- soup needs the full stock or it burns\n' > notes.txt
commit "Notes on halving"

+++ check
cd recipes 2>/dev/null || { echo "recipes/ is gone"; exit 1; }
fail=0
top=$(git log -1 --format=%s)
n=$(git rev-list --count HEAD)
if [ "$top" != "Every recipe tested" ] || [ "$n" != 3 ]; then
  echo "main should be on \"Every recipe tested\", with nothing after it; the latest commit is \"$top\""
  [ "$n" -gt 6 ] && echo "new commits only add to the history: these three should go, which is git reset's job"
  fail=1
fi
if [ ! -f notes.txt ]; then
  echo "notes.txt is gone. git reset --hard throws away files as well as commits; Start over and keep the notes this time"
  fail=1
elif ! grep -q "eggs do not halve" notes.txt; then
  echo "notes.txt isn't the notes from the afternoon any more"
  fail=1
elif git ls-files --error-unmatch notes.txt >/dev/null 2>&1; then
  echo "notes.txt is committed or added: leave it uncommitted"
  fail=1
fi
for f in pancakes.txt soup.txt; do
  git diff --quiet HEAD -- "$f" || { echo "$f still has the halved changes: it should match \"Every recipe tested\""; fail=1; }
done
exit $fail

+++ solution
cd recipes
git reset HEAD~3
git restore pancakes.txt soup.txt

+++ tools
- `git log --oneline`: find the good commit; `HEAD~3` is three before the latest
- `git reset <commit>`: moves `main` back to that commit. The later commits' changes stay in your files, uncommitted
- `git reset --hard <commit>`: the same, but throws the changes away too, and that includes `notes.txt`
- `git restore file`: throws away one file's changes

+++ steps
Find the good commit: `cd recipes`, then `git log --oneline`

"Every recipe tested" is three below the latest, so it's `HEAD~3`.

---
Move `main` back, keeping the changes in your files: `git reset HEAD~3`

The graph shows the three commits gone. `git status` lists the halved recipes as changed and `notes.txt` as untracked: the afternoon's work, now uncommitted.

---
Throw away the halved recipes: `git restore pancakes.txt soup.txt`, then press **Check**.

`notes.txt` stays, untracked.

+++ debrief
**`git reset` moves the branch.** The three commits aren't destroyed straight away: nothing points to them any more, and `git reflog` can still find them for a while (chapter 7).

**Three kinds of reset**

- `--soft`: move the branch; the changes stay added, ready to commit again
- (default, `--mixed`): move the branch; the changes stay in your files, not added
- `--hard`: move the branch and make your files match. Uncommitted changes are gone for good

**Another way:** copy `notes.txt` somewhere safe, `git reset --hard HEAD~3`, and copy it back.

**Only reset what's yours.** If the three commits had been shared, reverting them (last level) would be the way.
