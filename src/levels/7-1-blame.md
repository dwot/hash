---
id: blame
chapter: 7
order: 1
kind: lesson
checks: output
title: Who wrote this?
---
Someone put a red chili in the soup, and you'd like a word. Use `git blame` to show **line 4** of `soup.txt`, and only that line, with who last changed it and when.

+++ setup
repo recipes
printf 'Tomato soup\n\n6 tomatoes\n1 onion\n2 cups stock\n' > soup.txt
commit "Add soup"
echo "1 handful basil" >> soup.txt
by "Alex Kim" alex@example.com commit "Basil in the soup"
if [ "$VARIANT" = 0 ]; then
  sed -i 's/^1 onion$/1 red chili\n1 onion/' soup.txt
  by "Priya Shah" priya@example.com commit "Chili!"
  sed -i 's/^2 cups stock$/3 cups stock/' soup.txt
  commit "More stock"
else
  sed -i 's/^6 tomatoes$/8 tomatoes/' soup.txt
  commit "More tomatoes"
  sed -i 's/^1 onion$/1 red chili\n1 onion/' soup.txt
  by "Alex Kim" alex@example.com commit "A bit of heat"
fi

+++ solution
cd recipes
git blame -L 4,4 soup.txt

+++ tools
- `git blame file`: every line of the file, with the commit, author and date that last changed it
- `-L 4,4`: only lines 4 to 4

`cat -n soup.txt` numbers the lines, to check which is line 4.

+++ steps
Look at the whole file first: `cd recipes`, then `git blame soup.txt`

Each line starts with a short hash, then the author and date in brackets, then the line number.

---
Just line 4: `git blame -L 4,4 soup.txt`, then press **Check**.

+++ debrief
**Blame shows the last change, not the first.** If someone only fixed the spacing on a line, blame names them. `git show <hash>` shows the whole commit, and `git blame <hash>^ -- soup.txt` blames the version before it, to dig further back.

**Despite the name**, it's mostly for finding *why*: the hash leads to the commit message, and from there to the review or the issue.

**Options worth knowing**

- `git blame -L 10,20 file`: a range of lines
- `git blame -w`: ignore changes that only touched whitespace
- `git log -L 4,4:soup.txt`: every commit that changed that line, with the changes

+++ sheet
```bash
git blame file             # who last changed each line
git blame -L 4,4 file      # just line 4
git blame -w file          # ignore whitespace changes
git log -L 4,4:file        # that line's whole history
```

+++ tip
Blame finds the commit; the commit message says why.
