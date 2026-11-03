---
id: reflog
chapter: 7
order: 3
kind: lesson
checks: state
title: Lost and found
---
A moment ago you meant to type `git reset --hard HEAD~1`, and typed `HEAD~3`. Three commits have vanished from `main`, and the graph.

Get `main` back to exactly where it was before that reset.

+++ setup
repo recipes
printf 'Pancakes\n\n2 eggs\n1 cup flour\n1 cup milk\n' > pancakes.txt
commit "Add pancakes"
printf 'Tomato soup\n\n6 tomatoes\n1 onion\n2 cups stock\n' > soup.txt
commit "Add soup"
printf 'Chickpea curry\n\n2 tins chickpeas\n1 tin coconut milk\n' > curry.txt
commit "Add a curry"
printf 'Lemon cake\n\n3 eggs\n1 cup sugar\n2 lemons\n' > cake.txt
commit "Add a lemon cake"
printf 'Porridge\n\n1 cup oats\n2 cups milk\n' > porridge.txt
commit "Add porridge"
git reset -q --hard HEAD~3

+++ check
cd recipes 2>/dev/null || { echo "recipes/ is gone"; exit 1; }
fail=0
top=$(git log -1 --format=%s main)
n=$(git rev-list --count main)
if [ "$top" != "Add porridge" ] || [ "$n" != 5 ]; then
  echo "main is on \"$top\", with $n commits; before the reset it was on \"Add porridge\", with 5"
  fail=1
fi
[ "$(git symbolic-ref -q --short HEAD)" = main ] || { echo "you're not on main"; fail=1; }
left=$(git status --porcelain)
[ -z "$left" ] || { echo "there are changes left over:"; echo "$left"; fail=1; }
exit $fail

+++ solution
cd recipes
git reset --hard HEAD@{1}

+++ tools
- `git reflog`: every place HEAD has been, newest first, even commits nothing points to any more
- `HEAD@{1}`: where HEAD was one move ago
- `git reset --hard <commit>`: put `main` (and your files) there

+++ steps
See where you've been: `cd recipes`, then `git reflog`

The top line is the reset. The line below it, `HEAD@{1}`, is "Add porridge": where you were just before.

---
Go back there: `git reset --hard HEAD@{1}`, then press **Check**.

The three commits are back in the graph.

+++ debrief
**Commits are hard to lose.** A reset, a bad rebase, a deleted branch: the commits are still there, just with nothing pointing to them. The reflog is git's diary of where HEAD and each branch have been, kept for about 90 days, so you can point at them again.

**What the reflog can't save**: changes you never committed. `git reset --hard` and `git restore` throw those away for good. Commit often, even as "wip": chapter 6 shows how to tidy afterwards.

**Options worth knowing**

- `git reflog main`: just one branch's moves
- `git branch rescue HEAD@{3}`: keep an old state as a branch, without moving anything
- `HEAD@{2.hours.ago}`: by time instead of by count
- `git fsck --lost-found`: commits nothing points to, even outside the reflog

+++ sheet
```bash
git reflog               # everywhere HEAD has been
git reset --hard HEAD@{1}   # back one move
git branch rescue abc123    # keep a lost commit
```

+++ tip
If it was committed, git reflog can find it.
