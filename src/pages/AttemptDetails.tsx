import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { studentService } from '../services/api';
import { Attempt, Question } from '../types';
import Toast from '../components/Toast';

interface AttemptQuestion extends Question {
  userAnswer?: string;
  isCorrect?: boolean;
  isAttempted: boolean;
}

const AttemptDetails: React.FC = () => {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [questions, setQuestions] = useState<AttemptQuestion[]>([]);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    const fetchAttemptDetails = async () => {
      if (!attemptId) {
        setToast({ message: 'Attempt ID not found', type: 'error' });
        setTimeout(() => navigate('/my-attempts'), 2000);
        return;
      }
      
      try {
        const res = await studentService.getStudentAttemptById(attemptId);
        if (!res.data) {
          setToast({ message: 'Failed to load attempt details', type: 'error' });
          setTimeout(() => navigate('/my-attempts'), 2000);
          return;
        }
        
        setAttempt(res.data);
        
        if (res.data.testId && Array.isArray(res.data.testId.questions)) {
          // Create a map of answers for easier lookup
          const answersMap = res.data.answers.reduce((acc: {[key: string]: string}, ans: any) => {
            acc[ans.questionId._id] = ans.selectedOption;
            return acc;
          }, {});
          
          // Map user answers to questions
          const questionsWithAnswers = res.data.testId.questions.map((q: Question) => {
            const userAnswer = answersMap[q._id];
            return {
              ...q,
              userAnswer,
              isCorrect: (q.correctAnswer as string[])
                .map(correctAnswer => correctAnswer.toLowerCase())
                .includes((answersMap[q._id] as string).toLowerCase()),
                isAttempted: q._id in answersMap
            };
          });
          
          setQuestions(questionsWithAnswers);
        } else {
          setToast({ message: 'No questions found in this attempt', type: 'error' });
          setTimeout(() => navigate('/my-attempts'), 2000);
        }
      } catch (error) {
        console.error('Error fetching attempt details:', error);
        setToast({ message: 'Failed to load attempt details', type: 'error' });
        setTimeout(() => navigate('/my-attempts'), 2000);
      } finally {
        setLoading(false);
      }
    };

    fetchAttemptDetails();
  }, [attemptId, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading...</div>
        {toast && <Toast message={toast.message} type={toast.type} isOpen={true} />}
      </div>
    );
  }

  if (!attempt || !questions.length) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Toast message="Failed to load attempt details" type="error" isOpen={true} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      {toast && <Toast message={toast.message} type={toast.type} isOpen={true} />}
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">{attempt.testId.title}</h1>
        <div className="flex gap-4 text-sm text-gray-600">
          <div>Started: {new Date(attempt.startTime).toLocaleString()}</div>
          {attempt.endTime && (
            <>
              <div>Completed: {new Date(attempt.endTime).toLocaleString()}</div>
              <div className="font-semibold">Score: {attempt.score}%</div>
            </>
          )}
        </div>
      </div>

      <div className="space-y-8">
        {questions.map((question, index) => (
          <div key={question._id} className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-medium">Question {index + 1}</h3>
              <div className={`px-3 py-1 rounded text-sm ${
                !question.isAttempted 
                  ? 'bg-gray-100 text-gray-800'
                  : question.isCorrect 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
              }`}>
                {!question.isAttempted 
                  ? 'Not Attempted'
                  : question.isCorrect 
                    ? 'Correct' 
                    : 'Incorrect'}
              </div>
            </div>

            <div className="mb-4">{question.questionText}</div>

            {/* For MCQ questions */}
            {Array.isArray(question.options) && question.options.length > 0 && (
              <div className="space-y-2">
                {question.options.map((option, optIndex) => {
                  const correctAnswer = Array.isArray(question.correctAnswer) 
                    ? question.correctAnswer[0] 
                    : question.correctAnswer;
                  const isCorrectAnswer = option === correctAnswer;
                  const isUserAnswer = option === question.userAnswer;
                  
                  let optionClass = 'p-3 rounded-lg ';
                  if (isUserAnswer && isCorrectAnswer) {
                    optionClass += 'bg-green-50 border border-green-200';
                  } else if (isUserAnswer && !isCorrectAnswer) {
                    optionClass += 'bg-red-50 border border-red-200';
                  } else if (isCorrectAnswer) {
                    optionClass += 'bg-green-50 border border-green-200';
                  } else {
                    optionClass += 'bg-gray-50';
                  }

                  return (
                    <div key={optIndex} className={optionClass}>
                      <div className="flex items-center justify-between">
                        <div className="flex-grow">{option}</div>
                        <div className="flex items-center gap-2">
                          {isUserAnswer && isCorrectAnswer && (
                            <span className="text-green-600 text-sm flex items-center">
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                              </svg>
                              Correct
                            </span>
                          )}
                          {isUserAnswer && !isCorrectAnswer && (
                            <span className="text-red-600 text-sm flex items-center">
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                              Your Answer
                            </span>
                          )}
                          {!isUserAnswer && isCorrectAnswer && (
                            <span className="text-green-600 text-sm flex items-center">
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                              </svg>
                              Correct Answer
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* For text/numeric input questions */}
            {(!question.options || !question.options.length) && (
              <div className="space-y-4">
                <div className="p-3 rounded-lg bg-green-50 border border-green-200">
                  <div className="text-sm text-green-800 mb-1">Correct Answer:</div>
                  <div className="font-medium">
                    {Array.isArray(question.correctAnswer) 
                      ? question.correctAnswer[0] 
                      : question.correctAnswer}
                  </div>
                </div>
                {question.isAttempted ? (
                  <div className={`p-3 rounded-lg ${
                    question.isCorrect 
                      ? 'bg-green-50 border border-green-200' 
                      : 'bg-red-50 border border-red-200'
                  }`}>
                    <div className="text-sm mb-1">Your Answer:</div>
                    <div className="font-medium">{question.userAnswer}</div>
                  </div>
                ) : (
                  <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
                    <div className="text-sm text-gray-500">No answer provided</div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AttemptDetails; 