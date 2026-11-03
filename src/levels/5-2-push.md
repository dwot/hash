---
id: push
chapter: 5
order: 2
kind: lesson
checks: state
title: Share it
---
You've written `stew.txt` in your copy of the team's recipes. Commit it, and send it to the server so the others can have it.

+++ setup
server recipes
alex recipes eval '
  printf "Pancakes\n\n2 eggs\n1 cup flour\n1 cup milk\n" > pancakes.txt
  printf "Tomato soup\n\n6 tomatoes\n1 onion\n2 cups stock\n" > soup.txt
  commit "Add the first recipes"
  git push -q origin main'
git clone -q server:recipes.git
printf 'Beef stew\n\n500 g beef\n2 potatoes\n2 carrots\n' > recipes/stew.txt

+++ check
cd recipes 2>/dev/null || { echo "recipes/ is gone"; exit 1; }
srv="git --git-dir=../server/recipes.git"
fail=0
git cat-file -e HEAD:stew.txt 2>/dev/null || { echo "stew.txt isn't committed yet"; exit 1; }
$srv cat-file -e main:stew.txt 2>/dev/null || { echo "stew.txt is committed, but the server doesn't have it: push"; exit 1; }
[ "$(git rev-parse HEAD)" = "$($srv rev-parse main)" ] || { echo "your main and the server's are different"; fail=1; }
left=$(git status --porcelain)
[ -z "$left" ] || { echo "there are changes left over that aren't committed:"; echo "$left"; fail=1; }
exit $fail

+++ solution
cd recipes
git add stew.txt
git commit -m "Add a stew"
git push

+++ tools
- `git add`, `git commit -m "message"`: commit it in your copy first
- `git push`: sends your branch's new commits to the server
- `git status`: says how far ahead of `origin/main` you are

+++ steps
Commit: `cd recipes`, `git add stew.txt`, then `git commit -m "Add a stew"`

`git status` now says **Your branch is ahead of 'origin/main' by 1 commit**. The graph shows `main` one above `origin/main`.

---
Send it: `git push`, then press **Check**.

`origin/main` catches up with `main`.

+++ debrief
**Committing and sharing are separate steps.** Commits stay in your copy until you push, so you can commit as often as you like, tidy up (chapter 6), and share when it's ready.

**`git push` sends the branch you're on** to the branch it came from. That link was set up by the clone: `main` *tracks* `origin/main`. `git status` and `git branch -vv` show it.

**Options worth knowing**

- `git push origin main`: say exactly where and what
- `git push -u origin new-branch`: push a new branch and link it (the boss)
- `git log origin/main..main`: what you'd be pushing

+++ sheet
```bash
git push                 # send this branch's commits
git push origin main     # ...naming remote and branch
git log origin/main..    # commits not pushed yet
git branch -vv           # what each branch tracks
```

+++ tip
"Ahead by 1" means 1 commit to push.
