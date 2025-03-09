import React, { useState, useEffect } from 'react';
import { RadioGroup } from '@headlessui/react';
import ReactHtmlParser from 'react-html-parser';

// Example components for Star, Progress, Button, ScrollArea
const Star = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2l2.88 5.82L22 9.16l-4.16 4.05L18 21l-6-3.16L6 21l1.16-7.79L2 9.16l7.12-1.34L12 2z" />
  </svg>
);

const Progress = ({ value, className }) => (
  <div className={`relative w-full bg-gray-300 rounded-full h-4 ${className}`}>
    <div
      style={{ width: `${value}%` }}
      className="absolute top-0 left-0 bg-blue-500 h-full rounded-full"
    />
  </div>
);

const Button = ({ onClick, type, children, className, disabled }) => (
  <button
    onClick={onClick}
    type={type}
    className={`py-2 px-4 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 ${className}`}
    disabled={disabled}
  >
    {children}
  </button>
);

const ScrollArea = ({ children, className }) => (
  <div className={`overflow-auto ${className}`}>
    {children}
  </div>
);

const RadioGroupItem = ({ id, value, checked, onChange }) => (
  <input
    type="radio"
    id={id}
    value={value}
    checked={checked}
    onChange={onChange}
    className="peer sr-only"
  />
);

const Label = ({ htmlFor, children, className }) => (
  <label htmlFor={htmlFor} className={`text-indigo-300 flex flex-1 items-center justify-between rounded-md border-2 border-gray-300 p-4 cursor-pointer hover:bg-purple-300 hover:text-indigo-700 peer-checked:text-indigo-700 peer-checked:border-blue-500 peer-checked:bg-purple-300 ${className}`}>
    {children}
  </label>
);

const formatResponse = (text) => {
  // Convert **bold text** to <strong>bold text</strong>
  let formattedText = text.replace(/\*\*(.*?)\*\*/g, '<strong style="font-size: 1.5rem; color: #38bdf8;">$1</strong>');
  
  // Replace bullet points
  formattedText = formattedText
    .replace(/^\s*\*\s+/gm, '<li style="color: #fef08a;">')   // Convert bullet points
    .replace(/<\/li>\s*<li>/g, '</li><li style="color: #fef08a;">') // Fix broken list items
    .replace(/(\n|^)\*\s+/g, '$1<li style="color: #fef08a;">')   // Ensure no extra <li> tags
    .concat('</li>'); // Close the last list item

  // Preserve line breaks
  formattedText = formattedText.replace(/\n/g, '<br>');

  // Return HTML with <ul> tags
  return `<ul>${formattedText}</ul>`;
};

const QuizGenerator = () => {
  const [file, setFile] = useState(null);
  const [numQuestions, setNumQuestions] = useState('');
  const [quiz, setQuiz] = useState(null);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [score, setScore] = useState(null);
  const [error, setError] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [showAnswers, setShowAnswers] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [generatingMessage, setGeneratingMessage] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const generateQuiz = async () => {
    setIsLoading(true);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('num', numQuestions);

    try {
      const response = await fetch('https://imapmystudy.com/generate_quiz', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setIsLoading(false);
        setGeneratingMessage(true);
        setTimeout(() => {
          if (data.quiz && data.quiz.length > 0) {
            setQuiz(data.quiz);
            setError(null);
            setSelectedAnswers({});
            setScore(null);
            setCurrentQuestionIndex(0);
            setQuizSubmitted(false);
            setShowAnswers(false);
            setGeneratingMessage(false);
            setRetryCount(0);
          } else {
            setRetryCount(prevCount => prevCount + 1);
            if (retryCount < 3) {
              generateQuiz();
            } else {
              setError('Failed to generate quiz after multiple attempts. Please try again.');
              setIsLoading(false);
              setGeneratingMessage(false);
            }
          }
        }, 2000);
      } else {
        setError(data.error);
        setQuiz(null);
        setIsLoading(false);
      }
    } catch (err) {
      console.error('Error generating quiz:', err);
      setError('Your File is Too Large or can not read the Text.');
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setRetryCount(0);
    generateQuiz();
  };

  useEffect(() => {
    if (quiz && quiz.length === 0 && retryCount < 3) {
      generateQuiz();
    }
  }, [quiz, retryCount]);

  const handleAnswerSelect = (questionIndex, value) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionIndex]: value,
    }));
  };

  const handleSubmitQuiz = () => {
    let correctCount = 0;
    let incorrectCount = 0;
    quiz.forEach((q, index) => {
      if (selectedAnswers[index] === q.answer) {
        correctCount += 1;
      } else if (selectedAnswers[index] !== undefined) {
        incorrectCount += 1;
      }
    });
    setScore({
      correct: correctCount,
      incorrect: incorrectCount,
      total: quiz.length,
    });
    setQuizSubmitted(true);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < quiz.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleRetakeQuiz = () => {
    setQuiz(null);
    setScore(null);
    setSelectedAnswers({});
    setCurrentQuestionIndex(0);
    setQuizSubmitted(false);
    setShowAnswers(false);
  };

  return (
    <div className="p-4 mt-10 mx-auto text-white">
      
      <form onSubmit={handleSubmit} className="bg-gradient-to-r from-purple-500 to-indigo-500 p-4 sm:p-6 md:p-8 rounded-xl shadow-2xl transition-all duration-300 hover:shadow-purple-500/30">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold mb-4 sm:mb-6 text-center text-white"> iQuiz Generator</h1>
        <div className="mb-4 sm:mb-6">
          <label htmlFor="file" className="block text-sm font-medium text-gray-200 mb-2">Upload PDF:</label>
          <input
            type="file"
            id="file"
            accept="application/pdf"
            onChange={handleFileChange}
            required
            className="mt-1 block w-full text-sm text-gray-200 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
          />
        </div>
        <div className="mb-4 sm:mb-6">
          <label htmlFor="numQuestions" className="block text-sm font-medium text-gray-200 mb-2">Number of Questions:</label>
          <input
            type="number"
            id="numQuestions"
            value={numQuestions}
            onChange={(e) => setNumQuestions(e.target.value)}
            required
            className="mt-1 block w-full text-sm text-gray-800 bg-indigo-50 border border-indigo-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-2"
          />
        </div>
        <Button type="submit" className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 sm:py-3 px-4 sm:px-6 rounded-full transition duration-300 transform hover:scale-105 text-sm sm:text-base" disabled={isLoading}>
          {isLoading ? 'Uploading File...' : 'Generate Quiz'}
        </Button>
      </form>
      {isLoading && (
        <div className="loader">
          <div className="spinner-border" role="status">
            <span className="sr-only">Loading...</span>
          </div>
        </div>
      )}

      {generatingMessage && (
        <div className="flex justify-center items-center mt-4">
          <div className="bg-gradient-to-r from-green-400 to-blue-500 text-white font-bold py-2 sm:py-3 px-4 sm:px-6 rounded-full animate-pulse transition-all duration-300 transform hover:scale-105 shadow-lg">
            <div className="flex items-center">
              <svg className="animate-spin -ml-1 mr-3 h-4 w-4 sm:h-5 sm:w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="text-sm sm:text-base">Generating your Quiz...</span>
            </div>
          </div>
        </div>
      )}

      {error && <p className="text-red-400 mb-6 text-center bg-red-900 bg-opacity-50 p-4 rounded-lg">{error}</p>}

      {quiz && score === null && (
        <ScrollArea className="mt-8 bg-opacity-50 rounded-xl p-3">
          <h3 className="text-xl sm:text-2xl md:text-3xl font-semibold mb-3 text-indigo-300">Quiz</h3>
          <ul className="space-y-8">
            {quiz.map((q, index) => (
              <li key={index} className={` rounded-xl ${index === currentQuestionIndex ? 'block' : 'hidden'}`}>
                <strong className="block mb-4 text-lg sm:text-xl md:text-2xl text-purple-400">{ReactHtmlParser(formatResponse(q.question))}</strong>
                <RadioGroup
                  value={selectedAnswers[index]}
                  onChange={(value) => handleAnswerSelect(index, value)}
                  className="space-y-3"
                >
                  {q.options.map((option, i) => (
                    <div key={i} className="flex items-center rounded-lg hover:bg-gray-500 transition duration-200">
                      <RadioGroupItem
                        value={option}
                        id={`question-${index}-option-${i}`}
                        checked={selectedAnswers[index] === option}
                        onChange={() => handleAnswerSelect(index, option)}
                        className="text-indigo-400"
                      />
                      <Label
                        htmlFor={`question-${index}-option-${i}`}
                        className="text-gray-700 cursor-pointer flex-grow text-xs sm:text-sm md:text-base"
                      >
                        {option}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </li>
            ))}
          </ul>
        </ScrollArea>
      )}

      {quiz && !quizSubmitted && (
        <div className="bg-gray-800 bg-opacity-50 p-4 sm:p-6 rounded-xl shadow-md mt-6 mb-10">
           <div className="flex justify-between">
            <Button
              onClick={handlePreviousQuestion}
              disabled={currentQuestionIndex === 0}
              className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 sm:px-6 rounded-full transition duration-300 disabled:opacity-50 text-xs sm:text-sm"
            >
              Previous
            </Button>
            {currentQuestionIndex === quiz.length - 1 ? (
              <Button
                onClick={handleSubmitQuiz}
                className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 sm:px-6 rounded-full transition duration-300 text-xs sm:text-sm"
              >
                Submit Quiz
              </Button>
            ) : (
              <Button
                onClick={handleNextQuestion}
                className="bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-2 px-4 sm:px-6 rounded-full transition duration-300 text-xs sm:text-sm"
              >
                Next
              </Button>
            )}
          </div>
        </div>
      )}

      {quizSubmitted && score !== null && (
        <div className="mt-8 bg-gradient-to-r from-indigo-600 to-purple-600 p-4 sm:p-6 md:p-8 rounded-xl shadow-2xl mb-8">
          <h3 className="text-xl sm:text-2xl md:text-3xl font-extrabold mb-4 sm:mb-6 text-center text-white">
            Scorecard
          </h3>
          <div className="flex items-center justify-center mb-4 sm:mb-6">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 sm:w-6 sm:h-6 md:w-8 md:h-8 ${
                  i < Math.round((score.correct / score.total) * 5)
                    ? 'text-yellow-400 fill-yellow-400'
                    : 'text-gray-400'
                }`}
              />
            ))}
          </div>
          <Progress value={(score.correct / score.total) * 100} className="mb-4 sm:mb-6 h-2 sm:h-3 bg-indigo-200" />
          <p className="text-lg sm:text-xl md:text-2xl text-center mb-4 sm:mb-6">
            You got <span className="font-bold text-green-400">{score.correct}</span> out of{' '}
            <span className="font-bold">{score.total}</span> correct.
          </p>
          <p className="text-sm sm:text-base md:text-lg text-center mb-6 sm:mb-8">
            {score.correct === score.total
              ? "Congratulations! Perfect score! 🎉"
              : score.correct >= score.total / 2
              ? "Great job! Keep it up! 👍"
              : "Don't worry, you can always try again! 💪"}
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Button onClick={() => setShowAnswers(!showAnswers)} className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 sm:py-3 px-4 sm:px-6 rounded-full transition duration-300 transform hover:scale-105 text-xs sm:text-sm">
              {showAnswers ? 'Hide Answers' : 'Show Answers'}
            </Button>
            <Button onClick={handleRetakeQuiz} className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 sm:py-3 px-4 sm:px-6 rounded-full transition duration-300 transform hover:scale-105 flex items-center justify-center text-xs sm:text-sm">
              <svg className="mr-2 h-3 w-3 sm:h-4 sm:w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 4V1L8 5l4 4V6a8 8 0 0 1 8 8h-3a5 5 0 0 0-5-5z" /></svg> Retake Quiz
            </Button>
          </div>
        </div>
      )}

      {showAnswers && quiz && (
        <ScrollArea className="mt-8 h-[60vh] bg-opacity-50 rounded-xl p-4 sm:p-6">
          <h3 className="text-xl sm:text-2xl md:text-3xl font-semibold mb-6 text-indigo-300">Quiz Answers</h3>
          <ul className="space-y-8">
            {quiz.map((q, index) => (
              <li key={index} className=" rounded-xl shadow-md mb-8">
                <strong className="block mb-4 text-base sm:text-lg md:text-xl text-indigo-200">{ReactHtmlParser(formatResponse(q.question))}</strong>
                <ul className="space-y-3">
                  {q.options.map((option, i) => (
                    <li key={i} className={`flex items-center space-x-3 p-3 rounded-lg ${
                      option === q.answer ? 'bg-green-600 bg-opacity-50 text-green-200' : 
                      selectedAnswers[index] === option ? 'bg-red-600 bg-opacity-50 text-red-200' : 'bg-gray-600 text-gray-200'
                    } text-xs sm:text-sm md:text-base`}>
                      <span className="text-base sm:text-lg md:text-xl">{option === q.answer ? '✓' : selectedAnswers[index] === option ? '✗' : ''}</span>
                      <span>{option}</span>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </ScrollArea>
      )}
    </div>
  );
};

export default QuizGenerator;