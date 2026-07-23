export const explanations = {
  "O(1)": "O(1) -> Constant time: Operation takes the same time regardless of input size. Example: Accessing element in an array.",
  "O(log N)": "O(log N) -> Logarithmic time: Problem size is halved at each step. Example: Binary search on a sorted array.",
  "O(√N)": "O(√N) -> Square root time: Performance grows with the square root of input size. Example: Checking for prime by iterating up to √N.",
  "O(N)": "O(N) -> Linear time: Time grows directly with input size. Example: Finding the maximum value in an array.",
  "O(N log N)": "O(N log N) -> Linearithmic time: Common in efficient sorting algorithms. Example: Merge Sort or Heap Sort.",
  "O(N²)": "O(N²) -> Quadratic time: Operations inside a loop over all elements. Example: Bubble Sort or checking all pairs in a list.",
  "O(N³)": "O(N³) -> Cubic time: triple nested loops or 3D matrix operations. Example: 3 Nested loops.",
  "O(2^N)": "O(2^N) -> Exponential time: Doubles with each additional input. Example: Solving the subset sum problem via recursion.",
  "O(N!)": "O(N!) -> Factorial time: Extremely slow growth, tries all permutations. Example: Traveling Salesman Problem with brute-force.",
};

export const TOPIC_CATEGORIES = {
  "Data Structures": {
    "Arrays": "https://www.youtube.com/embed/8wmn7k1TTcI?si=brdDhfbk2aTM9057",
    "Strings":"https://www.youtube.com/embed/Wdjr6uoZ0e0?si=1y7kXOjRdtGxo5Cd",
    "Linked Lists": "https://www.youtube.com/embed/Hj_rA0dhr2I",
    "Trees": "https://www.youtube.com/embed/-DzowlcaUmE?si=srt6uqSmfmjDZ3jc",
    "Graphs": "https://www.youtube.com/embed/tWVWeAqZ0WU",
    "Hash Maps": "https://www.youtube.com/embed/knV86FlSXJ8"
  },
  "Algorithms": {
    "Sorting & Searching": "https://www.youtube.com/embed/pkkFqlG0Hds",
    "Dynamic Programming": "https://www.youtube.com/embed/oBt53YbR9Kk"
  },
  "Architecture": {
    "System Design": "https://www.youtube.com/embed/bUHFg8CZFws"
  }
};
