import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { studentService } from '../services/api';
import { Attempt, Question } from '../types';
import Toast from '../components/Toast';

const TestTaking: React.FC = () => {
  const { testId, attemptId } = useParams();
  const navigate = useNavigate();
  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [isRecoveredState, setIsRecoveredState] = useState(false);

  // Load saved state from localStorage
  useEffect(() => {
    if (!attemptId) return;

    const savedState = localStorage.getItem(`test_state_${attemptId}`);
    if (savedState) {
      try {
        const { answers: savedAnswers, timeLeft: savedTimeLeft, current: savedCurrent } = JSON.parse(savedState);
        const now = Date.now();
        const lastUpdate = JSON.parse(savedState).lastUpdate;
        
        // Only restore state if it's from the same session (within last 24 hours)
        if (now - lastUpdate < 24 * 60 * 60 * 1000) {
          setAnswers(savedAnswers);
          setCurrent(savedCurrent);
          setTimeLeft(savedTimeLeft);
          setIsRecoveredState(true);
          setToast({ 
            message: 'Your previous progress has been restored', 
            type: 'success' 
          });
        }
      } catch (error) {
        console.error('Error recovering test state:', error);
      }
    }
  }, [attemptId]);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    if (!attemptId || !attempt) return;

    // Don't save if the test is already submitted
    if (submitting) {
      localStorage.removeItem(`test_state_${attemptId}`);
      return;
    }

    const stateToSave = {
      answers,
      timeLeft,
      current,
      lastUpdate: Date.now()
    };

    localStorage.setItem(`test_state_${attemptId}`, JSON.stringify(stateToSave));
  }, [answers, timeLeft, current, attemptId, attempt, submitting]);

  useEffect(() => {
    const fetchAttempt = async () => {
      setLoading(true);
      try {
        const res = await studentService.getStudentAttemptById(attemptId!);
        console.log('Attempt data:', res.data);
        setAttempt(res.data);
        if (res.data.testId && Array.isArray(res.data.testId.questions)) {
          setQuestions(res.data.testId.questions);
          
          // Only set initial time if there's no recovered state
          if (!isRecoveredState) {
            const duration = res.data.testId.duration || 30;
            setTimeLeft(duration * 60);
          }
        } else {
          console.error('Invalid question data:', res.data.testId.questions);
          setToast({ message: 'Failed to load questions', type: 'error' });
        }
      } catch (error) {
        console.error('Error fetching attempt:', error);
        setToast({ message: 'Failed to load attempt', type: 'error' });
      } finally {
        setLoading(false);
      }
    };
    fetchAttempt();
  }, [attemptId, isRecoveredState]);

  // Timer logic with auto-save
  useEffect(() => {
    if (timeLeft <= 0 && attempt && !submitting) {
      handleSubmit();
      return;
    }
    if (timeLeft > 0 && !submitting) {
      timerRef.current = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
        // Save state every minute
        if (timeLeft % 60 === 0) {
          const stateToSave = {
            answers,
            timeLeft,
            current,
            lastUpdate: Date.now()
          };
          localStorage.setItem(`test_state_${attemptId}`, JSON.stringify(stateToSave));
        }
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [timeLeft, submitting, attempt, attemptId, answers, current]);

  // Handle beforeunload event
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!submitting && Object.keys(answers).length > 0) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [answers, submitting]);

  const handleOptionChange = (qid: string, value: string) => {
    setAnswers((prev) => {
      // If the same option is selected again, remove it (deselect)
      if (prev[qid] === value) {
        const newAnswers = { ...prev };
        delete newAnswers[qid];
        return newAnswers;
      }
      // Otherwise set the new value
      return { ...prev, [qid]: value };
    });
  };

  const handleClearSelection = (qid: string) => {
    setAnswers((prev) => {
      const newAnswers = { ...prev };
      delete newAnswers[qid];
      return newAnswers;
    });
  };

  const handleSubmit = async () => {
    if (!attempt?.testId?._id) {
      setToast({ message: 'Test ID not found. Please try again.', type: 'error' });
      return;
    }

    setSubmitting(true);
    try {
      // Format answers as an object with questionId as key and answer as value
      const formattedAnswers = Object.entries(answers).map(([questionId, answer]) => ({
        questionId,
        selectedOption: answer
      }));

      await studentService.submitTest(attempt.testId._id, formattedAnswers);
      
      // Clear saved state after successful submission
      localStorage.removeItem(`test_state_${attemptId}`);
      setToast({ message: 'Test submitted successfully!', type: 'success' });
      setTimeout(() => navigate('/my-attempts'), 1500);
    } catch (error) {
      console.error('Error submitting test:', error);
      setToast({ message: 'Failed to submit test. Your answers have been saved.', type: 'error' });
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-lg text-gray-600">Loading test...</div>;
  }

  if (!attempt) {
    return <div className="min-h-screen flex items-center justify-center text-lg text-red-600">Failed to load attempt data.</div>;
  }

  if (!Array.isArray(questions) || questions.length === 0) {
    return <div className="min-h-screen flex items-center justify-center text-lg text-red-600">No questions found in this test.</div>;
  }

  const q = questions[current];
  if (!q) {
    return <div className="min-h-screen flex items-center justify-center text-lg text-red-600">Failed to load question data.</div>;
  }

  const total = questions.length;
  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;

  // Calculate answered and unanswered questions
  const answeredCount = Object.keys(answers).length;
  const unansweredCount = total - answeredCount;

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <Toast message={toast?.message || ''} isOpen={!!toast} />
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Test: {attempt.testId.title}</h2>
        <div className="text-lg font-mono bg-gray-100 px-3 py-1 rounded">
          {mins}:{secs.toString().padStart(2, '0')} left
        </div>
      </div>

      {/* Question Progress Summary */}
      <div className="bg-white shadow rounded-lg p-4 mb-4">
        <div className="flex justify-between items-center">
          <div className="text-sm">
            <span className="font-medium">Total Questions:</span> {total} | 
            <span className="text-green-600 ml-2">Answered: {answeredCount}</span> |
            <span className="text-red-600 ml-2">Remaining: {unansweredCount}</span>
          </div>
          <div className="text-sm font-medium">
            Question {current + 1} of {total}
          </div>
        </div>
        
        {/* Question Navigation */}
        <div className="mt-4 flex flex-wrap gap-2">
          {questions.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrent(index)}
              className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium
                ${current === index ? 'ring-2 ring-blue-500 ' : ''}
                ${answers[questions[index]._id] 
                  ? 'bg-green-500 text-white hover:bg-green-600' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}
              `}
              disabled={submitting}
            >
              {index + 1}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6 mb-4">
        <div className="mb-4">
          <div className="flex justify-between items-start">
            <div className="text-lg">{q.questionText}</div>
            {answers[q._id] && (
              <button
                onClick={() => handleClearSelection(q._id)}
                className="ml-4 px-3 py-1 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md flex items-center transition-colors"
                disabled={submitting}
              >
                <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Clear Selection
              </button>
            )}
          </div>
          {answers[q._id] && (
            <div className="mt-2 text-sm text-gray-500">
              Note: Questions may have negative marking. You can deselect your answer if unsure.
            </div>
          )}
        </div>
        {/* Render options based on questionType */}
        {(!q.questionType || q.questionType === 'multiple-choice' || q.questionText === 'MCQ') && Array.isArray(q.options) && q.options.length > 0 && (
          <div className="space-y-3">
            {q.options.map((opt, idx) => {
              const isSelected = answers[q._id] === opt;
              const isCorrect = Array.isArray(q.correctAnswer) 
                ? q.correctAnswer.includes(opt)
                : q.correctAnswer === opt;
              const showAnswer = attempt.endTime; // Only show correct/incorrect after test is submitted

              let optionClass = "flex items-center p-3 rounded-lg hover:bg-gray-50 cursor-pointer group ";
              if (showAnswer) {
                if (isSelected && isCorrect) {
                  optionClass += "bg-green-50 border border-green-200";
                } else if (isSelected && !isCorrect) {
                  optionClass += "bg-red-50 border border-red-200";
                } else if (isCorrect) {
                  optionClass += "bg-green-50 border border-green-200";
                }
              }

              return (
                <label key={idx} className={optionClass}>
                  <input
                    type="radio"
                    name={`q_${q._id}`}
                    value={opt}
                    checked={isSelected}
                    onChange={() => handleOptionChange(q._id, opt)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                    disabled={submitting || showAnswer}
                  />
                  <span className="ml-3 flex-grow">{opt}</span>
                  {showAnswer && isSelected && (
                    <span className={`ml-2 text-sm ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                      {isCorrect ? 'Correct' : 'Your Answer'}
                    </span>
                  )}
                  {showAnswer && !isSelected && isCorrect && (
                    <span className="ml-2 text-sm text-green-600">
                      Correct Answer
                    </span>
                  )}
                </label>
              );
            })}
          </div>
        )}
        {/* For fill-in-the-blank or questions without options */}
        {(q.questionType === 'fill-in-the-blank' || (!q.questionType && (!Array.isArray(q.options) || q.options.length === 0))) && (
          <div className="mt-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Type your answer here..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                value={answers[q._id] || ''}
                onChange={e => handleOptionChange(q._id, e.target.value)}
                disabled={submitting}
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                {answers[q._id] ? (
                  <svg className="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                )}
              </div>
            </div>
            <p className="mt-2 text-sm text-gray-500">
              Enter your answer in the format specified in the question. For numerical answers, include units if required.
            </p>
          </div>
        )}
        {q.questionType === 'short-answer' && (
          <textarea
            placeholder="Type your answer here..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[120px] transition-colors"
            value={answers[q._id] || ''}
            onChange={e => handleOptionChange(q._id, e.target.value)}
            disabled={submitting}
          />
        )}
      </div>

      <div className="flex justify-between items-center">
        <button
          className="px-4 py-2 rounded bg-gray-200 text-gray-800 hover:bg-gray-300 disabled:opacity-50"
          onClick={() => setCurrent((prev) => Math.max(0, prev - 1))}
          disabled={current === 0 || submitting}
        >
          Previous
        </button>
        <div className="space-x-2">
          {current < total - 1 && (
            <button
              className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
              onClick={() => setCurrent((prev) => Math.min(total - 1, prev + 1))}
              disabled={submitting}
            >
              Next
            </button>
          )}
          {current === total - 1 && (
            <button
              className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
              onClick={handleSubmit}
              disabled={submitting}
            >
              Submit Test
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TestTaking; 