# Helpers for level setups, sourced before each one (src/game.ts). Commits made with them get fixed dates, so a
# level's commit hashes are the same every time it's built: output checks compare two separate builds.

__top=$PWD
__clock=$(date -u -d 2026-03-02T09:00:00 +%s)

# tick [seconds]: move the clock on, an hour by default, and date the next commit then.
tick() {
  __clock=$((__clock + ${1:-3600}))
  export GIT_AUTHOR_DATE="@$__clock +0000" GIT_COMMITTER_DATE="@$__clock +0000"
}

# commit "message" [files...]: add the files (everything, by default) and commit them, an hour after the last one.
commit() {
  local msg=$1; shift
  if [ $# -gt 0 ]; then git add -- "$@"; else git add -A; fi
  tick
  git commit -q -m "$msg"
}

# by "Name" email command...: run a command as someone else, for commits from teammates.
by() {
  local -x GIT_AUTHOR_NAME=$1 GIT_AUTHOR_EMAIL=$2 GIT_COMMITTER_NAME=$1 GIT_COMMITTER_EMAIL=$2
  shift 2
  "$@"
}

# repo dir: make a repository and go into it.
repo() {
  git init -q "$1" && cd "$1"
}

# server name: an empty repository on the server (~/work/server), which the player reaches as server:name.git.
server() {
  git init -q --bare "$__top/server/$1.git"
}

# alex name command...: run a command in Alex's own clone of server:name.git, as Alex. Alex pushes with it.
alex() {
  local name=$1 here=$PWD
  shift
  [ -d "$__top/server/.alex/$name" ] || git clone -q "server:$name.git" "$__top/server/.alex/$name" 2>/dev/null
  cd "$__top/server/.alex/$name" && by "Alex Kim" alex@example.com "$@"
  cd "$here"
}
