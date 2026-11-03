---
id: pickaxe
chapter: 7
order: 2
kind: lesson
checks: output
title: When did it vanish?
---
The soup used to have garlic in it, and now it doesn't. Somewhere in a long history, someone took it out (and maybe put it back and took it out again). List every commit that **added or removed** the word `garlic`, one line each.

+++ setup
repo recipes
printf 'Tomato soup\n\n6 tomatoes\n1 onion\n2 cups stock\n' > soup.txt
printf 'Pancakes\n\n2 eggs\n1 cup flour\n1 cup milk\n' > pancakes.txt
commit "Add soup and pancakes"
step() { sed -i "$1" "$2"; commit "$3"; }
add() { echo "$1" >> "$2"; commit "$3"; }
add "1 pinch salt" pancakes.txt "Salt the pancakes"
if [ "$VARIANT" = 0 ]; then
  add "3 cloves garlic" soup.txt "Garlic in the soup"
  step 's/6 tomatoes/8 tomatoes/' soup.txt "More tomatoes"
  add "Serve with maple syrup." pancakes.txt "Serving note"
  step 's/3 cloves garlic/4 cloves garlic/' soup.txt "Even more garlic"
  step '/garlic/d' soup.txt "Simplify the soup"
  add "1 handful basil" soup.txt "Basil instead"
  step 's/1 cup milk/1 cup oat milk/' pancakes.txt "Oat milk"
  add "2 cups stock (or water)" soup.txt "Stock note"
  step 's/2 eggs/3 eggs/' pancakes.txt "Fluffier pancakes"
else
  step 's/6 tomatoes/8 tomatoes/' soup.txt "More tomatoes"
  add "2 cloves garlic" soup.txt "Garlic in the soup"
  add "Serve with maple syrup." pancakes.txt "Serving note"
  step '/garlic/d' soup.txt "No garlic, by request"
  add "1 handful basil" soup.txt "Basil"
  add "1 clove garlic" soup.txt "Just a little garlic"
  step 's/2 eggs/3 eggs/' pancakes.txt "Fluffier pancakes"
  step '/garlic/d' soup.txt "Garlic out again"
fi

+++ solution
cd recipes
git log -S garlic --oneline

+++ tools
- `git log -S word`: only commits where the number of times `word` appears changed: where it was added or removed
- `--oneline`: one line each

Try `git log -p -S garlic` to see the changes themselves.

+++ steps
Go in: `cd recipes`. `git log --oneline` shows there are too many commits to read one by one.

---
Search the changes: `git log -S garlic --oneline`, then press **Check**.

+++ debrief
**`-S` is called the pickaxe.** It searches what commits *changed*, not their messages, so it finds code that's gone and code that moved in. It only lists commits where the count went up or down, so "3 cloves" becoming "4 cloves" isn't listed.

**`-G` is the looser cousin**: any commit with an added or removed line matching a regular expression (Caret's territory), "Even more garlic" included.

**Options worth knowing**

- `git log --grep=garlic`: search commit *messages* instead
- `git log -S garlic -p`: with the changes
- `git log -S garlic --all`: on every branch
- `git grep garlic $(git rev-list --all)`: every version of every file that mentions it

+++ sheet
```bash
git log -S word --oneline   # commits that added/removed word
git log -G 'regex'          # commits touching matching lines
git log --grep=word         # search commit messages
```

+++ tip
-S searches what changed; --grep searches what was said.
