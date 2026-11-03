---
id: stash
chapter: 6
order: 1
kind: lesson
checks: state
title: Hold that thought
---
You're halfway through improving the soup and the curry. Then someone points out that `soup.txt` says "tomatos", and it needs fixing **now**.

Commit just the spelling fix, without your half-done work in it. Then carry on: your half-done changes should be back in your files, uncommitted, and nothing left stashed.

+++ setup
repo recipes
printf 'Tomato soup\n\n6 tomatos\n1 onion\n2 cups stock\n' > soup.txt
printf 'Chickpea curry\n\n2 tins chickpeas\n' > curry.txt
commit "Add soup and curry"
echo "1 handful basil" >> soup.txt
echo "1 tin coconut milk" >> curry.txt

+++ check
cd recipes 2>/dev/null || { echo "recipes/ is gone"; exit 1; }
fail=0
n=$(git rev-list --count HEAD)
[ "$n" = 2 ] || { [ "$n" -lt 2 ] && echo "the spelling fix isn't committed yet" || echo "there should be one new commit, with the spelling fix; there are $((n - 1))"; exit 1; }
committed=$(git show HEAD:soup.txt)
printf '%s\n' "$committed" | grep -qx "6 tomatoes" || { echo "the commit doesn't fix \"tomatos\""; fail=1; }
printf '%s\n' "$committed" | grep -q basil && { echo "the half-done basil went into the commit"; fail=1; }
git diff-tree --no-commit-id --name-only -r HEAD | grep -qx curry.txt && { echo "the half-done curry went into the commit"; fail=1; }
grep -qx "1 handful basil" soup.txt 2>/dev/null || { echo "the half-done basil isn't back in soup.txt"; fail=1; }
grep -qx "6 tomatoes" soup.txt 2>/dev/null || { echo "soup.txt in your folder has lost the spelling fix"; fail=1; }
grep -qx "1 tin coconut milk" curry.txt 2>/dev/null || { echo "the half-done coconut milk isn't back in curry.txt"; fail=1; }
[ -z "$(git stash list)" ] || { echo "something is still stashed: git stash pop brings it back and drops it"; fail=1; }
exit $fail

+++ solution
cd recipes
git stash
sed -i 's/tomatos/tomatoes/' soup.txt
git commit -am "Spell tomatoes right"
git stash pop

+++ tools
- `git stash`: puts your uncommitted changes aside, leaving your files as the last commit
- `git stash pop`: brings them back, and drops them from the stash
- `git stash list`: what's stashed
- `nano soup.txt`, or `sed -i 's/tomatos/tomatoes/' soup.txt`, then `git commit -am "message"`

+++ steps
Put the half-done work aside: `cd recipes`, then `git stash`

`git status` is clean, and `cat soup.txt` has no basil. The graph shows **1 stashed**.

---
Fix and commit: `sed -i 's/tomatos/tomatoes/' soup.txt`, then `git commit -am "Spell tomatoes right"`

---
Bring your work back: `git stash pop`, then press **Check**.

The basil and coconut milk are back, and the spelling fix stays.

+++ debrief
**The stash is a pile of unfinished changes.** `git stash` pushes onto it, `git stash pop` takes the top one off and applies it. It's for minutes or hours, not weeks: a branch with a "wip" commit is easier to find again.

**Popping can conflict**, if what you committed meanwhile touched the same lines. Resolve it like a merge (chapter 4); the stash isn't dropped until it applies cleanly.

**Options worth knowing**

- `git stash -u`: include untracked files too (new files aren't stashed by default)
- `git stash push -m "soup ideas" soup.txt`: stash one file, with a name
- `git stash show -p`: what's in the top stash
- `git stash apply`: apply but keep it on the pile; `git stash drop` to remove it

+++ sheet
```bash
git stash            # put changes aside
git stash pop        # bring them back
git stash list       # what's stashed
git stash -u         # include new files
git stash show -p    # look inside the top one
```

+++ tip
Stash is for short interruptions; branches are for longer ones.
