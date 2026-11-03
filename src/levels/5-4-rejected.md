---
id: rejected
chapter: 5
order: 4
kind: lesson
checks: state
title: Rejected
---
You've committed a curry, and want to push it. But Alex pushed first, so the server will refuse.

Bring in Alex's work **without a merge commit**, so the history stays one straight line, then push.

+++ setup
server recipes
alex recipes eval '
  printf "Pancakes\n\n2 eggs\n1 cup flour\n1 cup milk\n" > pancakes.txt
  printf "Tomato soup\n\n6 tomatoes\n1 onion\n2 cups stock\n" > soup.txt
  commit "Add the first recipes"
  git push -q origin main'
git clone -q server:recipes.git
cd recipes
printf 'Chickpea curry\n\n2 tins chickpeas\n1 tin coconut milk\n' > curry.txt
commit "Add a curry"
cd ..
alex recipes eval '
  echo "1 handful basil" >> soup.txt
  commit "Basil in the soup"
  git push -q origin main'

+++ check
cd recipes 2>/dev/null || { echo "recipes/ is gone"; exit 1; }
srv="git --git-dir=../server/recipes.git"
fail=0
subjects=$($srv log --format=%s main)
printf '%s\n' "$subjects" | grep -qx "Add a curry" || { echo "the server doesn't have your curry yet"; exit 1; }
printf '%s\n' "$subjects" | grep -qx "Basil in the soup" || { echo "Alex's basil commit has gone from the server! Was that a git push --force?"; fail=1; }
if [ -n "$($srv rev-list --merges main)" ]; then
  echo "there's a merge commit on the server: the history isn't one straight line. Start over and use git pull --rebase"
  fail=1
fi
[ "$(git rev-parse HEAD)" = "$($srv rev-parse main)" ] || { echo "your main and the server's are different"; fail=1; }
exit $fail

+++ solution
cd recipes
git pull --rebase
git push

+++ tools
- `git push`: try it, and read why it's rejected
- `git pull --rebase`: fetch, then replay *your* new commits on top of what's on the server, instead of merging
- `git push` again once you're up to date

Never `git push --force` here: it would throw away Alex's commit.

+++ steps
Try it: `cd recipes`, then `git push`

**! [rejected] main -> main (fetch first)**: the server has a commit you don't.

---
Catch up by replaying your commit on top: `git pull --rebase`

The graph shows your curry commit moved above Alex's basil, with a new hash. One straight line.

---
Push: `git push`, then press **Check**.

+++ debrief
**The server only accepts pushes that add to its history.** Your `main` didn't contain Alex's commit, so pushing it would have dropped Alex's work. Git refuses rather than lose it.

**Merge or rebase?** `git pull` would merge, making a commit that says "these joined here". `git pull --rebase` takes your unpushed commits off, moves to the server's latest, and puts them back on top: a tidier history, and your commits get new hashes (fine, nobody else had them). Many teams set `git config --global pull.rebase true`.

**`--force` overwrites the server's branch** with yours. That's how Alex's work would vanish. If you ever need it, on your own branch, use `--force-with-lease`, which refuses if someone else pushed.

+++ sheet
```bash
git pull --rebase      # catch up, your commits on top
git push               # then push
git push --force-with-lease  # overwrite, only if
                             # nobody else pushed
```

+++ tip
Rejected push? Pull first, then push again.
