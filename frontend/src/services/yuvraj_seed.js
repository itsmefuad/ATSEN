// BRACU University Seed Data
// This file contains sample data for announcements, polls, and Q&A forms

// Helper function to generate MongoDB ObjectId-like strings
const generateId = () => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

export const yuvrajSeedData = {
  announcements: [
    {
      _id: generateId(),
      title: 'Welcome to BRACU Spring 2024 Semester',
      content: 'Dear students, welcome to the Spring 2024 semester at BRAC University. We are excited to have you back on campus. Please ensure you have completed your course registration and are familiar with the updated academic calendar. The semester begins on January 15th, 2024.',
      author: 'Academic Affairs Office',
      createdAt: new Date('2024-01-10T10:00:00Z').toISOString(),
      priority: 'high',
      category: 'Academic',
      pinned: true
    },
    {
      _id: generateId(),
      title: 'Course Registration Deadline Extended',
      content: 'Due to high demand and technical difficulties, we have extended the course registration deadline to January 20th, 2024. Please complete your course selections by this new deadline to avoid any scheduling conflicts.',
      author: 'Registrar Office',
      createdAt: new Date('2024-01-08T14:30:00Z').toISOString(),
      priority: 'urgent',
      category: 'Academic'
    },
    {
      _id: generateId(),
      title: 'Library Hours Update',
      content: 'The BRACU library will now be open until 10 PM on weekdays and 8 PM on weekends to accommodate evening study sessions. Extended hours will be effective from January 15th, 2024.',
      author: 'Library Staff',
      createdAt: new Date('2024-01-07T09:15:00Z').toISOString(),
      priority: 'normal',
      category: 'Facilities'
    },
    {
      _id: generateId(),
      title: 'Student Council Elections',
      content: 'Nominations are now open for student council positions for the Spring 2024 semester. Submit your applications by January 25th, 2024. Elections will be held on February 1st, 2024.',
      author: 'Student Affairs',
      createdAt: new Date('2024-01-06T16:45:00Z').toISOString(),
      priority: 'normal',
      category: 'Student Life'
    },
    {
      _id: generateId(),
      title: 'Technical Support Available',
      content: 'Our IT team is available 24/7 for any technical issues you may encounter with the ATSEN platform. Contact them via email at support@bracu.ac.bd or call the helpdesk at extension 1234.',
      author: 'IT Support',
      createdAt: new Date('2024-01-05T11:20:00Z').toISOString(),
      priority: 'low',
      category: 'Technical'
    },
    {
      _id: generateId(),
      title: 'Cafeteria Menu Update',
      content: 'The university cafeteria has updated its menu for the Spring semester. New healthy options including vegetarian and vegan meals are now available. Special student discounts apply during lunch hours.',
      author: 'Food Services',
      createdAt: new Date('2024-01-04T13:00:00Z').toISOString(),
      priority: 'normal',
      category: 'Facilities'
    },
    {
      _id: generateId(),
      title: 'Career Fair Registration',
      content: 'The annual BRACU Career Fair will be held on March 15th, 2024. Over 50 companies will be participating. Registration for students opens on February 1st. Don\'t miss this opportunity to network with potential employers.',
      author: 'Career Services',
      createdAt: new Date('2024-01-03T15:30:00Z').toISOString(),
      priority: 'high',
      category: 'Career'
    },
    {
      _id: generateId(),
      title: 'Sports Complex Maintenance',
      content: 'The university sports complex will undergo maintenance from January 20th to February 5th, 2024. During this period, alternative sports facilities will be available at the temporary sports center.',
      author: 'Facilities Management',
      createdAt: new Date('2024-01-02T10:45:00Z').toISOString(),
      priority: 'normal',
      category: 'Facilities'
    },
    {
      _id: generateId(),
      title: 'Scholarship Application Deadline',
      content: 'Applications for merit-based scholarships for the Spring 2024 semester are due by January 30th, 2024. Please submit all required documents through the student portal.',
      author: 'Financial Aid Office',
      createdAt: new Date('2024-01-01T12:00:00Z').toISOString(),
      priority: 'high',
      category: 'Financial'
    },
    {
      _id: generateId(),
      title: 'Research Symposium Call for Papers',
      content: 'The 15th Annual BRACU Research Symposium will be held on April 20th, 2024. Students and faculty are invited to submit research papers by March 1st, 2024. This is a great opportunity to showcase your research.',
      author: 'Research Office',
      createdAt: new Date('2023-12-30T14:20:00Z').toISOString(),
      priority: 'normal',
      category: 'Academic'
    },
    {
      _id: generateId(),
      title: 'Transportation Schedule Update',
      content: 'The university shuttle service schedule has been updated for the Spring semester. New routes and extended hours are now available. Check the updated schedule on the university website.',
      author: 'Transportation Office',
      createdAt: new Date('2023-12-29T09:30:00Z').toISOString(),
      priority: 'normal',
      category: 'Facilities'
    },
    {
      _id: generateId(),
      title: 'International Student Orientation',
      content: 'International students are required to attend the orientation session on January 12th, 2024, at 2 PM in the Main Auditorium. Important information about visas, accommodation, and academic requirements will be covered.',
      author: 'International Office',
      createdAt: new Date('2023-12-28T16:15:00Z').toISOString(),
      priority: 'high',
      category: 'Student Life'
    },
    {
      _id: generateId(),
      title: 'Health Center Services',
      content: 'The university health center now offers extended services including mental health counseling, nutrition consultation, and preventive health screenings. Appointments can be booked through the student portal.',
      author: 'Health Services',
      createdAt: new Date('2023-12-27T11:45:00Z').toISOString(),
      priority: 'normal',
      category: 'Health'
    },
    {
      _id: generateId(),
      title: 'Alumni Network Event',
      content: 'Join us for the annual alumni networking event on February 10th, 2024. Connect with successful BRACU graduates and explore career opportunities. Registration is free for current students.',
      author: 'Alumni Relations',
      createdAt: new Date('2023-12-26T13:20:00Z').toISOString(),
      priority: 'normal',
      category: 'Career'
    },
    {
      _id: generateId(),
      title: 'Language Center Programs',
      content: 'The BRACU Language Center is offering new language courses for the Spring semester. Learn Arabic, Chinese, French, German, or Spanish. Classes start on January 22nd, 2024.',
      author: 'Language Center',
      createdAt: new Date('2023-12-25T10:10:00Z').toISOString(),
      priority: 'low',
      category: 'Academic'
    },
    {
      _id: generateId(),
      title: 'Environmental Initiative Launch',
      content: 'BRACU is launching a new environmental sustainability initiative. Join the Green Campus program and participate in tree planting, waste reduction, and energy conservation activities.',
      author: 'Sustainability Office',
      createdAt: new Date('2023-12-24T15:40:00Z').toISOString(),
      priority: 'normal',
      category: 'Student Life'
    },
    {
      _id: generateId(),
      title: 'Emergency Contact Information',
      content: 'Please ensure your emergency contact information is up to date in the student portal. This information is crucial for your safety and for the university to contact your family in case of emergencies.',
      author: 'Student Services',
      createdAt: new Date('2023-12-23T12:30:00Z').toISOString(),
      priority: 'high',
      category: 'Administrative'
    },
    {
      _id: generateId(),
      title: 'Study Abroad Opportunities',
      content: 'Applications for study abroad programs for Fall 2024 are now open. Partner universities in Europe, Asia, and North America are available. Deadline for applications is March 15th, 2024.',
      author: 'International Programs',
      createdAt: new Date('2023-12-22T14:50:00Z').toISOString(),
      priority: 'normal',
      category: 'Academic'
    },
    {
      _id: generateId(),
      title: 'Graduation Ceremony Information',
      content: 'The Spring 2024 graduation ceremony will be held on May 15th, 2024. Graduation applications are due by March 30th, 2024. Please ensure all academic requirements are met.',
      author: 'Academic Affairs',
      createdAt: new Date('2023-12-21T09:15:00Z').toISOString(),
      priority: 'high',
      category: 'Academic'
    },
    {
      _id: generateId(),
      title: 'Student Discount Programs',
      content: 'Various local businesses are offering student discounts to BRACU students. Present your student ID at participating restaurants, bookstores, and entertainment venues to avail these offers.',
      author: 'Student Affairs',
      createdAt: new Date('2023-12-20T16:25:00Z').toISOString(),
      priority: 'low',
      category: 'Student Life'
    }
  ],
  
  forms: [
    // Polls
    {
      _id: generateId(),
      title: 'Preferred Study Environment',
      type: 'poll',
      questions: [
        {
          text: 'Where do you prefer to study?',
          options: ['Library', 'Cafeteria', 'Study Rooms', 'Outdoor Areas']
        }
      ],
      createdAt: new Date('2024-01-10T10:00:00Z').toISOString(),
      responseCount: 45,
      isActive: true,
      isMandatory: false
    },
    {
      _id: generateId(),
      title: 'Course Difficulty Assessment',
      type: 'poll',
      questions: [
        {
          text: 'How would you rate the difficulty of your current courses?',
          options: ['Very Easy', 'Easy', 'Moderate', 'Difficult', 'Very Difficult']
        }
      ],
      createdAt: new Date('2024-01-09T14:30:00Z').toISOString(),
      responseCount: 78,
      isActive: true,
      isMandatory: true
    },
    {
      _id: generateId(),
      title: 'Transportation Preferences',
      type: 'poll',
      questions: [
        {
          text: 'What is your primary mode of transportation to campus?',
          options: ['University Shuttle', 'Public Bus', 'Private Car', 'Walking', 'Bicycle']
        }
      ],
      createdAt: new Date('2024-01-08T09:15:00Z').toISOString(),
      responseCount: 32,
      isActive: true,
      isMandatory: false
    },
    {
      _id: generateId(),
      title: 'Library Resource Usage',
      type: 'poll',
      questions: [
        {
          text: 'How often do you use the university library?',
          options: ['Daily', 'Weekly', 'Monthly', 'Rarely', 'Never']
        },
        {
          text: 'Which library resources do you use most?',
          options: ['Books', 'Online Databases', 'Study Spaces', 'Computers', 'Printing Services']
        }
      ],
      createdAt: new Date('2024-01-07T16:45:00Z').toISOString(),
      responseCount: 56,
      isActive: true,
      isMandatory: false
    },
    {
      _id: generateId(),
      title: 'Cafeteria Satisfaction',
      type: 'poll',
      questions: [
        {
          text: 'How satisfied are you with the cafeteria food quality?',
          options: ['Very Satisfied', 'Satisfied', 'Neutral', 'Dissatisfied', 'Very Dissatisfied']
        },
        {
          text: 'What would you like to see improved?',
          options: ['Food Quality', 'Variety', 'Pricing', 'Service Speed', 'Hygiene']
        }
      ],
      createdAt: new Date('2024-01-06T11:20:00Z').toISOString(),
      responseCount: 89,
      isActive: true,
      isMandatory: false
    },
    {
      _id: generateId(),
      title: 'Online Learning Experience',
      type: 'poll',
      questions: [
        {
          text: 'How effective do you find online learning compared to in-person classes?',
          options: ['Much More Effective', 'More Effective', 'Equally Effective', 'Less Effective', 'Much Less Effective']
        }
      ],
      createdAt: new Date('2024-01-05T13:00:00Z').toISOString(),
      responseCount: 67,
      isActive: true,
      isMandatory: true
    },
    {
      _id: generateId(),
      title: 'Campus Safety Perception',
      type: 'poll',
      questions: [
        {
          text: 'How safe do you feel on campus?',
          options: ['Very Safe', 'Safe', 'Neutral', 'Unsafe', 'Very Unsafe']
        }
      ],
      createdAt: new Date('2024-01-04T15:30:00Z').toISOString(),
      responseCount: 43,
      isActive: true,
      isMandatory: false
    },
    {
      _id: generateId(),
      title: 'Student Services Feedback',
      type: 'poll',
      questions: [
        {
          text: 'Which student service do you use most frequently?',
          options: ['Academic Advising', 'Career Services', 'Health Center', 'Financial Aid', 'IT Support']
        }
      ],
      createdAt: new Date('2024-01-03T10:45:00Z').toISOString(),
      responseCount: 34,
      isActive: true,
      isMandatory: false
    },
    {
      _id: generateId(),
      title: 'Extracurricular Participation',
      type: 'poll',
      questions: [
        {
          text: 'How many extracurricular activities are you involved in?',
          options: ['None', '1-2', '3-4', '5+']
        }
      ],
      createdAt: new Date('2024-01-02T12:00:00Z').toISOString(),
      responseCount: 51,
      isActive: true,
      isMandatory: false
    },
    {
      _id: generateId(),
      title: 'Technology Infrastructure',
      type: 'poll',
      questions: [
        {
          text: 'How would you rate the campus technology infrastructure?',
          options: ['Excellent', 'Good', 'Average', 'Poor', 'Very Poor']
        }
      ],
      createdAt: new Date('2024-01-01T14:20:00Z').toISOString(),
      responseCount: 38,
      isActive: true,
      isMandatory: false
    },
    {
      _id: generateId(),
      title: 'Academic Support Needs',
      type: 'poll',
      questions: [
        {
          text: 'What type of academic support do you need most?',
          options: ['Tutoring', 'Study Skills', 'Time Management', 'Writing Help', 'Math Support']
        }
      ],
      createdAt: new Date('2023-12-30T09:30:00Z').toISOString(),
      responseCount: 42,
      isActive: true,
      isMandatory: false
    },
    {
      _id: generateId(),
      title: 'Graduation Plans',
      type: 'poll',
      questions: [
        {
          text: 'What are your plans after graduation?',
          options: ['Full-time Job', 'Graduate School', 'Entrepreneurship', 'Travel', 'Undecided']
        }
      ],
      createdAt: new Date('2023-12-29T16:15:00Z').toISOString(),
      responseCount: 29,
      isActive: true,
      isMandatory: false
    },
    
    // Q&A Forms
    {
      _id: generateId(),
      title: 'Course Content Feedback',
      type: 'qna',
      questions: [
        {
          text: 'What aspects of your current courses would you like to see improved?'
        },
        {
          text: 'How can instructors make the learning experience more engaging?'
        }
      ],
      createdAt: new Date('2024-01-10T11:00:00Z').toISOString(),
      responseCount: 23,
      isActive: true,
      isMandatory: true
    },
    {
      _id: generateId(),
      title: 'Campus Improvement Suggestions',
      type: 'qna',
      questions: [
        {
          text: 'What improvements would you like to see on campus?'
        },
        {
          text: 'Are there any facilities that need attention or renovation?'
        }
      ],
      createdAt: new Date('2024-01-09T15:30:00Z').toISOString(),
      responseCount: 18,
      isActive: true,
      isMandatory: false
    },
    {
      _id: generateId(),
      title: 'Student Life Experience',
      type: 'qna',
      questions: [
        {
          text: 'How would you describe your overall student life experience at BRACU?'
        },
        {
          text: 'What activities or events would you like to see more of?'
        }
      ],
      createdAt: new Date('2024-01-08T10:15:00Z').toISOString(),
      responseCount: 31,
      isActive: true,
      isMandatory: false
    },
    {
      _id: generateId(),
      title: 'Career Development Needs',
      type: 'qna',
      questions: [
        {
          text: 'What career development resources would be most helpful to you?'
        },
        {
          text: 'Are there specific industries or job roles you\'d like to learn more about?'
        }
      ],
      createdAt: new Date('2024-01-07T17:45:00Z').toISOString(),
      responseCount: 27,
      isActive: true,
      isMandatory: false
    },
    {
      _id: generateId(),
      title: 'Technology Support Feedback',
      type: 'qna',
      questions: [
        {
          text: 'What technical challenges do you face while using university systems?'
        },
        {
          text: 'How can IT support services be improved?'
        }
      ],
      createdAt: new Date('2024-01-06T12:20:00Z').toISOString(),
      responseCount: 19,
      isActive: true,
      isMandatory: false
    },
    {
      _id: generateId(),
      title: 'Academic Challenges',
      type: 'qna',
      questions: [
        {
          text: 'What are the biggest academic challenges you\'re currently facing?'
        },
        {
          text: 'How can the university better support students with these challenges?'
        }
      ],
      createdAt: new Date('2024-01-05T14:00:00Z').toISOString(),
      responseCount: 35,
      isActive: true,
      isMandatory: true
    },
    {
      _id: generateId(),
      title: 'Library Services Feedback',
      type: 'qna',
      questions: [
        {
          text: 'What additional library services would you find most valuable?'
        },
        {
          text: 'How can the library better support your research and study needs?'
        }
      ],
      createdAt: new Date('2024-01-04T16:30:00Z').toISOString(),
      responseCount: 22,
      isActive: true,
      isMandatory: false
    },
    {
      _id: generateId(),
      title: 'Student Organization Ideas',
      type: 'qna',
      questions: [
        {
          text: 'What new student organizations would you like to see on campus?'
        },
        {
          text: 'What activities or events should these organizations focus on?'
        }
      ],
      createdAt: new Date('2024-01-03T11:45:00Z').toISOString(),
      responseCount: 16,
      isActive: true,
      isMandatory: false
    },
    {
      _id: generateId(),
      title: 'Health and Wellness Needs',
      type: 'qna',
      questions: [
        {
          text: 'What health and wellness services would you like to see expanded?'
        },
        {
          text: 'How can the university better support student mental health?'
        }
      ],
      createdAt: new Date('2024-01-02T13:00:00Z').toISOString(),
      responseCount: 28,
      isActive: true,
      isMandatory: false
    },
    {
      _id: generateId(),
      title: 'International Student Support',
      type: 'qna',
      questions: [
        {
          text: 'What additional support do international students need?'
        },
        {
          text: 'How can the university better integrate international and local students?'
        }
      ],
      createdAt: new Date('2024-01-01T15:20:00Z').toISOString(),
      responseCount: 14,
      isActive: true,
      isMandatory: false
    }
  ]
};

// Export individual functions for easier access
export const getAnnouncementSeedData = () => yuvrajSeedData.announcements;
export const getFormsSeedData = () => yuvrajSeedData.forms;


