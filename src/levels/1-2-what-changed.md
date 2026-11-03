---
id: what-changed
chapter: 1
order: 2
kind: lesson
checks: output
title: What changed?
---
Someone has been at the recipes since the last commit. Find out which file they changed, then show exactly what they changed in it: the lines taken out and the lines put in.

+++ setup
repo recipes
printf '# Recipes\n\nThings worth cooking twice.\n' > README.md
printf 'Pancakes\n\n2 eggs\n1 cup flour\n1 cup milk\n' > pancakes.txt
printf 'Tomato soup\n\n6 tomatoes\n1 onion\n2 cups stock\n' > soup.txt
commit "Add the first recipes"
printf 'Pancakes\n\n2 eggs\n1 cup flour\n1 cup milk\n1 pinch salt\n' > pancakes.txt
commit "Salt the pancakes"
if [ "$VARIANT" = 0 ]; then
  printf 'Tomato soup\n\n8 tomatoes\n1 onion\n2 cups stock\n1 handful basil\n' > soup.txt
else
  printf 'Tomato soup\n\n6 tomatoes\n1 red onion\n3 cups stock\n' > soup.txt
fi

+++ solution
cd recipes
git diff

+++ tools
- `git status`: which files have changed since the last commit
- `git diff`: the changes themselves, line by line. `-` lines were taken out, `+` lines put in

`cd recipes` first. Long output pages through `less`: <kbd>Space</kbd> for more, <kbd>q</kbd> to get back to the prompt.

+++ steps
Go into the repository: `cd recipes`

---
See what's changed: `git status`

One file is listed under **Changes not staged for commit**: changed, but not added yet.

---
See the changes: `git diff`, then press **Check**.

Each changed line comes out twice: once with `-`, as it was, and once with `+`, as it is now.

+++ debrief
**`git status` is the question you ask most.** It says which branch you're on, what's changed and what's added, and often what to do next.

**`git diff` compares your files with what's added.** With nothing added yet, that's the same as comparing with the last commit. Lines around each change show where it is; the `@@ -3,4 +3,5 @@` line says which lines of the old and new file you're looking at.

**Options worth knowing**

- `git diff soup.txt`: just one file
- `git diff --staged`: what you've added, which `git diff` doesn't show
- `git diff --stat`: just the file names and how many lines changed
- `git status -s`: the short form, one line per file

+++ sheet
```bash
git status            # what's changed, and what's added
git status -s         # the same, one line per file
git diff              # changes not added yet, line by line
git diff --staged     # changes added, ready to commit
```

+++ tip
In `less`, press q to get back to the prompt.
