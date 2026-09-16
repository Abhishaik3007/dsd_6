// Comprehensive Algorithm Catalog Dataset with rich theoretical explanations,
// step-by-step breakdown, Big-O complexity matrices, and production code snippets

export const ALGORITHM_ITEMS = [
  // -------------------------------------------------------------
  // SORTING ALGORITHMS
  // -------------------------------------------------------------
  {
    id: 'bubble',
    title: 'Bubble Sort',
    category: 'Sorting',
    categoryTag: 'Exchange Sorting',
    paradigm: 'Iterative Comparison',
    badgeColor: 'bg-[#f5dec5]',
    shortDesc: 'Repeatedly step through the list, swap adjacent elements if out of order.',
    overview: 'Bubble Sort is the most foundational comparison-based sorting algorithm. It works by repeatedly traversing the array, comparing adjacent pairs, and swapping them if they appear in inverted order. Over multiple passes, larger elements "bubble up" toward the end of the array, leaving a sorted suffix behind.',
    timeBest: 'O(N)',
    timeAvg: 'O(N²)',
    timeWorst: 'O(N²)',
    space: 'O(1)',
    stable: true,
    hasLab: true,
    labCategory: 'sorting',
    howItWorks: [
      'Begin at index 0 and compare the element at arr[j] with arr[j+1].',
      'If arr[j] > arr[j+1], swap them so the larger element shifts to the right.',
      'Continue through the unsorted portion of the array (up to n - i - 1).',
      'At the end of pass i, the i-th largest element is guaranteed to be at its final position.',
      'Optimization: Track a boolean `swapped`. If a full pass makes 0 swaps, terminate early in O(N) time.'
    ],
    invariants: [
      'After k passes, the last k elements of the array are sorted and in their final positions.',
      'No element past index n - k will ever need to be moved again.'
    ],
    pros: [
      'Simple to understand, explain, and implement from first principles.',
      'In-place algorithm requiring only O(1) auxiliary memory.',
      'Stable sort: preserves relative order of duplicate items.',
      'Adaptive: achieves O(N) on already-sorted lists.'
    ],
    cons: [
      'O(N²) average and worst-case time complexity makes it impractical for large datasets.',
      'Performs an excessive number of write operations (swaps) compared to Selection Sort.'
    ],
    realWorldUse: 'Educational demonstrations and sanity checks on tiny, nearly-sorted embedded datasets.',
    codeSnippets: {
      javascript: `function bubbleSort(arr) {
  const n = arr.length;
  for (let i = 0; i < n; i++) {
    let swapped = false;
    for (let j = 0; j < n - i - 1; j++) {
      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
        swapped = true;
      }
    }
    if (!swapped) break; // Early exit if already sorted
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

  {
    id: 'selection',
    title: 'Selection Sort',
    category: 'Sorting',
    categoryTag: 'Selection Sorting',
    paradigm: 'Greedy Minimum Search',
    badgeColor: 'bg-[#f5dec5]',
    shortDesc: 'Scan for the minimum element in unsorted partition, place at beginning.',
    overview: 'Selection Sort divides the array into a sorted prefix and an unsorted suffix. In each iteration, it performs a linear search across the unsorted suffix to locate the minimum element, and performs exactly one swap to place it at the boundary of the sorted prefix.',
    timeBest: 'O(N²)',
    timeAvg: 'O(N²)',
    timeWorst: 'O(N²)',
    space: 'O(1)',
    stable: false,
    hasLab: true,
    labCategory: 'sorting',
    howItWorks: [
      'Initialize boundary pointer i at index 0.',
      'Scan from index i + 1 to n - 1 to find the index of the minimum element (minIdx).',
      'If minIdx !== i, swap arr[i] with arr[minIdx].',
      'Increment i and repeat until the entire array is sorted.'
    ],
    invariants: [
      'The subarray arr[0..i-1] contains the smallest i elements of the array in fully sorted order.',
      'Every element in arr[0..i-1] is less than or equal to every element in arr[i..n-1].'
    ],
    pros: [
      'Never performs more than O(N) swaps, making it ideal when writing to EEPROM or flash memory is costly.',
      'Simple in-place logic with strictly O(1) memory overhead.',
      'Deterministic comparison count: exactly n*(n-1)/2 comparisons regardless of input distribution.'
    ],
    cons: [
      'Always runs in O(N²) time even on already sorted input.',
      'Default implementation is unstable (can swap identical values out of relative position).'
    ],
    realWorldUse: 'Embedded microcontroller systems with limited write endurance cycles on flash blocks.',
    codeSnippets: {
      javascript: `function selectionSort(arr) {
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

  {
    id: 'insertion',
    title: 'Insertion Sort',
    category: 'Sorting',
    categoryTag: 'Incremental Insertion',
    paradigm: 'Online / Card Sorting',
    badgeColor: 'bg-[#d9e8df]',
    shortDesc: 'Build sorted array one element at a time, sliding smaller items leftward.',
    overview: 'Insertion Sort mimics how people intuitively sort a hand of playing cards. It iterates through the array, picks up the current item (the key), and shifts all greater elements in the sorted left subarray one position to the right to make room for the key.',
    timeBest: 'O(N)',
    timeAvg: 'O(N²)',
    timeWorst: 'O(N²)',
    space: 'O(1)',
    stable: true,
    hasLab: true,
    labCategory: 'sorting',
    howItWorks: [
      'Consider index 0 as an already-sorted subarray of length 1.',
      'Pick element at index i as key.',
      'Compare key with items in the sorted prefix from right to left (j = i - 1).',
      'Shift elements greater than key one position to the right.',
      'Insert key into the empty slot (j + 1).'
    ],
    invariants: [
      'At any step i, the subarray arr[0..i-1] consists of the original elements from those positions, in sorted order.'
    ],
    pros: [
      'Blazing fast for small arrays (n < 30) due to low constant overhead.',
      'Runs in linear O(N) time on nearly-sorted data.',
      'Online algorithm: can sort an incoming streaming feed item by item.',
      'Stable and strictly in-place.'
    ],
    cons: [
      'Quadratic O(N²) time when sorting reverse-ordered or random large datasets.'
    ],
    realWorldUse: 'Used in standard library hybrid algorithms (like V8 TimSort, Dual-Pivot QuickSort) for small partitions.',
    codeSnippets: {
      javascript: `function insertionSort(arr) {
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

  {
    id: 'quick',
    title: 'Quick Sort',
    category: 'Sorting',
    categoryTag: 'Divide & Conquer',
    paradigm: 'Pivot Partitioning',
    badgeColor: 'bg-[#f5dec5]',
    shortDesc: 'Partition elements around a pivot, recursively conquering subarrays.',
    overview: 'Quick Sort is widely regarded as one of the greatest algorithms of computer science. It chooses a "pivot" element, partitions the array such that all items smaller than the pivot precede it and all larger items follow it, and then recursively sorts the two partitions.',
    timeBest: 'O(N log N)',
    timeAvg: 'O(N log N)',
    timeWorst: 'O(N²)',
    space: 'O(log N)',
    stable: false,
    hasLab: true,
    labCategory: 'sorting',
    howItWorks: [
      'Choose a pivot element (e.g. Lomuto picks the last element arr[high]).',
      'Partition the subarray: reorder items so smaller items are moved left.',
      'Place the pivot into its final resting index.',
      'Recursively apply QuickSort to the left subarray [low..p-1] and right subarray [p+1..high].'
    ],
    invariants: [
      'After partitioning, the pivot element is at its permanent sorted position.',
      'Every item to the left of the pivot is ≤ pivot, and every item to the right is ≥ pivot.'
    ],
    pros: [
      'Fastest general-purpose comparison sort in practice due to spatial locality and CPU cache efficiency.',
      'Sorts in-place with only O(log N) recursion stack space.',
      'Tuning pivot selection (randomized or median-of-three) virtually eliminates O(N²) worst-case risks.'
    ],
    cons: [
      'Worst-case O(N²) occurs if an unbalanced pivot is chosen repeatedly (e.g., picking last item on sorted array).',
      'Unstable sort.'
    ],
    realWorldUse: 'Default sorting engine for primitive types in C (qsort), Java, Rust, and Go standard libraries.',
    codeSnippets: {
      javascript: `function quickSort(arr, low = 0, high = arr.length - 1) {
  if (low < high) {
    const pIdx = partition(arr, low, high);
    quickSort(arr, low, pIdx - 1);
    quickSort(arr, pIdx + 1, high);
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
      python: `def quick_sort(arr, low=0, high=None):
    if high is None:
        high = len(arr) - 1
    if low < high:
        pi = partition(arr, low, high)
        quick_sort(arr, low, pi - 1)
        quick_sort(arr, pi + 1, high)
    return arr

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

  {
    id: 'merge',
    title: 'Merge Sort',
    category: 'Sorting',
    categoryTag: 'Divide & Conquer',
    paradigm: 'Recursive Halving & Zipping',
    badgeColor: 'bg-[#f5dec5]',
    shortDesc: 'Split array into halves, recursively sort, and zip together seamlessly.',
    overview: 'Merge Sort is a classic divide-and-conquer algorithm invented by John von Neumann in 1945. It breaks down an array into single-element subarrays, and then repeatedly merges pairs of subarrays together in sorted order until only one completely sorted array remains.',
    timeBest: 'O(N log N)',
    timeAvg: 'O(N log N)',
    timeWorst: 'O(N log N)',
    space: 'O(N)',
    stable: true,
    hasLab: true,
    labCategory: 'sorting',
    howItWorks: [
      'Base condition: if array length ≤ 1, it is already sorted.',
      'Find midpoint: mid = floor(length / 2).',
      'Recursively sort left half: mergeSort(arr[0..mid]).',
      'Recursively sort right half: mergeSort(arr[mid..end]).',
      'Merge the two sorted halves into a single combined sorted list.'
    ],
    invariants: [
      'At each merge level, both input sublists are guaranteed to be sorted.',
      'Merging two sorted lists of size m and n takes strictly O(m + n) time.'
    ],
    pros: [
      'Guaranteed O(N log N) time complexity under all input orders (no worst-case degradation).',
      'Strictly stable sort: maintains ordering of identical keys.',
      'Ideal for external sorting (handling datasets too large to fit in RAM) and linked lists.'
    ],
    cons: [
      'Requires O(N) additional auxiliary space to merge array slices.',
      'Higher constant factors than Quick Sort on modern CPU caches.'
    ],
    realWorldUse: 'Core engine for Python/Java TimSort, database external disk sorting, and linked list sorting.',
    codeSnippets: {
      javascript: `function mergeSort(arr) {
  if (arr.length <= 1) return arr;
  const mid = Math.floor(arr.length / 2);
  const left = mergeSort(arr.slice(0, mid));
  const right = mergeSort(arr.slice(mid));
  return merge(left, right);
}

function merge(left, right) {
  const res = [];
  let i = 0, j = 0;
  while (i < left.length && j < right.length) {
    if (left[i] <= right[j]) res.push(left[i++]);
    else res.push(right[j++]);
  }
  return res.concat(left.slice(i)).concat(right.slice(j));
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

  {
    id: 'heap',
    title: 'Heap Sort',
    category: 'Sorting',
    categoryTag: 'Tree / Heap Sorting',
    paradigm: 'Priority Heap Structure',
    badgeColor: 'bg-[#cbe8e7]',
    shortDesc: 'Transform array into Max-Heap, repeatedly extract maximum to back.',
    overview: 'Heap Sort leverages the properties of a Binary Heap. It first rearranges the array into a Max-Heap in O(N) time. Then, it repeatedly swaps the root element (the maximum) with the last element in the unsorted partition, reduces the heap size, and sifts the new root down to restore the heap invariant.',
    timeBest: 'O(N log N)',
    timeAvg: 'O(N log N)',
    timeWorst: 'O(N log N)',
    space: 'O(1)',
    stable: false,
    hasLab: true,
    labCategory: 'sorting',
    howItWorks: [
      'Build a Max-Heap out of the input array by calling siftDown from index floor(n/2)-1 down to 0.',
      'Swap arr[0] (max) with arr[end].',
      'Decrement heap boundary (end = end - 1).',
      'Call siftDown(0) to restore the Max-Heap property at the root.',
      'Repeat until only one item remains in the heap.'
    ],
    invariants: [
      'During phase 2, arr[0..end] is always a valid Max-Heap, and arr[end+1..n-1] contains the sorted elements.'
    ],
    pros: [
      'Guaranteed O(N log N) worst-case time without any extra O(N) memory allocation (in-place O(1) space).',
      'Consistent performance with no risk of quadratic degradation.'
    ],
    cons: [
      'Poorer cache locality compared to QuickSort because heap children are located at 2i + 1 and 2i + 2 (jumping across memory).',
      'Not a stable sort.'
    ],
    realWorldUse: 'Critical mission-critical real-time systems (e.g. avionics, automotive ECUs) requiring strict upper bound execution times without heap allocation.',
    codeSnippets: {
      javascript: `function heapSort(arr) {
  const n = arr.length;
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) heapify(arr, n, i);
  for (let i = n - 1; i > 0; i--) {
    [arr[0], arr[i]] = [arr[i], arr[0]];
    heapify(arr, i, 0);
  }
  return arr;
}

function heapify(arr, n, i) {
  let largest = i;
  const l = 2 * i + 1;
  const r = 2 * i + 2;
  if (l < n && arr[l] > arr[largest]) largest = l;
  if (r < n && arr[r] > arr[largest]) largest = r;
  if (largest !== i) {
    [arr[i], arr[largest]] = [arr[largest], arr[i]];
    heapify(arr, n, largest);
  }
}`,
      python: `def heapify(arr, n, i):
    largest = i
    l = 2 * i + 1
    r = 2 * i + 2
    if l < n and arr[l] > arr[largest]:
        largest = l
    if r < n and arr[r] > arr[largest]:
        largest = r
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
  },

  // -------------------------------------------------------------
  // SEARCHING & POINTER ALGORITHMS
  // -------------------------------------------------------------
  {
    id: 'binary',
    title: 'Binary Search',
    category: 'Searching',
    categoryTag: 'Divide & Conquer Search',
    paradigm: 'Logarithmic Bisection',
    badgeColor: 'bg-[#d9e8df]',
    shortDesc: 'Halve the search space at every step by checking the middle element in a sorted list.',
    overview: 'Binary Search is an exceptionally efficient algorithm for locating a target value within a sorted array. It compares the target with the middle element: if equal, it halts; if smaller, it narrows search to the left half; if larger, it narrows to the right half, eliminating half the items in every single step.',
    timeBest: 'O(1)',
    timeAvg: 'O(log N)',
    timeWorst: 'O(log N)',
    space: 'O(1)',
    stable: true,
    hasLab: true,
    labCategory: 'search',
    howItWorks: [
      'Set search pointers: low = 0, high = n - 1.',
      'Compute midpoint: mid = floor((low + high) / 2).',
      'If arr[mid] === target, return mid.',
      'If arr[mid] < target, set low = mid + 1 to search right half.',
      'If arr[mid] > target, set high = mid - 1 to search left half.',
      'Repeat until low > high (target not found).'
    ],
    invariants: [
      'If target exists in the array, it must lie within the index interval [low..high].'
    ],
    pros: [
      'Logarithmic efficiency: searching 1,000,000 items takes at most 20 comparisons.',
      'Extremely lightweight O(1) space footprint.'
    ],
    cons: [
      'Strict prerequisite: requires array to already be sorted.',
      'Inefficient on linked lists due to lack of O(1) random index access.'
    ],
    realWorldUse: 'B-Tree database index searches, git bisect commit debugging, dictionary lookups.',
    codeSnippets: {
      javascript: `function binarySearch(arr, target) {
  let low = 0;
  let high = arr.length - 1;
  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    if (arr[mid] === target) return mid;
    else if (arr[mid] < target) low = mid + 1;
    else high = mid - 1;
  }
  return -1; // Not found
}`,
      python: `def binary_search(arr, target):
    low = 0
    high = len(arr) - 1
    while low <= high:
        mid = (low + high) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            low = mid + 1
        else:
            high = mid - 1
    return -1`,
      cpp: `int binarySearch(const vector<int>& arr, int target) {
    int low = 0, high = arr.size() - 1;
    while (low <= high) {
        int mid = low + (high - low) / 2;
        if (arr[mid] == target) return mid;
        else if (arr[mid] < target) low = mid + 1;
        else high = mid - 1;
    }
    return -1;
}`,
      java: `public static int binarySearch(int[] arr, int target) {
    int low = 0, high = arr.length - 1;
    while (low <= high) {
        int mid = low + (high - low) / 2;
        if (arr[mid] == target) return mid;
        else if (arr[mid] < target) low = mid + 1;
        else high = mid - 1;
    }
    return -1;
}`
    }
  },

  {
    id: 'twoPointers',
    title: 'Two Pointers (Container With Most Water)',
    category: 'Searching',
    categoryTag: 'Two Pointer Technique',
    paradigm: 'Greedy Convergence',
    badgeColor: 'bg-[#cbe8e7]',
    shortDesc: 'Move the shorter boundary inward to find maximum water holding capacity.',
    overview: 'The Two Pointer technique optimizes problems that would otherwise require nested O(N²) loops into linear O(N) passes. In the Container With Most Water problem, pointers start at opposing ends. At each step, the algorithm computes the water area and shifts the shorter wall inward.',
    timeBest: 'O(N)',
    timeAvg: 'O(N)',
    timeWorst: 'O(N)',
    space: 'O(1)',
    stable: true,
    hasLab: true,
    labCategory: 'search',
    howItWorks: [
      'Place Left pointer at index 0 and Right pointer at index n - 1.',
      'Compute area: (right - left) * min(height[left], height[right]).',
      'Record maxArea = max(maxArea, area).',
      'Move the pointer pointing to the shorter wall inward (left++ or right--).',
      'Repeat until left and right meet.'
    ],
    invariants: [
      'Moving the taller wall can never increase area, because width decreases and height is bounded by the shorter wall.'
    ],
    pros: [
      'Eliminates an entire loop dimension, turning O(N²) into O(N).',
      'Zero extra memory allocation (strictly O(1) space).'
    ],
    cons: [
      'Requires monotonic properties or clear bounding invariants to determine pointer movement.'
    ],
    realWorldUse: 'Computer vision boundary calculations, geometric hull optimizations, financial arbitrage windows.',
    codeSnippets: {
      javascript: `function maxArea(height) {
  let left = 0, right = height.length - 1;
  let max = 0;
  while (left < right) {
    const w = right - left;
    const h = Math.min(height[left], height[right]);
    max = Math.max(max, w * h);
    if (height[left] < height[right]) left++;
    else right--;
  }
  return max;
}`,
      python: `def max_area(height):
    left, right = 0, len(height) - 1
    max_water = 0
    while left < right:
        w = right - left
        h = min(height[left], height[right])
        max_water = max(max_water, w * h)
        if height[left] < height[right]:
            left += 1
        else:
            right -= 1
    return max_water`,
      cpp: `int maxArea(vector<int>& height) {
    int l = 0, r = height.size() - 1;
    int maxW = 0;
    while (l < r) {
        int w = r - l;
        int h = min(height[l], height[r]);
        maxW = max(maxW, w * h);
        if (height[l] < height[r]) l++;
        else r--;
    }
    return maxW;
}`,
      java: `public static int maxArea(int[] height) {
    int l = 0, r = height.length - 1;
    int maxW = 0;
    while (l < r) {
        int w = r - l;
        int h = Math.min(height[l], height[r]);
        maxW = Math.max(maxW, w * h);
        if (height[l] < height[r]) l++;
        else r--;
    }
    return maxW;
}`
    }
  },

  // -------------------------------------------------------------
  // GRAPH & PATHFINDING ALGORITHMS
  // -------------------------------------------------------------
  {
    id: 'dijkstra',
    title: "Dijkstra's Algorithm",
    category: 'Pathfinding',
    categoryTag: 'Weighted Graphs',
    paradigm: 'Greedy Relaxation',
    badgeColor: 'bg-[#f5dec5]',
    shortDesc: 'Greedy shortest path explorer using priority queues and distance relaxation.',
    overview: "Dijkstra's algorithm solves the single-source shortest path problem on graphs with non-negative edge weights. It iteratively selects the unvisited node with the smallest tentative distance, explores its neighbors, and updates ('relaxes') their tentative distances if a shorter path is found.",
    timeBest: 'O((V + E) log V)',
    timeAvg: 'O((V + E) log V)',
    timeWorst: 'O((V + E) log V)',
    space: 'O(V)',
    guaranteesShortest: true,
    hasLab: true,
    labCategory: 'pathfinding',
    howItWorks: [
      'Assign tentative distance 0 to start node, and infinity to all other nodes.',
      'Add all nodes to a priority queue keyed by tentative distance.',
      'Extract node u with minimum distance.',
      'For each unvisited neighbor v of u, calculate alternative distance: dist[u] + weight(u, v).',
      'If alternative < dist[v], relax: dist[v] = alternative, set parent[v] = u.',
      'Repeat until destination is extracted or all reachable nodes are visited.'
    ],
    invariants: [
      'When a node is finalized and removed from the priority queue, its tentative distance is guaranteed to be its true shortest path.'
    ],
    pros: [
      'Guarantees the optimal shortest path on any non-negative weighted graph.',
      'Extremely versatile for road maps, computer networks, and robotics.'
    ],
    cons: [
      'Cannot handle graphs with negative edge weights (requires Bellman-Ford).',
      'Explores in all directions equally without heuristic guidance (can visit many unnecessary nodes).'
    ],
    realWorldUse: 'OSPF internet routing protocol, Google Maps road navigation, flight connection planners.',
    codeSnippets: {
      javascript: `function dijkstra(graph, start) {
  const dist = {};
  const visited = new Set();
  for (const node in graph) dist[node] = Infinity;
  dist[start] = 0;

  while (visited.size < Object.keys(graph).length) {
    let u = null;
    let minDist = Infinity;
    for (const node in dist) {
      if (!visited.has(node) && dist[node] < minDist) {
        minDist = dist[node];
        u = node;
      }
    }
    if (u === null || minDist === Infinity) break;
    visited.add(u);

    for (const neighbor in graph[u]) {
      const weight = graph[u][neighbor];
      if (dist[u] + weight < dist[neighbor]) {
        dist[neighbor] = dist[u] + weight;
      }
    }
  }
  return dist;
}`,
      python: `import heapq

def dijkstra(graph, start):
    dist = {node: float('inf') for node in graph}
    dist[start] = 0
    pq = [(0, start)]

    while pq:
        d, u = heapq.heappop(pq)
        if d > dist[u]:
            continue
        for v, weight in graph[u].items():
            if dist[u] + weight < dist[v]:
                dist[v] = dist[u] + weight
                heapq.heappush(pq, (dist[v], v))
    return dist`,
      cpp: `vector<int> dijkstra(int V, vector<vector<pair<int, int>>>& adj, int S) {
    priority_queue<pair<int, int>, vector<pair<int, int>>, greater<>> pq;
    vector<int> dist(V, 1e9);
    dist[S] = 0;
    pq.push({0, S});

    while (!pq.empty()) {
        auto [d, u] = pq.top(); pq.pop();
        if (d > dist[u]) continue;
        for (auto [v, w] : adj[u]) {
            if (dist[u] + w < dist[v]) {
                dist[v] = dist[u] + w;
                pq.push({dist[v], v});
            }
        }
    }
    return dist;
}`,
      java: `public static int[] dijkstra(int V, List<List<int[]>> adj, int S) {
    PriorityQueue<int[]> pq = new PriorityQueue<>(Comparator.comparingInt(a -> a[1]));
    int[] dist = new int[V];
    Arrays.fill(dist, Integer.MAX_VALUE);
    dist[S] = 0;
    pq.offer(new int[]{S, 0});

    while (!pq.isEmpty()) {
        int[] curr = pq.poll();
        int u = curr[0], d = curr[1];
        if (d > dist[u]) continue;
        for (int[] edge : adj.get(u)) {
            int v = edge[0], w = edge[1];
            if (dist[u] + w < dist[v]) {
                dist[v] = dist[u] + w;
                pq.offer(new int[]{v, dist[v]});
            }
        }
    }
    return dist;
}`
    }
  },

  {
    id: 'astar',
    title: 'A* Search Algorithm',
    category: 'Pathfinding',
    categoryTag: 'Heuristic Search',
    paradigm: 'Best-First Exploration',
    badgeColor: 'bg-[#f5dec5]',
    shortDesc: 'Combines Dijkstra’s path cost g(n) with distance heuristic h(n) to home in on target.',
    overview: 'A* (A-Star) is one of the most successful pathfinding algorithms in AI, gaming, and robotics. It evaluates nodes using f(n) = g(n) + h(n), where g(n) is the actual cost from start to n, and h(n) is an admissible heuristic estimate of the cost from n to the goal.',
    timeBest: 'O(E)',
    timeAvg: 'O(E)',
    timeWorst: 'O(V + E)',
    space: 'O(V)',
    guaranteesShortest: true,
    hasLab: true,
    labCategory: 'pathfinding',
    howItWorks: [
      'Maintain an Open Set (frontier) and a Closed Set (explored).',
      'Select node n from Open Set with lowest f(n) = g(n) + h(n).',
      'If n is goal, reconstruct shortest path by following cameFrom pointers.',
      'Move n to Closed Set.',
      'For each neighbor m of n: compute tentative g = g(n) + cost(n, m).',
      'If tentative g < g(m), record cameFrom[m] = n, update g(m), and add m to Open Set.'
    ],
    invariants: [
      'If the heuristic h(n) is admissible (never overestimates the true cost) and consistent, A* is guaranteed to return the optimal shortest path.'
    ],
    pros: [
      'Substantially faster than Dijkstra because the heuristic steers the search directly toward the target.',
      'Guaranteed optimal shortest path when using admissible heuristics (like Manhattan or Euclidean distance).'
    ],
    cons: [
      'High memory usage because all explored nodes must be maintained in memory (unlike IDA*).'
    ],
    realWorldUse: 'Video game NPC pathfinding (StarCraft, Unreal Engine), autonomous drone navigation, automated warehouse robotics.',
    codeSnippets: {
      javascript: `function aStar(start, goal, heuristic, getNeighbors) {
  const openSet = [start];
  const cameFrom = new Map();
  const gScore = new Map([[start, 0]]);
  const fScore = new Map([[start, heuristic(start, goal)]]);

  while (openSet.length > 0) {
    openSet.sort((a, b) => (fScore.get(a) || Infinity) - (fScore.get(b) || Infinity));
    const current = openSet.shift();
    if (current === goal) return reconstructPath(cameFrom, current);

    for (const neighbor of getNeighbors(current)) {
      const tentativeG = (gScore.get(current) || 0) + 1;
      if (tentativeG < (gScore.get(neighbor) || Infinity)) {
        cameFrom.set(neighbor, current);
        gScore.set(neighbor, tentativeG);
        fScore.set(neighbor, tentativeG + heuristic(neighbor, goal));
        if (!openSet.includes(neighbor)) openSet.push(neighbor);
      }
    }
  }
  return null; // Path not found
}`,
      python: `import heapq

def a_star(start, goal, heuristic, get_neighbors):
    pq = [(heuristic(start, goal), 0, start, [start])]
    visited = set()

    while pq:
        f, g, current, path = heapq.heappop(pq)
        if current == goal:
            return path
        if current in visited:
            continue
        visited.add(current)

        for neighbor, weight in get_neighbors(current):
            if neighbor not in visited:
                new_g = g + weight
                new_f = new_g + heuristic(neighbor, goal)
                heapq.heappush(pq, (new_f, new_g, neighbor, path + [neighbor]))
    return None`,
      cpp: `// A* Search on Grid with Manhattan Heuristic
int heuristic(int r1, int c1, int r2, int c2) {
    return abs(r1 - r2) + abs(c1 - c2);
}`,
      java: `// A* Node priority implementation
class Node implements Comparable<Node> {
    int r, c, g, f;
    public int compareTo(Node o) { return Integer.compare(this.f, o.f); }
}`
    }
  },

  {
    id: 'bfs',
    title: 'Breadth-First Search (BFS)',
    category: 'Pathfinding',
    categoryTag: 'Unweighted Graphs',
    paradigm: 'Level-Order Traversal',
    badgeColor: 'bg-[#d9e8df]',
    shortDesc: 'Level-by-level ripple explorer using a FIFO Queue.',
    overview: 'Breadth-First Search traverses a graph in concentric ripples. Starting from a root node, it explores all neighbors at distance 1 before examining any neighbors at distance 2. This guarantees the shortest path on unweighted graphs.',
    timeBest: 'O(V + E)',
    timeAvg: 'O(V + E)',
    timeWorst: 'O(V + E)',
    space: 'O(V)',
    guaranteesShortest: true,
    hasLab: true,
    labCategory: 'pathfinding',
    howItWorks: [
      'Enqueue root node into a FIFO queue and mark it as visited.',
      'Dequeue front node u.',
      'If u is target, return path.',
      'For each neighbor v of u: if v is unvisited, mark visited, record parent[v] = u, and enqueue v.',
      'Repeat until queue is empty.'
    ],
    invariants: [
      'Nodes are visited in non-decreasing order of their distance from the source.'
    ],
    pros: [
      'Guarantees shortest path on unweighted graphs.',
      'Simple queue-based implementation without complex priority operations.'
    ],
    cons: [
      'Does not consider edge weights.',
      'High memory consumption on dense graphs with large branching factors.'
    ],
    realWorldUse: 'Social network friend recommendations (degrees of separation), peer-to-peer torrent peer discovery, web crawlers.',
    codeSnippets: {
      javascript: `function bfs(graph, start) {
  const visited = new Set([start]);
  const queue = [start];
  const order = [];

  while (queue.length > 0) {
    const node = queue.shift();
    order.push(node);
    for (const neighbor of graph[node] || []) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push(neighbor);
      }
    }
  }
  return order;
}`,
      python: `from collections import deque

def bfs(graph, start):
    visited = {start}
    queue = deque([start])
    order = []

    while queue:
        node = queue.popleft()
        order.append(node)
        for neighbor in graph.get(node, []):
            if neighbor not in visited:
                visited.add(neighbor)
                queue.append(neighbor)
    return order`,
      cpp: `vector<int> bfs(int V, vector<vector<int>>& adj, int start) {
    vector<bool> visited(V, false);
    queue<int> q;
    vector<int> res;

    visited[start] = true;
    q.push(start);
    while (!q.empty()) {
        int u = q.front(); q.pop();
        res.push_back(u);
        for (int v : adj[u]) {
            if (!visited[v]) {
                visited[v] = true;
                q.push(v);
            }
        }
    }
    return res;
}`,
      java: `public static List<Integer> bfs(int V, List<List<Integer>> adj, int start) {
    boolean[] visited = new boolean[V];
    Queue<Integer> q = new LinkedList<>();
    List<Integer> res = new ArrayList<>();

    visited[start] = true;
    q.offer(start);
    while (!q.isEmpty()) {
        int u = q.poll();
        res.add(u);
        for (int v : adj.get(u)) {
            if (!visited[v]) {
                visited[v] = true;
                q.offer(v);
            }
        }
    }
    return res;
}`
    }
  },

  {
    id: 'dfs',
    title: 'Depth-First Search (DFS)',
    category: 'Pathfinding',
    categoryTag: 'Graph Traversal',
    paradigm: 'Backtracking Recursion',
    badgeColor: 'bg-[#f5dec5]',
    shortDesc: 'Plunge deep along one path until blocked, then backtrack using LIFO recursion.',
    overview: 'Depth-First Search explores a graph by venturing as deep as possible along each branch before backtracking. It forms the algorithmic basis for topological sorting, cycle detection, strongly connected components, and solving mazes.',
    timeBest: 'O(V + E)',
    timeAvg: 'O(V + E)',
    timeWorst: 'O(V + E)',
    space: 'O(V)',
    guaranteesShortest: false,
    hasLab: true,
    labCategory: 'pathfinding',
    howItWorks: [
      'Mark current node as visited.',
      'For each adjacent unvisited neighbor, recursively call DFS.',
      'When all outgoing edges are explored, backtrack to the predecessor.'
    ],
    invariants: [
      'Every reachable node is visited exactly once.'
    ],
    pros: [
      'Memory efficient for sparse graphs (O(h) stack depth where h is tree height).',
      'Fundamental building block for cycle detection and topological sorting.'
    ],
    cons: [
      'Does NOT guarantee the shortest path.',
      'Risk of stack overflow on extremely deep graphs if recursion limit is exceeded.'
    ],
    realWorldUse: 'Compiler dependency resolution, circuit design deadlock detection, maze generation.',
    codeSnippets: {
      javascript: `function dfs(graph, start, visited = new Set()) {
  visited.add(start);
  const order = [start];
  for (const neighbor of graph[start] || []) {
    if (!visited.has(neighbor)) {
      order.push(...dfs(graph, neighbor, visited));
    }
  }
  return order;
}`,
      python: `def dfs(graph, node, visited=None):
    if visited is None:
        visited = set()
    visited.add(node)
    order = [node]
    for neighbor in graph.get(node, []):
        if neighbor not in visited:
            order.extend(dfs(graph, neighbor, visited))
    return order`,
      cpp: `void dfs(int u, vector<vector<int>>& adj, vector<bool>& visited, vector<int>& res) {
    visited[u] = true;
    res.push_back(u);
    for (int v : adj[u]) {
        if (!visited[v]) dfs(v, adj, visited, res);
    }
}`,
      java: `public static void dfs(int u, List<List<Integer>> adj, boolean[] visited, List<Integer> res) {
    visited[u] = true;
    res.add(u);
    for (int v : adj.get(u)) {
        if (!visited[v]) dfs(v, adj, visited, res);
    }
}`
    }
  },

  // -------------------------------------------------------------
  // DYNAMIC PROGRAMMING & BACKTRACKING
  // -------------------------------------------------------------
  {
    id: 'fibonacci',
    title: 'Fibonacci (Recursion vs DP Tabulation)',
    category: 'Dynamic Programming',
    categoryTag: 'Memoization & Tabulation',
    paradigm: 'Optimal Substructure',
    badgeColor: 'bg-[#f5dec5]',
    shortDesc: 'Transform an exponential call tree into linear time by memoizing subproblems.',
    overview: 'The Fibonacci sequence represents the textbook introduction to Dynamic Programming. While standard recursion evaluates the same subproblems repeatedly in an explosive O(2ⁿ) call tree, DP stores already-computed terms in a table, reducing time complexity to O(N).',
    timeBest: 'O(N)',
    timeAvg: 'O(N)',
    timeWorst: 'O(N)',
    space: 'O(1)',
    stable: true,
    hasLab: true,
    labCategory: 'dp',
    howItWorks: [
      'Base cases: dp[0] = 0, dp[1] = 1.',
      'For i from 2 to N: dp[i] = dp[i-1] + dp[i-2].',
      'Space optimization: keep only the two previous terms (prev1, prev2) to achieve O(1) memory.'
    ],
    invariants: [
      'At step i, dp[i] holds the exact i-th Fibonacci number computed from previously solved subproblems.'
    ],
    pros: [
      'Reduces calculation from trillions of redundant operations to a simple single loop.',
      'Demonstrates the two core tenets of DP: Overlapping Subproblems and Optimal Substructure.'
    ],
    cons: [
      'Requires identifying the recurrence relation.'
    ],
    realWorldUse: 'Financial compound interest models, population biology modeling, DP transition foundations.',
    codeSnippets: {
      javascript: `// O(N) Time, O(1) Space Tabulation
function fibonacci(n) {
  if (n <= 1) return n;
  let prev2 = 0, prev1 = 1;
  for (let i = 2; i <= n; i++) {
    const curr = prev1 + prev2;
    prev2 = prev1;
    prev1 = curr;
  }
  return prev1;
}`,
      python: `def fibonacci(n):
    if n <= 1:
        return n
    prev2, prev1 = 0, 1
    for _ in range(2, n + 1):
        prev2, prev1 = prev1, prev1 + prev2
    return prev1`,
      cpp: `int fibonacci(int n) {
    if (n <= 1) return n;
    int prev2 = 0, prev1 = 1;
    for (int i = 2; i <= n; i++) {
        int curr = prev1 + prev2;
        prev2 = prev1;
        prev1 = curr;
    }
    return prev1;
}`,
      java: `public static int fibonacci(int n) {
    if (n <= 1) return n;
    int prev2 = 0, prev1 = 1;
    for (int i = 2; i <= n; i++) {
        int curr = prev1 + prev2;
        prev2 = prev1;
        prev1 = curr;
    }
    return prev1;
}`
    }
  },

  {
    id: 'knapsack',
    title: '0/1 Knapsack Problem (2D DP)',
    category: 'Dynamic Programming',
    categoryTag: 'Subset Optimization',
    paradigm: '2D State Space Tabulation',
    badgeColor: 'bg-[#f5dec5]',
    shortDesc: 'Maximize value packed into a weight-constrained knapsack without item duplication.',
    overview: 'The 0/1 Knapsack problem is the gold standard 2D Dynamic Programming challenge. Given a set of items, each with a weight and value, determine the combination of items that maximizes total value without exceeding capacity W. Because items cannot be broken into fractions (0 or 1 choice), greedy approaches fail and dynamic programming is required.',
    timeBest: 'O(N × W)',
    timeAvg: 'O(N × W)',
    timeWorst: 'O(N × W)',
    space: 'O(N × W)',
    stable: true,
    hasLab: true,
    labCategory: 'dp',
    howItWorks: [
      'Create a 2D table dp[0..n][0..W] where dp[i][w] represents the maximum value using a subset of the first i items with weight limit w.',
      'Base cases: dp[0][w] = 0 (no items) and dp[i][0] = 0 (zero capacity).',
      'For item i with weight wt and value val:',
      'If wt > w: cannot include item i, so dp[i][w] = dp[i-1][w] (leave item).',
      'Otherwise: dp[i][w] = max(dp[i-1][w], val + dp[i-1][w - wt]) (max of leaving vs taking).',
      'Backtrack from dp[n][W] to trace exactly which items were selected in the optimal pack.'
    ],
    invariants: [
      'Cell dp[i][w] always holds the globally optimal value for the subproblem considering the first i items and weight bound w.'
    ],
    pros: [
      'Guarantees the exact globally optimal subset of items.',
      'Pseudo-polynomial runtime O(N × W) is blazing fast for practical capacities W.'
    ],
    cons: [
      'O(N × W) space complexity (though can be optimized to O(W) using a 1D rolling array).',
      'NP-complete problem; runtime degrades if capacity W is exponentially large.'
    ],
    realWorldUse: 'Resource allocation in cloud scheduling, cargo ship container packing, budget portfolio optimization.',
    codeSnippets: {
      javascript: `function knapsack(weights, values, W) {
  const n = weights.length;
  const dp = Array.from({ length: n + 1 }, () => Array(W + 1).fill(0));

  for (let i = 1; i <= n; i++) {
    const wt = weights[i - 1];
    const val = values[i - 1];
    for (let w = 0; w <= W; w++) {
      if (wt <= w) {
        dp[i][w] = Math.max(dp[i - 1][w], val + dp[i - 1][w - wt]);
      } else {
        dp[i][w] = dp[i - 1][w];
      }
    }
  }
  return dp[n][W];
}`,
      python: `def knapsack(weights, values, W):
    n = len(weights)
    dp = [[0] * (W + 1) for _ in range(n + 1)]

    for i in range(1, n + 1):
        wt = weights[i - 1]
        val = values[i - 1]
        for w in range(W + 1):
            if wt <= w:
                dp[i][w] = max(dp[i - 1][w], val + dp[i - 1][w - wt])
            else:
                dp[i][w] = dp[i - 1][w]

    return dp[n][W]`,
      cpp: `int knapsack(const vector<int>& weights, const vector<int>& values, int W) {
    int n = weights.size();
    vector<vector<int>> dp(n + 1, vector<int>(W + 1, 0));

    for (int i = 1; i <= n; i++) {
        int wt = weights[i - 1];
        int val = values[i - 1];
        for (int w = 0; w <= W; w++) {
            if (wt <= w) {
                dp[i][w] = max(dp[i - 1][w], val + dp[i - 1][w - wt]);
            } else {
                dp[i][w] = dp[i - 1][w];
            }
        }
    }
    return dp[n][W];
}`,
      java: `public static int knapsack(int[] weights, int[] values, int W) {
    int n = weights.length;
    int[][] dp = new int[n + 1][W + 1];

    for (int i = 1; i <= n; i++) {
        int wt = weights[i - 1];
        int val = values[i - 1];
        for (int w = 0; w <= W; w++) {
            if (wt <= w) {
                dp[i][w] = Math.max(dp[i - 1][w], val + dp[i - 1][w - wt]);
            } else {
                dp[i][w] = dp[i - 1][w];
            }
        }
    }
    return dp[n][W];
}`
    }
  },

  {
    id: 'nqueens',
    title: 'N-Queens (Backtracking)',
    category: 'Backtracking',
    categoryTag: 'Constraint Satisfaction',
    paradigm: 'Pruned State Space Search',
    badgeColor: 'bg-[#cbe8e7]',
    shortDesc: 'Place N queens on an N×N board such that no two queens attack each other.',
    overview: 'The N-Queens problem is the quintessential backtracking puzzle. It asks to place N chess queens on an N×N board such that no two queens share the same row, column, or diagonal. The backtracking algorithm systematically tries candidate columns row-by-row, immediately abandoning (pruning) branches that cause conflicts.',
    timeBest: 'O(N!)',
    timeAvg: 'O(N!)',
    timeWorst: 'O(N!)',
    space: 'O(N)',
    stable: true,
    hasLab: true,
    labCategory: 'backtrack',
    howItWorks: [
      'Start in the first row (row 0).',
      'Iterate through columns 0 to N - 1 in the current row.',
      'Check if placing queen at (row, col) is attacked by earlier queens along column or diagonals.',
      'If safe, record placement and recursively proceed to row + 1.',
      'If row === N, a full solution is found.',
      'If all columns in a row fail, backtrack to previous row and try next column.'
    ],
    invariants: [
      'At row k, queens in rows 0..k-1 never attack one another.'
    ],
    pros: [
      'Prunes massive portions of the search tree early, saving billions of useless states.',
      'Guarantees finding all valid solutions.'
    ],
    cons: [
      'Factorial O(N!) worst-case bound makes it intractable for very large boards without SAT solvers.'
    ],
    realWorldUse: 'VLSI chip layout gate placement, compiler register allocation, satellite scheduling.',
    codeSnippets: {
      javascript: `function solveNQueens(n) {
  const result = [];
  const board = Array(n).fill(-1);

  function isSafe(row, col) {
    for (let r = 0; r < row; r++) {
      const c = board[r];
      if (c === col || Math.abs(c - col) === Math.abs(r - row)) return false;
    }
    return true;
  }

  function backtrack(row) {
    if (row === n) {
      result.push([...board]);
      return;
    }
    for (let col = 0; col < n; col++) {
      if (isSafe(row, col)) {
        board[row] = col;
        backtrack(row + 1);
        board[row] = -1; // Backtrack
      }
    }
  }

  backtrack(0);
  return result;
}`,
      python: `def solve_n_queens(n):
    solutions = []
    board = [-1] * n

    def is_safe(row, col):
        for r in range(row):
            c = board[r]
            if c == col or abs(c - col) == abs(r - row):
                return False
        return True

    def backtrack(row):
        if row == n:
            solutions.append(list(board))
            return
        for col in range(n):
            if is_safe(row, col):
                board[row] = col
                backtrack(row + 1)
                board[row] = -1

    backtrack(0)
    return solutions`,
      cpp: `bool isSafe(int row, int col, const vector<int>& board) {
    for (int r = 0; r < row; r++) {
        int c = board[r];
        if (c == col || abs(c - col) == abs(r - row)) return false;
    }
    return true;
}`,
      java: `public static boolean isSafe(int row, int col, int[] board) {
    for (int r = 0; r < row; r++) {
        int c = board[r];
        if (c == col || Math.abs(c - col) == Math.abs(r - row)) return false;
    }
    return true;
}`
    }
  }
];
