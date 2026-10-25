import React from 'react';

const StudentList = ({
  students,
  loading,
  searchQuery,
  onSearchChange,
  courseFilter,
  onCourseFilterChange,
  onView,
  onEdit,
  onDelete,
  deletingId,
}) => {
  const uniqueCourses = Array.from(new Set(students.map((s) => s.course))).filter(Boolean);

  return (
    <div className="card list-card">
      <div className="list-header">
        <div>
          <h2>Enrolled Students</h2>
          <p className="card-subtitle">
            Showing {students.length} {students.length === 1 ? 'student' : 'students'}
          </p>
        </div>

        <div className="filter-bar">
          <input
            type="text"
            placeholder="Search by name, email, or course..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="search-input"
          />

          <select
            value={courseFilter}
            onChange={(e) => onCourseFilterChange(e.target.value)}
            className="filter-select"
          >
            <option value="">All Courses</option>
            {uniqueCourses.map((course) => (
              <option key={course} value={course}>
                {course}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading student records from MongoDB...</p>
        </div>
      ) : students.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🎓</div>
          <h3>No Students Found</h3>
          <p>
            {searchQuery || courseFilter
              ? 'No students match your current search or filter criteria.'
              : 'Get started by adding your first student using the form on the left.'}
          </p>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="student-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Course</th>
                <th>Semester</th>
                <th className="actions-col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student._id}>
                  <td>
                    <div className="student-info">
                      <div className="avatar">
                        {student.name?.charAt(0)?.toUpperCase() || 'S'}
                      </div>
                      <div>
                        <div className="student-name">{student.name}</div>
                        <div className="student-email">{student.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="course-badge">{student.course}</span>
                  </td>
                  <td>
                    <span className="semester-pill">Sem {student.semester}</span>
                  </td>
                  <td className="actions-cell">
                    <button
                      type="button"
                      className="btn-action btn-view"
                      onClick={() => onView(student)}
                      title="View Details"
                    >
                      View
                    </button>
                    <button
                      type="button"
                      className="btn-action btn-edit"
                      onClick={() => onEdit(student)}
                      title="Edit Student"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="btn-action btn-delete"
                      onClick={() => onDelete(student._id, student.name)}
                      disabled={deletingId === student._id}
                      title="Delete Student"
                    >
                      {deletingId === student._id ? 'Deleting...' : 'Delete'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default StudentList;
