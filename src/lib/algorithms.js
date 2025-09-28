// Algorithms for selecting an optimal set of tasks under constraints
// and utilities to estimate theoretical time complexities for charting.

/**
 * Constraints shape
 * @typedef {Object} Constraints
 * @property {number} maxBudget
 * @property {number} maxHours
 * @property {{[skill: string]: number}} minSkills
 */

/**
 * @typedef {Object} Task
 * @property {string} id
 * @property {string} name
 * @property {number} price
 * @property {number} hours
 * @property {number} value
 * @property {{[skill: string]: number}} skills
 */

/**
 * @typedef {Object} AlgorithmResult
 * @property {Task[]} selectedTasks
 * @property {number} totalValue
 * @property {number} totalCost
 * @property {number} totalHours
 * @property {{[skill: string]: number}} totalSkills
 * @property {{ name: string, complexity: string, note?: string }} algorithmInfo
 */

const ALGORITHMS = [
  'Brute Force',
  'Dynamic Programming',
  'Meet-in-the-Middle',
  'Branch & Bound',
  'Greedy',
  'Bitset DP',
];

function evaluateSelection(tasks) {
  const totalValue = tasks.reduce((s, t) => s + t.value, 0);
  const totalCost = tasks.reduce((s, t) => s + t.price, 0);
  const totalHours = tasks.reduce((s, t) => s + t.hours, 0);
  const totalSkills = tasks.reduce(
    (acc, t) => {
      Object.keys(t.skills).forEach((k) => {
        acc[k] = (acc[k] || 0) + t.skills[k];
      });
      return acc;
    },
    { D: 0, FE: 0, BE: 0, DevOps: 0, QA: 0 }
  );
  return { totalValue, totalCost, totalHours, totalSkills };
}

function satisfiesConstraints(selectionTotals, constraints) {
  if (selectionTotals.totalCost > constraints.maxBudget) return false;
  if (selectionTotals.totalHours > constraints.maxHours) return false;
  for (const skill of Object.keys(constraints.minSkills)) {
    if ((selectionTotals.totalSkills[skill] || 0) < constraints.minSkills[skill]) {
      return false;
    }
  }
  return true;
}

function fitsMaxOnly(selectionTotals, constraints) {
  return (
    selectionTotals.totalCost <= constraints.maxBudget &&
    selectionTotals.totalHours <= constraints.maxHours
  );
}

function meetsSkillMinima(selectionTotals, constraints) {
  for (const skill of Object.keys(constraints.minSkills)) {
    if ((selectionTotals.totalSkills[skill] || 0) < constraints.minSkills[skill]) {
      return false;
    }
  }
  return true;
}

// Brute Force: Try all subsets. Exponential O(2^n)
function bruteForce(tasks, constraints) {
  const n = tasks.length;
  // Safety cap to avoid freezing UI on very large n
  if (n > 22) {
    return greedy(tasks, constraints, {
      fallbackOf: 'Brute Force',
    });
  }
  let best = { selectedTasks: [], totalValue: -Infinity };
  const totalSubsets = 1 << n;
  for (let mask = 0; mask < totalSubsets; mask++) {
    const subset = [];
    for (let i = 0; i < n; i++) {
      if (mask & (1 << i)) subset.push(tasks[i]);
    }
    const totals = evaluateSelection(subset);
    if (fitsMaxOnly(totals, constraints) && meetsSkillMinima(totals, constraints)) {
      if (totals.totalValue > best.totalValue) {
        best = { selectedTasks: subset, ...totals };
      }
    }
  }
  if (best.totalValue === -Infinity) {
    return emptyResult('Brute Force');
  }
  return {
    ...best,
    algorithmInfo: { name: 'Brute Force', complexity: 'O(2^n)' },
  };
}

// Greedy: Sort by value/price ratio and take while feasible. O(n log n)
function greedy(tasks, constraints, meta) {
  const byValuePerCost = [...tasks].sort((a, b) => b.value / b.price - a.value / a.price);
  const selected = [];
  const used = new Set();
  for (const t of byValuePerCost) {
    const candidate = [...selected, t];
    const totals = evaluateSelection(candidate);
    if (fitsMaxOnly(totals, constraints)) {
      selected.push(t);
      used.add(t.id);
    }
  }
  // Ensure min skills are met; if not, try to add tasks that best reduce skill deficit per cost
  let totals = evaluateSelection(selected);
  const remaining = tasks.filter((t) => !used.has(t.id));
  function skillDeficit() {
    const def = {};
    let sum = 0;
    for (const k of Object.keys(constraints.minSkills)) {
      const d = Math.max(0, constraints.minSkills[k] - (totals.totalSkills[k] || 0));
      def[k] = d; sum += d;
    }
    return { def, sum };
  }
  let { def, sum } = skillDeficit();
  while (sum > 0) {
    // score each remaining task by deficit reduction per unit cost
    let bestTask = null;
    let bestScore = -Infinity;
    for (const t of remaining) {
      const reduction = Object.keys(def).reduce((acc, k) => acc + Math.min(def[k], t.skills[k] || 0), 0);
      if (reduction <= 0) continue;
      const candidate = evaluateSelection([...selected, t]);
      if (!fitsMaxOnly(candidate, constraints)) continue;
      const score = reduction / (t.price + 1);
      if (score > bestScore) {
        bestScore = score;
        bestTask = t;
      }
    }
    if (!bestTask) break;
    selected.push(bestTask);
    used.add(bestTask.id);
    totals = evaluateSelection(selected);
    ({ def, sum } = skillDeficit());
  }
  totals = evaluateSelection(selected);
  if (!satisfiesConstraints(totals, constraints)) {
    return {
      ...emptyResult(meta?.fallbackOf ? `${meta.fallbackOf} → Greedy (fallback)` : 'Greedy'),
      algorithmInfo: {
        name: meta?.fallbackOf ? `${meta.fallbackOf} → Greedy (fallback)` : 'Greedy',
        complexity: 'O(n log n)',
        note: 'No feasible solution under current constraints',
      }
    };
  }
  return {
    selectedTasks: selected,
    ...totals,
    algorithmInfo: {
      name: meta?.fallbackOf ? `${meta.fallbackOf} → Greedy (fallback)` : 'Greedy',
      complexity: 'O(n log n)',
      note: meta?.fallbackOf ? 'Large n; used greedy heuristic' : undefined,
    },
  };
}

// Dynamic Programming: 0/1 knapsack on budget, track hours to prune; O(n * B)
// B = maxBudget. Works best when budget values are reasonably small integers.
function dynamicProgramming(tasks, constraints) {
  const B = Math.max(0, Math.floor(constraints.maxBudget));
  if (B <= 0) return emptyResult('Dynamic Programming');

  // dp[b] = { value, hours, chosenIds(bitset-like as array of booleans) }
  const dp = Array(B + 1)
    .fill(null)
    .map(() => ({ value: 0, hours: 0, chosen: [] }));

  tasks.forEach((task, taskIdx) => {
    const cost = Math.floor(task.price);
    for (let b = B; b >= cost; b--) {
      const prev = dp[b - cost];
      const candidateHours = prev.hours + task.hours;
      if (candidateHours <= constraints.maxHours) {
        const candidateValue = prev.value + task.value;
        if (candidateValue > dp[b].value) {
          dp[b] = {
            value: candidateValue,
            hours: candidateHours,
            chosen: [...prev.chosen, taskIdx],
          };
        }
      }
    }
  });

  // Pick best feasible wrt skills minima
  let best = { selectedTasks: [], totalValue: -Infinity };
  for (let b = 0; b <= B; b++) {
    const entry = dp[b];
    const selected = entry.chosen.map((i) => tasks[i]);
    const totals = evaluateSelection(selected);
    if (fitsMaxOnly(totals, constraints) && meetsSkillMinima(totals, constraints) && totals.totalValue > best.totalValue) {
      best = { selectedTasks: selected, ...totals };
    }
  }

  if (best.totalValue === -Infinity) {
    return emptyResult('Dynamic Programming');
  }
  return {
    ...best,
    algorithmInfo: { name: 'Dynamic Programming', complexity: 'O(n · B)' },
  };
}

// Meet-in-the-middle: split into halves, enumerate each half, then two-pointer by budget/hours. ~O(2^(n/2))
function meetInTheMiddle(tasks, constraints) {
  const n = tasks.length;
  if (n > 30) {
    return greedy(tasks, constraints, { fallbackOf: 'Meet-in-the-Middle' });
  }
  const mid = Math.floor(n / 2);
  const left = tasks.slice(0, mid);
  const right = tasks.slice(mid);

  function enumerate(arr) {
    const res = [];
    const m = arr.length;
    const total = 1 << m;
    for (let mask = 0; mask < total; mask++) {
      const sub = [];
      for (let i = 0; i < m; i++) if (mask & (1 << i)) sub.push(arr[i]);
      const totals = evaluateSelection(sub);
      res.push({ sub, ...totals });
    }
    return res;
  }

  const L = enumerate(left).filter((x) => x.totalCost <= constraints.maxBudget && x.totalHours <= constraints.maxHours);
  const R = enumerate(right).filter((x) => x.totalCost <= constraints.maxBudget && x.totalHours <= constraints.maxHours);

  // Sort R by cost to enable two-pointer-like search. Keep best value for each cost threshold.
  R.sort((a, b) => a.totalCost - b.totalCost);
  let bestSuffix = Array(R.length);
  let bestVal = -Infinity;
  for (let i = R.length - 1; i >= 0; i--) {
    if (R[i].totalValue > bestVal) {
      bestVal = R[i].totalValue;
      bestSuffix[i] = R[i];
    } else {
      bestSuffix[i] = bestSuffix[i + 1] || R[i];
    }
  }

  let best = { selectedTasks: [], totalValue: -Infinity };
  for (const l of L) {
    const remainingBudget = constraints.maxBudget - l.totalCost;
    const remainingHours = constraints.maxHours - l.totalHours;
    // binary search in R for max cost <= remainingBudget; hours is approximated by filtering
    let lo = 0, hi = R.length - 1, idx = -1;
    while (lo <= hi) {
      const midIdx = (lo + hi) >> 1;
      if (R[midIdx].totalCost <= remainingBudget) {
        idx = midIdx;
        lo = midIdx + 1;
      } else hi = midIdx - 1;
    }
    if (idx !== -1) {
      // walk forward to find an R with hours <= remainingHours; fallback to bestSuffix windows
      for (let j = idx; j >= 0; j--) {
        const r = R[j];
        if (r.totalHours <= remainingHours) {
          const combined = {
            selectedTasks: [...l.sub, ...r.sub],
            ...evaluateSelection([...l.sub, ...r.sub]),
          };
          if (fitsMaxOnly(combined, constraints) && meetsSkillMinima(combined, constraints) && combined.totalValue > best.totalValue) {
            best = combined;
          }
          break;
        }
      }
    }
  }

  if (best.totalValue === -Infinity) {
    return emptyResult('Meet-in-the-Middle');
  }
  return { ...best, algorithmInfo: { name: 'Meet-in-the-Middle', complexity: 'O(2^(n/2))' } };
}

// Branch & Bound: simple DFS with bounding by remaining max value. Exponential in worst case.
function branchAndBound(tasks, constraints) {
  const sorted = [...tasks].sort((a, b) => b.value / b.price - a.value / a.price);
  const prefixMax = Array(sorted.length + 1).fill(0);
  for (let i = sorted.length - 1; i >= 0; i--) {
    prefixMax[i] = prefixMax[i + 1] + sorted[i].value;
  }
  let best = { selectedTasks: [], totalValue: -Infinity };

  function dfs(i, chosen) {
    const totals = evaluateSelection(chosen);
    // For partials, only enforce budget/hours
    if (!fitsMaxOnly(totals, constraints)) return;
    // Track best only when skills minima are also satisfied
    if (meetsSkillMinima(totals, constraints) && totals.totalValue > best.totalValue) {
      best = { selectedTasks: [...chosen], ...totals };
    }
    if (i >= sorted.length) return;
    // Upper bound: current value + max remaining possible value
    const upperBound = totals.totalValue + prefixMax[i];
    if (upperBound <= best.totalValue) return;
    // Choose item i
    dfs(i + 1, [...chosen, sorted[i]]);
    // Skip item i
    dfs(i + 1, chosen);
  }

  dfs(0, []);
  if (best.totalValue === -Infinity) {
    return greedy(tasks, constraints, { fallbackOf: 'Branch & Bound' });
  }
  return { ...best, algorithmInfo: { name: 'Branch & Bound', complexity: 'O(2^n) (pruned)' } };
}

// Bitset DP on budget: represent achievable budgets; reconstruct approx by tracking predecessor.
function bitsetDP(tasks, constraints) {
  const B = Math.max(0, Math.floor(constraints.maxBudget));
  if (B <= 0) return emptyResult('Bitset DP');
  let bitset = 1n; // only 0 achievable
  const prev = Array(B + 1).fill(-1);
  const from = Array(B + 1).fill(-1);
  tasks.forEach((task, idx) => {
    const cost = Math.floor(task.price);
    if (cost > B) return;
    const shifted = bitset << BigInt(cost);
    const newBits = bitset | shifted;
    // update predecessors for newly achievable sums
    for (let b = B; b >= cost; b--) {
      const was = (bitset >> BigInt(b)) & 1n;
      const now = (newBits >> BigInt(b)) & 1n;
      if (was === 0n && now === 1n && prev[b] === -1) {
        prev[b] = b - cost;
        from[b] = idx;
      }
    }
    bitset = newBits;
  });

  // Find best sum within hours + skills constraints by scanning feasible budgets
  let best = { selectedTasks: [], totalValue: -Infinity };
  for (let b = 0; b <= B; b++) {
    if (((bitset >> BigInt(b)) & 1n) === 1n) {
      // reconstruct set for sum b
      const pickedIdx = new Set();
      let cur = b;
      while (cur > 0 && prev[cur] !== -1) {
        pickedIdx.add(from[cur]);
        cur = prev[cur];
      }
      const selected = [...pickedIdx].map((i) => tasks[i]);
      const totals = evaluateSelection(selected);
      if (fitsMaxOnly(totals, constraints) && meetsSkillMinima(totals, constraints) && totals.totalValue > best.totalValue) {
        best = { selectedTasks: selected, ...totals };
      }
    }
  }

  if (best.totalValue === -Infinity) {
    return emptyResult('Bitset DP');
  }
  return { ...best, algorithmInfo: { name: 'Bitset DP', complexity: 'O(n · B / word_size)' } };
}

function emptyResult(name) {
  return {
    selectedTasks: [],
    totalValue: 0,
    totalCost: 0,
    totalHours: 0,
    totalSkills: { D: 0, FE: 0, BE: 0, DevOps: 0, QA: 0 },
    algorithmInfo: { name, complexity: '—' },
  };
}

export function runAlgorithmByName(tasks, constraints, name) {
  switch (name) {
    case 'Brute Force':
      return bruteForce(tasks, constraints);
    case 'Dynamic Programming':
      return dynamicProgramming(tasks, constraints);
    case 'Meet-in-the-Middle':
      return meetInTheMiddle(tasks, constraints);
    case 'Branch & Bound':
      return branchAndBound(tasks, constraints);
    case 'Greedy':
      return greedy(tasks, constraints);
    case 'Bitset DP':
      return bitsetDP(tasks, constraints);
    default:
      return greedy(tasks, constraints, { fallbackOf: name });
  }
}

export function getSupportedAlgorithms() {
  return [...ALGORITHMS];
}

// Compute a normalized theoretical time cost for given n and constraint scale.
export function computeTheoreticalCost(algorithmName, n, constraints) {
  // Normalize budget scale to dampen B impact
  const B = Math.max(1, Math.min(1000, Math.floor(constraints.maxBudget / 100))); // e.g., budget in hundreds
  switch (algorithmName) {
    case 'Brute Force':
      return Math.pow(2, Math.min(30, n));
    case 'Dynamic Programming':
      return n * B;
    case 'Meet-in-the-Middle':
      return Math.pow(2, Math.min(30, Math.ceil(n / 2)));
    case 'Branch & Bound':
      // optimistic pruning factor
      return Math.pow(2, Math.min(30, n * 0.75));
    case 'Greedy':
      return n * Math.log2(Math.max(2, n));
    case 'Bitset DP':
      return (n * B) / 32;
    default:
      return n;
  }
}

export function complexityLabel(name) {
  switch (name) {
    case 'Brute Force':
      return 'O(2^n)';
    case 'Dynamic Programming':
      return 'O(n·B)';
    case 'Meet-in-the-Middle':
      return 'O(2^(n/2))';
    case 'Branch & Bound':
      return 'O(2^n) (pruned)';
    case 'Greedy':
      return 'O(n log n)';
    case 'Bitset DP':
      return 'O(n·B/word)';
    default:
      return '—';
  }
}


