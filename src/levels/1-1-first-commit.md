---
id: first-commit
chapter: 1
order: 1
kind: lesson
checks: state
title: First commit
---
`recipes/` is a folder of recipes that nobody has saved a history for. Make it a git repository and commit everything in it.

+++ setup
mkdir recipes
printf '# Recipes\n\nThings worth cooking twice.\n' > recipes/README.md
printf 'Pancakes\n\n2 eggs\n1 cup flour\n1 cup milk\n' > recipes/pancakes.txt
printf 'Tomato soup\n\n6 tomatoes\n1 onion\n2 cups stock\n' > recipes/soup.txt

+++ check
cd recipes 2>/dev/null || { echo "recipes/ is gone"; exit 1; }
[ -d .git ] || { echo "recipes/ isn't a repository yet: there's no recipes/.git"; exit 1; }
git rev-parse -q --verify HEAD >/dev/null || { echo "the repository has no commits yet"; exit 1; }
fail=0
for f in README.md pancakes.txt soup.txt; do
  git cat-file -e "HEAD:$f" 2>/dev/null || { echo "$f isn't in the commit"; fail=1; }
done
left=$(git status --porcelain)
[ -z "$left" ] || { echo "there are changes left over that aren't committed:"; echo "$left"; fail=1; }
exit $fail

+++ solution
cd recipes
git init
git add .
git commit -m "Add the first recipes"

+++ tools
- `git init`: makes the folder you're in a repository
- `git add`: chooses what goes into the next commit. `git add .` adds everything here
- `git commit -m "message"`: saves what you've added as a commit
- `git status`: what's changed, and what's added, at any point

`cd recipes` first: git works on the repository you're in.

+++ steps
Go into the folder: `cd recipes`

---
Make it a repository: `git init`

The prompt now shows `(main)`, the branch you're on. Git has made a hidden `.git` folder, where the history will live.

---
Add everything: `git add .`

Then `git status` lists the three files under **Changes to be committed**.

---
Commit them: `git commit -m "Add the first recipes"`, then press **Check**.

+++ debrief
**A commit is a snapshot.** It saves every added file as it is right now, with your name, the time and a message. `git log` lists the commits so far.

**Adding is a separate step** on purpose. You choose what goes in each commit, so one commit can be one idea. Level 3 makes use of that.

**Who are you?** Git puts a name and email on every commit. Here they're set for you; on a new computer, git asks for them:

```bash
git config --global user.name "Your Name"
git config --global user.email "you@example.com"
```

**Options worth knowing**

- `git commit` without `-m` opens an editor for the message (here, nano)
- `git add pancakes.txt soup.txt`: add just those files
- `git init new-project`: make a new folder and a repository in it

+++ sheet
```bash
git init                  # make this folder a repository
git add .                 # add everything here to the next commit
git commit -m "message"   # save what's added as a commit
git status                # what's changed, and what's added
```

+++ tip
Nothing is in the history until you commit it.
