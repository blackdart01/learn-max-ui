import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { testService } from '../services/api';
import { Test } from '../types';
import Modal from '../components/Modal';
import { useNavigate } from 'react-router-dom';

const ManageTests: React.FC = () => {
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [testDetailModalOpen, setTestDetailModalOpen] = useState(false);
  const [testDetail, setTestDetail] = useState<Test | null>(null);
  const [testDetailLoading, setTestDetailLoading] = useState(false);
  const navigate = useNavigate();

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
      <div className="px-4 py-6 sm:px-0">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Manage Tests</h1>
          <button
            className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700"
            onClick={() => {/* TODO: Implement create test */}}
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
                        onClick={(e) => {
                          e.stopPropagation();
                          /* TODO: Implement edit */
                        }}
                      >
                        Edit
                      </button>
                      <button
                        className="bg-red-100 text-red-800 px-3 py-1 rounded-md text-sm font-medium hover:bg-red-200"
                        onClick={(e) => {
                          e.stopPropagation();
                          /* TODO: Implement delete */
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
      </div>
    </div>
  );
};

export default ManageTests; 