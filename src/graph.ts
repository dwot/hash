// The commit graph beside the terminal. After each command the page asks the game agent for the repository the
// player is in (`GRAPH_SCRIPT`), parses its plain-text reply (`parseGraph`), lays the commits out in lanes
// (`layout`) and draws them as SVG (`renderGraph`).

/** Run by the game agent as root, in the directory the player's shell is in. Exits 3 outside a repository. */
export const GRAPH_SCRIPT = String.raw`
cd "/home/player/work/$(player_dir)" 2>/dev/null || exit 3
top=$(git rev-parse --show-toplevel 2>/dev/null) || exit 3
cd "$top" || exit 3
case $top in /home/player/work) echo "repo ~/work" ;; /home/player/work/*) echo "repo $(printf '%s' "$top" | cut -c19-)" ;; *) echo "repo $top" ;; esac
echo "head $(git symbolic-ref -q --short HEAD || echo '')"
g=$(git rev-parse --git-dir)
if [ -d "$g/rebase-merge" ]; then echo "state rebasing $(cat "$g/rebase-merge/msgnum" 2>/dev/null)/$(cat "$g/rebase-merge/end" 2>/dev/null)"
elif [ -d "$g/rebase-apply" ]; then echo "state rebasing"
elif [ -f "$g/MERGE_HEAD" ]; then echo "state merging"
elif [ -f "$g/CHERRY_PICK_HEAD" ]; then echo "state cherry-picking"
elif [ -f "$g/REVERT_HEAD" ]; then echo "state reverting"
elif [ -f "$g/BISECT_LOG" ]; then echo "state bisecting"
fi
git status --porcelain 2>/dev/null | awk '
  /^\?\?/ { n++; next }
  /^(DD|AU|UD|UA|DU|AA|UU)/ { c++; next }
  { if (substr($0,1,1) != " ") s++; if (substr($0,2,1) != " ") u++ }
  END { printf "changes %d %d %d %d\n", s, u, n, c }'
echo "stash $(git stash list 2>/dev/null | wc -l)"
echo "commits"
git log --exclude=refs/stash --all --topo-order -n 80 --format='%H%x09%P%x09%h%x09%D%x09%s' 2>/dev/null
`;

export interface Commit {
  hash: string;
  short: string;
  parents: string[];
  /** Branches, tags and remote branches pointing here, without HEAD. */
  refs: string[];
  /** HEAD points here (detached, or through the current branch). */
  head: boolean;
  subject: string;
}

export interface Graph {
  repo: string;
  /** The current branch, or "" when HEAD is detached. */
  branch: string;
  /** A merge, rebase and so on in progress, as git would say it. */
  state: string;
  staged: number;
  unstaged: number;
  untracked: number;
  conflicts: number;
  stashes: number;
  commits: Commit[];
}

export function parseGraph(text: string): Graph {
  const g: Graph = { repo: "", branch: "", state: "", staged: 0, unstaged: 0, untracked: 0, conflicts: 0, stashes: 0, commits: [] };
  const lines = text.split("\n");
  let i = 0;
  for (; i < lines.length; i++) {
    const line = lines[i];
    if (line === "commits") { i++; break; }
    const sp = line.indexOf(" ");
    const key = sp < 0 ? line : line.slice(0, sp);
    const val = sp < 0 ? "" : line.slice(sp + 1);
    if (key === "repo") g.repo = val;
    else if (key === "head") g.branch = val;
    else if (key === "state") g.state = val;
    else if (key === "stash") g.stashes = Number(val) || 0;
    else if (key === "changes") [g.staged, g.unstaged, g.untracked, g.conflicts] = val.split(" ").map((n) => Number(n) || 0);
  }
  for (; i < lines.length; i++) {
    if (!lines[i]) continue;
    const [hash, parents, short, deco, ...subject] = lines[i].split("\t");
    let head = false;
    const refs: string[] = [];
    for (const r of (deco ?? "").split(", ").filter(Boolean)) {
      if (r === "HEAD") head = true;
      else if (r.startsWith("HEAD -> ")) { head = true; refs.push(r.slice(8)); }
      else if (r.startsWith("tag: ")) refs.push(r);
      else if (!r.endsWith("/HEAD")) refs.push(r);
    }
    g.commits.push({ hash, short, parents: parents ? parents.split(" ") : [], refs, head, subject: subject.join("\t") });
  }
  return g;
}

export interface Placed {
  commit: Commit;
  row: number;
  lane: number;
}
export interface Edge {
  from: Placed;
  /** Where the parent is drawn, or the bottom of the graph when it's past the commits shown. */
  to: { row: number; lane: number };
  /** The lane the line runs down between the two. */
  lane: number;
}

/** One lane per line of history, newest first. A commit takes the lane that was waiting for it. */
export function layout(commits: Commit[]): { placed: Placed[]; edges: Edge[]; lanes: number } {
  const lanes: (string | null)[] = [];
  const placed: Placed[] = [];
  const at = new Map<string, Placed>();
  const pending: { from: Placed; parent: string; lane: number }[] = [];
  const free = () => {
    const i = lanes.indexOf(null);
    return i < 0 ? lanes.push(null) - 1 : i;
  };

  commits.forEach((commit, row) => {
    let lane = lanes.indexOf(commit.hash);
    if (lane < 0) lane = free();
    // Any other lane waiting for this commit joins it here.
    for (let l = 0; l < lanes.length; l++) if (lanes[l] === commit.hash) lanes[l] = null;
    const p = { commit, row, lane };
    placed.push(p);
    at.set(commit.hash, p);
    commit.parents.forEach((parent, n) => {
      let pl: number;
      if (n === 0) pl = lane;
      else {
        const waiting = lanes.indexOf(parent);
        pl = waiting >= 0 ? waiting : free();
      }
      lanes[pl] = parent;
      pending.push({ from: p, parent, lane: pl });
    });
  });

  const bottom = commits.length;
  const edges = pending.map(({ from, parent, lane }) => {
    const to = at.get(parent);
    return { from, lane, to: to ? { row: to.row, lane: to.lane } : { row: bottom, lane } };
  });
  return { placed, edges, lanes: Math.max(1, lanes.length) };
}

const ROW = 30;
const LANE = 16;
const PAD = 14;
const COLOURS = ["#6aaa64", "#5b8fd6", "#c9b458", "#b071c9", "#d9774b", "#4fb3a9"];
const colour = (lane: number) => COLOURS[lane % COLOURS.length];
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function changesText(g: Graph): string {
  const parts: string[] = [];
  if (g.conflicts) parts.push(`${g.conflicts} in conflict`);
  if (g.staged) parts.push(`${g.staged} staged`);
  if (g.unstaged) parts.push(`${g.unstaged} changed`);
  if (g.untracked) parts.push(`${g.untracked} new`);
  return parts.join(" · ");
}

/** The panel's HTML: a header line, then the graph as SVG, then a note when history goes on past what's shown. */
export function renderGraph(g: Graph, limit = 80): string {
  const head = g.branch ? `on <b>${esc(g.branch)}</b>` : g.commits.some((c) => c.head) ? "<b>detached HEAD</b>" : "";
  const state = g.state ? ` <span class="graph-state">${esc(g.state)}</span>` : "";
  const stash = g.stashes ? ` <span class="graph-stash">${g.stashes} stashed</span>` : "";
  const header = `<div class="graph-head"><span class="graph-repo">${esc(g.repo)}</span> ${head}${state}${stash}</div>`;

  const changes = changesText(g);
  const extra = changes ? 1 : 0;
  const { placed, edges, lanes } = layout(g.commits);
  if (!placed.length && !changes) return header + `<p class="graph-empty">No commits yet.</p>`;

  const x = (lane: number) => PAD + lane * LANE;
  const y = (row: number) => PAD + (row + extra) * ROW;
  const textX = x(lanes) + 6;
  const parts: string[] = [];

  for (const e of edges) {
    const x1 = x(e.from.lane), y1 = y(e.from.row), xl = x(e.lane), x2 = x(e.to.lane), y2 = y(e.to.row);
    const c = colour(e.lane);
    // Out to the lane within a row, down the lane, and into the parent within its row.
    let d = `M${x1} ${y1}`;
    if (xl !== x1) d += ` C${x1} ${y1 + ROW / 2} ${xl} ${y1 + ROW / 2} ${xl} ${y1 + ROW}`;
    if (x2 !== xl && e.to.row < g.commits.length) {
      d += ` L${xl} ${y2 - ROW} C${xl} ${y2 - ROW / 2} ${x2} ${y2 - ROW / 2} ${x2} ${y2}`;
    } else d += ` L${xl} ${y2 - (e.to.row >= g.commits.length ? ROW / 2 : 0)}`;
    parts.push(`<path d="${d}" stroke="${c}" />`);
  }

  const headCommit = placed.find((p) => p.commit.head);
  if (changes) {
    const lane = headCommit?.lane ?? 0;
    if (headCommit) parts.push(`<path class="pending-line" d="M${x(lane)} ${y(-1)} L${x(lane)} ${y(headCommit.row)}" />`);
    parts.push(`<circle class="pending" cx="${x(lane)}" cy="${y(-1)}" r="5" />`);
    parts.push(`<text x="${textX}" y="${y(-1) + 4}" class="pending-text">${esc(changes)}</text>`);
  }

  for (const p of placed) {
    const cx = x(p.lane), cy = y(p.row);
    const c = colour(p.lane);
    const merge = p.commit.parents.length > 1;
    parts.push(`<circle cx="${cx}" cy="${cy}" r="${p.commit.head ? 6 : 4.5}" fill="${p.commit.head ? "var(--graph-bg)" : c}" stroke="${c}" stroke-width="${p.commit.head ? 3 : merge ? 2 : 0}" />`);
    let tx = textX;
    let label = "";
    const chips = p.commit.refs.map((r) => {
      const kind = r.startsWith("tag: ") ? "tag" : r.includes("/") ? "remote" : "branch";
      const name = kind === "tag" ? r.slice(5) : r;
      const current = kind === "branch" && name === g.branch && p.commit.head;
      return `<tspan class="ref ${kind}${current ? " current" : ""}">${esc(name)}</tspan> `;
    });
    if (p.commit.head && !g.branch) chips.unshift(`<tspan class="ref head">HEAD</tspan> `);
    label += chips.join("");
    label += `<tspan class="sha">${esc(p.commit.short)}</tspan> ${esc(p.commit.subject)}`;
    parts.push(`<text x="${tx}" y="${cy + 4}">${label}</text>`);
  }

  const height = y(placed.length - 1 + (g.commits.length >= limit ? 1 : 0)) + PAD;
  const svg = `<svg class="graph-svg" width="100%" height="${height}" role="img" aria-label="Commit graph">${parts.join("")}</svg>`;
  const more = g.commits.length >= limit ? `<p class="graph-more">Older commits aren't shown.</p>` : "";
  return header + svg + more;
}
