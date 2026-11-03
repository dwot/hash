---
id: big-merge
chapter: 4
order: 5
kind: boss
checks: state
title: The big merge
---
The `spring` branch has been going for weeks. Merge it into `main`. Three files conflict, and each needs a different answer:

- `prices.csv`: take the branch's version whole
- `README.md`: keep `main`'s version whole
- `menu.txt`: keep **every** dish from both sides, each once, with no markers

Anything that merges without a conflict is fine as git leaves it. When the merge is done, delete `spring`.

+++ setup
repo cafe
printf 'item,price\ncoffee,3.00\ntea,2.50\ncake,4.00\n' > prices.csv
printf 'Today\n\n- Soup\n- Cake\n' > menu.txt
printf 'The cafe\n\nOpen 8 till 4.\n' > README.md
printf 'Mon-Fri 8-4\n' > hours.txt
commit "Open the cafe"
git switch -q -c spring
printf 'item,price\ncoffee,3.20\ntea,2.60\ncake,4.25\nsalad,6.50\n' > prices.csv; commit "Spring prices"
printf 'Today\n\n- Soup\n- Cake\n- Spring salad\n' > menu.txt; commit "Add a salad"
printf 'The cafe\n\nOpen 8 till 5 in spring.\n' > README.md; commit "Spring hours in the README"
printf 'Mon-Fri 8-4\nSat 9-1\n' > hours.txt; commit "Open on Saturdays"
git switch -q main
printf 'item,price\ncoffee,3.10\ntea,2.50\ncake,4.00\n' > prices.csv; commit "Coffee up 10p"
printf 'Today\n\n- Soup\n- Cake\n- Cheese toastie\n' > menu.txt; commit "Add toasties"
printf 'The cafe\n\nOpen 8 till 4. Cash and card.\n' > README.md; commit "Say we take cards"

+++ check
cd cafe 2>/dev/null || { echo "cafe/ is gone"; exit 1; }
if [ -f .git/MERGE_HEAD ]; then
  u=$(git diff --name-only --diff-filter=U | paste -sd' ')
  if [ -n "$u" ]; then echo "the merge is still waiting: still in conflict: $u"
  else echo "the conflicts are resolved, but the merge isn't finished: git commit"; fi
  exit 1
fi
merge=$(git rev-list --merges -n 1 HEAD)
if [ -z "$merge" ] || [ "$(git log -1 --format=%s "$merge^2")" != "Open on Saturdays" ]; then
  echo "main doesn't have a merge of spring yet"
  exit 1
fi
fail=0
[ "$(git show HEAD:prices.csv)" = "$(git show "$merge^2:prices.csv")" ] || { echo "prices.csv should be exactly spring's version"; fail=1; }
[ "$(git show HEAD:README.md)" = "$(git show "$merge^1:README.md")" ] || { echo "README.md should be exactly main's version"; fail=1; }
menu=$(git show HEAD:menu.txt)
if printf '%s\n' "$menu" | grep -qE '^(<<<<<<<|=======|>>>>>>>)'; then echo "menu.txt still has conflict markers"; fail=1; fi
for dish in Soup Cake "Spring salad" "Cheese toastie"; do
  n=$(printf '%s\n' "$menu" | grep -cxF -- "- $dish")
  [ "$n" = 1 ] || { echo "menu.txt should list \"- $dish\" once; it has it $n times"; fail=1; }
done
git show HEAD:hours.txt | grep -qx "Sat 9-1" || { echo "hours.txt lost the Saturday hours, which merged cleanly"; fail=1; }
git rev-parse -q --verify refs/heads/spring >/dev/null && { echo "spring is still here: delete it once it's merged"; fail=1; }
left=$(git status --porcelain)
[ -z "$left" ] || { echo "there are changes left over that aren't committed:"; echo "$left"; fail=1; }
exit $fail

+++ solution
cd cafe
git merge spring
git restore --theirs prices.csv
git restore --ours README.md
sed -i '/^<<<<<<<\|^=======\|^>>>>>>>/d' menu.txt
git add prices.csv README.md menu.txt
git commit --no-edit
git branch -d spring

+++ tools
- `git status`: lists the files in conflict under **Unmerged paths**
- `git restore --theirs file`, `git restore --ours file`: one side, whole
- `nano file`: edit by hand, deleting the `<<<<<<<`, `=======` and `>>>>>>>` lines
- `git add file...`, `git commit --no-edit`, `git branch -d spring`

+++ steps
Merge: `cd cafe`, then `git merge spring`, then `git status`

Three files conflict. `hours.txt` merged on its own.

---
The prices, from spring: `git restore --theirs prices.csv`

---
The README, from main: `git restore --ours README.md`

---
The menu, both: `nano menu.txt`, delete the three marker lines so all four dishes are left, and save.

---
Finish: `git add prices.csv README.md menu.txt`, then `git commit --no-edit`

---
Tidy up: `git branch -d spring`, then press **Check**.

+++ debrief
**Big merges are many small decisions.** `git status` is the to-do list: work down **Unmerged paths** one file at a time, and `git add` each one as you finish it. Nothing is committed until the end, and `git merge --abort` is there if it goes wrong.

**Merge often, and it stays small.** A branch that lives for weeks gathers conflicts. Merging `main` into it now and then, or keeping branches short, means fewer decisions at once.

**Options worth knowing**

- `git mergetool`: steps through each conflict in a side-by-side tool, if one is set up
- `git diff --name-only --diff-filter=U`: just the names of files still in conflict
- `git rerere`: has git remember how you resolved a conflict, and do it again next time
