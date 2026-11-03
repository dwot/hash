---
id: cherry-pick
chapter: 6
order: 2
kind: lesson
checks: state
title: Just that one
---
The `experiments` branch is full of half-tested ideas, but one commit on it is a real fix: "Fix the oven temperature". `main` needs that fix today. Copy **just that commit** onto `main`, leaving the experiments behind, and leave `experiments` as it is.

+++ setup
repo recipes
printf 'Lemon cake\n\n2 lemons\n3 eggs\n1 cup sugar\n1 cup flour\n\nMix, pour into a lined tin.\nBake at 280C for 40 minutes\n' > cake.txt
printf 'Pancakes\n\n2 eggs\n1 cup flour\n1 cup milk\n' > pancakes.txt
commit "Add cake and pancakes"
git switch -q -c experiments
sed -i 's/2 lemons/2 limes/' cake.txt; commit "Try limes in the cake"
sed -i 's/280C/180C/' cake.txt; commit "Fix the oven temperature"
sed -i 's/1 cup milk/1 cup beer/' pancakes.txt; commit "Beer pancakes?"
git switch -q main

+++ check
cd recipes 2>/dev/null || { echo "recipes/ is gone"; exit 1; }
fail=0
[ "$(git log -1 --format=%s experiments)" = "Beer pancakes?" ] && [ "$(git rev-list --count experiments)" = 4 ] || { echo "experiments has changed: it should be left as it was"; fail=1; }
main_cake=$(git show main:cake.txt)
printf '%s\n' "$main_cake" | grep -q "180C" || { echo "main's cake.txt doesn't have the oven fix yet"; fail=1; }
printf '%s\n' "$main_cake" | grep -q "limes" && { echo "the limes came to main too: only the oven fix should"; fail=1; }
git show main:pancakes.txt | grep -q beer && { echo "the beer pancakes came to main too"; fail=1; }
git merge-base --is-ancestor experiments main && { echo "main has merged all of experiments"; fail=1; }
[ "$(git rev-list --count main)" = 2 ] || [ $fail = 1 ] || { echo "main should have one new commit, the fix"; fail=1; }
left=$(git status --porcelain)
[ -z "$left" ] || { echo "there are changes left over:"; echo "$left"; fail=1; }
exit $fail

+++ solution
cd recipes
git cherry-pick experiments~1

+++ tools
- `git log --oneline experiments`: find the fix's hash
- `git cherry-pick <commit>`: makes a new commit here with the same changes as that one
- Make sure you're on `main` first: cherry-pick copies to where you are

+++ steps
Find the commit: `cd recipes`, then `git log --oneline experiments`

"Fix the oven temperature" is second from the top: `experiments~1`, or use its hash.

---
Copy it: `git cherry-pick experiments~1`, then press **Check**.

The graph shows a new commit on `main` with the same message and a different hash. `experiments` is untouched.

+++ debrief
**A cherry-pick is a copy, not a move.** The new commit has the same changes and message, but a different parent, so a different hash. The original stays on `experiments`. If `experiments` is merged later, git usually notices the change is already there.

**Good uses**: a fix that's needed on a release branch as well as `main`, or rescuing one good commit from an abandoned branch.

**Options worth knowing**

- `git cherry-pick a1b2c3d e4f5a6b`: several commits, in order
- `git cherry-pick -x ...`: adds "(cherry picked from commit ...)" to the message
- If it conflicts: resolve, `git add`, then `git cherry-pick --continue` (or `--abort`)

+++ sheet
```bash
git cherry-pick abc1234    # copy one commit here
git cherry-pick -x abc12   # ...noting where it came from
git cherry-pick --abort    # back out of a conflict
```

+++ tip
Cherry-pick copies a commit; the copy gets a new hash.
