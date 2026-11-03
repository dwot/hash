---
id: bisect
chapter: 7
order: 5
kind: boss
checks: state
title: Find the bug
---
The cookbook has a test, `./test.sh`, and it fails now. It passed in the very first commit, and since then there have been 40 commits of small edits, any of which could have broken it.

Find the **first commit where the test fails**, and tag it `broke-it`. Leave the repository as you found it, on `main`.

+++ setup
mkdir cookbook && cd cookbook && git init -q
start=$(date -u -d 2026-02-02T09:00:00 +%s)
# One fast-import call builds the whole history: 40 separate git commits are slow in the emulator.
blob() { printf 'data %d\n%s\n' "${#1}" "$1"; }
notes=""
{
  for i in $(seq 1 41); do
    notes="${notes}Note $i: tasted, adjusted.
"
    if [ "$i" -lt 27 ]; then temp=180C; else temp=180F; fi
    case $i in 1) msg="Start the cookbook" ;; 27) msg="Tidy the cake recipe" ;; *) msg="Tidy the notes ($i)" ;; esac
    echo "commit refs/heads/main"
    echo "mark :$i"
    echo "author Sam Player <sam@example.com> $((start + i * 3600)) +0000"
    echo "committer Sam Player <sam@example.com> $((start + i * 3600)) +0000"
    blob "$msg"
    [ "$i" -gt 1 ] && echo "from :$((i - 1))"
    printf -v cake 'Lemon cake\n\n3 eggs\n1 cup sugar\n2 lemons\n1 cup flour\n\nBake at %s for 40 minutes.\n' "$temp"
    echo "M 644 inline cake.txt"; blob "$cake"
    echo "M 644 inline notes.txt"; blob "$notes"
    echo "M 755 inline test.sh"; blob '#!/bin/sh
# The cookbook test: every oven temperature is in Celsius.
if grep -q "Bake at [0-9]*F" cake.txt; then echo "FAIL: cake.txt has a Fahrenheit temperature"; exit 1; fi
echo "ok"'
  done
} | git fast-import --quiet
git reset -q --hard main

+++ check
cd cookbook 2>/dev/null || { echo "cookbook/ is gone"; exit 1; }
fail=0
[ -f .git/BISECT_LOG ] && { echo "the bisect is still going: git bisect reset finishes it"; fail=1; }
if ! git rev-parse -q --verify refs/tags/broke-it >/dev/null; then
  echo "there's no tag called broke-it yet"
  exit 1
fi
tagged=$(git log -1 --format=%s broke-it)
if [ "$tagged" != "Tidy the cake recipe" ]; then
  echo "broke-it is on \"$tagged\": that isn't the first commit where ./test.sh fails"
  fail=1
fi
[ "$(git symbolic-ref -q --short HEAD)" = main ] || { echo "you're not back on main"; fail=1; }
[ "$(git rev-list --count main)" = 41 ] || { echo "main has changed"; fail=1; }
exit $fail

+++ solution
cd cookbook
git bisect start main main~40
git bisect run ./test.sh
git tag broke-it refs/bisect/bad
git bisect reset

+++ tools
- `git bisect start <bad> <good>`: starts a binary search between a commit where it's broken and one where it worked. `main~40` is the first commit
- `git bisect good` / `git bisect bad`: after testing the commit git checks out, tell it the result. It halves the range each time
- `git bisect run ./test.sh`: does the good/bad for you, using the test's exit code
- `git tag broke-it <commit>`, then `git bisect reset` to go back to `main`

+++ steps
Confirm it's broken: `cd cookbook`, then `./test.sh`

---
Start the search, broken at `main`, working at the first commit: `git bisect start main main~40`

The prompt says `BISECTING`, and git has checked out a commit halfway along.

---
Test it: `./test.sh`. If it says ok, type `git bisect good`; if FAIL, `git bisect bad`. Repeat.

About six rounds: 40 commits halve to one quickly. Or let git do it: `git bisect run ./test.sh`.

---
Git says **<hash> is the first bad commit**. Tag it: `git tag broke-it <hash>`

`refs/bisect/bad` names it too: `git tag broke-it refs/bisect/bad`

---
Finish: `git bisect reset`, then press **Check**.

+++ debrief
**Bisect is binary search on history.** 40 commits take about 6 tests, 1,000 take about 10. All it needs is a way to tell good from bad: a test, a script, or you looking at the result.

**`git bisect run`** turns it into one command: exit code 0 means good, 1 to 127 means bad (except 125, which means "can't test this one, skip it"). A failing test you write today can find the commit that broke it months ago.

**Worth knowing**

- `git bisect skip`: this commit can't be tested (doesn't build, say)
- `git bisect log`: the steps so far; `git bisect visualize` shows what's left
- `git bisect start --term-old=slow --term-new=fast`: for finding when something *changed*, not only broke

That's the course: snapshots, undo, branches, conflicts, remotes, tidy history and detective work. The cheat sheet has everything you've solved.
