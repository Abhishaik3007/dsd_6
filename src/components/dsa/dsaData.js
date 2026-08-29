import { 
  Binary, GitCommit, Layers, BarChart2, Hash, GitBranch, Cpu, Network, 
  ArrowDownUp, Link, Shuffle, CircleDot, Database, Workflow
} from 'lucide-react';

export const DATA_STRUCTURES_DATA = [
  // ═══════════════════════════════════════════
  //  LINEAR DATA STRUCTURES
  // ═══════════════════════════════════════════
  {
    id: 'array',
    title: 'Array & Dynamic Array',
    category: 'Linear',
    categoryTag: 'Contiguous Memory',
    icon: Binary,
    iconColor: '#60a5fa',
    bgColor: 'bg-[#D8E6DD]',
    diagramType: 'array',
    shortDesc: 'Contiguous block of memory providing O(1) constant-time element indexing.',
    overview: 'An Array is the most fundamental data structure in computing. Think of it like a row of numbered lockers in a hallway — each locker has a fixed position (index), and you can instantly open any locker if you know its number. Because elements sit side-by-side in RAM, the CPU can jump directly to any element using simple math.',
    
    detailedTheory: {
      mechanics: 'Elements in an array are stored in consecutive memory slots. Given a base address B, element size S, and target index i, the exact RAM address is calculated instantly via: Address(i) = B + (i × S). This single multiplication + addition makes array access the fastest possible data retrieval operation in computing.',
      memoryModel: 'Static arrays allocate a fixed-size block at compile time. Dynamic Arrays (JavaScript Array, Python list, C++ std::vector) start with an initial capacity buffer. When full, a new buffer of 2× capacity is allocated, all elements are copied over, and the old memory is freed. This "doubling strategy" gives amortized O(1) append performance.',
      operations: [
        { name: 'Access by Index', time: 'O(1)', desc: 'Instant lookup — CPU computes the memory address directly from the index number.' },
        { name: 'Linear Search', time: 'O(n)', desc: 'Check each element one by one from index 0 to n-1 until the target is found.' },
        { name: 'Binary Search', time: 'O(log n)', desc: 'Only works on sorted arrays. Repeatedly halves the search range by comparing the middle element.' },
        { name: 'Insert at Middle', time: 'O(n)', desc: 'Must shift all subsequent elements one position right to create space for the new element.' }
      ],
      tradeoffs: [
        { pro: 'O(1) instant element access by index — the fastest data lookup possible.' },
        { pro: 'Excellent CPU cache utilization because elements are stored side-by-side in memory.' },
        { con: 'Inserting or deleting in the middle requires shifting O(n) elements.' },
        { con: 'Resizing a dynamic array occasionally triggers an expensive O(n) memory copy.' }
      ]
    },

    realWorldUseCases: [
      'Image pixel framebuffers — each pixel stored as RGB values in a contiguous array',
      'Spreadsheet cell grids — rows and columns mapped to 2D array indices',
      'Audio sample buffers in music players and DAWs',
      'GPU vertex buffers for 3D graphics rendering pipelines'
    ],
    complexity: {
      access: { time: 'O(1)', space: 'O(1)' },
      search: { time: 'O(n)', space: 'O(1)' },
      insertHead: { time: 'O(n)', space: 'O(1)' },
      insertTail: { time: 'O(1) amortized', space: 'O(1)' },
      deleteHead: { time: 'O(n)', space: 'O(1)' },
      deletePos: { time: 'O(n)', space: 'O(1)' },
    },
    codeSnippets: {
      javascript: `// Binary Search on a Sorted Array
function binarySearch(arr, target) {
  let low = 0, high = arr.length - 1;
  while (low <= high) {
    let mid = Math.floor((low + high) / 2);
    if (arr[mid] === target) return mid;
    if (arr[mid] < target) low = mid + 1;
    else high = mid - 1;
  }
  return -1;
}`,
      python: `def binary_search(arr, target):
    low, high = 0, len(arr) - 1
    while low <= high:
        mid = (low + high) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            low = mid + 1
        else:
            high = mid - 1
    return -1`,
      cpp: `int binarySearch(int arr[], int n, int target) {
    int low = 0, high = n - 1;
    while (low <= high) {
        int mid = low + (high - low) / 2;
        if (arr[mid] == target) return mid;
        if (arr[mid] < target) low = mid + 1;
        else high = mid - 1;
    }
    return -1;
}`
    }
  },
  {
    id: 'linked-list',
    title: 'Singly Linked List',
    category: 'Linear',
    categoryTag: 'Linear Structure',
    icon: GitCommit,
    iconColor: '#fbbf24',
    bgColor: 'bg-[#F4DFC9]',
    diagramType: 'linked-list',
    shortDesc: 'Sequential collection of nodes connected by unidirectional memory pointers.',
    overview: 'Imagine a treasure hunt where each clue tells you where the next clue is hidden. A Singly Linked List works the same way — each node holds a value and a pointer to the next node. You start at the "head" and follow pointers until you reach NULL (the end). Unlike arrays, nodes can live anywhere in memory.',
    
    detailedTheory: {
      mechanics: 'Each node is an independent object on the heap containing two fields: a data payload and a "next" pointer (a 64-bit memory address). To traverse the list, you start at the head pointer and follow each node\'s next reference. There is no index-based math — you must walk the chain.',
      memoryModel: 'Nodes are allocated individually on the heap, so they can be scattered anywhere in RAM. This means no wasted pre-allocated space (unlike arrays), but the CPU cannot efficiently cache-prefetch the next node since its address is unpredictable. Each pointer costs 8 bytes of overhead per node.',
      operations: [
        { name: 'Insert at Head', time: 'O(1)', desc: 'Create a new node, point its next to the current head, then update head to the new node. Just two pointer changes!' },
        { name: 'Insert at Tail', time: 'O(n)', desc: 'Walk from head to the last node (where next == NULL), then set its next to the new node.' },
        { name: 'Delete a Node', time: 'O(n)', desc: 'Find the node before the target, update its next pointer to skip over the target, then free the target node.' },
        { name: 'Search', time: 'O(n)', desc: 'Start at head, check each node\'s value. If found, return it. If you hit NULL, the value doesn\'t exist.' }
      ],
      tradeoffs: [
        { pro: 'O(1) insertion and deletion at the head — no shifting needed.' },
        { pro: 'Grows dynamically — no need to pre-allocate or resize memory.' },
        { con: 'No random access — reaching index i requires traversing i nodes from head.' },
        { con: 'Extra 8 bytes per node for the pointer — significant overhead for small data.' }
      ]
    },

    realWorldUseCases: [
      'Undo/Redo history buffers in text editors and IDEs',
      'Music player playlists — each track points to the next track',
      'Browser back-forward page navigation chains',
      'Operating system memory allocation free lists (slab allocators)'
    ],
    complexity: {
      access: { time: 'O(n)', space: 'O(1)' },
      search: { time: 'O(n)', space: 'O(1)' },
      insertHead: { time: 'O(1)', space: 'O(1)' },
      insertTail: { time: 'O(n)', space: 'O(1)' },
      deleteHead: { time: 'O(1)', space: 'O(1)' },
      deletePos: { time: 'O(n)', space: 'O(1)' },
    },
    codeSnippets: {
      javascript: `class Node {
  constructor(data) {
    this.data = data;
    this.next = null;
  }
}

class LinkedList {
  constructor() {
    this.head = null;
  }

  insertAtHead(val) {
    const newNode = new Node(val);
    newNode.next = this.head;
    this.head = newNode;
  }

  insertAtPosition(val, pos) {
    if (pos === 0) return this.insertAtHead(val);
    let curr = this.head;
    let index = 0;
    while (curr && index < pos - 1) {
      curr = curr.next;
      index++;
    }
    if (!curr) return;
    const newNode = new Node(val);
    newNode.next = curr.next;
    curr.next = newNode;
  }
}`,
      python: `class Node:
    def __init__(self, data):
        self.data = data
        self.next = None

class LinkedList:
    def __init__(self):
        self.head = None

    def insert_head(self, val):
        new_node = Node(val)
        new_node.next = self.head
        self.head = new_node

    def search(self, val):
        curr = self.head
        while curr:
            if curr.data == val:
                return True
            curr = curr.next
        return False`,
      cpp: `struct Node {
    int data;
    Node* next;
    Node(int val) : data(val), next(nullptr) {}
};

class LinkedList {
public:
    Node* head = nullptr;

    void insertHead(int val) {
        Node* newNode = new Node(val);
        newNode->next = head;
        head = newNode;
    }
};`
    }
  },
  {
    id: 'doubly-linked-list',
    title: 'Doubly Linked List',
    category: 'Linear',
    categoryTag: 'Bidirectional',
    icon: Link,
    iconColor: '#f59e0b',
    bgColor: 'bg-[#FEF3C7]',
    diagramType: 'doubly-linked-list',
    shortDesc: 'Each node has two pointers — one to the next node and one to the previous, enabling backward traversal.',
    overview: 'A Doubly Linked List is like a two-way street compared to the one-way street of a Singly Linked List. Each node stores a "prev" pointer in addition to "next", so you can walk both forward AND backward through the list. This extra pointer costs more memory but unlocks powerful operations.',
    
    detailedTheory: {
      mechanics: 'Each node contains three fields: data, a "next" pointer, and a "prev" pointer. The head node\'s prev is NULL, and the tail node\'s next is NULL. This bidirectional linking means you can reach any node\'s predecessor in O(1) — something impossible with a singly linked list.',
      memoryModel: 'Each node now uses 16 bytes of pointer overhead (two 8-byte pointers) instead of 8. The trade-off is worthwhile when you frequently need to delete a node you already have a reference to, or traverse backward. Most real-world linked list implementations (Java LinkedList, Python deque) use doubly linked lists internally.',
      operations: [
        { name: 'Insert at Head/Tail', time: 'O(1)', desc: 'Update prev/next pointers on the new node and its neighbor. Both ends are O(1) since we track head AND tail.' },
        { name: 'Delete Known Node', time: 'O(1)', desc: 'If you already have a reference to the node, just update its neighbors\' pointers — no traversal needed!' },
        { name: 'Reverse Traversal', time: 'O(n)', desc: 'Start from tail and follow prev pointers. Impossible with singly linked lists.' },
        { name: 'Search', time: 'O(n)', desc: 'Same as singly linked list — must walk the chain from one end.' }
      ],
      tradeoffs: [
        { pro: 'O(1) deletion when you have a direct reference to the node to remove.' },
        { pro: 'Can traverse both forward and backward through the list.' },
        { con: 'Double the pointer overhead — 16 bytes vs 8 bytes per node.' },
        { con: 'More complex insertion/deletion logic since two pointers must be maintained.' }
      ]
    },

    realWorldUseCases: [
      'Browser history — back/forward navigation needs bidirectional traversal',
      'LRU (Least Recently Used) caches in databases and web frameworks',
      'Text editor cursor movement — moving left/right through characters',
      'Music player with Previous/Next track controls'
    ],
    complexity: {
      access: { time: 'O(n)', space: 'O(1)' },
      search: { time: 'O(n)', space: 'O(1)' },
      insertHead: { time: 'O(1)', space: 'O(1)' },
      insertTail: { time: 'O(1)', space: 'O(1)' },
      deleteHead: { time: 'O(1)', space: 'O(1)' },
      deletePos: { time: 'O(n)', space: 'O(1)' },
    },
    codeSnippets: {
      javascript: `class DNode {
  constructor(data) {
    this.data = data;
    this.prev = null;
    this.next = null;
  }
}

class DoublyLinkedList {
  constructor() {
    this.head = null;
    this.tail = null;
  }

  insertAtTail(val) {
    const node = new DNode(val);
    if (!this.tail) {
      this.head = this.tail = node;
    } else {
      node.prev = this.tail;
      this.tail.next = node;
      this.tail = node;
    }
  }

  deleteNode(node) {
    if (node.prev) node.prev.next = node.next;
    else this.head = node.next;
    if (node.next) node.next.prev = node.prev;
    else this.tail = node.prev;
  }
}`,
      python: `class DNode:
    def __init__(self, data):
        self.data = data
        self.prev = None
        self.next = None

class DoublyLinkedList:
    def __init__(self):
        self.head = None
        self.tail = None

    def insert_tail(self, val):
        node = DNode(val)
        if not self.tail:
            self.head = self.tail = node
        else:
            node.prev = self.tail
            self.tail.next = node
            self.tail = node`,
      cpp: `struct DNode {
    int data;
    DNode *prev, *next;
    DNode(int v) : data(v), prev(nullptr), next(nullptr) {}
};

class DoublyLinkedList {
public:
    DNode *head = nullptr, *tail = nullptr;

    void insertTail(int val) {
        DNode* node = new DNode(val);
        if (!tail) { head = tail = node; return; }
        node->prev = tail;
        tail->next = node;
        tail = node;
    }
};`
    }
  },
  {
    id: 'stack',
    title: 'Stack (LIFO)',
    category: 'Linear',
    categoryTag: 'LIFO Frame',
    icon: Layers,
    iconColor: '#34d399',
    bgColor: 'bg-[#E2DEEE]',
    diagramType: 'stack',
    shortDesc: 'Last-In, First-Out collection — like a stack of plates where you can only touch the top.',
    overview: 'Imagine stacking plates in a cafeteria — you always place a new plate on top, and always grab the top plate first. A Stack works exactly this way. The last item you added (pushed) is always the first item you remove (pop). This simple constraint makes stacks incredibly useful for tracking "what was I doing before this?"',
    
    detailedTheory: {
      mechanics: 'A Stack has one access point: the "top". Push adds an element above the current top. Pop removes and returns the top element. Peek lets you look at the top without removing it. All three operations are O(1) — no searching or shifting required.',
      memoryModel: 'Can be implemented with an array (top = index of last element) or a linked list (push/pop at head). Array-based stacks are more common because of better cache performance. The function call stack in your CPU uses hardware-level stack mechanics for every function call.',
      operations: [
        { name: 'Push', time: 'O(1)', desc: 'Place new element on top. Like putting a new plate on the stack.' },
        { name: 'Pop', time: 'O(1)', desc: 'Remove and return the top element. Like taking the top plate off.' },
        { name: 'Peek / Top', time: 'O(1)', desc: 'Look at what\'s on top without removing it.' }
      ],
      tradeoffs: [
        { pro: 'All operations are guaranteed O(1) constant time.' },
        { pro: 'Perfect for tracking nested or recursive operations (function calls, undo history).' },
        { con: 'Cannot access elements in the middle or bottom without popping everything above.' }
      ]
    },

    realWorldUseCases: [
      'Function Call Stack — every time you call a function, a stack frame is pushed',
      'Undo operations — each action is pushed; pressing Ctrl+Z pops the last one',
      'Parenthesis/bracket matching in code editors and compilers',
      'Depth-First Search (DFS) algorithm uses a stack to track unvisited nodes'
    ],
    complexity: {
      access: { time: 'O(n)', space: 'O(1)' },
      search: { time: 'O(n)', space: 'O(1)' },
      insertHead: { time: 'O(1)', space: 'O(1)' },
      insertTail: { time: 'O(1)', space: 'O(1)' },
      deleteHead: { time: 'O(1)', space: 'O(1)' },
      deletePos: { time: 'O(1)', space: 'O(1)' },
    },
    codeSnippets: {
      javascript: `class Stack {
  constructor() { this.items = []; }

  push(element) { this.items.push(element); }
  pop() { return this.items.pop(); }
  peek() { return this.items[this.items.length - 1]; }
  isEmpty() { return this.items.length === 0; }
  size() { return this.items.length; }
}

// Example: Check balanced parentheses
function isBalanced(str) {
  const stack = new Stack();
  for (const ch of str) {
    if (ch === '(') stack.push(ch);
    else if (ch === ')') {
      if (stack.isEmpty()) return false;
      stack.pop();
    }
  }
  return stack.isEmpty();
}`,
      python: `class Stack:
    def __init__(self):
        self.items = []

    def push(self, val):
        self.items.append(val)

    def pop(self):
        return self.items.pop()

    def peek(self):
        return self.items[-1]

    def is_empty(self):
        return len(self.items) == 0

# Example: Reverse a string using a stack
def reverse_string(s):
    stack = Stack()
    for ch in s:
        stack.push(ch)
    return ''.join(stack.pop() for _ in range(len(s)))`,
      cpp: `#include <stack>
#include <string>
using namespace std;

// Check balanced parentheses
bool isBalanced(const string& str) {
    stack<char> s;
    for (char ch : str) {
        if (ch == '(') s.push(ch);
        else if (ch == ')') {
            if (s.empty()) return false;
            s.pop();
        }
    }
    return s.empty();
}`
    }
  },
  {
    id: 'queue',
    title: 'Queue (FIFO)',
    category: 'Linear',
    categoryTag: 'FIFO Queue',
    icon: BarChart2,
    iconColor: '#c084fc',
    bgColor: 'bg-[#F4DFC9]',
    diagramType: 'queue',
    shortDesc: 'First-In, First-Out — like a line at a coffee shop where the first person in line gets served first.',
    overview: 'A Queue works like any real-world queue — at a coffee shop, bank, or ticket counter. The first person to join the line is the first person served. Elements enter at the back (enqueue) and leave from the front (dequeue). This fairness principle is essential for orderly processing.',
    
    detailedTheory: {
      mechanics: 'A Queue has two ends: the "front" (where elements leave) and the "rear" (where elements enter). Enqueue adds to the rear. Dequeue removes from the front. A Circular Queue uses a fixed-size array with wrap-around indices to avoid wasting space.',
      memoryModel: 'Can be implemented with a linked list (enqueue at tail, dequeue at head — both O(1)) or a circular array with front/rear index pointers. JavaScript\'s Array.shift() is O(n) because it re-indexes everything, so serious queue implementations use linked lists or ring buffers.',
      operations: [
        { name: 'Enqueue', time: 'O(1)', desc: 'Add a new element to the back of the queue. Like a person joining the end of the line.' },
        { name: 'Dequeue', time: 'O(1)', desc: 'Remove and return the front element. Like the next person being served.' },
        { name: 'Peek / Front', time: 'O(1)', desc: 'See who\'s next in line without actually serving them.' }
      ],
      tradeoffs: [
        { pro: 'Guarantees fairness — first come, first served ordering.' },
        { pro: 'O(1) enqueue and dequeue with linked list or circular buffer implementation.' },
        { con: 'No random access — you can only look at the front element.' },
        { con: 'Naive array implementation has O(n) dequeue due to element shifting.' }
      ]
    },

    realWorldUseCases: [
      'Print job queues — documents print in the order they were submitted',
      'CPU task scheduling — processes execute in FIFO order in a round-robin scheduler',
      'Message queues (RabbitMQ, Kafka) — messages processed in arrival order',
      'Breadth-First Search (BFS) — explores graph nodes level by level using a queue'
    ],
    complexity: {
      access: { time: 'O(n)', space: 'O(1)' },
      search: { time: 'O(n)', space: 'O(1)' },
      insertHead: { time: 'O(1)', space: 'O(1)' },
      insertTail: { time: 'O(1)', space: 'O(1)' },
      deleteHead: { time: 'O(1)', space: 'O(1)' },
      deletePos: { time: 'O(1)', space: 'O(1)' },
    },
    codeSnippets: {
      javascript: `class Queue {
  constructor() {
    this.items = {};
    this.front = 0;
    this.rear = 0;
  }

  enqueue(val) {
    this.items[this.rear] = val;
    this.rear++;
  }

  dequeue() {
    const item = this.items[this.front];
    delete this.items[this.front];
    this.front++;
    return item;
  }

  peek() { return this.items[this.front]; }
  isEmpty() { return this.rear === this.front; }
  size() { return this.rear - this.front; }
}`,
      python: `from collections import deque

# Python's deque is optimized for both ends
queue = deque()

queue.append(10)    # enqueue
queue.append(20)
queue.append(30)

val = queue.popleft()  # dequeue → 10 (FIFO)

# For thread-safe queues:
from queue import Queue
q = Queue()
q.put(42)
val = q.get()`,
      cpp: `#include <queue>
using namespace std;

queue<int> q;
q.push(10);   // enqueue
q.push(20);
q.push(30);

int front = q.front();  // peek → 10
q.pop();                 // dequeue → removes 10`
    }
  },

  // ═══════════════════════════════════════════
  //  NON-LINEAR DATA STRUCTURES
  // ═══════════════════════════════════════════
  {
    id: 'tree',
    title: 'Binary Search Tree',
    category: 'Non-Linear',
    categoryTag: 'Hierarchical',
    icon: GitBranch,
    iconColor: '#fb923c',
    bgColor: 'bg-[#D8E6DD]',
    diagramType: 'tree',
    shortDesc: 'A tree where every node\'s left children are smaller and right children are larger — enabling fast search.',
    overview: 'Imagine a decision tree: "Is the number I\'m looking for bigger or smaller than this one?" At each node you make one comparison and eliminate half the remaining possibilities. A Binary Search Tree (BST) organizes data so that left children are always smaller and right children are always larger than their parent.',
    
    detailedTheory: {
      mechanics: 'Each node holds a value and two child pointers: left and right. The BST invariant states: for any node N, every value in N\'s left subtree < N\'s value < every value in N\'s right subtree. Searching is like playing a guessing game — at each node, you go left if your target is smaller, right if larger.',
      memoryModel: 'Nodes live on the heap connected via structural pointers. An Inorder Traversal (Left → Root → Right) visits all nodes in sorted ascending order — a powerful property. The tree\'s height determines performance: a balanced tree has height log(n), but a skewed tree degrades to height n (basically a linked list).',
      operations: [
        { name: 'Search', time: 'O(log n) avg', desc: 'Compare target with current node. Go left if smaller, right if larger. Halves the search space at each step.' },
        { name: 'Insert', time: 'O(log n) avg', desc: 'Search for where the value belongs, then attach a new node at that empty spot.' },
        { name: 'Inorder Traversal', time: 'O(n)', desc: 'Visit Left → Root → Right. Produces all values in sorted ascending order.' },
        { name: 'Delete', time: 'O(log n) avg', desc: 'Three cases: leaf node (easy), one child (replace), two children (find inorder successor).' }
      ],
      tradeoffs: [
        { pro: 'O(log n) search, insert, and delete on balanced trees — very fast.' },
        { pro: 'Inorder traversal gives sorted output without needing a separate sort step.' },
        { con: 'Worst case O(n) if the tree becomes skewed (e.g., inserting sorted data).' },
        { con: 'Self-balancing variants (AVL, Red-Black) add complexity to maintain balance.' }
      ]
    },

    realWorldUseCases: [
      'Database indexing — B-Trees (a BST variant) power MySQL and PostgreSQL indexes',
      'File system directory structures — hierarchical parent-child organization',
      'Compiler Abstract Syntax Trees (AST) — parsing code into a tree of operations',
      'Auto-complete and spell-check systems using Trie trees (a specialized tree)'
    ],
    complexity: {
      access: { time: 'O(log n)', space: 'O(1)' },
      search: { time: 'O(log n)', space: 'O(1)' },
      insertHead: { time: 'O(log n)', space: 'O(1)' },
      insertTail: { time: 'O(log n)', space: 'O(1)' },
      deleteHead: { time: 'O(log n)', space: 'O(1)' },
      deletePos: { time: 'O(log n)', space: 'O(1)' },
    },
    codeSnippets: {
      javascript: `class TreeNode {
  constructor(val) {
    this.val = val;
    this.left = null;
    this.right = null;
  }
}

function insert(root, val) {
  if (!root) return new TreeNode(val);
  if (val < root.val) root.left = insert(root.left, val);
  else if (val > root.val) root.right = insert(root.right, val);
  return root;
}

function search(root, target) {
  if (!root) return false;
  if (target === root.val) return true;
  if (target < root.val) return search(root.left, target);
  return search(root.right, target);
}

// Inorder traversal → sorted order
function inorder(root, result = []) {
  if (!root) return result;
  inorder(root.left, result);
  result.push(root.val);
  inorder(root.right, result);
  return result;
}`,
      python: `class TreeNode:
    def __init__(self, val):
        self.val = val
        self.left = None
        self.right = None

def insert(root, val):
    if not root:
        return TreeNode(val)
    if val < root.val:
        root.left = insert(root.left, val)
    else:
        root.right = insert(root.right, val)
    return root

def inorder(root):
    """Returns values in sorted order"""
    if not root:
        return []
    return inorder(root.left) + [root.val] + inorder(root.right)`,
      cpp: `struct TreeNode {
    int val;
    TreeNode *left, *right;
    TreeNode(int v) : val(v), left(nullptr), right(nullptr) {}
};

TreeNode* insert(TreeNode* root, int val) {
    if (!root) return new TreeNode(val);
    if (val < root->val) root->left = insert(root->left, val);
    else root->right = insert(root->right, val);
    return root;
}`
    }
  },
  {
    id: 'avl-tree',
    title: 'AVL Tree (Self-Balancing)',
    category: 'Non-Linear',
    categoryTag: 'Strictly Balanced',
    icon: GitBranch,
    iconColor: '#10b981',
    bgColor: 'bg-[#D8E6DD]',
    diagramType: 'avl-tree',
    shortDesc: 'A strictly self-balancing BST where the heights of left and right subtrees differ by at most 1.',
    overview: 'Standard Binary Search Trees can degrade into O(n) linked lists if data arrives in sorted order. An AVL Tree solves this by enforcing a strict balance rule: for every node, the height difference between its left and right subtrees (Balance Factor = Height(Left) - Height(Right)) must be -1, 0, or +1. If an operation violates this, the tree automatically rebalances itself using tree rotations.',
    
    detailedTheory: {
      mechanics: 'After every insertion or deletion, the tree calculates the Balance Factor (BF) for each node along the path back to the root. If |BF| > 1, the tree performs one of 4 rotation types: Left-Left (Single Right Rotation), Right-Right (Single Left Rotation), Left-Right (Left-Right Double Rotation), or Right-Left (Right-Left Double Rotation).',
      memoryModel: 'Each node stores its key, left/right child pointers, and an extra integer for its current height (or balance factor). Because AVL trees maintain tighter balance than Red-Black trees (max height 1.44 log2 n), lookups are slightly faster, making them ideal for lookup-heavy workloads.',
      operations: [
        { name: 'Search', time: 'O(log n)', desc: 'Guaranteed O(log n) worst-case search because tree height is strictly controlled.' },
        { name: 'Insert', time: 'O(log n)', desc: 'Insert like a standard BST, then retrace path to root and perform rotations if |BF| > 1.' },
        { name: 'Delete', time: 'O(log n)', desc: 'Delete node, then re-balance ancestors up to root. May require multiple rotations.' },
        { name: 'Tree Rotations', time: 'O(1)', desc: 'Pointer-swapping operation that restructures local nodes without breaking BST invariants.' }
      ],
      tradeoffs: [
        { pro: 'Guaranteed O(log n) worst-case time for all operations (search, insert, delete).' },
        { pro: 'Faster lookups than Red-Black trees due to strictly flatter height profile.' },
        { con: 'Slower insertions and deletions because frequent rebalancing rotations are required.' },
        { con: 'Extra memory overhead per node to store height or balance factor integers.' }
      ]
    },

    realWorldUseCases: [
      'High-frequency read-heavy database indexes where lookup speed is critical',
      'In-memory set/map data structures requiring strict O(log n) lookup bounds',
      'Memory management systems tracking memory block allocations',
      'Geographic information systems (GIS) for spatial range queries'
    ],
    complexity: {
      access: { time: 'O(log n)', space: 'O(1)' },
      search: { time: 'O(log n)', space: 'O(1)' },
      insertHead: { time: 'O(log n)', space: 'O(1)' },
      insertTail: { time: 'O(log n)', space: 'O(1)' },
      deleteHead: { time: 'O(log n)', space: 'O(1)' },
      deletePos: { time: 'O(log n)', space: 'O(1)' },
    },
    codeSnippets: {
      javascript: `class AVLNode {
  constructor(val) {
    this.val = val;
    this.height = 1;
    this.left = null;
    this.right = null;
  }
}

function getHeight(node) { return node ? node.height : 0; }
function getBalance(node) { return node ? getHeight(node.left) - getHeight(node.right) : 0; }

// Right Rotation (LL Case)
function rotateRight(y) {
  const x = y.left;
  const T2 = x.right;
  x.right = y;
  y.left = T2;
  y.height = Math.max(getHeight(y.left), getHeight(y.right)) + 1;
  x.height = Math.max(getHeight(x.left), getHeight(x.right)) + 1;
  return x;
}

// Left Rotation (RR Case)
function rotateLeft(x) {
  const y = x.right;
  const T2 = y.left;
  y.left = x;
  x.right = T2;
  x.height = Math.max(getHeight(x.left), getHeight(x.right)) + 1;
  y.height = Math.max(getHeight(y.left), getHeight(y.right)) + 1;
  return y;
}`,
      python: `class AVLNode:
    def __init__(self, val):
        self.val = val
        self.height = 1
        self.left = None
        self.right = None

def get_height(node):
    return node.height if node else 0

def get_balance(node):
    return get_height(node.left) - get_height(node.right) if node else 0

def rotate_right(z):
    y = z.left
    T3 = y.right
    y.right = z
    z.left = T3
    z.height = 1 + max(get_height(z.left), get_height(z.right))
    y.height = 1 + max(get_height(y.left), get_height(y.right))
    return y`,
      cpp: `struct AVLNode {
    int val, height;
    AVLNode *left, *right;
    AVLNode(int v) : val(v), height(1), left(nullptr), right(nullptr) {}
};

int height(AVLNode* n) { return n ? n->height : 0; }
int getBalance(AVLNode* n) { return n ? height(n->left) - height(n->right) : 0; }

AVLNode* rotateRight(AVLNode* y) {
    AVLNode* x = y->left;
    AVLNode* T2 = x->right;
    x->right = y;
    y->left = T2;
    y->height = max(height(y->left), height(y->right)) + 1;
    x->height = max(height(x->left), height(x->right)) + 1;
    return x;
}`
    }
  },
  {
    id: 'red-black-tree',
    title: 'Red-Black Tree',
    category: 'Non-Linear',
    categoryTag: 'Production Standard',
    icon: GitBranch,
    iconColor: '#ef4444',
    bgColor: 'bg-[#FCE4EC]',
    diagramType: 'red-black-tree',
    shortDesc: 'A self-balancing BST with colored nodes (Red/Black) ensuring the longest path is at most twice the shortest.',
    overview: 'Red-Black Trees are the industry standard self-balancing binary search trees used inside C++ std::map / std::set, Java TreeMap / TreeSet, and Linux kernel CPU schedulers. Every node is tagged as RED or BLACK. By enforcing 5 strict rules, Red-Black Trees maintain balance with fewer rotations during insertions/deletions than AVL trees.',
    
    detailedTheory: {
      mechanics: 'Five Red-Black Invariants: 1. Every node is either RED or BLACK. 2. The root is always BLACK. 3. All NIL leaf nodes are BLACK. 4. If a node is RED, both its children must be BLACK (no consecutive red nodes). 5. Every path from a node to any descendant NIL leaf contains the same number of BLACK nodes (Black-Height).',
      memoryModel: 'Nodes store key, left, right, parent, and a 1-bit color flag (0 = Black, 1 = Red). When insertions or deletions violate the 5 rules, the tree restores balance using node recoloring and at most 2 tree rotations.',
      operations: [
        { name: 'Search', time: 'O(log n)', desc: 'Guaranteed O(log n) search since height is bounded by 2 * log2(n + 1).' },
        { name: 'Insert', time: 'O(log n)', desc: 'Insert new RED node, then recolor or perform at most 2 rotations to restore properties.' },
        { name: 'Delete', time: 'O(log n)', desc: 'Delete node, then fixup black-height imbalance using recoloring & rotations.' },
        { name: 'Recoloring', time: 'O(1)', desc: 'Flip node colors between RED and BLACK — cheaper than tree rotations.' }
      ],
      tradeoffs: [
        { pro: 'Faster insertions and deletions than AVL trees due to fewer required rotations.' },
        { pro: 'Industry standard — powers C++ STL, Java Collections, and OS kernel schedulers.' },
        { con: 'Slightly taller than AVL trees, making searches marginally slower than AVL.' },
        { con: 'Complex implementation with multiple insertion and deletion fixup cases.' }
      ]
    },

    realWorldUseCases: [
      'C++ Standard Template Library — std::map, std::set, and std::multimap',
      'Java Collections Framework — java.util.TreeMap and java.util.TreeSet',
      'Linux Kernel Completely Fair Scheduler (CFS) — tracks runnable process execution time',
      'epoll I/O event notification mechanism in Linux systems'
    ],
    complexity: {
      access: { time: 'O(log n)', space: 'O(1)' },
      search: { time: 'O(log n)', space: 'O(1)' },
      insertHead: { time: 'O(log n)', space: 'O(1)' },
      insertTail: { time: 'O(log n)', space: 'O(1)' },
      deleteHead: { time: 'O(log n)', space: 'O(1)' },
      deletePos: { time: 'O(log n)', space: 'O(1)' },
    },
    codeSnippets: {
      javascript: `const RED = 'RED';
const BLACK = 'BLACK';

class RBNode {
  constructor(val, color = RED) {
    this.val = val;
    this.color = color;
    this.left = null;
    this.right = null;
    this.parent = null;
  }
}

class RedBlackTree {
  constructor() {
    this.NIL = new RBNode(null, BLACK);
    this.root = this.NIL;
  }

  // Left rotation for RB Tree fixup
  rotateLeft(x) {
    const y = x.right;
    x.right = y.left;
    if (y.left !== this.NIL) y.left.parent = x;
    y.parent = x.parent;
    if (x.parent === null) this.root = y;
    else if (x === x.parent.left) x.parent.left = y;
    else x.parent.right = y;
    y.left = x;
    x.parent = y;
  }
}`,
      python: `RED = "RED"
BLACK = "BLACK"

class RBNode:
    def __init__(self, val, color=RED):
        self.val = val
        self.color = color
        self.left = None
        self.right = None
        self.parent = None

class RedBlackTree:
    def __init__(self):
        self.NIL = RBNode(None, color=BLACK)
        self.root = self.NIL

    def rotate_left(self, x):
        y = x.right
        x.right = y.left
        if y.left != self.NIL:
            y.left.parent = x
        y.parent = x.parent
        if not x.parent:
            self.root = y
        elif x == x.parent.left:
            self.parent.left = y
        else:
            x.parent.right = y
        y.left = x
        x.parent = y`,
      cpp: `enum Color { RED, BLACK };

struct RBNode {
    int val;
    Color color;
    RBNode *left, *right, *parent;
    RBNode(int v) : val(v), color(RED), left(nullptr), right(nullptr), parent(nullptr) {}
};

class RedBlackTree {
    RBNode* root;
    void rotateLeft(RBNode*& root, RBNode*& pt) {
        RBNode* pt_right = pt->right;
        pt->right = pt_right->left;
        if (pt->right != nullptr) pt->right->parent = pt;
        pt_right->parent = pt->parent;
        if (pt->parent == nullptr) root = pt_right;
        else if (pt == pt->parent->left) pt->parent->left = pt_right;
        else pt->parent->right = pt_right;
        pt_right->left = pt;
        pt->parent = pt_right;
    }
};`
    }
  },
  {
    id: 'heap',
    title: 'Binary Heap (Priority Queue)',
    category: 'Non-Linear',
    categoryTag: 'Priority Ordering',
    icon: Cpu,
    iconColor: '#f472b6',
    bgColor: 'bg-[#FCE4EC]',
    diagramType: 'heap',
    shortDesc: 'A complete binary tree where each parent is smaller (min-heap) or larger (max-heap) than its children.',
    overview: 'Think of a hospital emergency room — patients aren\'t served in arrival order, but by urgency. A Binary Heap is the data structure behind this "priority queue" concept. In a Min-Heap, the smallest element is always at the top. In a Max-Heap, the largest is always at the top. You can always instantly see the most important item.',
    
    detailedTheory: {
      mechanics: 'A heap is a complete binary tree stored as a flat array. For node at index i: left child = 2i+1, right child = 2i+2, parent = floor((i-1)/2). The "heap property" ensures parent ≤ children (min-heap) or parent ≥ children (max-heap). Insert adds at the end and "bubbles up". Extract removes the root and "sinks down" a replacement.',
      memoryModel: 'Despite being a tree conceptually, heaps are stored as arrays — no pointers needed! The parent-child relationship is computed purely from index arithmetic. This makes heaps extremely cache-friendly and memory-efficient.',
      operations: [
        { name: 'Get Min/Max', time: 'O(1)', desc: 'The root element (index 0) is always the smallest (min-heap) or largest (max-heap).' },
        { name: 'Insert', time: 'O(log n)', desc: 'Add at the end of the array, then "bubble up" by swapping with parent until heap property is restored.' },
        { name: 'Extract Min/Max', time: 'O(log n)', desc: 'Remove root, move last element to root, then "sink down" by swapping with the smaller child.' },
        { name: 'Heapify Array', time: 'O(n)', desc: 'Build a heap from an unsorted array in linear time using bottom-up sift-down.' }
      ],
      tradeoffs: [
        { pro: 'O(1) access to the minimum or maximum element at all times.' },
        { pro: 'Stored as an array — no pointer overhead, excellent cache performance.' },
        { con: 'Cannot efficiently search for an arbitrary value — only the min/max is fast.' },
        { con: 'Extracting the min/max is O(log n), not O(1).' }
      ]
    },

    realWorldUseCases: [
      'Hospital triage systems — patients served by priority, not arrival time',
      'Dijkstra\'s shortest path algorithm — always processes the closest unvisited node',
      'Operating system job schedulers — high-priority tasks run first',
      'Heap Sort algorithm — sorts using heap extract operations'
    ],
    complexity: {
      access: { time: 'O(1) min/max', space: 'O(1)' },
      search: { time: 'O(n)', space: 'O(1)' },
      insertHead: { time: 'O(log n)', space: 'O(1)' },
      insertTail: { time: 'O(log n)', space: 'O(1)' },
      deleteHead: { time: 'O(log n)', space: 'O(1)' },
      deletePos: { time: 'O(log n)', space: 'O(1)' },
    },
    codeSnippets: {
      javascript: `class MinHeap {
  constructor() { this.heap = []; }

  insert(val) {
    this.heap.push(val);
    this._bubbleUp(this.heap.length - 1);
  }

  extractMin() {
    const min = this.heap[0];
    const last = this.heap.pop();
    if (this.heap.length > 0) {
      this.heap[0] = last;
      this._sinkDown(0);
    }
    return min;
  }

  _bubbleUp(i) {
    while (i > 0) {
      const parent = Math.floor((i - 1) / 2);
      if (this.heap[i] >= this.heap[parent]) break;
      [this.heap[i], this.heap[parent]] = [this.heap[parent], this.heap[i]];
      i = parent;
    }
  }

  _sinkDown(i) {
    const n = this.heap.length;
    while (true) {
      let smallest = i;
      const left = 2 * i + 1, right = 2 * i + 2;
      if (left < n && this.heap[left] < this.heap[smallest]) smallest = left;
      if (right < n && this.heap[right] < this.heap[smallest]) smallest = right;
      if (smallest === i) break;
      [this.heap[i], this.heap[smallest]] = [this.heap[smallest], this.heap[i]];
      i = smallest;
    }
  }
}`,
      python: `import heapq

# Python's heapq is a min-heap
nums = [5, 3, 8, 1, 9]
heapq.heapify(nums)          # O(n) — build heap
heapq.heappush(nums, 2)      # O(log n)
smallest = heapq.heappop(nums)  # O(log n) → 1

# For max-heap, negate values
max_heap = [-x for x in [5, 3, 8, 1, 9]]
heapq.heapify(max_heap)
largest = -heapq.heappop(max_heap)  # → 9`,
      cpp: `#include <queue>
using namespace std;

// Min-heap (default in C++ uses max-heap)
priority_queue<int, vector<int>, greater<int>> minHeap;
minHeap.push(5);
minHeap.push(3);
minHeap.push(8);
int smallest = minHeap.top();  // → 3
minHeap.pop();

// Max-heap (default)
priority_queue<int> maxHeap;
maxHeap.push(5);
maxHeap.push(3);
int largest = maxHeap.top();   // → 5`
    }
  },
  {
    id: 'graph',
    title: 'Graph & Adjacency List',
    category: 'Non-Linear',
    categoryTag: 'Network Graph',
    icon: Network,
    iconColor: '#22d3ee',
    bgColor: 'bg-[#E2DEEE]',
    diagramType: 'graph',
    shortDesc: 'A network of vertices connected by edges — the most flexible data structure for modeling relationships.',
    overview: 'Think of a social network: people are "nodes" and friendships are "edges" connecting them. A graph is the most general-purpose data structure — it can model almost any relationship: road networks, social connections, web page links, dependencies between tasks, and more. Graphs can be directed or undirected, weighted or unweighted.',
    
    detailedTheory: {
      mechanics: 'A graph G = (V, E) consists of vertices (V) and edges (E). In an Adjacency List, each vertex stores a list of its neighbors. In an Adjacency Matrix, a V×V grid stores 1/0 (or weights) for each possible edge. Adjacency lists are preferred for sparse graphs (few edges); matrices for dense graphs.',
      memoryModel: 'Adjacency List uses O(V + E) space — one entry per vertex plus one entry per edge. Adjacency Matrix uses O(V²) space regardless of edge count. For a social network with 1 million users and 150 friends each, an adjacency list uses ~150M entries vs a matrix using 1 trillion entries.',
      operations: [
        { name: 'Add Vertex', time: 'O(1)', desc: 'Create a new entry in the adjacency list with an empty neighbor list.' },
        { name: 'Add Edge', time: 'O(1)', desc: 'Append the destination vertex to the source vertex\'s neighbor list.' },
        { name: 'BFS Traversal', time: 'O(V + E)', desc: 'Visit all vertices level by level using a queue. Finds shortest path in unweighted graphs.' },
        { name: 'DFS Traversal', time: 'O(V + E)', desc: 'Explore as deep as possible along each branch using a stack or recursion.' }
      ],
      tradeoffs: [
        { pro: 'Most flexible data structure — can model virtually any relationship or network.' },
        { pro: 'Adjacency list is space-efficient for sparse graphs with few edges.' },
        { con: 'Checking if a specific edge exists is O(degree) with adjacency lists.' },
        { con: 'Graph algorithms can be complex to implement correctly (cycles, disconnected components).' }
      ]
    },

    realWorldUseCases: [
      'Google Maps / GPS navigation — cities are nodes, roads are weighted edges',
      'Social networks (Instagram, LinkedIn) — users are nodes, follows/connections are edges',
      'Web crawling — pages are nodes, hyperlinks are edges (Google PageRank)',
      'Package managers (npm, pip) — packages are nodes, dependencies are directed edges'
    ],
    complexity: {
      access: { time: 'O(V + E)', space: 'O(V + E)' },
      search: { time: 'O(V + E)', space: 'O(V)' },
      insertHead: { time: 'O(1)', space: 'O(1)' },
      insertTail: { time: 'O(1)', space: 'O(1)' },
      deleteHead: { time: 'O(E)', space: 'O(1)' },
      deletePos: { time: 'O(E)', space: 'O(1)' },
    },
    codeSnippets: {
      javascript: `class Graph {
  constructor() {
    this.adjList = new Map();
  }

  addVertex(v) { this.adjList.set(v, []); }

  addEdge(v1, v2) {
    this.adjList.get(v1).push(v2);
    this.adjList.get(v2).push(v1); // undirected
  }

  // Breadth-First Search
  bfs(start) {
    const visited = new Set([start]);
    const queue = [start];
    const result = [];

    while (queue.length > 0) {
      const vertex = queue.shift();
      result.push(vertex);

      for (const neighbor of this.adjList.get(vertex)) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          queue.push(neighbor);
        }
      }
    }
    return result;
  }
}`,
      python: `from collections import deque

graph = {
    'A': ['B', 'C'],
    'B': ['A', 'D', 'E'],
    'C': ['A', 'F'],
    'D': ['B'],
    'E': ['B', 'F'],
    'F': ['C', 'E']
}

def bfs(graph, start):
    visited = set([start])
    queue = deque([start])
    result = []
    while queue:
        vertex = queue.popleft()
        result.append(vertex)
        for neighbor in graph[vertex]:
            if neighbor not in visited:
                visited.add(neighbor)
                queue.append(neighbor)
    return result`,
      cpp: `#include <vector>
#include <queue>
#include <unordered_set>
using namespace std;

class Graph {
public:
    vector<vector<int>> adj;
    Graph(int n) : adj(n) {}

    void addEdge(int u, int v) {
        adj[u].push_back(v);
        adj[v].push_back(u);
    }

    vector<int> bfs(int start) {
        unordered_set<int> visited = {start};
        queue<int> q;
        q.push(start);
        vector<int> result;
        while (!q.empty()) {
            int v = q.front(); q.pop();
            result.push_back(v);
            for (int neighbor : adj[v]) {
                if (!visited.count(neighbor)) {
                    visited.insert(neighbor);
                    q.push(neighbor);
                }
            }
        }
        return result;
    }
};`
    }
  },

  // ═══════════════════════════════════════════
  //  ADVANCED DATA STRUCTURES
  // ═══════════════════════════════════════════
  {
    id: 'hash-table',
    title: 'Hash Table (Hash Map)',
    category: 'Advanced',
    categoryTag: 'Key-Value Index',
    icon: Hash,
    iconColor: '#2dd4bf',
    bgColor: 'bg-[#F4DFC9]',
    diagramType: 'hash-table',
    shortDesc: 'Maps keys to values using a hash function — enabling O(1) average-time lookups.',
    overview: 'Imagine a library where instead of searching every shelf for a book, you use a magic formula that instantly tells you the exact shelf number. A Hash Table does exactly this — it converts any key (like a name or ID) into an array index using a "hash function", giving you near-instant lookups. This is arguably the most important data structure in modern software.',
    
    detailedTheory: {
      mechanics: 'A hash function converts a key into an integer index: index = hash(key) % arraySize. The value is stored at that index. When two different keys produce the same index (a "collision"), there are two strategies: Chaining (each slot holds a linked list of entries) or Open Addressing (probe for the next empty slot).',
      memoryModel: 'A hash table is an array of "buckets." The Load Factor (elements / array size) determines performance. When load factor exceeds ~0.75, the table is resized (usually doubled) and all entries are rehashed. Good hash functions distribute keys uniformly to minimize collisions.',
      operations: [
        { name: 'Insert (Put)', time: 'O(1) avg', desc: 'Hash the key, store the value at the computed index. Handle collisions if needed.' },
        { name: 'Lookup (Get)', time: 'O(1) avg', desc: 'Hash the key, jump directly to the index, return the value. Near-instant!' },
        { name: 'Delete', time: 'O(1) avg', desc: 'Hash the key, find the entry, remove it. May need to handle chain/probe cleanup.' },
        { name: 'Resize', time: 'O(n)', desc: 'When load factor is too high, allocate a bigger array and rehash all existing entries.' }
      ],
      tradeoffs: [
        { pro: 'O(1) average-case lookup, insert, and delete — the fastest for key-value access.' },
        { pro: 'Extremely versatile — used everywhere from databases to caches to symbol tables.' },
        { con: 'Worst case O(n) if many collisions occur (bad hash function or adversarial input).' },
        { con: 'No ordering guarantee — keys are stored in hash order, not insertion or sorted order.' }
      ]
    },

    realWorldUseCases: [
      'JavaScript objects and Python dictionaries are hash tables under the hood',
      'Database primary key indexes for O(1) record lookups',
      'In-memory caches (Redis, Memcached) — store key-value pairs for fast retrieval',
      'Counting word frequencies, detecting duplicates, and two-sum problems'
    ],
    complexity: {
      access: { time: 'O(1) avg', space: 'O(n)' },
      search: { time: 'O(1) avg', space: 'O(n)' },
      insertHead: { time: 'O(1) avg', space: 'O(n)' },
      insertTail: { time: 'O(1) avg', space: 'O(n)' },
      deleteHead: { time: 'O(1) avg', space: 'O(n)' },
      deletePos: { time: 'O(1) avg', space: 'O(n)' },
    },
    codeSnippets: {
      javascript: `// JavaScript Map (built-in hash table)
const users = new Map();
users.set('alice', { age: 25, role: 'engineer' });
users.set('bob',   { age: 30, role: 'designer' });

console.log(users.get('alice'));  // O(1) lookup
console.log(users.has('charlie')); // false

// Count character frequencies
function charFrequency(str) {
  const freq = {};
  for (const ch of str) {
    freq[ch] = (freq[ch] || 0) + 1;
  }
  return freq;
}
// charFrequency("hello") → {h:1, e:1, l:2, o:1}`,
      python: `# Python dict IS a hash table
users = {
    'alice': {'age': 25, 'role': 'engineer'},
    'bob':   {'age': 30, 'role': 'designer'}
}

print(users['alice'])      # O(1) lookup
print('charlie' in users)  # False

# Count word frequencies
from collections import Counter
words = "the cat sat on the mat".split()
freq = Counter(words)
# Counter({'the': 2, 'cat': 1, 'sat': 1, 'on': 1, 'mat': 1})`,
      cpp: `#include <unordered_map>
#include <string>
using namespace std;

unordered_map<string, int> ages;
ages["alice"] = 25;
ages["bob"] = 30;

// O(1) average lookup
if (ages.count("alice")) {
    int age = ages["alice"];  // 25
}

// Count character frequencies
unordered_map<char, int> freq;
string s = "hello";
for (char c : s) freq[c]++;`
    }
  },
  {
    id: 'trie',
    title: 'Trie (Prefix Tree)',
    category: 'Advanced',
    categoryTag: 'String Search',
    icon: Workflow,
    iconColor: '#a78bfa',
    bgColor: 'bg-[#E2DEEE]',
    diagramType: 'trie',
    shortDesc: 'A tree where each path from root to leaf represents a word — optimized for prefix-based string search.',
    overview: 'Imagine typing "app" into a search bar and instantly seeing suggestions like "apple", "application", "append". A Trie makes this possible. It\'s a tree where each edge represents a character, and paths from root to nodes represent prefixes. Sharing common prefixes between words saves massive amounts of memory and enables lightning-fast autocomplete.',
    
    detailedTheory: {
      mechanics: 'Each node in a Trie has up to 26 children (for lowercase English letters). To insert "cat", you create nodes for c → a → t and mark t as an "end of word." To search, you follow the character path from root. To find all words with prefix "ca", you traverse to the "a" node and collect all complete words below it.',
      memoryModel: 'Each node stores an array/map of children and a boolean flag for "is end of word." For large dictionaries, Tries can be compressed using techniques like Patricia Trees (Radix Trees) which merge single-child chains into one node to save memory.',
      operations: [
        { name: 'Insert Word', time: 'O(L)', desc: 'Walk/create one node per character. L = length of the word.' },
        { name: 'Search Word', time: 'O(L)', desc: 'Follow the character path. If you reach the end and it\'s marked as a word, it exists.' },
        { name: 'Prefix Search', time: 'O(P + K)', desc: 'Navigate to the prefix node, then collect all words below. P = prefix length, K = results.' },
        { name: 'Delete Word', time: 'O(L)', desc: 'Unmark the end-of-word flag. Clean up unused nodes if they have no other children.' }
      ],
      tradeoffs: [
        { pro: 'Prefix search in O(prefix length) — impossible to beat for autocomplete use cases.' },
        { pro: 'No hash collisions — every key has a unique path in the tree.' },
        { con: 'High memory usage — each node may have 26+ child pointers, many of which are null.' },
        { con: 'Slower than hash tables for exact key lookups (O(L) vs O(1)).' }
      ]
    },

    realWorldUseCases: [
      'Search engine autocomplete — type a prefix, get instant suggestions',
      'Spell checkers — quickly verify if a word exists in a dictionary',
      'IP routing tables — longest prefix matching in network routers',
      'T9 predictive text on old mobile phone keypads'
    ],
    complexity: {
      access: { time: 'O(L)', space: 'O(1)' },
      search: { time: 'O(L)', space: 'O(1)' },
      insertHead: { time: 'O(L)', space: 'O(L)' },
      insertTail: { time: 'O(L)', space: 'O(L)' },
      deleteHead: { time: 'O(L)', space: 'O(1)' },
      deletePos: { time: 'O(L)', space: 'O(1)' },
    },
    codeSnippets: {
      javascript: `class TrieNode {
  constructor() {
    this.children = {};
    this.isEnd = false;
  }
}

class Trie {
  constructor() { this.root = new TrieNode(); }

  insert(word) {
    let node = this.root;
    for (const ch of word) {
      if (!node.children[ch]) node.children[ch] = new TrieNode();
      node = node.children[ch];
    }
    node.isEnd = true;
  }

  search(word) {
    let node = this.root;
    for (const ch of word) {
      if (!node.children[ch]) return false;
      node = node.children[ch];
    }
    return node.isEnd;
  }

  startsWith(prefix) {
    let node = this.root;
    for (const ch of prefix) {
      if (!node.children[ch]) return false;
      node = node.children[ch];
    }
    return true; // prefix exists
  }
}`,
      python: `class TrieNode:
    def __init__(self):
        self.children = {}
        self.is_end = False

class Trie:
    def __init__(self):
        self.root = TrieNode()

    def insert(self, word):
        node = self.root
        for ch in word:
            if ch not in node.children:
                node.children[ch] = TrieNode()
            node = node.children[ch]
        node.is_end = True

    def search(self, word):
        node = self.root
        for ch in word:
            if ch not in node.children:
                return False
            node = node.children[ch]
        return node.is_end

    def starts_with(self, prefix):
        node = self.root
        for ch in prefix:
            if ch not in node.children:
                return False
            node = node.children[ch]
        return True`,
      cpp: `struct TrieNode {
    TrieNode* children[26] = {};
    bool isEnd = false;
};

class Trie {
    TrieNode* root = new TrieNode();
public:
    void insert(const string& word) {
        TrieNode* node = root;
        for (char c : word) {
            int i = c - 'a';
            if (!node->children[i])
                node->children[i] = new TrieNode();
            node = node->children[i];
        }
        node->isEnd = true;
    }

    bool search(const string& word) {
        TrieNode* node = root;
        for (char c : word) {
            int i = c - 'a';
            if (!node->children[i]) return false;
            node = node->children[i];
        }
        return node->isEnd;
    }
};`
    }
  },
  {
    id: 'deque',
    title: 'Deque (Double-Ended Queue)',
    category: 'Linear',
    categoryTag: 'Dual-Access',
    icon: ArrowDownUp,
    iconColor: '#06b6d4',
    bgColor: 'bg-[#D8E6DD]',
    diagramType: 'deque',
    shortDesc: 'A queue that supports insertion and removal at both the front and back in O(1) time.',
    overview: 'A Deque (pronounced "deck") is like a queue with superpowers — you can add or remove elements from BOTH ends. It combines the abilities of a stack (LIFO from one end) and a queue (FIFO across both ends) into one versatile data structure. Python\'s collections.deque and Java\'s ArrayDeque are Deque implementations.',
    
    detailedTheory: {
      mechanics: 'A Deque maintains access to both the front and back. It supports four key operations: push_front, push_back, pop_front, and pop_back — all in O(1) time. Internally, it\'s typically implemented as a circular buffer (array with wrap-around indices) or a doubly linked list.',
      memoryModel: 'Circular buffer implementations use a fixed-size array with "front" and "rear" pointers that wrap around. When the buffer fills up, it\'s resized. This gives excellent cache performance. Linked list implementations use doubly linked nodes for guaranteed O(1) operations without resizing.',
      operations: [
        { name: 'Push Front', time: 'O(1)', desc: 'Add an element to the front. The new element becomes the first item.' },
        { name: 'Push Back', time: 'O(1)', desc: 'Add an element to the back. The new element becomes the last item.' },
        { name: 'Pop Front', time: 'O(1)', desc: 'Remove and return the front element.' },
        { name: 'Pop Back', time: 'O(1)', desc: 'Remove and return the back element.' }
      ],
      tradeoffs: [
        { pro: 'O(1) insertion and removal at both ends — more flexible than stack or queue alone.' },
        { pro: 'Can simulate both a stack and a queue with a single data structure.' },
        { con: 'No efficient random access to middle elements.' },
        { con: 'Slightly more complex to implement than a simple stack or queue.' }
      ]
    },

    realWorldUseCases: [
      'Sliding window algorithms — efficiently maintain a window of recent elements',
      'Work-stealing thread pools — threads steal tasks from the back of other threads\' deques',
      'Palindrome checking — compare characters from both ends simultaneously',
      'Undo/Redo systems that cap history length (remove oldest from front when full)'
    ],
    complexity: {
      access: { time: 'O(n)', space: 'O(1)' },
      search: { time: 'O(n)', space: 'O(1)' },
      insertHead: { time: 'O(1)', space: 'O(1)' },
      insertTail: { time: 'O(1)', space: 'O(1)' },
      deleteHead: { time: 'O(1)', space: 'O(1)' },
      deletePos: { time: 'O(n)', space: 'O(1)' },
    },
    codeSnippets: {
      javascript: `// JavaScript doesn't have a built-in Deque
// but you can use an array (with caveats)
class Deque {
  constructor() { this.items = []; }

  pushFront(val) { this.items.unshift(val); }
  pushBack(val) { this.items.push(val); }
  popFront() { return this.items.shift(); }
  popBack() { return this.items.pop(); }
  peekFront() { return this.items[0]; }
  peekBack() { return this.items[this.items.length - 1]; }
  size() { return this.items.length; }
}

// Sliding window maximum using a deque
function maxSlidingWindow(nums, k) {
  const deque = [], result = [];
  for (let i = 0; i < nums.length; i++) {
    while (deque.length && deque[0] <= i - k) deque.shift();
    while (deque.length && nums[deque[deque.length-1]] < nums[i]) deque.pop();
    deque.push(i);
    if (i >= k - 1) result.push(nums[deque[0]]);
  }
  return result;
}`,
      python: `from collections import deque

# Python's deque is a true double-ended queue
d = deque()

d.append(1)       # push back  → [1]
d.append(2)       # push back  → [1, 2]
d.appendleft(0)   # push front → [0, 1, 2]

d.pop()           # pop back   → 2
d.popleft()       # pop front  → 0

# Bounded deque (auto-removes oldest when full)
history = deque(maxlen=5)
for i in range(10):
    history.append(i)
# history → deque([5, 6, 7, 8, 9])`,
      cpp: `#include <deque>
using namespace std;

deque<int> dq;
dq.push_back(1);    // [1]
dq.push_back(2);    // [1, 2]
dq.push_front(0);   // [0, 1, 2]

dq.pop_back();      // removes 2
dq.pop_front();     // removes 0

// Random access supported!
int val = dq[0];    // → 1`
    }
  },
  {
    id: 'set',
    title: 'Set (Hash Set)',
    category: 'Advanced',
    categoryTag: 'Unique Collection',
    icon: CircleDot,
    iconColor: '#10b981',
    bgColor: 'bg-[#D8E6DD]',
    diagramType: 'set',
    shortDesc: 'An unordered collection of unique elements — no duplicates allowed, with O(1) membership testing.',
    overview: 'A Set is like a guest list at a party — each person can only appear once. If you try to add someone who\'s already on the list, nothing happens. The power of a Set is instant membership testing: "Is this person on the list?" takes O(1) time. Under the hood, a Hash Set uses a hash table where only keys exist (no values).',
    
    detailedTheory: {
      mechanics: 'A Hash Set is essentially a Hash Table where you only store keys (no values). The hash function maps each element to a bucket index. Inserting a duplicate element is silently ignored. Membership testing (contains/has) is O(1) average time — just hash the element and check if the bucket is occupied.',
      memoryModel: 'Like hash tables, Sets use a load-factor-based resizing strategy. Tree-based Sets (like Java\'s TreeSet or C++\'s std::set) use Red-Black Trees instead, giving O(log n) operations but maintaining sorted order. Choose Hash Set for speed, Tree Set for ordering.',
      operations: [
        { name: 'Add', time: 'O(1) avg', desc: 'Hash the element and insert into the bucket. If it already exists, do nothing.' },
        { name: 'Contains', time: 'O(1) avg', desc: 'Hash the element and check if it\'s in the bucket. Lightning fast.' },
        { name: 'Remove', time: 'O(1) avg', desc: 'Hash the element, find it, and remove it from the bucket.' },
        { name: 'Union / Intersection', time: 'O(n)', desc: 'Combine two sets or find common elements. Core set theory operations.' }
      ],
      tradeoffs: [
        { pro: 'O(1) average-time membership testing — "does this element exist?"' },
        { pro: 'Automatically prevents duplicate entries.' },
        { con: 'No ordering guarantee in hash-based implementations.' },
        { con: 'Cannot store duplicate values — by design.' }
      ]
    },

    realWorldUseCases: [
      'Detecting duplicate entries in a dataset or form submission',
      'Tracking visited nodes in graph traversal (BFS/DFS)',
      'Removing duplicate words from a document',
      'Checking if a username is already taken during registration'
    ],
    complexity: {
      access: { time: 'O(1) avg', space: 'O(n)' },
      search: { time: 'O(1) avg', space: 'O(n)' },
      insertHead: { time: 'O(1) avg', space: 'O(n)' },
      insertTail: { time: 'O(1) avg', space: 'O(n)' },
      deleteHead: { time: 'O(1) avg', space: 'O(n)' },
      deletePos: { time: 'O(1) avg', space: 'O(n)' },
    },
    codeSnippets: {
      javascript: `const colors = new Set(['red', 'blue', 'green']);

colors.add('yellow');    // Set now has 4 items
colors.add('red');       // Ignored — already exists!
colors.has('blue');      // true — O(1) check
colors.delete('green');  // removes 'green'
colors.size;             // 3

// Remove duplicates from an array
const nums = [1, 2, 2, 3, 3, 4];
const unique = [...new Set(nums)]; // [1, 2, 3, 4]

// Set operations
const a = new Set([1, 2, 3]);
const b = new Set([2, 3, 4]);
const union = new Set([...a, ...b]);       // {1,2,3,4}
const inter = new Set([...a].filter(x => b.has(x))); // {2,3}`,
      python: `colors = {'red', 'blue', 'green'}

colors.add('yellow')     # 4 items
colors.add('red')        # Ignored — duplicate!
'blue' in colors         # True — O(1)
colors.discard('green')  # removes it

# Remove duplicates
nums = [1, 2, 2, 3, 3, 4]
unique = list(set(nums))  # [1, 2, 3, 4]

# Set operations — built into Python!
a = {1, 2, 3}
b = {2, 3, 4}
a | b    # union        → {1, 2, 3, 4}
a & b    # intersection → {2, 3}
a - b    # difference   → {1}`,
      cpp: `#include <unordered_set>
using namespace std;

unordered_set<string> colors = {"red", "blue", "green"};
colors.insert("yellow");
colors.insert("red");       // ignored
colors.count("blue");       // 1 (exists)
colors.erase("green");

// Ordered set (sorted, O(log n) ops)
#include <set>
set<int> sorted_set = {3, 1, 4, 1, 5};
// → {1, 3, 4, 5} — sorted, no duplicates`
    }
  },
  {
    id: 'b-tree',
    title: 'B-Tree',
    category: 'Advanced',
    categoryTag: 'Disk & DB Indexing',
    icon: Workflow,
    iconColor: '#ec4899',
    bgColor: 'bg-[#F3E5F5]',
    diagramType: 'b-tree',
    shortDesc: 'Self-balancing n-ary search tree optimized for systems with large block storage and databases.',
    overview: 'A B-Tree is a self-balancing search tree designed to read and write large blocks of data efficiently. Unlike binary search trees, a B-Tree node can contain multiple keys and more than two children. This makes it ideal for database indexing (MySQL, PostgreSQL) and file system block storage (NTFS, ext4), where minimizing disk I/O operations is critical.',
    
    detailedTheory: {
      mechanics: 'A B-Tree of order m satisfies key structural rules: every node has at most m children, every internal node (except root) has at least ⌈m/2⌉ children, and all leaves appear at the exact same depth. A node with k children contains k-1 sorted keys. Keys within a node act as separation values dividing its subtrees.',
      memoryModel: 'In disk storage, reading a single byte costs the same disk I/O time as reading an entire 4KB block. B-Trees leverage this by packing dozens or hundreds of keys into a single node that fits exactly inside a disk block. As a result, B-Trees maintain a very low height (often 3 or 4 levels for millions of records), dramatically reducing disk page accesses.',
      operations: [
        { name: 'Search', time: 'O(log n)', desc: 'Multi-way search: compare key within node block, then follow child pointer to next disk block.' },
        { name: 'Insert', time: 'O(log n)', desc: 'Insert into leaf. If node overflows (keys > m-1), split node around median key and push median up to parent.' },
        { name: 'Delete', time: 'O(log n)', desc: 'Remove key from node. If underflow occurs (keys < ⌈m/2⌉-1), borrow key from sibling or merge nodes.' },
        { name: 'Range Scan', time: 'O(log n + k)', desc: 'Locate start key in tree, then sequentially traverse leaf nodes (B+ Tree variant).' }
      ],
      tradeoffs: [
        { pro: 'Extremely shallow tree height — minimizes expensive disk I/O page reads.' },
        { pro: 'High memory locality within node blocks.' },
        { con: 'More complex node splitting and merging algorithms than binary trees.' },
        { con: 'Unused space in partially filled node blocks.' }
      ]
    },

    realWorldUseCases: [
      'Relational Database Indexing — MySQL InnoDB (B+ Tree), PostgreSQL (B-Tree index)',
      'Operating System File Systems — NTFS, ext4, Btrfs, HFS+ file allocation tables',
      'NoSQL Storage Engines — WiredTiger (MongoDB core engine), RocksDB SSTable indices',
      'Key-Value Stores and Large-Scale Directory Indexing'
    ],
    complexity: {
      access: { time: 'O(log n)', space: 'O(n)' },
      search: { time: 'O(log n)', space: 'O(n)' },
      insertHead: { time: 'O(log n)', space: 'O(n)' },
      insertTail: { time: 'O(log n)', space: 'O(n)' },
      deleteHead: { time: 'O(log n)', space: 'O(n)' },
      deletePos: { time: 'O(log n)', space: 'O(n)' },
    },
    codeSnippets: {
      javascript: `// Simplified B-Tree Node (Order t=3)
class BTreeNode {
  constructor(t, leaf = true) {
    this.t = t;           // Minimum degree
    this.keys = [];       // Array of keys
    this.children = [];   // Array of child pointers
    this.leaf = leaf;     // Is leaf node
  }

  // Search key in subtree rooted with this node
  search(k) {
    let i = 0;
    while (i < this.keys.length && k > this.keys[i]) i++;
    if (this.keys[i] === k) return this;
    if (this.leaf) return null;
    return this.children[i].search(k);
  }
}`,
      python: `# Simplified B-Tree Node
class BTreeNode:
    def __init__(self, t, leaf=True):
        self.t = t          # Minimum degree
        self.keys = []      # Array of keys
        self.children = []  # Child pointers
        self.leaf = leaf

    def search(self, k):
        i = 0
        while i < len(self.keys) and k > self.keys[i]:
            i += 1
        if i < len(self.keys) and self.keys[i] == k:
            return self
        if self.leaf:
            return None
        return self.children[i].search(k)`,
      cpp: `#include <vector>
using namespace std;

// B-Tree Node Structure
struct BTreeNode {
    int t;                     // Minimum degree
    vector<int> keys;          // Node keys
    vector<BTreeNode*> C;      // Child pointers
    bool leaf;

    BTreeNode(int _t, bool _leaf) {
        t = _t;
        leaf = _leaf;
    }

    BTreeNode* search(int k) {
        int i = 0;
        while (i < keys.size() && k > keys[i]) i++;
        if (i < keys.size() && keys[i] == k) return this;
        if (leaf) return nullptr;
        return C[i]->search(k);
    }
};`
    }
  }
];
