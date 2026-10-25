import React, { useState, useEffect } from 'react';

const COURSES = [
  'B.Tech Computer Science',
  'B.Tech Information Technology',
  'B.Tech Electronics & Communication',
  'B.Sc Computer Science',
  'BCA (Bachelor of Computer Applications)',
  'MCA (Master of Computer Applications)',
  'M.Tech Software Engineering',
  'B.Sc Data Science & AI',
];

const INITIAL_FORM_STATE = {
  name: '',
  email: '',
  course: '',
  semester: '',
};

const StudentForm = ({ editingStudent, onSubmit, onCancelEdit, isSubmitting }) => {
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (editingStudent) {
      setFormData({
        name: editingStudent.name || '',
        email: editingStudent.email || '',
        course: editingStudent.course || '',
        semester: editingStudent.semester ? String(editingStudent.semester) : '',
      });
      setErrors({});
    } else {
      setFormData(INITIAL_FORM_STATE);
      setErrors({});
    }
  }, [editingStudent]);

  // Client-side form validation
  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!emailRegex.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.course.trim()) {
      newErrors.course = 'Please select or enter a course';
    }

    const semNum = Number(formData.semester);
    if (!formData.semester) {
      newErrors.semester = 'Semester is required';
    } else if (Number.isNaN(semNum) || semNum < 1 || semNum > 8) {
      newErrors.semester = 'Semester must be between 1 and 8';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const success = await onSubmit({
      name: formData.name.trim(),
      email: formData.email.trim().toLowerCase(),
      course: formData.course.trim(),
      semester: Number(formData.semester),
    });

    if (success && !editingStudent) {
      setFormData(INITIAL_FORM_STATE);
    }
  };

  const handleReset = () => {
    if (editingStudent) {
      onCancelEdit();
    } else {
      setFormData(INITIAL_FORM_STATE);
      setErrors({});
    }
  };

  return (
    <div className="card form-card">
      <div className="card-header">
        <h2>{editingStudent ? 'Edit Student Record' : 'Add New Student'}</h2>
        <p className="card-subtitle">
          {editingStudent
            ? `Updating details for ${editingStudent.name}`
            : 'Fill in the details below to enroll a student'}
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="student-form">
        <div className="form-group">
          <label htmlFor="name">
            Student Name <span className="required">*</span>
          </label>
          <input
            id="name"
            name="name"
            type="text"
            placeholder="e.g., Aarav Sharma"
            value={formData.name}
            onChange={handleChange}
            className={errors.name ? 'input-error' : ''}
            disabled={isSubmitting}
          />
          {errors.name && <span className="field-error">{errors.name}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="email">
            Email Address <span className="required">*</span>
          </label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="e.g., aarav.sharma@university.edu"
            value={formData.email}
            onChange={handleChange}
            className={errors.email ? 'input-error' : ''}
            disabled={isSubmitting}
          />
          {errors.email && <span className="field-error">{errors.email}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="course">
            Course / Program <span className="required">*</span>
          </label>
          <select
            id="course"
            name="course"
            value={formData.course}
            onChange={handleChange}
            className={errors.course ? 'input-error' : ''}
            disabled={isSubmitting}
          >
            <option value="">-- Select Course --</option>
            {COURSES.map((courseOption) => (
              <option key={courseOption} value={courseOption}>
                {courseOption}
              </option>
            ))}
          </select>
          {errors.course && <span className="field-error">{errors.course}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="semester">
            Semester (1 - 8) <span className="required">*</span>
          </label>
          <select
            id="semester"
            name="semester"
            value={formData.semester}
            onChange={handleChange}
            className={errors.semester ? 'input-error' : ''}
            disabled={isSubmitting}
          >
            <option value="">-- Select Semester --</option>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
              <option key={sem} value={sem}>
                Semester {sem}
              </option>
            ))}
          </select>
          {errors.semester && <span className="field-error">{errors.semester}</span>}
        </div>

        <div className="form-actions">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting
              ? editingStudent
                ? 'Saving Changes...'
                : 'Adding Student...'
              : editingStudent
              ? 'Update Student'
              : 'Add Student'}
          </button>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleReset}
            disabled={isSubmitting}
          >
            {editingStudent ? 'Cancel Edit' : 'Clear Form'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default StudentForm;
