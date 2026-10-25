const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

/**
 * Helper to handle fetch responses and extract error messages cleanly
 */
const handleResponse = async (response) => {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || `Request failed with status ${response.status}`);
  }
  return data;
};

/**
 * Fetch all students from the backend
 */
export const getStudents = async () => {
  const response = await fetch(`${API_BASE_URL}/students`);
  return handleResponse(response);
};

/**
 * Fetch a single student by ID
 */
export const getStudentById = async (id) => {
  const response = await fetch(`${API_BASE_URL}/students/${id}`);
  return handleResponse(response);
};

/**
 * Create a new student record
 */
export const createStudent = async (studentData) => {
  const response = await fetch(`${API_BASE_URL}/students`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(studentData),
  });
  return handleResponse(response);
};

/**
 * Update an existing student record by ID
 */
export const updateStudent = async (id, studentData) => {
  const response = await fetch(`${API_BASE_URL}/students/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(studentData),
  });
  return handleResponse(response);
};

/**
 * Delete a student record by ID
 */
export const deleteStudent = async (id) => {
  const response = await fetch(`${API_BASE_URL}/students/${id}`, {
    method: 'DELETE',
  });
  return handleResponse(response);
};
