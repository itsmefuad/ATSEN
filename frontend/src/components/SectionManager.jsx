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

  return (
    <div className="space-y-6">
      <div className="mb-4">
        <p className="text-base-content/70">
          Configure 5 sections, each with 2 class timings. Select days and time
          slots for each class.
        </p>
      </div>

      <div className="space-y-4">
        {sections.map((section, sectionIndex) => (
          <div
            key={section.sectionNumber}
            className="card bg-base-100 border border-base-300 p-6"
          >
            <h3 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
              <span className="badge badge-primary">
                Section {section.sectionNumber}
              </span>
            </h3>

            <div className="space-y-4">
              {section.classTimings.map((timing, timingIndex) => (
                <div
                  key={timingIndex}
                  className="card bg-base-50 border border-base-200 p-4"
                >
                  <h4 className="font-medium text-base-content mb-3">
                    Class {timingIndex + 1}
                  </h4>

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
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SectionManager;
