import React, { useState, useEffect } from 'react';
import { teacherService } from '../services/api';
import { FiUserPlus, FiUserMinus, FiSearch, FiUsers } from 'react-icons/fi';
import { User } from '../types';

const ManageEnrollments: React.FC = () => {
  const [enrolledStudents, setEnrolledStudents] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [newUsernames, setNewUsernames] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Fetch enrolled students
  useEffect(() => {
    fetchEnrolledStudents();
  }, []);

  const fetchEnrolledStudents = async () => {
    try {
      setLoading(true);
      const response = await teacherService.getEnrolledStudents();
      // Log the response to see its structure
      console.log('API Response:', response);
      
      // Handle both possible response structures
      const students = Array.isArray(response.data) 
        ? response.data 
        : response.data?.data || [];
      
      console.log('Processed students:', students);
      setEnrolledStudents(students);
      setError(null);
    } catch (err) {
      console.error('Error fetching students:', err);
      setError('Failed to fetch enrolled students');
      setEnrolledStudents([]); // Reset to empty array on error
    } finally {
      setLoading(false);
    }
  };

  // Filter students based on search term
  const filteredStudents = searchTerm
    ? enrolledStudents.filter(student =>
        student?.username?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : enrolledStudents;

  // Handle enrolling new students
  const handleEnrollStudents = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsernames.trim()) return;

    try {
      setLoading(true);
      const usernames = newUsernames.split(',').map(u => u.trim()).filter(Boolean);
      await teacherService.enrollStudents(usernames);
      await fetchEnrolledStudents();
      setNewUsernames('');
      setSuccessMessage('Students enrolled successfully');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError('Failed to enroll students');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Handle removing a student
  const handleRemoveStudent = async (studentId: string) => {
    try {
      setLoading(true);
      await teacherService.removeEnrolledStudents([studentId]);
      await fetchEnrolledStudents();
      setSuccessMessage('Student removed successfully');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError('Failed to remove student');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <FiUsers className="inline" />
          Manage Enrolled Students
        </h1>
        <p className="mt-2 text-gray-600">
          Add or remove students from your enrolled list. Only enrolled students can access your "enrolled-only" tests.
        </p>
      </div>

      {/* Add new students form */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <FiUserPlus className="inline" />
          Add New Students
        </h2>
        <form onSubmit={handleEnrollStudents} className="space-y-4">
          <div>
            <label htmlFor="usernames" className="block text-sm font-medium text-gray-700">
              Student Usernames (comma-separated)
            </label>
            <input
              type="text"
              id="usernames"
              value={newUsernames}
              onChange={(e) => setNewUsernames(e.target.value)}
              placeholder="e.g., student1, student2, student3"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {loading ? 'Adding...' : 'Add Students'}
          </button>
        </form>
      </div>

      {/* Search and list enrolled students */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Enrolled Students</h2>
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-4 p-4 text-red-700 bg-red-100 rounded-md">
            {error}
          </div>
        )}
        {successMessage && (
          <div className="mb-4 p-4 text-green-700 bg-green-100 rounded-md">
            {successMessage}
          </div>
        )}

        {/* Students list */}
        {loading ? (
          <div className="text-center py-4">Loading...</div>
        ) : filteredStudents.length > 0 ? (
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {filteredStudents.map((student) => (
              <div
                key={student._id}
                className="flex justify-between items-center p-4 border rounded-lg hover:bg-gray-50"
              >
                <div>
                  <h3 className="font-medium">{student.username}</h3>
                  <p className="text-sm text-gray-500">Student</p>
                </div>
                <button
                  onClick={() => handleRemoveStudent(student._id)}
                  className="text-red-600 hover:text-red-800 p-2"
                  title="Remove student"
                >
                  <FiUserMinus size={20} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-gray-500">
            {searchTerm ? 'No students found matching your search' : 'No students enrolled yet'}
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageEnrollments; 