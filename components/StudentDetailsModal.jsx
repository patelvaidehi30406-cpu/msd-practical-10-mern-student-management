import React from 'react';

const StudentDetailsModal = ({ student, onClose, onEdit }) => {
  if (!student) return null;

  const formattedDate = student.createdAt
    ? new Date(student.createdAt).toLocaleString()
    : 'N/A';

  const updatedDate = student.updatedAt
    ? new Date(student.updatedAt).toLocaleString()
    : 'N/A';

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <div className="avatar avatar-lg">
              {student.name?.charAt(0)?.toUpperCase() || 'S'}
            </div>
            <div>
              <h3>{student.name}</h3>
              <span className="semester-pill">Semester {student.semester}</span>
            </div>
          </div>
          <button type="button" className="modal-close" onClick={onClose}>
            &times;
          </button>
        </div>

        <div className="modal-body">
          <div className="detail-row">
            <span className="detail-label">Student ID</span>
            <span className="detail-value mono">{student._id}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Email Address</span>
            <span className="detail-value">{student.email}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Enrolled Course</span>
            <span className="detail-value">{student.course}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Current Semester</span>
            <span className="detail-value">Semester {student.semester}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Created At</span>
            <span className="detail-value">{formattedDate}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Last Updated</span>
            <span className="detail-value">{updatedDate}</span>
          </div>
        </div>

        <div className="modal-footer">
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              onEdit(student);
              onClose();
            }}
          >
            Edit This Student
          </button>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentDetailsModal;
