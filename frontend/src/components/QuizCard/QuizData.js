const questions = [
  {
    text: 'Q1. Which of these has the worst complexity?',
    options: ['O(n)', 'O(n^2)', 'O(n!)', 'O(log n)'],
    correctIndex: 2,
    explanation: 'O(n!) is factorial time — worse than all others here.',
  },
  {
    text: 'Q2. Which of these complexities grows the fastest as n increases?',
    options: ['O(n log n)', 'O(2^n)', 'O(n^2)', 'O(n!)'],
    correctIndex: 3,
    explanation: 'O(n!) grows faster than exponential or polynomial time — it\'s one of the most expensive complexities.',
  },
  {
    text: 'Q3. Which algorithm is likely to perform worst in terms of time when input size doubles?',
    options: ['Merge Sort', 'Binary Search', 'Brute Force for Traveling Salesman', 'Linear Search'],
    correctIndex: 2,
    explanation: 'Brute Force for Traveling Salesman is O(n!), so doubling n leads to a massive growth in time.',
  },
  {
    text: 'Q4. Which of these complexities indicates a divide-and-conquer strategy?',
    options: ['O(n)', 'O(n^2)', 'O(n log n)', 'O(n!)'],
    correctIndex: 2,
    explanation: 'O(n log n) is commonly associated with divide-and-conquer algorithms like Merge Sort and Quick Sort.',
  },
  {
    text: 'Q5. What is the time complexity of Binary Search on a sorted array?',
    options: ['O(1)', 'O(n)', 'O(log n)', 'O(n log n)'],
    correctIndex: 2,
    explanation: 'Binary Search halves the search space each time, resulting in O(log n) time complexity.',
  },
  {
    text: 'Q6. Which of the following has the best space complexity?',
    options: ['O(n)', 'O(log n)', 'O(1)', 'O(n^2)'],
    correctIndex: 2,
    explanation: 'O(1) means constant space — the least memory usage regardless of input size.',
  },
  {
    text: 'Q7. If an algorithm uses recursion and stores partial results in a 2D table, what is the likely space complexity?',
    options: ['O(n)', 'O(log n)', 'O(n^2)', 'O(1)'],
    correctIndex: 2,
    explanation: 'Storing results in a 2D table of size n × n leads to O(n^2) space complexity.',
  },
  {
    text: 'Q8. Which complexity is typical for naive recursive Fibonacci without memoization?',
    options: ['O(n)', 'O(log n)', 'O(n^2)', 'O(2^n)'],
    correctIndex: 3,
    explanation: 'Naive recursive Fibonacci has exponential time complexity: O(2^n).',
  },
  {
    text: 'Q9. Which of the following is not a valid Big-O notation?',
    options: ['O(n!)', 'O(n^n)', 'O(n/n)', 'O(1)'],
    correctIndex: 2,
    explanation: 'O(n/n) simplifies to O(1), but it’s not commonly used or considered standard Big-O form.',
  },
  {
    text: 'Q10. What is the worst-case time complexity of Quick Sort?',
    options: ['O(n log n)', 'O(n)', 'O(n^2)', 'O(log n)'],
    correctIndex: 2,
    explanation: 'In the worst case (when pivot is always the smallest/largest element), Quick Sort becomes O(n^2).',
  }
];

export default questions;
