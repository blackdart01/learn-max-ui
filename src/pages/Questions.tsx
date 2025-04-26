import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { questionService, testService } from '../services/api';
import { Question, QuestionFormData } from '../types';
import Modal from '../components/Modal';
import Toast from '../components/Toast';

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

const Questions: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState<Question | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [questionToEdit, setQuestionToEdit] = useState<Question | null>(null);
  const [editForm, setEditForm] = useState<EditFormType>({ ...defaultEditForm });
  const [editLoading, setEditLoading] = useState(false);
  const [addToTestModalOpen, setAddToTestModalOpen] = useState(false);
  const [questionToAddToTest, setQuestionToAddToTest] = useState<Question | null>(null);
  const [allTests, setAllTests] = useState<any[]>([]);
  const [selectedTestIds, setSelectedTestIds] = useState<string[]>([]);
  const [addToTestLoading, setAddToTestLoading] = useState(false);

  // Delete handler
  const handleDelete = async () => {
    if (!questionToDelete) return;
    try {
      await questionService.deleteQuestion(questionToDelete._id);
      setQuestions((prev) => prev.filter((q) => q._id !== questionToDelete._id));
      setDeleteModalOpen(false);
      setQuestionToDelete(null);
      setToastType('success');
      setToastMessage('Question deleted successfully');
    } catch (err) {
      setToastType('error');
      setToastMessage('Failed to delete question');
    }
  };

  // Edit handlers
  const openEditModal = (question: Question) => {
    let questionType = (question as any).questionType?.toLowerCase() || 'mcq';
    let correctAnswerArr: string[] = [];
    if (typeof question.correctAnswer === 'string' && question.correctAnswer) {
      correctAnswerArr = question.correctAnswer.split(',').map(s => s.trim()).filter(Boolean);
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
      // Convert array to string for API
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

  const handleCreateNew = () => {
    setQuestionToEdit(null);
    setEditForm({ ...defaultEditForm });
    setEditModalOpen(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditLoading(true);
    try {
      let correctAnswerToSave = editForm.correctAnswer;
      if (editForm.questionType === 'fill-in-the-blank') {
        correctAnswerToSave = (editForm.correctAnswer[0] || '').split(',').map(s => s.trim()).filter(Boolean);
      }
      // Convert array to string for API
      const correctAnswerString = correctAnswerToSave.join(',');
      const newQuestion = {
        questionText: editForm.questionText,
        questionType: editForm.questionType,
        options: editForm.options.filter((opt) => opt.trim() !== ''),
        correctAnswer: correctAnswerString,
        topic: editForm.topic,
        difficulty: editForm.difficulty as 'easy' | 'medium' | 'hard' | undefined,
      };
      const response = await questionService.addQuestion(newQuestion as unknown as Omit<Question, 'id' | 'createdAt' | 'createdBy'>);
      setQuestions((prev) => [response.data, ...prev]);
      setEditModalOpen(false);
      setToastType('success');
      setToastMessage('Question created successfully');
    } catch (err) {
      setToastType('error');
      setToastMessage('Failed to create question');
    } finally {
      setEditLoading(false);
    }
  };

  const openAddToTestModal = async (question: Question) => {
    setQuestionToAddToTest(question);
    setAddToTestModalOpen(true);
    setAddToTestLoading(true);
    try {
      const response = await testService.getAllTests();
      const now = new Date();
      const activeTests = (response.data || []).filter(test => {
        const start = test.startDate ? new Date(test.startDate) : null;
        const end = test.endDate ? new Date(test.endDate) : null;
        return (!start || start <= now) && (!end || end >= now);
      });
      setAllTests(activeTests);
    } catch (err) {
      setAllTests([]);
    } finally {
      setAddToTestLoading(false);
    }
  };

  const handleAddToTestConfirm = async () => {
    if (!questionToAddToTest || selectedTestIds.length === 0) return;
    setAddToTestLoading(true);
    try {
      await testService.addQuestionToMultipleTests(questionToAddToTest._id, selectedTestIds);
      setToastType('success');
      setToastMessage('Question added to selected tests successfully');
      setAddToTestModalOpen(false);
      setSelectedTestIds([]);
      setQuestionToAddToTest(null);
    } catch (err) {
      setToastType('error');
      setToastMessage('Failed to add question to tests');
    } finally {
      setAddToTestLoading(false);
    }
  };

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        const response = await questionService.getAllQuestions();
        setQuestions(response.data);
      } catch (err) {
        setError('Failed to fetch questions');
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, []);

  // Toast auto-hide
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading questions...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 min-h-screen">
      <Toast
        message={toastMessage || ""}
        isOpen={!!toastMessage}
      />
      <div className="px-4 py-6 sm:px-0">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
          <h1 className="text-2xl font-semibold text-gray-900 ">Question Bank</h1>
          <button
            className="w-full sm:w-auto bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 "
            onClick={handleCreateNew}
          >
            Create New Question
          </button>
        </div>
        
        {questions.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 ">No questions available. Create your first question!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {questions.map((question) => (
              <div key={question._id} className="bg-white  shadow rounded-lg p-4 flex flex-col gap-2">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="flex-1">
                    <h3 className="text-base sm:text-lg font-medium text-gray-900  mb-1">{question.questionText}</h3>
                    <div className="mt-1">
                      <div className="space-y-1">
                        {question.options.map((option, index) => (
                          <div
                            key={index}
                            className={`flex items-center space-x-2 text-sm ${
                              Array.isArray(question.correctAnswer) && question.correctAnswer.includes(option)
                                ? 'text-green-600 font-medium'
                                : 'text-gray-500'
                            }`}
                          >
                            <span className="w-6">{String.fromCharCode(65 + index)}.</span>
                            <span>{option}</span>
                            {Array.isArray(question.correctAnswer) && question.correctAnswer.includes(option) && (
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
                  <div className="flex sm:flex-wrap flex-row gap-2 sm:gap-2 mt-2 sm:mt-0">
                    <button
                      className="bg-blue-100 text-blue-800 px-3 py-1 rounded-md text-sm font-medium hover:bg-blue-200 w-full sm:w-auto"
                      onClick={() => openEditModal(question)}
                    >
                      Edit
                    </button>
                    <button
                      className="bg-red-100 text-red-800 px-3 py-1 rounded-md text-sm font-medium hover:bg-red-200 w-full sm:w-auto"
                      onClick={() => {
                        setQuestionToDelete(question);
                        setDeleteModalOpen(true);
                      }}
                    >
                      Delete
                    </button>
                    <button
                      className="bg-green-100 text-green-800 px-3 py-1 rounded-md text-sm font-medium hover:bg-green-200 w-full sm:w-auto"
                      onClick={() => openAddToTestModal(question)}
                    >
                      Add to Test
                    </button>
                  </div>
                </div>
                <div className="mt-2 flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-4">
                  <div className="flex flex-wrap gap-2">
                    {question.topic && (
                      <span className="inline-flex items-center text-xs sm:text-sm text-gray-500 bg-gray-100 rounded px-2 py-1">
                        Topic: {question.topic}
                      </span>
                    )}
                    {question.difficulty && (
                      <span className="inline-flex items-center text-xs sm:text-sm text-gray-500  bg-gray-100 rounded px-2 py-1">
                        Difficulty: {question.difficulty}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Delete Confirmation Modal */}
      <Modal isOpen={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} title="Delete Question">
        <div className="text-gray-700">Are you sure you want to delete this question?</div>
        <div className="mt-6 flex justify-end space-x-2">
          <button
            className="px-4 py-2 rounded bg-gray-200 text-gray-800 hover:bg-gray-300"
            onClick={() => setDeleteModalOpen(false)}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
            onClick={handleDelete}
          >
            Delete
          </button>
        </div>
      </Modal>
      {/* Edit Question Modal */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title={questionToEdit ? 'Edit Question' : 'Create Question'}
      >
        <form onSubmit={questionToEdit ? handleEditSubmit : handleCreateSubmit}>
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
          {editForm.questionType !== 'fill-in-the-blank' && (
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
      {/* Add To Test Modal */}
      <Modal isOpen={addToTestModalOpen} onClose={() => setAddToTestModalOpen(false)} title="Add Question to Tests">
        {addToTestLoading ? (
          <div>Loading tests...</div>
        ) : (
          <form onSubmit={e => { e.preventDefault(); handleAddToTestConfirm(); }}>
            <div className="mb-4 max-h-64 overflow-y-auto">
              {allTests.length === 0 ? (
                <div>No active tests found.</div>
              ) : (
                allTests.map(test => (
                  <div key={test._id} className="flex items-center mb-2">
                    <input
                      type="checkbox"
                      id={`test-${test._id}`}
                      checked={selectedTestIds.includes(test._id)}
                      onChange={e => {
                        if (e.target.checked) {
                          setSelectedTestIds(prev => [...prev, test._id]);
                        } else {
                          setSelectedTestIds(prev => prev.filter(id => id !== test._id));
                        }
                      }}
                      className="mr-2"
                    />
                    <label htmlFor={`test-${test._id}`}>{test.title}</label>
                  </div>
                ))
              )}
            </div>
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                className="px-4 py-2 rounded bg-gray-200 text-gray-800 hover:bg-gray-300"
                onClick={() => setAddToTestModalOpen(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700"
                disabled={addToTestLoading || selectedTestIds.length === 0}
              >
                {addToTestLoading ? 'Adding...' : 'Add'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default Questions; 