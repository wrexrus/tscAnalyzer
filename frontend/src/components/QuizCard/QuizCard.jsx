import React, { useState } from "react";
import questions from "./QuizData";
import "./QuizCard.css";

const QuizCard = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [showScore, setShowScore] = useState(false);

  const currentQuestion = questions[currentIndex];

  const handleOptionClick = (index) => {
    if (!submitted) {
      setSelected(index);
      setSubmitted(true);
      if (index === currentQuestion.correctIndex) {
        setScore(score + 1);
      }
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(currentIndex + 1);
      setSelected(null);
      setSubmitted(false);
    } else {
      setShowScore(true);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelected(null);
    setSubmitted(false);
    setScore(0);
    setShowScore(false);
  };

  return (
    <div className="quiz-card">
      {!showScore ? (
        <>
          <h3 className="quiz-question">{currentQuestion.text}</h3>

          {currentQuestion.options.map((opt, idx) => {
            const isCorrect = idx === currentQuestion.correctIndex;
            const isSelected = idx === selected;

            let btnClass = "quiz-option";
            if (submitted) {
              if (isCorrect) btnClass += " correct";
              else if (isSelected) btnClass += " incorrect";
            }

            return (
              <button
                key={idx}
                onClick={() => handleOptionClick(idx)}
                className={btnClass}
                disabled={submitted}
              >
                {opt}
              </button>
            );
          })}

          {submitted && (
            <div className="quiz-result-box">
              <strong
                className={
                  selected === currentQuestion.correctIndex
                    ? "correct-text"
                    : "incorrect-text"
                }
              >
                {selected === currentQuestion.correctIndex
                  ? "✅ Correct!"
                  : "❌ Incorrect!"}
              </strong>
              <p className="quiz-explanation">
                {currentQuestion.explanation}
              </p>
            </div>
          )}

          {submitted && (
            <button onClick={handleNext} className="quiz-next-btn">
              Next
            </button>
          )}
        </>
      ) : (
        <>
          <h2>
            Your Score: {score} / {questions.length}
          </h2>
          <h3 className="quiz-summary">
            🧠 Great job! Review and retry if you'd like.
          </h3>
          <button onClick={handleRestart} className="quiz-restart-btn">
            Restart Quiz
          </button>
        </>
      )}
    </div>
  );
};

export default QuizCard;
