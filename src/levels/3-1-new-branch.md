---
id: new-branch
chapter: 3
order: 1
kind: lesson
checks: state
title: A place to try things
---
You want to try a spicier soup without touching the recipe everyone uses. Make a branch called `spicy`, and on it, commit a new line in `soup.txt`: `1 red chili`.

`main` should stay exactly as it is.

+++ setup
repo recipes
printf 'Pancakes\n\n2 eggs\n1 cup flour\n1 cup milk\n' > pancakes.txt
printf 'Tomato soup\n\n6 tomatoes\n1 onion\n2 cups stock\n' > soup.txt
commit "Add the first recipes"
echo "1 pinch salt" >> pancakes.txt
commit "Salt the pancakes"

+++ check
cd recipes 2>/dev/null || { echo "recipes/ is gone"; exit 1; }
fail=0
[ "$(git log -1 --format=%s main)" = "Salt the pancakes" ] && [ "$(git rev-list --count main)" = 2 ] || { echo "main has changed: it should still end at \"Salt the pancakes\". The new commit belongs on spicy"; fail=1; }
if ! git rev-parse -q --verify refs/heads/spicy >/dev/null; then
  echo "there's no branch called spicy yet"
  exit 1
fi
git merge-base --is-ancestor main spicy || { echo "spicy should start from main"; fail=1; }
[ "$(git rev-list --count main..spicy)" -ge 1 ] || { echo "spicy has no commits of its own yet"; fail=1; }
git show spicy:soup.txt 2>/dev/null | grep -qx "1 red chili" || { echo "soup.txt on spicy doesn't have the line 1 red chili"; fail=1; }
exit $fail

+++ solution
cd recipes
git switch -c spicy
echo "1 red chili" >> soup.txt
git commit -am "Add a chili to the soup"

+++ tools
- `git switch -c name`: makes a branch here and switches to it
- `git branch`: lists branches; `*` marks the one you're on (the prompt shows it too)
- `echo "line" >> file` adds a line to the end of a file
- `git commit -am "message"`: adds changes to files git already tracks, and commits

+++ steps
Make the branch and switch to it: `cd recipes`, then `git switch -c spicy`

The prompt now says `(spicy)`, and in the graph `spicy` and `main` point at the same commit.

---
Change the soup: `echo "1 red chili" >> soup.txt`

---
Commit: `git commit -am "Add a chili to the soup"`, then press **Check**.

In the graph, `spicy` has moved on and `main` has stayed put.

+++ debrief
**A branch is just a name for a commit.** Making one costs nothing: git writes the commit's hash in a tiny file. Committing moves the branch you're on to the new commit, and only that one.

**HEAD is where you are**: usually a branch name, which says which branch the next commit moves.

**Options worth knowing**

- `git branch name`: make a branch without switching to it
- `git switch -c name abc1234`: start the branch from another commit
- `git branch -v`: each branch with its latest commit
- `git checkout -b name`: the older way to write `git switch -c name`

+++ sheet
```bash
git switch -c name    # new branch here, and switch to it
git branch            # list branches (* = current)
git branch -v         # ...with their latest commits
git commit -am "msg"  # add tracked changes, and commit
```

+++ tip
A branch is a name for a commit, and it moves when you commit.
