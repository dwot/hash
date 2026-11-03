---
id: take-theirs
chapter: 4
order: 4
kind: lesson
checks: state
title: Take theirs
---
Merge `new-prices` into `main`. Two files will conflict, and each should be taken **whole** from one side:

- `prices.csv`: the branch's version is right. It came from the shop's system.
- `menu.txt`: your version on `main` is right.

+++ setup
repo cafe
printf 'item,price\ncoffee,3.00\ntea,2.50\ncake,4.00\nsoup,5.50\n' > prices.csv
printf 'Today\n\n- Soup of the day\n- Lemon cake\n' > menu.txt
commit "Open the cafe"
git switch -q -c new-prices
printf 'item,price\ncoffee,3.20\ntea,2.60\ncake,4.25\nsoup,5.90\nscone,2.80\n' > prices.csv
printf 'Today\n\n- Soup\n- Cake\n- Scones\n' > menu.txt
commit "Prices from the till, November"
git switch -q main
printf 'item,price\ncoffee,3.10\ntea,2.50\ncake,4.00\nsoup,5.50\n' > prices.csv
printf 'Today\n\n- Roast tomato soup\n- Lemon drizzle cake\n- Fruit scones\n' > menu.txt
commit "Nicer menu, and a guess at the coffee price"

+++ check
cd cafe 2>/dev/null || { echo "cafe/ is gone"; exit 1; }
if [ -f .git/MERGE_HEAD ]; then
  u=$(git diff --name-only --diff-filter=U | paste -sd' ')
  if [ -n "$u" ]; then echo "the merge is still waiting: still in conflict: $u"
  else echo "the conflicts are resolved, but the merge isn't finished: git commit"; fi
  exit 1
fi
git rev-parse -q --verify HEAD^2 >/dev/null && [ "$(git rev-parse HEAD^2)" = "$(git rev-parse new-prices)" ] || { echo "main doesn't have a merge of new-prices yet"; exit 1; }
fail=0
[ "$(git show HEAD:prices.csv)" = "$(git show new-prices:prices.csv)" ] || { echo "prices.csv should be exactly new-prices' version"; fail=1; }
[ "$(git show HEAD:menu.txt)" = "$(git show HEAD^1:menu.txt)" ] || { echo "menu.txt should be exactly main's version, from before the merge"; fail=1; }
left=$(git status --porcelain)
[ -z "$left" ] || { echo "there are changes left over that aren't committed:"; echo "$left"; fail=1; }
exit $fail

+++ solution
cd cafe
git merge new-prices
git restore --theirs prices.csv
git restore --ours menu.txt
git add prices.csv menu.txt
git commit --no-edit

+++ tools
- `git restore --theirs file`: during a merge, the file as it is on the branch you're merging in
- `git restore --ours file`: the file as it is on your branch (where HEAD is)
- `git add`, then `git commit --no-edit`, as before

You'll see `git checkout --theirs file` in many guides: the same thing.

+++ steps
Merge: `cd cafe`, then `git merge new-prices`

Both files conflict.

---
Take the branch's prices: `git restore --theirs prices.csv`

`cat prices.csv`: no markers, just the November prices.

---
Keep your menu: `git restore --ours menu.txt`

---
Finish: `git add prices.csv menu.txt`, then `git commit --no-edit`, then press **Check**.

+++ debrief
**Ours is where you are; theirs is what you're merging in.** In a merge, *ours* is your branch and *theirs* is the other one. (In a rebase they swap round, which catches everyone out once: chapter 6.)

**Whole-file choices suit files nobody edits by hand**: exports, generated files, lock files like `package-lock.json`. Merging those line by line usually makes something neither side would recognise.

**Options worth knowing**

- `git merge -X theirs new-prices`: resolve *every* conflict in the branch's favour, automatically. Use with care
- `git diff --ours prices.csv`, `--theirs`: compare the file in progress with one side

+++ sheet
```bash
git restore --theirs file   # take the incoming version
git restore --ours file     # keep your version
git merge -X theirs name    # every conflict their way
```

+++ tip
Merging: ours is your branch, theirs is the one coming in.
