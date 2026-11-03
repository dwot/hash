# Hash curriculum

35 levels in seven chapters of five: four lessons and a boss. Every level is played in a real repository; the
commit graph beside the terminal shows it change.

## 1. Snapshots
`init`, `status`, `add`, `commit`, `log`

| # | Level | Kind | Goal |
|---|---|---|---|
| 1 | First commit | State | Turn a folder into a repo and commit it |
| 2 | What changed? | Output | `status` and `diff` on an edited project |
| 3 | Not everything | State | Stage two of three changed files, and `.gitignore` the build output |
| 4 | Read the history | Output | `log` and `show`: when did this line arrive? |
| B | Two tidy commits | State | Split a mixed set of edits into two commits that each make sense |

## 2. Undo
`restore`, `restore --staged`, `commit --amend`, `revert`, `reset`

| # | Level | Kind | Goal |
|---|---|---|---|
| 1 | Throw it away | State | Discard an edit you don't want |
| 2 | Unstage | State | Take a file back out of the next commit |
| 3 | Fix the last commit | State | Amend a typo'd message and a forgotten file |
| 4 | Undo in public | State | `revert` a shared commit instead of rewriting it |
| B | Back to good | Rescue | `reset` to the last good commit, keeping one file's changes |

## 3. Branches
`branch`, `switch`, `merge`, `log --graph`

| # | Level | Kind | Goal |
|---|---|---|---|
| 1 | A place to try things | State | Make a branch and commit on it, leaving main alone |
| 2 | Switching | State | Move between branches and see the files change |
| 3 | Fast-forward | State | Merge a finished branch into main |
| 4 | Clean up | State | Delete merged branches, keep the unmerged one |
| B | Two features | State | Two branches both merged into main, a real merge commit |

## 4. Conflicts
Conflict markers, resolving, `merge --abort`, `--ours` and `--theirs`

| # | Level | Kind | Goal |
|---|---|---|---|
| 1 | Both changed it | State | Resolve your first conflict |
| 2 | Keep both | State | A resolution that takes something from each side |
| 3 | Not now | State | `merge --abort` back to where you were |
| 4 | Take theirs | State | Resolve whole files one way |
| B | The big merge | State | Three files, three different resolutions |

## 5. Remotes
`clone`, `fetch`, `pull`, `push`, a rejected push

| # | Level | Kind | Goal |
|---|---|---|---|
| 1 | Get a copy | State | `clone`, then look at `origin` |
| 2 | Share it | State | Commit and `push` |
| 3 | What did they do? | Output | `fetch` and compare before you merge |
| 4 | Rejected | State | Someone pushed first: `pull --rebase`, then push |
| B | A day on the team | State | A feature branch, pushed, with the teammate's work pulled in |

## 6. Tidying history
`stash`, `cherry-pick`, `rebase`, `rebase -i`

| # | Level | Kind | Goal |
|---|---|---|---|
| 1 | Hold that thought | State | `stash` half-done work to fix something urgent |
| 2 | Just that one | State | `cherry-pick` a fix onto another branch |
| 3 | Replay | State | `rebase` a branch onto a moved main |
| 4 | Squash | State | `rebase -i` four "wip" commits into one |
| B | Ready for review | State | Reorder, reword and squash a messy branch |

## 7. Detective work
`blame`, `log -S`, `bisect`, `reflog`

| # | Level | Kind | Goal |
|---|---|---|---|
| 1 | Who wrote this? | Output | `blame` a line |
| 2 | When did it vanish? | Output | `log -S` for a deleted function |
| 3 | Lost and found | Rescue | Get back a commit after a bad `reset --hard`, with `reflog` |
| 4 | Detached | Rescue | Save commits made on a detached HEAD |
| B | Find the bug | Output | `bisect` 60 commits to the one that broke the test |
