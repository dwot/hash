---
id: keep-both
chapter: 4
order: 2
kind: lesson
checks: state
title: Keep both
---
You added basil to the end of the soup on `main`. Meanwhile someone added garlic to the end of it on the `garlic` branch. Merge `garlic` into `main` and keep **both** new lines.

+++ setup
repo recipes
printf 'Tomato soup\n\n6 tomatoes\n1 onion\n2 cups stock\n' > soup.txt
commit "Add soup"
git switch -q -c garlic
echo "3 cloves garlic" >> soup.txt; commit "Garlic in the soup"
git switch -q main
echo "1 handful basil" >> soup.txt; commit "Basil in the soup"

+++ check
cd recipes 2>/dev/null || { echo "recipes/ is gone"; exit 1; }
if [ -f .git/MERGE_HEAD ]; then
  if git diff --name-only --diff-filter=U | grep -q .; then echo "the merge is still waiting: soup.txt is in conflict"
  else echo "the conflict is resolved, but the merge isn't finished: git commit"; fi
  exit 1
fi
git rev-parse -q --verify HEAD^2 >/dev/null && [ "$(git rev-parse HEAD^2)" = "$(git rev-parse garlic)" ] || { echo "main doesn't have a merge of garlic yet"; exit 1; }
fail=0
have=$(git show HEAD:soup.txt)
if printf '%s\n' "$have" | grep -qE '^(<<<<<<<|=======|>>>>>>>)'; then echo "conflict markers went into the commit"; fail=1; fi
for line in "Tomato soup" "6 tomatoes" "1 onion" "2 cups stock" "3 cloves garlic" "1 handful basil"; do
  n=$(printf '%s\n' "$have" | grep -cxF "$line")
  [ "$n" = 1 ] || { echo "soup.txt should have the line \"$line\" once; it has it $n times"; fail=1; }
done
[ "$(printf '%s\n' "$have" | grep -c .)" = 6 ] || [ $fail = 1 ] || { echo "soup.txt has extra lines:"; echo "$have"; fail=1; }
left=$(git status --porcelain)
[ -z "$left" ] || { echo "there are changes left over that aren't committed:"; echo "$left"; fail=1; }
exit $fail

+++ solution
cd recipes
git merge garlic
sed -i '/^<<<<<<<\|^=======\|^>>>>>>>/d' soup.txt
git add soup.txt
git commit --no-edit

+++ tools
- `git merge garlic`, then `cat soup.txt` to see the conflict
- `nano soup.txt`: delete the three marker lines, keep both ingredients
- `git add soup.txt`, then `git commit --no-edit`

When the answer is "both", only the markers need to go.

+++ steps
Merge and look: `cd recipes`, `git merge garlic`, then `cat soup.txt`

Both sides added a line in the same place, after the stock. Git can't know which goes first, so it asks.

---
Take out the markers: `nano soup.txt`, delete the `<<<<<<<`, `=======` and `>>>>>>>` lines, and save.

Or, in one go: `sed -i '/^<<<<<<<\|^=======\|^>>>>>>>/d' soup.txt`

---
Finish: `git add soup.txt`, then `git commit --no-edit`, then press **Check**.

+++ debrief
**Adding next to each other is a conflict too.** Git conflicts when changes touch the same place, even if neither removed anything. Here the order didn't matter, but it might have (steps in a method), so git doesn't guess.

**Taking out the markers** leaves both sides, yours first. That's often the answer for lists, imports and changelogs.

**Never resolve blind.** Deleting markers is only right when both sides belong. In code, two people adding the same function twice "resolves" cleanly and then breaks.

**Options worth knowing**

- `git diff` during a merge: shows only the conflicted parts
- `git log --merge`: the commits on each side that touched the conflicted files
