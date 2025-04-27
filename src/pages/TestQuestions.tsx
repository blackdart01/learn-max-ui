import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { testService, questionService } from '../services/api';
import { Question, Test } from '../types';
import Modal from '../components/Modal';
import Toast from '../components/Toast';
import { MathJax, MathJaxContext } from 'better-react-mathjax';

const defaultEditForm = {
  questionText: '',
  options: ['', '', '', ''],
  correctAnswer: [],
  topic: '',
  difficulty: '',
  questionType: 'mcq',
};

type EditFormType = {
  questionText: string;
  options: string[];
  correctAnswer: string[];
  topic: string;
  difficulty: string;
  questionType: string;
};

const mathJaxConfig = {
  loader: { load: ["input/tex", "output/chtml"] },
  tex: { inlineMath: [['$', '$'], ['\\(', '\\)']] }
};

const TestQuestions: React.FC = () => {
  const { id: testId } = useParams<{ id: string }>();
  const [test, setTest] = useState<Test | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [questionToEdit, setQuestionToEdit] = useState<Question | null>(null);
  const [editForm, setEditForm] = useState<EditFormType>({ ...defaultEditForm });
  const [editLoading, setEditLoading] = useState(false);
  const [removeLoading, setRemoveLoading] = useState(false);
  const [removeConfirmOpen, setRemoveConfirmOpen] = useState(false);
  const [questionToRemove, setQuestionToRemove] = useState<Question | null>(null);

  useEffect(() => {
    const fetchTest = async () => {
      try {
        setLoading(true);
        const response = await testService.getTestComplete(testId!);
        setTest(response.data);
        setQuestions(response.data.questions || []);
      } catch (err) {
        setError('Failed to fetch test details');
      } finally {
        setLoading(false);
      }
    };
    fetchTest();
  }, [testId]);

  // Toast auto-hide
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Edit handlers (same as Questions page)
  const openEditModal = (question: Question) => {
    let questionType = (question as any).questionType?.toLowerCase() || 'mcq';
    let correctAnswerArr: string[] = [];
    if (typeof question.correctAnswer === 'string' && question.correctAnswer) {
      correctAnswerArr = question.correctAnswer.split(',').map(s => s.trim()).filter(Boolean);
    } else if (Array.isArray(question.correctAnswer)) {
      correctAnswerArr = question.correctAnswer.map(s => s.trim());
    }
    setQuestionToEdit(question);
    setEditForm({
      questionText: question.questionText,
      options: questionType === 'fill-in-the-blank' ? [] : [...question.options],
      correctAnswer: correctAnswerArr,
      topic: question.topic || '',
      difficulty: question.difficulty || '',
      questionType,
    });
    setEditModalOpen(true);
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>, idx?: number) => {
    const { name, value } = e.target;
    if (name === 'options' && typeof idx === 'number') {
      setEditForm((prev) => {
        const newOptions = [...prev.options];
        newOptions[idx] = value;
        return { ...prev, options: newOptions };
      });
    } else {
      setEditForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionToEdit) return;
    setEditLoading(true);
    try {
      let correctAnswerToSave = editForm.correctAnswer;
      if (editForm.questionType === 'fill-in-the-blank') {
        correctAnswerToSave = (editForm.correctAnswer[0] || '').split(',').map(s => s.trim()).filter(Boolean);
      }
      const correctAnswerString = correctAnswerToSave.join(',');
      const updated = {
        ...questionToEdit,
        ...editForm,
        options: editForm.options.filter((opt) => opt.trim() !== ''),
        difficulty: editForm.difficulty as 'easy' | 'medium' | 'hard' | undefined,
        correctAnswer: correctAnswerString,
      };
      await questionService.updateQuestion(questionToEdit._id, updated);
      setQuestions((prev) =>
        prev.map((q) =>
          q._id === questionToEdit._id
            ? { ...q, ...updated, correctAnswer: correctAnswerString }
            : q
        )
      );
      setEditModalOpen(false);
      setQuestionToEdit(null);
      setToastType('success');
      setToastMessage('Question updated successfully');
    } catch (err) {
      setToastType('error');
      setToastMessage('Failed to update question');
    } finally {
      setEditLoading(false);
    }
  };

  // Remove from test
  const handleRemoveFromTest = async (question: Question) => {
    if (!testId) return;
    setRemoveLoading(true);
    try {
      await testService.removeQuestionFromTest(testId, question._id);
      setQuestions((prev) => prev.filter((q) => q._id !== question._id));
      setToastType('success');
      setToastMessage('Question removed from test');
    } catch (err) {
      setToastType('error');
      setToastMessage('Failed to remove question from test');
    } finally {
      setRemoveLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading test questions...</div>
      </div>
    );
  }

  if (error || !test) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-red-600">{error || 'Test not found.'}</div>
      </div>
    );
  }

  return (
    <MathJaxContext config={mathJaxConfig}>
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <Toast message={toastMessage || ""} isOpen={!!toastMessage} />
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-2xl font-semibold text-gray-900 mb-6">Test: {test.title}</h1>
          {questions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No questions in this test.</p>
            </div>
          ) : (
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {questions.map((question) => (
                  <li key={question._id}>
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 pr-4">
                          <h3 className="text-lg font-medium text-gray-900">
                            <MathJax inline>{question.questionText}</MathJax>
                          </h3>
                          <div className="mt-2">
                            <div className="space-y-2">
                              {question.options.map((option, index) => (
                                <div
                                  key={index}
                                  className={`flex items-center space-x-2 text-sm ${
                                    ((typeof question.correctAnswer === 'string' && question.correctAnswer.split(',').map(s => s.trim()).includes(option)) ||
                                     (Array.isArray(question.correctAnswer) && question.correctAnswer.includes(option)))
                                      ? 'text-green-600 font-medium'
                                      : 'text-gray-500'
                                    }`}
                                >
                                  <span className="w-6">{String.fromCharCode(65 + index)}.</span>
                                  <span>{option}</span>
                                  {((typeof question.correctAnswer === 'string' && question.correctAnswer.split(',').map(s => s.trim()).includes(option)) ||
                                    (Array.isArray(question.correctAnswer) && question.correctAnswer.includes(option))) && (
                                    <span className="text-xs">(Correct)</span>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                          {(question as any).questionType?.toLowerCase() === 'fill-in-the-blank' && (
                            <div className="mt-2 text-green-700 text-sm">
                              Correct Answer: {
                                Array.isArray(question.correctAnswer)
                                  ? question.correctAnswer.join(', ')
                                  : (typeof question.correctAnswer === 'string' && question.correctAnswer
                                      ? question.correctAnswer.split(',').map(ans => ans.trim()).filter(Boolean).join(', ')
                                      : '')
                              }
                            </div>
                          )}
                        </div>
                        <div className="ml-4 flex-shrink-0 flex space-x-2">
                          <button
                            className="bg-blue-100 text-blue-800 px-3 py-1 rounded-md text-sm font-medium hover:bg-blue-200"
                            onClick={() => openEditModal(question)}
                          >
                            Edit
                          </button>
                          <button
                            className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-md text-sm font-medium hover:bg-yellow-200"
                            onClick={() => {
                              setQuestionToRemove(question);
                              setRemoveConfirmOpen(true);
                            }}
                            disabled={removeLoading}
                          >
                            {removeLoading ? 'Removing...' : 'Remove from Test'}
                          </button>
                        </div>
                      </div>
                      <div className="mt-2 sm:flex sm:justify-between">
                        <div className="sm:flex space-x-4">
                          {question.topic && (
                            <p className="flex items-center text-sm text-gray-500">
                              Topic: {question.topic}
                            </p>
                          )}
                          {question.difficulty && (
                            <p className="flex items-center text-sm text-gray-500">
                              Difficulty: {question.difficulty}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        {/* Edit Question Modal */}
        <Modal
          isOpen={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          title={questionToEdit ? 'Edit Question' : 'Create Question'}
        >
          <form onSubmit={handleEditSubmit}>
            <div className="mb-4">
              <label className="block mb-1 font-medium">Question Text</label>
              <input
                type="text"
                name="questionText"
                value={editForm.questionText}
                onChange={handleEditChange}
                className="w-full border rounded px-3 py-2"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block mb-1 font-medium">Question Type</label>
              <select
                name="questionType"
                value={editForm.questionType}
                onChange={handleEditChange}
                className="w-full border rounded px-3 py-2"
              >
                <option value="mcq">MCQ</option>
                <option value="checkbox">Checkbox</option>
                <option value="poll">Poll</option>
                <option value="fill-in-the-blank">Fill-in-the-Blank</option>
              </select>
            </div>
            {editForm.questionType === 'fill-in-the-blank' && (
              <div className="mb-4">
                <label className="block mb-1 font-medium">Answer</label>
                <input
                  type="text"
                  value={editForm.correctAnswer[0] || ''}
                  onChange={e => setEditForm(prev => ({ ...prev, correctAnswer: [e.target.value] }))}
                  className="w-full border rounded px-3 py-2"
                  placeholder="Correct answer (comma separated for multiple)"
                />
              </div>
            )}
            {editForm.questionType === 'fill-in-the-blank' ? (
              <div className="mb-4">
                <label className="block mb-1 font-medium">Answer(s)</label>
                {editForm.correctAnswer.map((ans, idx) => (
                  <input
                    key={idx}
                    type="text"
                    value={ans}
                    className="w-full border rounded px-3 py-2 mb-2"
                    placeholder="Correct answer"
                    readOnly
                  />
                ))}
              </div>
            ) : (
              <div className="mb-4">
                <label className="block mb-1 font-medium">Options</label>
                {editForm.options.map((option, idx) => (
                  <div key={idx} className="flex items-center mb-2">
                    <input
                      type="text"
                      name="options"
                      value={option}
                      onChange={(e) => handleEditChange(e, idx)}
                      className="flex-1 border rounded px-3 py-2 mr-2"
                      required={idx < 2}
                      placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                    />
                    <input
                      type={editForm.questionType === 'checkbox' ? 'checkbox' : 'radio'}
                      name="correctAnswer"
                      checked={editForm.questionType === 'checkbox'
                        ? editForm.correctAnswer.includes(option)
                        : editForm.correctAnswer[0] === option}
                      onChange={() => {
                        if (editForm.questionType === 'checkbox') {
                          setEditForm(prev => {
                            const arr = [...prev.correctAnswer];
                            if (arr.includes(option)) {
                              return { ...prev, correctAnswer: arr.filter(o => o !== option) };
                            } else {
                              return { ...prev, correctAnswer: [...arr, option] };
                            }
                          });
                        } else {
                          setEditForm(prev => ({ ...prev, correctAnswer: [option] }));
                        }
                      }}
                      className="ml-2"
                      required={editForm.questionType !== 'checkbox'}
                    />
                    <span className="ml-1 text-xs">Correct</span>
                    <button
                      type="button"
                      className="ml-2 text-red-500 hover:text-red-700"
                      onClick={() => {
                        setEditForm(prev => {
                          const newOptions = prev.options.filter((_, i) => i !== idx);
                          const newCorrect = prev.correctAnswer.filter(ans => ans !== option);
                          return { ...prev, options: newOptions, correctAnswer: newCorrect };
                        });
                      }}
                      title="Delete option"
                    >
                      &#128465;
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  className="mt-2 px-3 py-1 rounded bg-gray-100 text-gray-800 hover:bg-gray-200 text-sm"
                  onClick={() => setEditForm((prev) => ({ ...prev, options: [...prev.options, ''] }))}
                >
                  Add More Option
                </button>
              </div>
            )}
            <div className="mb-4">
              <label className="block mb-1 font-medium">Topic</label>
              <input
                type="text"
                name="topic"
                value={editForm.topic}
                onChange={handleEditChange}
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div className="mb-4">
              <label className="block mb-1 font-medium">Difficulty</label>
              <select
                name="difficulty"
                value={editForm.difficulty}
                onChange={handleEditChange}
                className="w-full border rounded px-3 py-2"
              >
                <option value="">Select difficulty</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                className="px-4 py-2 rounded bg-gray-200 text-gray-800 hover:bg-gray-300"
                onClick={() => setEditModalOpen(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
                disabled={editLoading}
              >
                {editLoading ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
        </Modal>
        {/* Confirmation Modal */}
        <Modal isOpen={removeConfirmOpen} onClose={() => setRemoveConfirmOpen(false)} title="Remove Question from Test">
          <div>Are you sure you want to remove this question from the test?</div>
          <div className="mt-6 flex justify-end space-x-2">
            <button
              className="px-4 py-2 rounded bg-gray-200 text-gray-800 hover:bg-gray-300"
              onClick={() => setRemoveConfirmOpen(false)}
            >
              Cancel
            </button>
            <button
              className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
              onClick={async () => {
                if (!testId || !questionToRemove) return;
                setRemoveLoading(true);
                try {
                  await testService.removeQuestionFromTest(testId, questionToRemove._id);
                  setQuestions((prev) => prev.filter((q) => q._id !== questionToRemove._id));
                  setRemoveConfirmOpen(false);
                  setQuestionToRemove(null);
                  setToastType('success');
                  setToastMessage('Question removed from test');
                } catch (err) {
                  setToastType('error');
                  setToastMessage('Failed to remove question from test');
                } finally {
                  setRemoveLoading(false);
                }
              }}
            >
              Remove
            </button>
          </div>
        </Modal>
      </div>
    </MathJaxContext>
  );
};

export default TestQuestions; 