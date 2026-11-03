---
id: history
chapter: 1
order: 4
kind: lesson
checks: output
title: Read the history
---
The soup recipe has been changed a few times, among lots of other commits. List just the commits that changed `soup.txt`, one line each.

+++ setup
repo recipes
printf '# Recipes\n' > README.md
printf 'Pancakes\n\n2 eggs\n1 cup flour\n1 cup milk\n' > pancakes.txt
printf 'Tomato soup\n\n6 tomatoes\n1 onion\n2 cups stock\n' > soup.txt
commit "Add the first recipes"
echo "1 pinch salt" >> pancakes.txt; commit "Salt the pancakes"
if [ "$VARIANT" = 0 ]; then
  sed -i 's/6 tomatoes/8 tomatoes/' soup.txt; commit "More tomatoes in the soup"
  printf '\nThings worth cooking twice.\n' >> README.md; commit "Say what the recipes are for"
  echo "1 handful basil" >> soup.txt; commit "Basil in the soup"
  printf 'Chickpea curry\n\n2 tins chickpeas\n' > curry.txt; commit "Start a curry"
  echo "1 tin coconut milk" >> curry.txt; commit "Coconut milk in the curry"
  sed -i 's/1 onion/2 onions/' soup.txt; commit "Two onions, not one"
  echo "Serve with maple syrup." >> pancakes.txt; commit "Serving note for pancakes"
else
  printf '\nThings worth cooking twice.\n' >> README.md; commit "Say what the recipes are for"
  sed -i 's/2 cups stock/3 cups stock/' soup.txt; commit "Thinner soup"
  printf 'Chickpea curry\n\n2 tins chickpeas\n' > curry.txt; commit "Start a curry"
  echo "1 tin coconut milk" >> curry.txt; commit "Coconut milk in the curry"
  echo "Serve with maple syrup." >> pancakes.txt; commit "Serving note for pancakes"
  echo "Serve with crusty bread." >> soup.txt; commit "Serving note for soup"
fi

+++ solution
cd recipes
git log --oneline soup.txt

+++ tools
- `git log`: every commit, newest first. `git log file` only the commits that changed that file
- `--oneline`: one line per commit: a short hash and the message

`git log --help` lists many more options. Press <kbd>q</kbd> to get out of a long log.

+++ steps
Go in, and look at the whole history: `cd recipes`, then `git log`

Each commit has a long hash (its ID), an author, a date and a message. Press <kbd>q</kbd> to get back.

---
Make it shorter: `git log --oneline`

---
Only the soup: `git log --oneline soup.txt`, then press **Check**.

+++ debrief
**Every commit has a hash**, the long hex ID at the top. The first few characters are enough to name it: `git show 3f2a1bc` shows that commit and its changes.

**A file name narrows the log.** `git log soup.txt` only lists commits that changed it. Put `--` before the name if it might be mistaken for a branch: `git log -- soup.txt`.

**Options worth knowing**

- `git log -p soup.txt`: each commit's changes, too
- `git log -3`: just the last three
- `git log --stat`: which files each commit changed
- `git log --author=Sam`, `git log --since="2 weeks ago"`
- `git show HEAD`: the latest commit; `git show HEAD~1` the one before

+++ sheet
```bash
git log                  # every commit, newest first
git log --oneline        # one line each
git log --oneline file   # only commits that changed file
git log -p file          # ...with their changes
git show abc1234         # one commit and its changes
```

+++ tip
HEAD is the commit you're on; HEAD~1 is the one before it.
