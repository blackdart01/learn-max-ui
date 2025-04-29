import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { studentService } from '../services/api';
import Toast from '../components/Toast';

const ViewResponse: React.FC = () => {
  const { attemptId } = useParams();
  const [attempt, setAttempt] = useState<any>(null);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    const fetchAttemptWithAnswers = async () => {
      if (!attemptId) return;

      try {
        const res = await studentService.getStudentAttemptById(attemptId);
        setAttempt(res.data);
      } catch (error) {
        console.error('Error fetching attempt:', error);
        setToast({ message: 'Failed to load attempt response', type: 'error' });
      } finally {
        setLoading(false);
      }
    };

    fetchAttemptWithAnswers();
  }, [attemptId]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-lg text-gray-600">Loading response...</div>;
  }

  if (!attempt) {
    return <div className="min-h-screen flex items-center justify-center text-lg text-red-600">Failed to load attempt data.</div>;
  }

  const questions = attempt.testId.questions || [];
  if (!Array.isArray(questions) || questions.length === 0) {
    return <div className="min-h-screen flex items-center justify-center text-lg text-red-600">No questions found in this test.</div>;
  }

  const q = questions[current];
  if (!q) {
    return <div className="min-h-screen flex items-center justify-center text-lg text-red-600">Failed to load question data.</div>;
  }

  const userAnswer = attempt.answers.find((ans: any) => ans.questionId === q._id)?.selectedOption;
  const isCorrect = userAnswer === q.correctAnswer;
  const total = questions.length;

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <Toast message={toast?.message || ''} isOpen={!!toast} />
      
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Test Response: {attempt.testId.title}</h2>
        <div className="text-lg font-medium">
          Score: {attempt.score}%
        </div>
      </div>

      {/* Question Progress Summary */}
      <div className="bg-white shadow rounded-lg p-4 mb-4">
        <div className="flex justify-between items-center">
          <div className="text-sm font-medium">
            Question {current + 1} of {total}
          </div>
          <div className="text-sm">
            Completed on: {new Date(attempt.submittedAt).toLocaleString()}
          </div>
        </div>
        
        {/* Question Navigation */}
        <div className="mt-4 flex flex-wrap gap-2">
          {questions.map((_, index) => {
            const answer = attempt.answers.find((ans: any) => ans.questionId === questions[index]._id);
            const correct = answer?.selectedOption === questions[index].correctAnswer;
            return (
              <button
                key={index}
                onClick={() => setCurrent(index)}
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium
                  ${current === index ? 'ring-2 ring-blue-500 ' : ''}
                  ${answer ? (correct ? 'bg-green-500 text-white' : 'bg-red-500 text-white') : 'bg-gray-200 text-gray-700'}
                `}
              >
                {index + 1}
              </button>
            );
          })}
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6 mb-4">
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-2">{q.questionText}</h3>
          <div className="text-sm text-gray-500 mb-4">
            {userAnswer ? (
              isCorrect ? (
                <span className="text-green-600">✓ Correct Answer</span>
              ) : (
                <span className="text-red-600">✗ Incorrect Answer</span>
              )
            ) : (
              <span className="text-yellow-600">Not Answered</span>
            )}
          </div>
        </div>

        {/* Options */}
        {(!q.questionType || q.questionType === 'multiple-choice' || q.questionType === 'MCQ') && Array.isArray(q.options) && (
          <div className="space-y-3">
            {q.options.map((opt, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-lg border ${
                  opt === q.correctAnswer
                    ? 'border-green-500 bg-green-50'
                    : opt === userAnswer
                    ? 'border-red-500 bg-red-50'
                    : 'border-gray-200'
                }`}
              >
                <div className="flex items-center">
                  <span className="flex-grow">{opt}</span>
                  {opt === q.correctAnswer && (
                    <span className="text-green-600 ml-2">✓ Correct Answer</span>
                  )}
                  {opt === userAnswer && opt !== q.correctAnswer && (
                    <span className="text-red-600 ml-2">✗ Your Answer</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* For fill-in-the-blank or other question types */}
        {(q.questionType === 'fill-in-the-blank' || q.questionType === 'short-answer') && (
          <div className="space-y-4">
            <div className="p-4 border rounded-lg">
              <div className="font-medium mb-2">Your Answer:</div>
              <div className={`${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                {userAnswer || 'Not answered'}
              </div>
            </div>
            <div className="p-4 border rounded-lg bg-green-50">
              <div className="font-medium mb-2">Correct Answer:</div>
              <div className="text-green-600">{q.correctAnswer}</div>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-between items-center">
        <button
          className="px-4 py-2 rounded bg-gray-200 text-gray-800 hover:bg-gray-300"
          onClick={() => setCurrent((prev) => Math.max(0, prev - 1))}
          disabled={current === 0}
        >
          Previous
        </button>
        <button
          className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
          onClick={() => setCurrent((prev) => Math.min(total - 1, prev + 1))}
          disabled={current === total - 1}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default ViewResponse; 