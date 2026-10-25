import React, { useState, useEffect, useMemo, useCallback } from 'react';
import StudentForm from './components/StudentForm';
import StudentList from './components/StudentList';
import StudentDetailsModal from './components/StudentDetailsModal';
import {
  getStudents,
  createStudent,
  updateStudent,
  deleteStudent,
} from './services/studentApi';

const App = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [editingStudent, setEditingStudent] = useState(null);
  const [viewingStudent, setViewingStudent] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [courseFilter, setCourseFilter] = useState('');

  // Alert banner state ({ type: 'success' | 'error', text: string })
  const [alert, setAlert] = useState(null);

  const showAlert = useCallback((type, text) => {
    setAlert({ type, text });
  }, []);

  // Automatically dismiss success alerts after 4 seconds
  useEffect(() => {
    if (alert?.type === 'success') {
      const timer = setTimeout(() => setAlert(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [alert]);

  // Fetch all students on initial mount
  const fetchAllStudents = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getStudents();
      setStudents(response.data || []);
    } catch (error) {
      showAlert(
        'error',
        error.message || 'Unable to connect to the server. Make sure the backend is running.'
      );
    } finally {
      setLoading(false);
    }
  }, [showAlert]);

  useEffect(() => {
    fetchAllStudents();
  }, [fetchAllStudents]);

  // Create or Update Student
  const handleFormSubmit = async (formData) => {
    setIsSubmitting(true);
    setAlert(null);

    try {
      if (editingStudent) {
        const response = await updateStudent(editingStudent._id, formData);
        setStudents((prev) =>
          prev.map((item) => (item._id === editingStudent._id ? response.data : item))
        );
        setEditingStudent(null);
        showAlert('success', response.message || 'Student updated successfully!');
      } else {
        const response = await createStudent(formData);
        setStudents((prev) => [response.data, ...prev]);
        showAlert('success', response.message || 'Student added successfully!');
      }
      return true;
    } catch (error) {
      showAlert('error', error.message || 'Something went wrong while saving student.');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Student
  const handleDeleteStudent = async (id, name) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${name}" from the database?`
    );
    if (!confirmed) return;

    setDeletingId(id);
    setAlert(null);

    try {
      const response = await deleteStudent(id);
      setStudents((prev) => prev.filter((student) => student._id !== id));
      if (editingStudent?._id === id) {
        setEditingStudent(null);
      }
      showAlert('success', response.message || 'Student deleted successfully!');
    } catch (error) {
      showAlert('error', error.message || 'Failed to delete student.');
    } finally {
      setDeletingId(null);
    }
  };

  // Filtered students list
  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const matchesCourse = courseFilter ? student.course === courseFilter : true;
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch = query
        ? student.name.toLowerCase().includes(query) ||
          student.email.toLowerCase().includes(query) ||
          student.course.toLowerCase().includes(query)
        : true;
      return matchesCourse && matchesSearch;
    });
  }, [students, searchQuery, courseFilter]);

  // Quick stats
  const totalCourses = useMemo(
    () => new Set(students.map((s) => s.course)).size,
    [students]
  );

  return (
    <div className="app-wrapper">
      {/* Top Navigation / Hero Header */}
      <header className="app-header">
        <div className="container header-content">
          <div className="brand">
            <span className="brand-badge">Practical 10</span>
            <h1>MERN Student Management System</h1>
            <p>Full-Stack CRUD Application with React, Express, Node.js &amp; MongoDB Atlas</p>
          </div>

          <div className="stats-group">
            <div className="stat-card">
              <span className="stat-value">{students.length}</span>
              <span className="stat-label">Total Students</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">{totalCourses}</span>
              <span className="stat-label">Active Courses</span>
            </div>
            <button
              type="button"
              className="btn btn-refresh"
              onClick={fetchAllStudents}
              disabled={loading}
              title="Refresh student list"
            >
              {loading ? 'Refreshing...' : '↻ Refresh'}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container main-content">
        {/* Alert Banner for Success / Error Messages */}
        {alert && (
          <div className={`alert-banner alert-${alert.type}`} role="alert">
            <div className="alert-text">
              <strong>{alert.type === 'success' ? 'Success: ' : 'Error: '}</strong>
              {alert.text}
            </div>
            <button
              type="button"
              className="alert-close"
              onClick={() => setAlert(null)}
              aria-label="Close alert"
            >
              &times;
            </button>
          </div>
        )}

        <div className="dashboard-grid">
          <section className="form-section">
            <StudentForm
              editingStudent={editingStudent}
              onSubmit={handleFormSubmit}
              onCancelEdit={() => setEditingStudent(null)}
              isSubmitting={isSubmitting}
            />
          </section>

          <section className="list-section">
            <StudentList
              students={filteredStudents}
              loading={loading}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              courseFilter={courseFilter}
              onCourseFilterChange={setCourseFilter}
              onView={(student) => setViewingStudent(student)}
              onEdit={(student) => {
                setEditingStudent(student);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onDelete={handleDeleteStudent}
              deletingId={deletingId}
            />
          </section>
        </div>
      </main>

      {/* View Student Details Modal */}
      <StudentDetailsModal
        student={viewingStudent}
        onClose={() => setViewingStudent(null)}
        onEdit={(student) => setEditingStudent(student)}
      />

      {/* Footer */}
      <footer className="app-footer">
        <div className="container">
          <p>Practical 10 &bull; Built with React + Vite, Express.js &amp; MongoDB Atlas</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
