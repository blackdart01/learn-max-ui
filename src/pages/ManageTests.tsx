import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { testService } from '../services/api';
import { Test, TestFormData } from '../types';
import Modal from '../components/Modal';
import { useNavigate } from 'react-router-dom';
import Toast from '../components/Toast';

// Helper to convert ISO string to datetime-local format
function toDateTimeLocal(isoString: string) {
  if (!isoString) return '';
  const date = new Date(isoString);
  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offset * 60 * 1000);
  return localDate.toISOString().slice(0, 16);
}

// Add type for form and editForm
interface TestFormUI {
  title: string;
  description: string;
  duration: number;
  startDate: string;
  endDate: string;
  visibility: 'enrolled' | 'public' | 'code';
  joinCode: string;
  allowedStudentIds: string[];
  _id?: string;
}

const ManageTests: React.FC = () => {
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [testDetailModalOpen, setTestDetailModalOpen] = useState(false);
  const [testDetail, setTestDetail] = useState<Test | null>(null);
  const [testDetailLoading, setTestDetailLoading] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [form, setForm] = useState<TestFormUI>({
    title: '',
    description: '',
    duration: 60,
    startDate: '',
    endDate: '',
    visibility: 'enrolled',
    joinCode: '',
    allowedStudentIds: [],
  });
  const [creating, setCreating] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState<TestFormUI>({
    _id: '',
    title: '',
    description: '',
    duration: 60,
    startDate: '',
    endDate: '',
    visibility: 'enrolled',
    joinCode: '',
    allowedStudentIds: [],
  });
  const [editing, setEditing] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [testToDelete, setTestToDelete] = useState<Test | null>(null);
  const navigate = useNavigate();
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  useEffect(() => {
    const fetchTests = async () => {
      try {
        setLoading(true);
        const response = await testService.getAllTests();
        setTests(response.data);
      } catch (err) {
        setError('Failed to fetch tests');
      } finally {
        setLoading(false);
      }
    };

    fetchTests();
  }, []);

  // Helper to get test status
  const getTestStatus = (test: Test) => {
    const now = new Date();
    const start = test.startDate ? new Date(test.startDate) : null;
    const end = test.endDate ? new Date(test.endDate) : null;
    if (start && now < start) return 'Upcoming';
    if (end && now > end) return 'Expired';
    return 'Active';
  };

  const openTestDetailModal = async (testId: string) => {
    setTestDetailModalOpen(true);
    setTestDetailLoading(true);
    try {
      const response = await testService.getTestById(testId);
      setTestDetail(response.data);
    } catch (err) {
      setTestDetail(null);
    } finally {
      setTestDetailLoading(false);
    }
  };

  // Edit handlers
  const openEditModal = (test: Test) => {
    setEditForm({
      _id: test._id,
      title: test.title,
      description: test.description || '',
      duration: test.duration,
      startDate: test.startDate || '',
      endDate: test.endDate || '',
      visibility: test.visibility,
      joinCode: test.joinCode || '',
      allowedStudentIds: test.allowedStudentIds || [],
    });
    setEditModalOpen(true);
  };

  // Delete handlers
  const openDeleteModal = (test: Test) => {
    setTestToDelete(test);
    setDeleteModalOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading tests...</div>
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
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <Toast message={toastMessage || ""} isOpen={!!toastMessage} />
      <div className="px-4 py-6 sm:px-0">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Manage Tests</h1>
          <button
            className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700"
            onClick={() => setCreateModalOpen(true)}
          >
            Create New Test
          </button>
        </div>
        
        {tests.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No tests created yet.</p>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {tests.map((test) => (
                <li key={test._id} className="px-4 py-4 sm:px-6 cursor-pointer hover:bg-gray-50" onClick={() => openTestDetailModal(test._id)}>
                  <div className="flex flex-wrap items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{test.title}</h3>
                      <p className="mt-1 text-sm text-gray-500">{test.description}</p>
                    </div>
                    <div className="flex-shrink-0 flex items-center space-x-2">
                      {/* Status Tag */}
                      {(() => {
                        const status = getTestStatus(test);
                        let color = 'bg-green-100 text-green-800';
                        if (status === 'Upcoming') color = 'bg-blue-100 text-blue-800';
                        if (status === 'Expired') color = 'bg-red-100 text-red-800';
                        return (
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${color}`}>{status}</span>
                        );
                      })()}
                      <button
                        className="ml-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-md text-sm font-medium hover:bg-blue-200"
                        onClick={e => {
                          e.stopPropagation();
                          openEditModal(test);
                        }}
                      >
                        Edit
                      </button>
                      <button
                        className="bg-red-100 text-red-800 px-3 py-1 rounded-md text-sm font-medium hover:bg-red-200"
                        onClick={e => {
                          e.stopPropagation();
                          openDeleteModal(test);
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  <div className="mt-2 sm:flex sm:justify-between">
                    <div className="sm:flex">
                      <p className="flex items-center text-sm text-gray-500">
                        Questions: {test.questions.length} • Duration: {test.duration} minutes
                      </p>
                    </div>
                    <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                      <p>
                        {test.startDate && `Starts: ${new Date(test.startDate).toLocaleDateString()}`}
                        {test.endDate && ` • Ends: ${new Date(test.endDate).toLocaleDateString()}`}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Test Detail Modal */}
        <Modal isOpen={testDetailModalOpen} onClose={() => setTestDetailModalOpen(false)} title="Test Details">
          {testDetailLoading ? (
            <div>Loading...</div>
          ) : testDetail ? (
            <div className="space-y-2">
              <div><strong>Title:</strong> {testDetail.title}</div>
              <div><strong>Description:</strong> {testDetail.description}</div>
              <div className="flex items-center space-x-2">
                <span><strong>Questions:</strong> {testDetail.questions.length}</span>
                <button
                  className="px-2 py-1 rounded bg-indigo-600 text-white text-xs font-medium hover:bg-indigo-700"
                  onClick={() => {
                    setTestDetailModalOpen(false);
                    navigate(`/tests/${testDetail._id}/questions`);
                  }}
                >
                  View Questions
                </button>
              </div>
              <div><strong>Duration:</strong> {testDetail.duration} minutes</div>
              <div><strong>Start Date:</strong> {testDetail.startDate ? new Date(testDetail.startDate).toLocaleString() : 'N/A'}</div>
              <div><strong>End Date:</strong> {testDetail.endDate ? new Date(testDetail.endDate).toLocaleString() : 'N/A'}</div>
              <div><strong>Status:</strong> {getTestStatus(testDetail)}</div>
              {/* Add more fields as needed */}
            </div>
          ) : (
            <div>Failed to load test details.</div>
          )}
        </Modal>

        <Modal isOpen={createModalOpen} onClose={() => setCreateModalOpen(false)} title="Create New Test">
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setCreating(true);
              try {
                const payload: TestFormData = {
                  title: form.title,
                  description: form.description,
                  duration: Number(form.duration),
                  startDate: form.startDate || undefined,
                  endDate: form.endDate || undefined,
                  questions: [],
                  visibility: form.visibility,
                  joinCode: form.visibility === 'code' ? form.joinCode : undefined,
                  allowedStudentIds: form.allowedStudentIds,
                };
                const response = await testService.createTest(payload);
                setTests((prev) => [response.data, ...prev]);
                setCreateModalOpen(false);
                setForm({ title: '', description: '', duration: 60, startDate: '', endDate: '', visibility: 'enrolled', joinCode: '', allowedStudentIds: [] });
              } catch (err) {
                alert('Failed to create test');
              } finally {
                setCreating(false);
              }
            }}
          >
            <div className="mb-4">
              <label className="block mb-1 font-medium">Title</label>
              <input
                type="text"
                className="w-full border rounded px-3 py-2"
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                required
              />
            </div>
            <div className="mb-4">
              <label className="block mb-1 font-medium">Description</label>
              <textarea
                className="w-full border rounded px-3 py-2"
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              />
            </div>
            <div className="mb-4">
              <label className="block mb-1 font-medium">Duration (minutes)</label>
              <input
                type="number"
                className="w-full border rounded px-3 py-2"
                value={form.duration}
                onChange={e => setForm(f => ({ ...f, duration: Number(e.target.value) }))}
                min={1}
                required
              />
            </div>
            <div className="mb-4">
              <label className="block mb-1 font-medium">Start Date</label>
              <input
                type="datetime-local"
                className="w-full border rounded px-3 py-2"
                value={form.startDate}
                onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))}
              />
            </div>
            <div className="mb-4">
              <label className="block mb-1 font-medium">End Date</label>
              <input
                type="datetime-local"
                className="w-full border rounded px-3 py-2"
                value={form.endDate}
                onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))}
              />
            </div>
            <div className="mb-4">
              <label className="block mb-1 font-medium">Visibility</label>
              <select
                className="w-full border rounded px-3 py-2"
                value={form.visibility}
                onChange={e => setForm(f => ({ ...f, visibility: e.target.value as 'enrolled' | 'public' | 'code' }))}
              >
                <option value="enrolled">Only my enrolled students</option>
                <option value="public">All students</option>
                <option value="code">Students with join code</option>
              </select>
            </div>
            {form.visibility === 'code' && (
              <div className="mb-4">
                <label className="block mb-1 font-medium">Join Code</label>
                <input
                  type="text"
                  className="w-full border rounded px-3 py-2"
                  value={form.joinCode}
                  onChange={e => setForm(f => ({ ...f, joinCode: e.target.value }))}
                  placeholder="Enter or generate a join code"
                  required={form.visibility === 'code'}
                />
              </div>
            )}
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                className="px-4 py-2 rounded bg-gray-200 text-gray-800 hover:bg-gray-300"
                onClick={() => setCreateModalOpen(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
                disabled={creating}
              >
                {creating ? 'Creating...' : 'Create'}
              </button>
            </div>
          </form>
        </Modal>

        {/* Edit Test Modal */}
        <Modal isOpen={editModalOpen} onClose={() => setEditModalOpen(false)} title="Edit Test">
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setEditing(true);
              try {
                if (!editForm._id) return;
                const payload = {
                  title: editForm.title,
                  description: editForm.description,
                  duration: Number(editForm.duration),
                  startDate: editForm.startDate || undefined,
                  endDate: editForm.endDate || undefined,
                  visibility: editForm.visibility,
                  joinCode: editForm.visibility === 'code' ? editForm.joinCode : undefined,
                  allowedStudentIds: editForm.allowedStudentIds,
                };
                const response = await testService.updateTest(editForm._id, payload);
                setTests(prev => prev.map(t => t._id === editForm._id ? response.data : t));
                setEditModalOpen(false);
                setToastType('success');
                setToastMessage('Test updated successfully');
              } catch (err) {
                setToastType('error');
                setToastMessage('Failed to update test');
              } finally {
                setEditing(false);
              }
            }}
          >
            <div className="mb-4">
              <label className="block mb-1 font-medium">Title</label>
              <input
                type="text"
                className="w-full border rounded px-3 py-2"
                value={editForm.title}
                onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))}
                required
              />
            </div>
            <div className="mb-4">
              <label className="block mb-1 font-medium">Description</label>
              <textarea
                className="w-full border rounded px-3 py-2"
                value={editForm.description}
                onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))}
              />
            </div>
            <div className="mb-4">
              <label className="block mb-1 font-medium">Duration (minutes)</label>
              <input
                type="number"
                className="w-full border rounded px-3 py-2"
                value={editForm.duration}
                onChange={e => setEditForm(f => ({ ...f, duration: Number(e.target.value) }))}
                min={1}
                required
              />
            </div>
            <div className="mb-4">
              <label className="block mb-1 font-medium">Start Date</label>
              <input
                type="datetime-local"
                className="w-full border rounded px-3 py-2"
                value={toDateTimeLocal(editForm.startDate || '')}
                onChange={e => setEditForm(f => ({ ...f, startDate: e.target.value }))}
              />
            </div>
            <div className="mb-4">
              <label className="block mb-1 font-medium">End Date</label>
              <input
                type="datetime-local"
                className="w-full border rounded px-3 py-2"
                value={toDateTimeLocal(editForm.endDate || '')}
                onChange={e => setEditForm(f => ({ ...f, endDate: e.target.value }))}
              />
            </div>
            <div className="mb-4">
              <label className="block mb-1 font-medium">Visibility</label>
              <select
                className="w-full border rounded px-3 py-2"
                value={editForm.visibility}
                onChange={e => setEditForm(f => ({ ...f, visibility: e.target.value as 'enrolled' | 'public' | 'code' }))}
              >
                <option value="enrolled">Only my enrolled students</option>
                <option value="public">All students</option>
                <option value="code">Students with join code</option>
              </select>
            </div>
            {editForm.visibility === 'code' && (
              <div className="mb-4">
                <label className="block mb-1 font-medium">Join Code</label>
                <input
                  type="text"
                  className="w-full border rounded px-3 py-2"
                  value={editForm.joinCode}
                  onChange={e => setEditForm(f => ({ ...f, joinCode: e.target.value }))}
                  placeholder="Enter or generate a join code"
                  required={editForm.visibility === 'code'}
                />
              </div>
            )}
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
                disabled={editing}
              >
                {editing ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal isOpen={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} title="Delete Test">
          <div>Are you sure you want to delete this test?</div>
          <div className="mt-6 flex justify-end space-x-2">
            <button
              className="px-4 py-2 rounded bg-gray-200 text-gray-800 hover:bg-gray-300"
              onClick={() => setDeleteModalOpen(false)}
            >
              Cancel
            </button>
            <button
              className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
              onClick={async () => {
                if (!testToDelete) return;
                try {
                  await testService.deleteTest(testToDelete._id);
                  setTests(prev => prev.filter(t => t._id !== testToDelete._id));
                  setDeleteModalOpen(false);
                  setTestToDelete(null);
                } catch (err) {
                  alert('Failed to delete test');
                }
              }}
            >
              Delete
            </button>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default ManageTests; 