// Every trap the course is meant to catch, and the alternative answers it should accept. Level by level, in play order.
// Careful in bash strings: "\\;" in JavaScript is only ";", so B stands in for a backslash.
const B = "\x5c";

export const scenarios = {
  "first-commit": async (t) => {
    await t.type("cd recipes"); await t.type("git init"); await t.rejected("1-1 no commit yet");
    await t.type("git add README.md"); await t.type('git commit -m "Start"'); await t.rejected("1-1 two files left out");
    await t.type("git add ."); await t.type('git commit -m "The rest"'); await t.solved("1-1 in two commits");
  },
  "what-changed": async (t) => {
    await t.type("cd recipes"); await t.type("git status"); await t.rejected("1-2 status");
    await t.type("cat soup.txt"); await t.rejected("1-2 cat");
    await t.type("git diff soup.txt"); await t.solved("1-2 one file");
    await t.type("git diff HEAD"); await t.solved("1-2 against HEAD");
  },
  "not-everything": async (t) => {
    await t.type("cd recipes"); await t.type("git add ."); await t.type('git commit -qm "Everything"');
    await t.rejected("1-3 build committed", "git rm -r --cached build");
    await t.type("echo build/ > .gitignore"); await t.rejected("1-3 still tracked", "build/ is in the history");
    await t.type("git rm -rq --cached build"); await t.type("git add .gitignore"); await t.type('git commit -qm "Ignore build"');
    await t.solved("1-3 fixed afterwards");
    await t.reset();
    await t.type("cd recipes"); await t.type("echo build/ > .git/info/exclude"); await t.type("git add curry.txt"); await t.type('git commit -qm "Curry"');
    await t.rejected("1-3 private exclude", "put it in .gitignore");
  },
  "history": async (t) => {
    await t.type("cd recipes"); await t.type("git log --oneline"); await t.rejected("1-4 everything");
    await t.type("git log --oneline -- soup.txt"); await t.solved("1-4 with --");
  },
  "two-commits": async (t) => {
    await t.type("cd recipes"); await t.type("git add ."); await t.type('git commit -qm "All of it"');
    await t.rejected("1-5 one commit", "there should be two new commits");
    await t.reset();
    await t.type("cd recipes"); await t.type("git commit -qam Pancakes"); await t.type("git add curry.txt"); await t.type("git commit -qm Curry");
    await t.rejected("1-5 commit -a", "each commit should hold one change");
    await t.reset();
    await t.type("cd recipes"); await t.type("git add curry.txt index.txt"); await t.type("git commit -qm Curry");
    await t.type("git add pancakes.txt"); await t.type("git commit -qm Pancakes"); await t.solved("1-5 curry first");
  },
  "throw-away": async (t) => {
    await t.type("cd recipes"); await t.type("git restore ."); await t.rejected("2-1 restore everything", "the pancake changes are gone");
    await t.reset();
    await t.type("cd recipes"); await t.type("git checkout -- soup.txt"); await t.solved("2-1 checkout");
  },
  "unstage": async (t) => {
    await t.type("cd recipes"); await t.type('git commit -qm "Curry"'); await t.rejected("2-2 committed", "the password is in the history");
    await t.reset();
    await t.type("cd recipes"); await t.type("git rm -q -f .env"); await t.type('git commit -qm "Curry"'); await t.rejected("2-2 deleted", "deleted");
    await t.reset();
    await t.type("cd recipes"); await t.type("git rm -q --cached .env"); await t.type("echo .env > .gitignore"); await t.type('git commit -qm "Curry"');
    await t.solved("2-2 rm --cached, gitignore left untracked");
  },
  "amend": async (t) => {
    await t.type("cd recipes"); await t.type("git add index.txt"); await t.type('git commit -qm "Add curry to the index"');
    await t.rejected("2-3 second commit", "there's a new commit on top");
    await t.type("git reset -q --soft HEAD~1"); await t.type('git commit -q --amend -m "Add a curry recipe"'); await t.solved("2-3 after soft reset");
    await t.reset();
    await t.type("cd recipes"); await t.type("git commit -q --amend -m Fixed"); await t.rejected("2-3 message only", "index.txt");
  },
  "revert": async (t) => {
    await t.type("cd recipes"); await t.type("git reset -q --hard HEAD~2"); await t.rejected("2-4 reset", "the history has changed");
    await t.reset();
    await t.type("cd recipes"); await t.type("git log --oneline");
    const hash = (await t.page.evaluate(() => [...document.querySelectorAll(".xterm-rows > div")].map((d) => d.textContent).find((l) => l.includes("Switch to metric")))).trim().split(" ")[0];
    await t.type(`git revert --no-edit ${hash}`); await t.solved("2-4 by hash");
  },
  "back-to-good": async (t) => {
    await t.type("cd recipes"); await t.type("git reset -q --hard HEAD~3"); await t.rejected("2-5 hard", "notes.txt is gone");
    await t.reset();
    await t.type("cd recipes"); await t.type("git revert --no-edit HEAD~2..HEAD"); await t.rejected("2-5 revert", "git reset's job");
    await t.reset();
    await t.type("cd recipes"); await t.type("cp notes.txt /tmp/"); await t.type("git reset -q --hard HEAD~3"); await t.type("cp /tmp/notes.txt .");
    await t.solved("2-5 copy and hard reset");
  },
  "new-branch": async (t) => {
    await t.type("cd recipes"); await t.type('echo "1 red chili" >> soup.txt'); await t.type('git commit -qam Chili'); await t.rejected("3-1 on main", "main has changed");
    await t.type("git branch spicy"); await t.type("git reset -q --hard HEAD~1"); await t.solved("3-1 branch afterwards, main reset");
    await t.reset();
    await t.type("cd recipes"); await t.type("git branch spicy"); await t.rejected("3-1 no commit", "no commits of its own");
  },
  "switching": async (t) => {
    await t.type("cd recipes"); await t.type("git switch -q winter"); await t.type('echo "2 carrots" >> stew.txt'); await t.type("git commit -qam Carrots");
    await t.rejected("3-2 still on winter", "switch back to main");
    await t.type("git switch -q -"); await t.solved("3-2 switch -");
  },
  "fast-forward": async (t) => {
    await t.type("cd recipes"); await t.type("git switch -q curry"); await t.type("git merge main"); await t.rejected("3-3 wrong way round", "main doesn't have the curry commits");
    await t.type("git switch -q main"); await t.type("git merge -q --no-ff --no-edit curry"); await t.solved("3-3 no-ff");
  },
  "clean-up": async (t) => {
    await t.type("cd recipes"); await t.type("git branch -d gluten-free"); await t.rejected("3-4 refused, nothing deleted", "typo-fix is merged");
    await t.type("git branch -D gluten-free typo-fix curry salt"); await t.rejected("3-4 forced", "gluten-free has been deleted");
  },
  "two-features": async (t) => {
    await t.type("cd recipes"); await t.type("git merge --no-edit dessert"); await t.type("git merge --no-edit breakfast");
    await t.rejected("3-5 branches left", "the dessert branch is still here");
    await t.type("git branch -d dessert breakfast"); await t.solved("3-5 in steps");
    await t.reset();
    await t.type("cd recipes"); await t.type("git merge --no-edit dessert breakfast"); await t.type("git branch -d dessert breakfast"); await t.solved("3-5 octopus");
  },
  "first-conflict": async (t) => {
    await t.type("cd recipes"); await t.type("git merge red-onion"); await t.rejected("4-1 in conflict", "soup.txt is in conflict");
    await t.type("git add soup.txt"); await t.rejected("4-1 added with markers", "the merge isn't finished");
    await t.type("git commit -q --no-edit"); await t.rejected("4-1 markers committed", "conflict markers");
    await t.reset();
    await t.type("cd recipes"); await t.type("git merge red-onion"); await t.type("git restore --theirs soup.txt"); await t.type("git commit -qam done");
    await t.rejected("4-1 took theirs", "2 red onions");
    await t.reset();
    await t.type("cd recipes"); await t.type("git merge red-onion");
    await t.type("printf 'Tomato soup\\n\\n6 tomatoes\\n2 red onions\\n2 cups stock\\n' > soup.txt"); await t.type("git add soup.txt"); await t.page.keyboard.type("git merge --continue"); await t.page.keyboard.press("Enter");
    await t.page.waitForTimeout(3000); await t.page.keyboard.press("Control+X"); await t.page.waitForTimeout(2000);
    await t.solved("4-1 merge --continue through nano");
  },
  "keep-both": async (t) => {
    await t.type("cd recipes"); await t.type("git merge garlic"); await t.type("git restore --ours soup.txt"); await t.type("git commit -qam ours");
    await t.rejected("4-2 ours only", "3 cloves garlic");
  },
  "abort": async (t) => {
    await t.type("cd recipes"); await t.type("git commit -qam whatever"); await t.rejected("4-3 committed the mess", "main has moved");
    await t.reset();
    await t.type("cd recipes"); await t.type("git reset -q --hard"); await t.solved("4-3 reset --hard");
  },
  "take-theirs": async (t) => {
    await t.type("cd cafe"); await t.type("git merge new-prices"); await t.type("git restore --ours prices.csv"); await t.type("git restore --theirs menu.txt");
    await t.type("git commit -qam swapped"); await t.rejected("4-4 the wrong way round", "prices.csv should be exactly new-prices");
    await t.reset();
    await t.type("cd cafe"); await t.type("git merge new-prices"); await t.type("git checkout --theirs prices.csv"); await t.type("git checkout --ours menu.txt");
    await t.type("git add ."); await t.rejected("4-4 not committed", "the merge isn't finished");
    await t.type("git commit -q --no-edit"); await t.solved("4-4 checkout");
  },
  "big-merge": async (t) => {
    await t.type("cd cafe"); await t.type("git merge -X theirs --no-edit spring"); await t.type("git branch -d spring");
    await t.rejected("4-5 all theirs", "README.md should be exactly main's version");
    await t.reset();
    await t.type("cd cafe"); await t.type("git merge spring"); await t.type("git restore --theirs prices.csv"); await t.type("git restore --ours README.md");
    await t.type("git restore --theirs menu.txt"); await t.type("git commit -qam merged");
    await t.rejected("4-5 menu one side", "Cheese toastie");
  },
  "clone": async (t) => {
    await t.type("mkdir recipes"); await t.type("cp -r server/recipes.git/. recipes/"); await t.rejected("5-1 copied the bare repo", "there's no repository");
    await t.reset();
    await t.type("git clone -q server:recipes.git"); await t.solved("5-1 quiet clone");
  },
  "push": async (t) => {
    await t.type("cd recipes"); await t.type("git add stew.txt"); await t.type('git commit -qm "Stew"'); await t.rejected("5-2 not pushed", "push");
    await t.type("git push -q origin main"); await t.solved("5-2 push origin main");
  },
  "catch-up": async (t) => {
    await t.type("cd recipes"); await t.type("git fetch -q"); await t.rejected("5-3 fetched only", "git merge");
    await t.type("git merge -q origin/main"); await t.solved("5-3 merge origin/main");
    await t.reset();
    await t.type("cd recipes"); await t.type("git pull -q"); await t.solved("5-3 pull");
  },
  "rejected": async (t) => {
    await t.type("cd recipes"); await t.type("git push -q --force"); await t.rejected("5-4 force", "Alex's basil commit has gone");
    await t.reset();
    await t.type("cd recipes"); await t.type("git pull -q --no-edit"); await t.type("git push -q"); await t.rejected("5-4 merge", "merge commit");
    await t.reset();
    await t.type("cd recipes"); await t.type("git fetch -q"); await t.type("git rebase -q origin/main"); await t.type("git push -q"); await t.solved("5-4 fetch and rebase");
  },
  "team-day": async (t) => {
    await t.type("cd recipes"); await t.type("git switch -qc salads"); await t.type("git add salad.txt"); await t.type('git commit -qm Salad'); await t.type("git push -q -u origin salads");
    await t.rejected("5-5 no pull first", "your main isn't up to date");
    await t.reset();
    await t.type("cd recipes"); await t.type("git pull -q"); await t.type("git switch -qc salads"); await t.type("git add salad.txt"); await t.type('git commit -qm Salad'); await t.type("git push -q origin salads");
    await t.rejected("5-5 no upstream", "git push -u");
    await t.type("git branch -u origin/salads"); await t.solved("5-5 upstream set afterwards");
    await t.reset();
    await t.type("cd recipes"); await t.type("git pull -q"); await t.type("git add salad.txt"); await t.type('git commit -qm Salad'); await t.type("git push -q");
    await t.rejected("5-5 pushed to main", "the server's main has changed");
  },
  "stash": async (t) => {
    await t.type("cd recipes"); await t.type("sed -i 's/tomatos/tomatoes/' soup.txt"); await t.type('git commit -qam "Fix"');
    await t.rejected("6-1 everything committed", "the half-done basil went into the commit");
    await t.reset();
    await t.type("cd recipes"); await t.type("git stash -q"); await t.type("sed -i 's/tomatos/tomatoes/' soup.txt"); await t.type('git commit -qam "Fix"');
    await t.rejected("6-1 not popped", "isn't back");
    await t.type("git stash apply -q"); await t.rejected("6-1 applied, not dropped", "still stashed");
    await t.type("git stash drop -q"); await t.solved("6-1 apply and drop");
  },
  "cherry-pick": async (t) => {
    await t.type("cd recipes"); await t.type("git merge -q --no-edit experiments"); await t.rejected("6-2 merged everything", "the limes came to main too");
    await t.reset();
    await t.type("cd recipes"); await t.type("git restore --source=experiments cake.txt"); await t.type('git commit -qam "Oven fix"'); await t.rejected("6-2 whole file", "the limes came to main too");
  },
  "rebase": async (t) => {
    await t.type("cd recipes"); await t.type("git merge -q --no-edit main"); await t.rejected("6-3 merged", "merge commit");
    await t.reset();
    await t.type("cd recipes"); await t.type("git switch -q main"); await t.type("git rebase -q salads"); await t.rejected("6-3 wrong way round", "main has changed");
    await t.reset();
    await t.type("cd recipes"); await t.type("git switch -q main"); await t.type("git rebase -q main salads"); await t.solved("6-3 rebase main salads, from main");
  },
  "squash": async (t) => {
    await t.type("cd recipes"); await t.type("GIT_SEQUENCE_EDITOR=\"sed -i '2,\\$s/^pick/fixup/'\" git rebase -q -i main"); await t.rejected("6-4 message still wip", "the message should be just");
    await t.reset();
    await t.type("cd recipes"); await t.type("git reset -q --soft main"); await t.type('git commit -qm "Add a curry"'); await t.solved("6-4 soft reset");
    await t.reset();
    await t.type("cd recipes"); await t.type("GIT_SEQUENCE_EDITOR=\"sed -i '2,\\$s/^pick/squash/'\" GIT_EDITOR=true git rebase -q -i main"); await t.rejected("6-4 squash keeps all messages", "the message should be just");
  },
  "ready-for-review": async (t) => {
    await t.type("cd recipes"); await t.type("git rebase -q main"); await t.rejected("6-5 rebased only", "two commits of its own");
    await t.reset();
    await t.type("cd recipes"); await t.type("git reset -q --soft main"); await t.type('git commit -qm "Add a summer salad"'); await t.rejected("6-5 one commit", "two commits");
    await t.reset();
    await t.type("cd recipes"); await t.type("git rebase -q main"); await t.type("git reset -q main");
    await t.type("git add salad.txt"); await t.type('git commit -qm "Add a summer salad"'); await t.type("git add dressing.txt"); await t.type('git commit -qm "Add a lemon dressing"');
    await t.solved("6-5 rebase, reset and recommit");
  },
  "blame": async (t) => {
    await t.type("cd recipes"); await t.type("git blame soup.txt"); await t.rejected("7-1 whole file");
    await t.type("echo Priya"); await t.rejected("7-1 hard-coded");
    await t.type("git blame -L 4,+1 soup.txt"); await t.solved("7-1 -L 4,+1");
  },
  "pickaxe": async (t) => {
    await t.type("cd recipes"); await t.type("git log --oneline --grep=garlic -i"); await t.rejected("7-2 messages");
    await t.type("git log -G garlic --oneline"); await t.rejected("7-2 -G lists the 3 to 4 cloves change");
    await t.type("git log --oneline -S garlic -- soup.txt"); await t.solved("7-2 limited to soup.txt");
  },
  "reflog": async (t) => {
    await t.type("cd recipes"); await t.type("git reset -q --hard HEAD~1"); await t.rejected("7-3 further back", "before the reset it was on");
    await t.type("git reflog | cat");
    const line = (await t.page.evaluate(() => [...document.querySelectorAll(".xterm-rows > div")].map((d) => d.textContent).find((l) => /commit: Add porridge/.test(l)))).trim();
    await t.type(`git reset -q --hard ${line.split(" ")[0]}`); await t.solved("7-3 by hash, after a second mistake");
  },
  "detached": async (t) => {
    await t.type("cd recipes"); await t.type("git switch -q main"); await t.rejected("7-4 left them", "no branch called pudding");
    await t.type("git branch pudding HEAD@{1}"); await t.solved("7-4 rescued with the reflog");
    await t.reset();
    await t.type("cd recipes"); await t.type("git branch pudding"); await t.solved("7-4 branch, still detached");
  },
  "bisect": async (t) => {
    await t.type("cd cookbook"); await t.type("git tag broke-it main"); await t.rejected("7-5 tagged main", "isn't the first commit");
    await t.reset();
    await t.type("cd cookbook"); await t.type("git bisect start main main~40"); await t.type("git bisect run ./test.sh");
    await t.type("git tag broke-it refs/bisect/bad"); await t.rejected("7-5 not reset", "git bisect reset");
    await t.type("git bisect reset"); await t.solved("7-5");
  },
};
