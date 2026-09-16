// Algorithm metadata, complexity tables, multi-language code snippets, and educator insights

export const ALGO_CATEGORIES = [
  { id: 'sorting', label: 'Sorting & Races', icon: 'BarChart2', desc: 'Comparison & divide-and-conquer ordering engines' },
  { id: 'pathfinding', label: 'Pathfinding & Mazes', icon: 'Compass', desc: 'Shortest path & graph exploration on 2D grids' },
  { id: 'search', label: 'Search & Pointers', icon: 'Search', desc: 'Logarithmic search & two-pointer convergence' },
  { id: 'dp', label: 'Dynamic Programming', icon: 'Boxes', desc: 'Overlapping subproblems & tabulation matrices' },
  { id: 'backtrack', label: 'Backtracking', icon: 'GitBranch', desc: 'Constraint satisfaction & state space tree search' },
];

export const SORTING_ALGOS = {
  bubble: {
    id: 'bubble',
    name: 'Bubble Sort',
    category: 'Exchange',
    timeBest: 'O(N)',
    timeAvg: 'O(N²)',
    timeWorst: 'O(N²)',
    space: 'O(1)',
    stable: true,
    tagline: 'Repeatedly step through the list, swap adjacent elements if out of order.',
    insight: 'Notice how each full pass guarantees the next largest element floats to its final position at the end of the array like an air bubble in water.',
    code: {
      js: `function bubbleSort(arr) {
  const n = arr.length;
  for (let i = 0; i < n; i++) {
    let swapped = false;
    for (let j = 0; j < n - i - 1; j++) {
      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
        swapped = true;
      }
    }
    if (!swapped) break; // Early termination if sorted
  }
  return arr;
}`,
      python: `def bubble_sort(arr):
    n = len(arr)
    for i in range(n):
        swapped = False
        for j in range(0, n - i - 1):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
                swapped = True
        if not swapped:
            break
    return arr`,
      cpp: `void bubbleSort(vector<int>& arr) {
    int n = arr.size();
    for (int i = 0; i < n; i++) {
        bool swapped = false;
        for (int j = 0; j < n - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {
                swap(arr[j], arr[j + 1]);
                swapped = true;
            }
        }
        if (!swapped) break;
    }
}`,
      java: `public static void bubbleSort(int[] arr) {
    int n = arr.length;
    for (int i = 0; i < n; i++) {
        boolean swapped = false;
        for (int j = 0; j < n - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {
                int temp = arr[j];
                arr[j] = arr[j + 1];
                arr[j + 1] = temp;
                swapped = true;
            }
        }
        if (!swapped) break;
    }
}`
    }
  },

  selection: {
    id: 'selection',
    name: 'Selection Sort',
    category: 'Selection',
    timeBest: 'O(N²)',
    timeAvg: 'O(N²)',
    timeWorst: 'O(N²)',
    space: 'O(1)',
    stable: false,
    tagline: 'Scan for the minimum element in unsorted partition, place at beginning.',
    insight: 'Selection sort makes at most N swaps, making it advantageous when writing to memory is extremely costly compared to comparisons.',
    code: {
      js: `function selectionSort(arr) {
  const n = arr.length;
  for (let i = 0; i < n - 1; i++) {
    let minIdx = i;
    for (let j = i + 1; j < n; j++) {
      if (arr[j] < arr[minIdx]) minIdx = j;
    }
    if (minIdx !== i) {
      [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
    }
  }
  return arr;
}`,
      python: `def selection_sort(arr):
    n = len(arr)
    for i in range(n - 1):
        min_idx = i
        for j in range(i + 1, n):
            if arr[j] < arr[min_idx]:
                min_idx = j
        if min_idx != i:
            arr[i], arr[min_idx] = arr[min_idx], arr[i]
    return arr`,
      cpp: `void selectionSort(vector<int>& arr) {
    int n = arr.size();
    for (int i = 0; i < n - 1; i++) {
        int minIdx = i;
        for (int j = i + 1; j < n; j++) {
            if (arr[j] < arr[minIdx]) minIdx = j;
        }
        if (minIdx != i) swap(arr[i], arr[minIdx]);
    }
}`,
      java: `public static void selectionSort(int[] arr) {
    int n = arr.length;
    for (int i = 0; i < n - 1; i++) {
        int minIdx = i;
        for (int j = i + 1; j < n; j++) {
            if (arr[j] < arr[minIdx]) minIdx = j;
        }
        if (minIdx != i) {
            int t = arr[i]; arr[i] = arr[minIdx]; arr[minIdx] = t;
        }
    }
}`
    }
  },

  insertion: {
    id: 'insertion',
    name: 'Insertion Sort',
    category: 'Insertion',
    timeBest: 'O(N)',
    timeAvg: 'O(N²)',
    timeWorst: 'O(N²)',
    space: 'O(1)',
    stable: true,
    tagline: 'Build sorted array one element at a time, sliding smaller items leftward.',
    insight: 'Super fast on small or nearly sorted arrays! Real-world engines (like V8 TimSort) use insertion sort for chunks under 32 elements.',
    code: {
      js: `function insertionSort(arr) {
  for (let i = 1; i < arr.length; i++) {
    const key = arr[i];
    let j = i - 1;
    while (j >= 0 && arr[j] > key) {
      arr[j + 1] = arr[j];
      j--;
    }
    arr[j + 1] = key;
  }
  return arr;
}`,
      python: `def insertion_sort(arr):
    for i in range(1, len(arr)):
        key = arr[i]
        j = i - 1
        while j >= 0 and arr[j] > key:
            arr[j + 1] = arr[j]
            j -= 1
        arr[j + 1] = key
    return arr`,
      cpp: `void insertionSort(vector<int>& arr) {
    for (int i = 1; i < arr.size(); i++) {
        int key = arr[i];
        int j = i - 1;
        while (j >= 0 && arr[j] > key) {
            arr[j + 1] = arr[j];
            j--;
        }
        arr[j + 1] = key;
    }
}`,
      java: `public static void insertionSort(int[] arr) {
    for (int i = 1; i < arr.length; i++) {
        int key = arr[i];
        int j = i - 1;
        while (j >= 0 && arr[j] > key) {
            arr[j + 1] = arr[j];
            j--;
        }
        arr[j + 1] = key;
    }
}`
    }
  },

  quick: {
    id: 'quick',
    name: 'Quick Sort',
    category: 'Divide & Conquer',
    timeBest: 'O(N log N)',
    timeAvg: 'O(N log N)',
    timeWorst: 'O(N²)',
    space: 'O(log N)',
    stable: false,
    tagline: 'Partition elements around a pivot, recursively conquering subarrays.',
    insight: 'Cache-friendly and blazing fast in practice due to tight inner loops and in-place partitioning without extra array allocation.',
    code: {
      js: `function quickSort(arr, low = 0, high = arr.length - 1) {
  if (low < high) {
    const pivotIdx = partition(arr, low, high);
    quickSort(arr, low, pivotIdx - 1);
    quickSort(arr, pivotIdx + 1, high);
  }
  return arr;
}

function partition(arr, low, high) {
  const pivot = arr[high];
  let i = low - 1;
  for (let j = low; j < high; j++) {
    if (arr[j] <= pivot) {
      i++;
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  }
  [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
  return i + 1;
}`,
      python: `def quick_sort(arr, low, high):
    if low < high:
        pi = partition(arr, low, high)
        quick_sort(arr, low, pi - 1)
        quick_sort(arr, pi + 1, high)

def partition(arr, low, high):
    pivot = arr[high]
    i = low - 1
    for j in range(low, high):
        if arr[j] <= pivot:
            i += 1
            arr[i], arr[j] = arr[j], arr[i]
    arr[i + 1], arr[high] = arr[high], arr[i + 1]
    return i + 1`,
      cpp: `int partition(vector<int>& arr, int low, int high) {
    int pivot = arr[high];
    int i = low - 1;
    for (int j = low; j < high; j++) {
        if (arr[j] <= pivot) {
            i++;
            swap(arr[i], arr[j]);
        }
    }
    swap(arr[i + 1], arr[high]);
    return i + 1;
}

void quickSort(vector<int>& arr, int low, int high) {
    if (low < high) {
        int pi = partition(arr, low, high);
        quickSort(arr, low, pi - 1);
        quickSort(arr, pi + 1, high);
    }
}`,
      java: `public static void quickSort(int[] arr, int low, int high) {
    if (low < high) {
        int pi = partition(arr, low, high);
        quickSort(arr, low, pi - 1);
        quickSort(arr, pi + 1, high);
    }
}

private static int partition(int[] arr, int low, int high) {
    int pivot = arr[high];
    int i = low - 1;
    for (int j = low; j < high; j++) {
        if (arr[j] <= pivot) {
            i++;
            int t = arr[i]; arr[i] = arr[j]; arr[j] = t;
        }
    }
    int t = arr[i + 1]; arr[i + 1] = arr[high]; arr[high] = t;
    return i + 1;
}`
    }
  },

  merge: {
    id: 'merge',
    name: 'Merge Sort',
    category: 'Divide & Conquer',
    timeBest: 'O(N log N)',
    timeAvg: 'O(N log N)',
    timeWorst: 'O(N log N)',
    space: 'O(N)',
    stable: true,
    tagline: 'Split array into halves, recursively sort, and zip together seamlessly.',
    insight: 'Guaranteed O(N log N) worst-case performance under all input arrangements! Highly stable and ideal for external storage or linked lists.',
    code: {
      js: `function mergeSort(arr) {
  if (arr.length <= 1) return arr;
  const mid = Math.floor(arr.length / 2);
  const left = mergeSort(arr.slice(0, mid));
  const right = mergeSort(arr.slice(mid));
  return merge(left, right);
}

function merge(left, right) {
  const result = [];
  let i = 0, j = 0;
  while (i < left.length && j < right.length) {
    if (left[i] <= right[j]) result.push(left[i++]);
    else result.push(right[j++]);
  }
  return result.concat(left.slice(i)).concat(right.slice(j));
}`,
      python: `def merge_sort(arr):
    if len(arr) <= 1:
        return arr
    mid = len(arr) // 2
    left = merge_sort(arr[:mid])
    right = merge_sort(arr[mid:])
    return merge(left, right)

def merge(left, right):
    res = []
    i = j = 0
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            res.append(left[i]); i += 1
        else:
            res.append(right[j]); j += 1
    res.extend(left[i:]); res.extend(right[j:])
    return res`,
      cpp: `void merge(vector<int>& arr, int l, int m, int r) {
    vector<int> left(arr.begin() + l, arr.begin() + m + 1);
    vector<int> right(arr.begin() + m + 1, arr.begin() + r + 1);
    int i = 0, j = 0, k = l;
    while (i < left.size() && j < right.size()) {
        if (left[i] <= right[j]) arr[k++] = left[i++];
        else arr[k++] = right[j++];
    }
    while (i < left.size()) arr[k++] = left[i++];
    while (j < right.size()) arr[k++] = right[j++];
}

void mergeSort(vector<int>& arr, int l, int r) {
    if (l < r) {
        int m = l + (r - l) / 2;
        mergeSort(arr, l, m);
        mergeSort(arr, m + 1, r);
        merge(arr, l, m, r);
    }
}`,
      java: `public static void mergeSort(int[] arr, int l, int r) {
    if (l < r) {
        int m = l + (r - l) / 2;
        mergeSort(arr, l, m);
        mergeSort(arr, m + 1, r);
        merge(arr, l, m, r);
    }
}`
    }
  },

  heap: {
    id: 'heap',
    name: 'Heap Sort',
    category: 'Selection / Heap',
    timeBest: 'O(N log N)',
    timeAvg: 'O(N log N)',
    timeWorst: 'O(N log N)',
    space: 'O(1)',
    stable: false,
    tagline: 'Transform array into Max-Heap, repeatedly extract maximum to back.',
    insight: 'Combines the O(N log N) guarantee of Merge Sort with the O(1) auxiliary space advantage of Quick Sort.',
    code: {
      js: `function heapSort(arr) {
  const n = arr.length;
  // Build max heap
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) heapify(arr, n, i);
  // Extract elements from heap
  for (let i = n - 1; i > 0; i--) {
    [arr[0], arr[i]] = [arr[i], arr[0]];
    heapify(arr, i, 0);
  }
  return arr;
}

function heapify(arr, n, i) {
  let largest = i;
  const left = 2 * i + 1;
  const right = 2 * i + 2;
  if (left < n && arr[left] > arr[largest]) largest = left;
  if (right < n && arr[right] > arr[largest]) largest = right;
  if (largest !== i) {
    [arr[i], arr[largest]] = [arr[largest], arr[i]];
    heapify(arr, n, largest);
  }
}`,
      python: `def heapify(arr, n, i):
    largest = i
    left = 2 * i + 1
    right = 2 * i + 2
    if left < n and arr[left] > arr[largest]:
        largest = left
    if right < n and arr[right] > arr[largest]:
        largest = right
    if largest != i:
        arr[i], arr[largest] = arr[largest], arr[i]
        heapify(arr, n, largest)

def heap_sort(arr):
    n = len(arr)
    for i in range(n // 2 - 1, -1, -1):
        heapify(arr, n, i)
    for i in range(n - 1, 0, -1):
        arr[0], arr[i] = arr[i], arr[0]
        heapify(arr, i, 0)
    return arr`,
      cpp: `void heapify(vector<int>& arr, int n, int i) {
    int largest = i;
    int l = 2 * i + 1;
    int r = 2 * i + 2;
    if (l < n && arr[l] > arr[largest]) largest = l;
    if (r < n && arr[r] > arr[largest]) largest = r;
    if (largest != i) {
        swap(arr[i], arr[largest]);
        heapify(arr, n, largest);
    }
}

void heapSort(vector<int>& arr) {
    int n = arr.size();
    for (int i = n / 2 - 1; i >= 0; i--) heapify(arr, n, i);
    for (int i = n - 1; i > 0; i--) {
        swap(arr[0], arr[i]);
        heapify(arr, i, 0);
    }
}`,
      java: `public static void heapSort(int[] arr) {
    int n = arr.length;
    for (int i = n / 2 - 1; i >= 0; i--) heapify(arr, n, i);
    for (int i = n - 1; i > 0; i--) {
        int t = arr[0]; arr[0] = arr[i]; arr[i] = t;
        heapify(arr, i, 0);
    }
}`
    }
  }
};

export const PATHFINDING_ALGOS = {
  dijkstra: {
    id: 'dijkstra',
    name: "Dijkstra's Algorithm",
    category: 'Weighted Shortest Path',
    time: 'O((V + E) log V)',
    space: 'O(V)',
    guaranteesShortest: true,
    tagline: 'Greedy shortest path explorer using priority queues and distance relaxation.',
    insight: 'Explores equally in all directions (concentric circles of wave fronts) until the target is reached, guaranteeing the absolute shortest path.',
  },
  astar: {
    id: 'astar',
    name: 'A* Search',
    category: 'Heuristic Search',
    time: 'O(E)',
    space: 'O(V)',
    guaranteesShortest: true,
    tagline: 'Combines Dijkstra’s path cost g(n) with distance heuristic h(n) to home in on target.',
    insight: 'Uses Manhattan/Euclidean distance as an intelligent beacon, steering exploration towards the target and drastically cutting down visited nodes.',
  },
  bfs: {
    id: 'bfs',
    name: 'Breadth-First Search (BFS)',
    category: 'Unweighted Shortest Path',
    time: 'O(V + E)',
    space: 'O(V)',
    guaranteesShortest: true,
    tagline: 'Level-by-level ripple explorer using a FIFO Queue.',
    insight: 'Explores all neighbors at distance 1 before moving to distance 2. Guarantees shortest path on unweighted grids.',
  },
  dfs: {
    id: 'dfs',
    name: 'Depth-First Search (DFS)',
    category: 'Graph Traversal',
    time: 'O(V + E)',
    space: 'O(V)',
    guaranteesShortest: false,
    tagline: 'Plunge deep along one path until blocked, then backtrack using LIFO recursion.',
    insight: 'Does NOT guarantee shortest path, but is memory-efficient and fundamental for cycle detection, topological sorting, and maze generation.',
  }
};

export const SEARCH_ALGOS = {
  binary: {
    id: 'binary',
    name: 'Binary Search',
    category: 'Divide & Conquer Search',
    timeBest: 'O(1)',
    timeAvg: 'O(log N)',
    timeWorst: 'O(log N)',
    space: 'O(1)',
    tagline: 'Halve the search space at every step by checking the middle element in a sorted list.',
    insight: 'Searching 1,000,000 elements takes at most ~20 comparisons! Works only because the array is sorted.',
  },
  twoPointers: {
    id: 'twoPointers',
    name: 'Two Pointers (Container With Most Water)',
    category: 'Greedy Convergent Pointers',
    timeBest: 'O(N)',
    timeAvg: 'O(N)',
    timeWorst: 'O(N)',
    space: 'O(1)',
    tagline: 'Move the shorter boundary inward to find maximum water holding capacity.',
    insight: 'Eliminates an O(N²) nested loop by recognizing that moving the taller wall can never increase area, since width decreases and height is bounded by the shorter wall.',
  }
};

export const DP_ALGOS = {
  fibonacci: {
    id: 'fibonacci',
    name: 'Fibonacci (Recursion Tree vs DP Tabulation)',
    category: 'Dynamic Programming',
    timeRecursion: 'O(2ⁿ)',
    timeDP: 'O(N)',
    spaceDP: 'O(N) / O(1)',
    tagline: 'Transform an exponential call tree into linear time by memoizing subproblems.',
    insight: 'Notice how fib(3) and fib(2) are recalculated over and over in pure recursion. DP stores answers in a table once solved, collapsing 2ⁿ calculations down to N steps.',
  },
  knapsack: {
    id: 'knapsack',
    name: '0/1 Knapsack Decision Matrix',
    category: 'Dynamic Programming',
    timeBest: 'O(N × W)',
    timeAvg: 'O(N × W)',
    timeWorst: 'O(N × W)',
    space: 'O(N × W)',
    tagline: 'At each item, choose whether to include or exclude to maximize value within capacity W.',
    insight: 'dp[i][w] represents the best value using a subset of the first i items with weight capacity w.',
  },
  nqueens: {
    id: 'nqueens',
    name: 'N-Queens (Backtracking)',
    category: 'Backtracking Search',
    timeBest: 'O(N!)',
    timeWorst: 'O(N!)',
    space: 'O(N)',
    tagline: 'Place N queens on an N×N board such that no two queens attack each other.',
    insight: 'Tests candidate row/column positions column-by-column. The moment a conflict occurs along rows or diagonals, it prunes the entire subtree and backtracks!',
  }
};
