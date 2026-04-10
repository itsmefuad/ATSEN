// Component for managing section assignments for students and instructors
import React, { useState } from "react";
import { Users, GraduationCap, Clock, Calendar } from "lucide-react";
import api from "../lib/axios";

const SectionAssignment = ({ room, onUserSectionUpdate }) => {
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedInstructor, setSelectedInstructor] = useState(null);
  const [studentSection, setStudentSection] = useState("");
  const [instructorSections, setInstructorSections] = useState([]);
  const [loading, setLoading] = useState(false);

  const assignStudentToSection = async () => {
    if (!selectedStudent || !studentSection) {
      alert("Please select a student and section");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post(
        `/institutions/${room.institution}/rooms/${room._id}/assign-student-section`,
        {
          studentId: selectedStudent._id,
          sectionNumber: parseInt(studentSection),
        }
      );

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error);
      }

      alert("Student assigned to section successfully!");
      setSelectedStudent(null);
      setStudentSection("");
      if (onUserSectionUpdate) onUserSectionUpdate();
    } catch (error) {
      console.error("Error assigning student:", error);
      alert("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const assignInstructorToSections = async () => {
    if (!selectedInstructor || instructorSections.length === 0) {
      alert("Please select an instructor and at least one section");
      return;
    }

    if (instructorSections.length > 2) {
      alert("Instructors can only be assigned to maximum 2 sections");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post(
        `/institutions/${room.institution}/rooms/${room._id}/assign-instructor-sections`,
        {
          instructorId: selectedInstructor._id,
          sectionNumbers: instructorSections.map((s) => parseInt(s)),
        }
      );

      alert("Instructor assigned to sections successfully!");
      setSelectedInstructor(null);
      setInstructorSections([]);
      if (onUserSectionUpdate) onUserSectionUpdate();
    } catch (error) {
      console.error("Error assigning instructor:", error);
      alert("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInstructorSectionChange = (sectionNumber) => {
    setInstructorSections((prev) => {
      if (prev.includes(sectionNumber)) {
        return prev.filter((s) => s !== sectionNumber);
      } else if (prev.length < 2) {
        return [...prev, sectionNumber];
      } else {
        alert("Instructors can only be assigned to maximum 2 sections");
        return prev;
      }
    });
  };

  const formatClassTimings = (timings) => {
    return timings
      .map((timing) => `${timing.day} ${timing.startTime} - ${timing.endTime}`)
      .join(", ");
  };

  return (
    <div className="space-y-6">
      {/* Section Overview */}
      <div className="card bg-base-100 border border-base-300 p-6">
        <h3 className="text-xl font-semibold text-base-content mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary" />
          Section Overview
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {room.sections?.map((section) => (
            <div
              key={section.sectionNumber}
              className="card bg-base-50 border border-base-200 p-4"
            >
              <div className="font-medium text-primary mb-2">
                Section {section.sectionNumber}
              </div>
              <div className="text-sm text-base-content/60 mb-3 flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {formatClassTimings(section.classTimings)}
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-success" />
                  <span className="text-sm">
                    {section.students?.length || 0} Students
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-secondary" />
                  <span className="text-sm">
                    {section.instructors?.length || 0} Instructors
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Student Assignment */}
      <div className="card bg-base-100 border border-base-300 p-6">
        <h3 className="text-xl font-semibold text-base-content mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-success" />
          Assign Student to Section
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Select Student</span>
            </label>
            <select
              value={selectedStudent?._id || ""}
              onChange={(e) => {
                const student = room.students?.find(
                  (s) => s._id === e.target.value
                );
                setSelectedStudent(student || null);
              }}
              className="select select-bordered"
            >
              <option value="">Choose student...</option>
              {room.students?.map((student) => (
                <option key={student._id} value={student._id}>
                  {student.name} ({student.email})
                </option>
              ))}
            </select>
          </div>
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Select Section</span>
            </label>
            <select
              value={studentSection}
              onChange={(e) => setStudentSection(e.target.value)}
              className="select select-bordered"
            >
              <option value="">Choose section...</option>
              {[1, 2, 3, 4, 5].map((num) => (
                <option key={num} value={num}>
                  Section {num}
                </option>
              ))}
            </select>
          </div>
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">&nbsp;</span>
            </label>
            <button
              onClick={assignStudentToSection}
              disabled={loading || !selectedStudent || !studentSection}
              className="btn btn-success"
            >
              {loading ? "Assigning..." : "Assign Student"}
            </button>
          </div>
        </div>
      </div>

      {/* Instructor Assignment */}
      <div className="card bg-base-100 border border-base-300 p-6">
        <h3 className="text-xl font-semibold text-base-content mb-4 flex items-center gap-2">
          <GraduationCap className="w-5 h-5 text-secondary" />
          Assign Instructor to Sections
        </h3>
        <div className="space-y-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Select Instructor</span>
            </label>
            <select
              value={selectedInstructor?._id || ""}
              onChange={(e) => {
                const instructor = room.instructors?.find(
                  (i) => i._id === e.target.value
                );
                setSelectedInstructor(instructor || null);
                setInstructorSections([]);
              }}
              className="select select-bordered"
            >
              <option value="">Choose instructor...</option>
              {room.instructors?.map((instructor) => (
                <option key={instructor._id} value={instructor._id}>
                  {instructor.name} ({instructor.email})
                </option>
              ))}
            </select>
          </div>
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">
                Select Sections (1-2 sections)
              </span>
            </label>
            <div className="grid grid-cols-5 gap-2">
              {[1, 2, 3, 4, 5].map((num) => (
                <label key={num} className="label cursor-pointer">
                  <input
                    type="checkbox"
                    checked={instructorSections.includes(num.toString())}
                    onChange={() =>
                      handleInstructorSectionChange(num.toString())
                    }
                    className="checkbox checkbox-primary"
                  />
                  <span className="label-text text-sm">Section {num}</span>
                </label>
              ))}
            </div>
          </div>
          <button
            onClick={assignInstructorToSections}
            disabled={
              loading || !selectedInstructor || instructorSections.length === 0
            }
            className="btn btn-secondary"
          >
            {loading ? "Assigning..." : "Assign Instructor"}
          </button>
        </div>
      </div>

      {/* Current Assignments */}
      <div className="card bg-base-100 border border-base-300 p-6">
        <h3 className="text-xl font-semibold text-base-content mb-4">
          Current Section Assignments
        </h3>

        {/* Students by Section */}
        <div className="mb-6">
          <h4 className="font-medium text-success mb-3 flex items-center gap-2">
            <Users className="w-4 h-4" />
            Students by Section
          </h4>
          <div className="space-y-4">
            {room.sections?.map((section) => (
              <div
                key={section.sectionNumber}
                className="card bg-base-50 border border-base-200 p-4"
              >
                <div className="font-medium text-base-content mb-2">
                  Section {section.sectionNumber}
                </div>
                <div className="text-sm text-base-content/60 mb-2">
                  {formatClassTimings(section.classTimings)}
                </div>
                <div className="space-y-1">
                  {room.students
                    ?.filter((student) =>
                      student.assignedSections?.some(
                        (as) => as.sectionNumber === section.sectionNumber
                      )
                    )
                    .map((student) => (
                      <div
                        key={student._id}
                        className="badge badge-success gap-2 p-3"
                      >
                        {student.name} ({student.email})
                      </div>
                    )) || (
                    <div className="text-sm text-base-content/50">
                      No students assigned
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Instructors by Section */}
        <div>
          <h4 className="font-medium text-secondary mb-3 flex items-center gap-2">
            <GraduationCap className="w-4 h-4" />
            Instructors by Section
          </h4>
          <div className="space-y-4">
            {room.sections?.map((section) => (
              <div
                key={section.sectionNumber}
                className="card bg-base-50 border border-base-200 p-4"
              >
                <div className="font-medium text-base-content mb-2">
                  Section {section.sectionNumber}
                </div>
                <div className="text-sm text-base-content/60 mb-2">
                  {formatClassTimings(section.classTimings)}
                </div>
                <div className="space-y-1">
                  {room.instructors
                    ?.filter((instructor) =>
                      instructor.assignedSections?.some(
                        (as) => as.sectionNumber === section.sectionNumber
                      )
                    )
                    .map((instructor) => (
                      <div
                        key={instructor._id}
                        className="badge badge-secondary gap-2 p-3"
                      >
                        {instructor.name} ({instructor.email})
                      </div>
                    )) || (
                    <div className="text-sm text-base-content/50">
                      No instructors assigned
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SectionAssignment;
