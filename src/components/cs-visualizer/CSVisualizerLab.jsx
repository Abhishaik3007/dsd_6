import React, { useState } from 'react';
import { ArrayVisualizer } from './ArrayVisualizer';
import { TreeVisualizer } from './TreeVisualizer';
import { StackQueueVisualizer } from './StackQueueVisualizer';
import { SortingVisualizer } from './SortingVisualizer';
import { useHub } from '../../context/HubContext';
import { Binary, GitCommit, Layers, BarChart2, Code, BookOpen, Home, ArrowLeft } from 'lucide-react';
import './cs-visualizer-styles.css';

export const CSVisualizerLab = () => {
  const { setActiveTab } = useHub();
  const [activeSubLab, setActiveSubLab] = useState('array'); // 'array' | 'tree' | 'stack' | 'sorting'
  const [codeLang, setCodeLang] = useState('javascript'); // 'javascript' | 'python' | 'cpp'

  const subLabs = [
    { id: 'array', title: 'Arrays & Dynamic Arrays', icon: Binary, desc: 'Array operations, memory indices, linear & binary search' },
    { id: 'tree', title: 'Binary Search Tree & Traversals', icon: GitCommit, desc: 'BST insertion, search path trace, Inorder & BFS traversals' },
    { id: 'stack', title: 'Stack & Queue Frames', icon: Layers, desc: 'LIFO stack push/pop frames and FIFO queue enqueue/dequeue' },
    { id: 'sorting', title: 'Sorting Algorithms', icon: BarChart2, desc: 'Bubble, selection, and quick sort animated array bars' },
  ];

  const codeSnippets = {
    array: {
      javascript: `// Binary Search in JavaScript
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
      python: `# Binary Search in Python
def binary_search(arr, target):
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
      cpp: `// Binary Search in C++
int binarySearch(int arr[], int n, int target) {
    int low = 0, high = n - 1;
    while (low <= high) {
        int mid = low + (high - low) / 2;
        if (arr[mid] == target) return mid;
        if (arr[mid] < target) low = mid + 1;
        else high = mid - 1;
    }
    return -1;
}`
    },
    tree: {
      javascript: `// BST Insertion in JavaScript
function insertNode(root, val) {
  if (!root) return new TreeNode(val);
  if (val < root.value) root.left = insertNode(root.left, val);
  else if (val > root.value) root.right = insertNode(root.right, val);
  return root;
}`,
      python: `# BST Insertion in Python
def insert_node(root, val):
    if not root:
        return TreeNode(val)
    if val < root.value:
        root.left = insert_node(root.left, val)
    elif val > root.value:
        root.right = insert_node(root.right, val)
    return root`,
      cpp: `// BST Insertion in C++
TreeNode* insertNode(TreeNode* root, int val) {
    if (!root) return new TreeNode(val);
    if (val < root->val) root->left = insertNode(root->left, val);
    else if (val > root->val) root->right = insertNode(root->right, val);
    return root;
}`
    },
    stack: {
      javascript: `// Stack Implementation in JavaScript
class Stack {
  constructor() { this.items = []; }
  push(element) { this.items.push(element); }
  pop() { return this.items.pop(); }
  peek() { return this.items[this.items.length - 1]; }
}`,
      python: `# Stack Implementation in Python
class Stack:
    def __init__(self):
        self.items = []
    def push(self, val):
        self.items.append(val)
    def pop(self):
        return self.items.pop()`,
      cpp: `// Stack in C++ STL
#include <stack>
std::stack<int> s;
s.push(10);
s.push(20);
int topVal = s.top();
s.pop();`
    },
    sorting: {
      javascript: `// QuickSort Partition in JavaScript
function partition(arr, low, high) {
  let pivot = arr[high];
  let i = low - 1;
  for (let j = low; j < high; j++) {
    if (arr[j] < pivot) {
      i++;
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  }
  [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
  return i + 1;
}`,
      python: `# QuickSort in Python
def quick_sort(arr, low, high):
    if low < high:
        pi = partition(arr, low, high)
        quick_sort(arr, low, pi - 1)
        quick_sort(arr, pi + 1, high)`,
      cpp: `// QuickSort in C++
void quickSort(int arr[], int low, int high) {
    if (low < high) {
        int pi = partition(arr, low, high);
        quickSort(arr, low, pi - 1);
        quickSort(arr, pi + 1, high);
    }
}`
    }
  };

  return (
    <div className="cs-lab-page">
      {/* LAB HERO HEADER */}
      <div className="cs-lab-banner">
        <div className="banner-left">
          <button className="back-hub-pill" onClick={() => setActiveTab('hub')}>
            <ArrowLeft size={14} /> Back to Hub
          </button>
          <h1 className="cs-lab-title">CS Data Structures & Algorithms Lab</h1>
          <p className="cs-lab-subtitle">
            Interactive visual simulation engine for arrays, binary search trees, stacks, queues, and sorting algorithms.
          </p>
        </div>

        {/* SUB-LAB SELECTOR TABS */}
        <div className="cs-sublab-tabs">
          {subLabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeSubLab === tab.id;
            return (
              <button
                key={tab.id}
                className={`sublab-tab-btn ${isActive ? 'active' : ''}`}
                onClick={() => setActiveSubLab(tab.id)}
              >
                <Icon size={18} />
                <span>{tab.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* LAB MAIN SPLIT VIEW */}
      <div className="cs-lab-content-grid">
        {/* LEFT / CENTER: ACTIVE VISUALIZER STAGE */}
        <div className="lab-stage-container">
          {activeSubLab === 'array' && <ArrayVisualizer />}
          {activeSubLab === 'tree' && <TreeVisualizer />}
          {activeSubLab === 'stack' && <StackQueueVisualizer />}
          {activeSubLab === 'sorting' && <SortingVisualizer />}
        </div>

        {/* RIGHT: CODE SNIPPETS & THEORY DRAWER */}
        <div className="lab-side-panel">
          {/* Code Viewer Box */}
          <div className="code-viewer-box">
            <div className="code-viewer-header">
              <div className="code-header-title">
                <Code size={16} />
                <span>ALGORITHM CODE</span>
              </div>
              <div className="code-lang-selector">
                <button className={codeLang === 'javascript' ? 'active' : ''} onClick={() => setCodeLang('javascript')}>JS</button>
                <button className={codeLang === 'python' ? 'active' : ''} onClick={() => setCodeLang('python')}>Py</button>
                <button className={codeLang === 'cpp' ? 'active' : ''} onClick={() => setCodeLang('cpp')}>C++</button>
              </div>
            </div>
            <pre className="code-pre">
              <code>{codeSnippets[activeSubLab][codeLang]}</code>
            </pre>
          </div>

          {/* Quick Theory & Complexity Reference */}
          <div className="theory-box">
            <div className="theory-header">
              <BookOpen size={16} />
              <span>THEORY & COMPLEXITY</span>
            </div>
            <div className="theory-body">
              {activeSubLab === 'array' && (
                <>
                  <p><strong>Array Access:</strong> O(1) direct indexing.</p>
                  <p><strong>Linear Search:</strong> O(n) worst case time complexity.</p>
                  <p><strong>Binary Search:</strong> O(log n) require pre-sorted elements.</p>
                </>
              )}
              {activeSubLab === 'tree' && (
                <>
                  <p><strong>BST Search:</strong> O(log n) average, O(n) worst case skewed.</p>
                  <p><strong>Inorder Traversal:</strong> Yields elements in sorted order.</p>
                  <p><strong>BFS Level Order:</strong> Uses Queue to traverse level by level.</p>
                </>
              )}
              {activeSubLab === 'stack' && (
                <>
                  <p><strong>Stack (LIFO):</strong> Push & Pop O(1) time complexity.</p>
                  <p><strong>Queue (FIFO):</strong> Enqueue & Dequeue O(1) with pointers.</p>
                </>
              )}
              {activeSubLab === 'sorting' && (
                <>
                  <p><strong>Bubble Sort:</strong> O(n²) comparisons and swaps.</p>
                  <p><strong>Selection Sort:</strong> O(n²) comparison, O(n) swaps.</p>
                  <p><strong>QuickSort:</strong> O(n log n) average divide and conquer.</p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
