import React, { useState } from "react";
import questionsData from "./QuizData"; // Importing the static list as a fallback/mock
import styles from "./QuizCard.module.css";

const topics = [
  "Quick Sort",
  "Merge Sort",
  "Binary Search",
  "Strings",
  "Arrays",
  "Singly Linked lists",
  "Doubly Linked lists",
  "Trees",
  "Graphs"
];

const QuizCard = () => {
  // Mode state: 'topics' | 'quiz' | 'loading'
  const [viewMode, setViewMode] = useState("topics");
  const [currentQuestions, setCurrentQuestions] = useState([]);

  // Quiz taking state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [showScoreHelper, setShowScoreHelper] = useState(false);

  const handleTopicClick = (topic) => {
    // In the future, this would fetch from backend.
    // For now, we load the static data to simulate the flow.
    setViewMode("loading");

    // Simulate network delay
    setTimeout(() => {
      // Here we could filter questionsData based on topic if we had categorized data.
      // For now, just load all static questions.
      setCurrentQuestions(questionsData);
      setViewMode("quiz");
      resetQuizState();
    }, 600);
  };

  const resetQuizState = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsSubmitted(false);
    setScore(0);
    setShowScoreHelper(false);
  };

  const handleOptionClick = (index) => {
    if (!isSubmitted) {
      setSelectedOption(index);
      setIsSubmitted(true);
      if (index === currentQuestions[currentIndex].correctIndex) {
        setScore((prev) => prev + 1);
      }
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 < currentQuestions.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsSubmitted(false);
    } else {
      setShowScoreHelper(true);
    }
  };

  const handleRestart = () => {
    setViewMode("topics");
    resetQuizState();
  };

  // --- RENDER HELPERS ---

  if (viewMode === "loading") {
    return (
      <div className={styles["quiz-card"]}>
        <h3 style={{ color: "#888" }}>Generating questions...</h3>
      </div>
    );
  }

  // 1. TOPIC SELECTION View
  if (viewMode === "topics") {
    return (
      <div className={styles["quiz-card"]}>
        <div className={styles["topic-grid"]}>
          {topics.map((topic, index) => (
            <button
              key={index}
              className={styles["topic-item"]}
              onClick={() => handleTopicClick(topic)}
            >
              {topic}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // 2. QUIZ TAKING View
  const currentQuestion = currentQuestions[currentIndex];

  return (
    <div className={styles["quiz-card"]}>
      {!showScoreHelper ? (
        <>
          <h3 className={styles["quiz-question"]}>
            {currentIndex + 1}. {currentQuestion.text}
          </h3>

          <div style={{ width: "100%", maxWidth: "600px" }}>
            {currentQuestion.options.map((opt, idx) => {
              const isCorrect = idx === currentQuestion.correctIndex;
              const isSelected = idx === selectedOption;

              let btnClass = styles["quiz-option"];
              if (isSubmitted) {
                if (isCorrect) btnClass += ` ${styles["correct"]}`;
                else if (isSelected) btnClass += ` ${styles["incorrect"]}`;
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleOptionClick(idx)}
                  className={btnClass}
                >
                  {opt}
                </button>
              );
            })}
          </div>

          {isSubmitted && (
            <div className={styles["quiz-result-box"]}>
              <strong
                style={{
                  color:
                    selectedOption === currentQuestion.correctIndex
                      ? "#4caf50"
                      : "#f44336",
                }}
              >
                {selectedOption === currentQuestion.correctIndex
                  ? "✅ Correct!"
                  : "❌ Incorrect!"}
              </strong>
              <p className={styles["quiz-explanation"]}>
                {currentQuestion.explanation}
              </p>
            </div>
          )}

          {isSubmitted && (
            <button onClick={handleNext} className={styles["quiz-next-btn"]}>
              {currentIndex + 1 === currentQuestions.length
                ? "See Results"
                : "Next Question"}
            </button>
          )}
        </>
      ) : (
        <div className={styles["quiz-score-display"]}>
          <h2>
            Score: {score} / {currentQuestions.length}
          </h2>
          <p style={{ color: "#aaa", marginBottom: "20px" }}>
            {score === currentQuestions.length
              ? "Perfect score! You're a pro! 🚀"
              : "Good practice! Keep it up. 💪"}
          </p>
          <button onClick={handleRestart} className={styles["quiz-restart-btn"]}>
            Choose Another Topic
          </button>
        </div>
      )}
    </div>
  );
};

export default QuizCard;
