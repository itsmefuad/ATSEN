// Component for managing room sections and class timings
import React from "react";

const SectionManager = ({ sections, onSectionsChange }) => {
  const availableDays = [
    "Saturday",
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
  ];
  const availableTimeSlots = [
    { startTime: "8:00 AM", endTime: "9:20 AM" },
    { startTime: "9:30 AM", endTime: "10:50 AM" },
    { startTime: "11:00 AM", endTime: "12:20 PM" },
    { startTime: "12:30 PM", endTime: "1:50 PM" },
    { startTime: "2:00 PM", endTime: "3:20 PM" },
    { startTime: "3:30 PM", endTime: "4:50 PM" },
  ];

  const updateClassTiming = (sectionIndex, timingIndex, field, value) => {
    const newSections = [...sections];
    newSections[sectionIndex].classTimings[timingIndex][field] = value;

    // Auto-fill end time when start time is selected
    if (field === "startTime") {
      const timeSlot = availableTimeSlots.find(
        (slot) => slot.startTime === value
      );
      if (timeSlot) {
        newSections[sectionIndex].classTimings[timingIndex].endTime =
          timeSlot.endTime;
      }
    }

    onSectionsChange(newSections);
  };

  const addClassTiming = (sectionIndex) => {
    const newSections = [...sections];
    newSections[sectionIndex].classTimings.push({
      day: "",
      startTime: "",
      endTime: "",
    });
    onSectionsChange(newSections);
  };

  const removeClassTiming = (sectionIndex, timingIndex) => {
    const newSections = [...sections];
    // Don't allow removing if it's the only class timing
    if (newSections[sectionIndex].classTimings.length > 1) {
      newSections[sectionIndex].classTimings.splice(timingIndex, 1);
      onSectionsChange(newSections);
    }
  };

  const addSection = () => {
    const newSections = [...sections];
    const newSectionNumber = newSections.length + 1;
    newSections.push({
      sectionNumber: newSectionNumber,
      classTimings: [{ day: "", startTime: "", endTime: "" }],
      instructors: [],
    });
    onSectionsChange(newSections);
  };

  const removeSection = (sectionIndex) => {
    const newSections = [...sections];
    // Don't allow removing if it's the only section
    if (newSections.length > 1) {
      newSections.splice(sectionIndex, 1);
      // Renumber sections after removal
      newSections.forEach((section, index) => {
        section.sectionNumber = index + 1;
      });
      onSectionsChange(newSections);
    }
  };

  return (
    <div className="space-y-6">
      <div className="mb-4">
        <p className="text-base-content/70">
          Configure sections for your room. Each section requires at least 1
          class timing. You can add additional sections and classes as needed.
        </p>
      </div>

      <div className="space-y-4">
        {sections.map((section, sectionIndex) => (
          <div
            key={section.sectionNumber}
            className="card bg-base-100 border border-base-300 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-primary flex items-center gap-2">
                <span className="badge badge-primary">
                  Section {section.sectionNumber}
                  {sectionIndex === 0 && (
                    <span className="ml-2 text-xs bg-green-100 text-green-600 px-2 py-1 rounded">
                      Required
                    </span>
                  )}
                </span>
              </h3>
              {sections.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeSection(sectionIndex)}
                  className="btn btn-ghost btn-sm text-red-500 hover:text-red-700 hover:bg-red-50"
                >
                  Remove Section
                </button>
              )}
            </div>

            <div className="space-y-4">
              {section.classTimings.map((timing, timingIndex) => (
                <div
                  key={timingIndex}
                  className="card bg-base-50 border border-base-200 p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-base-content">
                      Class {timingIndex + 1}
                      {timingIndex === 0 && (
                        <span className="ml-2 text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
                          Required
                        </span>
                      )}
                    </h4>
                    {section.classTimings.length > 1 && (
                      <button
                        type="button"
                        onClick={() =>
                          removeClassTiming(sectionIndex, timingIndex)
                        }
                        className="btn btn-ghost btn-sm text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Day Selection */}
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text font-medium">Day</span>
                      </label>
                      <select
                        value={timing.day}
                        onChange={(e) =>
                          updateClassTiming(
                            sectionIndex,
                            timingIndex,
                            "day",
                            e.target.value
                          )
                        }
                        className="select select-bordered"
                        required
                      >
                        <option value="">Select Day</option>
                        {availableDays.map((day) => (
                          <option key={day} value={day}>
                            {day}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Start Time Selection */}
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text font-medium">
                          Start Time
                        </span>
                      </label>
                      <select
                        value={timing.startTime}
                        onChange={(e) =>
                          updateClassTiming(
                            sectionIndex,
                            timingIndex,
                            "startTime",
                            e.target.value
                          )
                        }
                        className="select select-bordered"
                        required
                      >
                        <option value="">Select Time</option>
                        {availableTimeSlots.map((slot) => (
                          <option key={slot.startTime} value={slot.startTime}>
                            {slot.startTime}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* End Time Display */}
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text font-medium">End Time</span>
                      </label>
                      <input
                        type="text"
                        value={timing.endTime}
                        readOnly
                        className="input input-bordered bg-base-200 text-base-content/60"
                        placeholder="Auto-filled"
                      />
                    </div>
                  </div>
                </div>
              ))}

              {/* Add Another Class Button */}
              <div className="flex justify-center pt-2">
                <button
                  type="button"
                  onClick={() => addClassTiming(sectionIndex)}
                  className="btn btn-outline btn-primary btn-sm gap-2"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  Add Another Class
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* Add Section Button */}
        <div className="flex justify-center pt-4">
          <button
            type="button"
            onClick={addSection}
            className="btn btn-outline btn-secondary gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Add Another Section
          </button>
        </div>
      </div>
    </div>
  );
};

export default SectionManager;
