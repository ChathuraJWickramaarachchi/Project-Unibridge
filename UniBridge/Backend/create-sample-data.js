import mongoose from 'mongoose';
import User from './models/User.js';
import Department from './models/Department.js';
import Job from './models/Job.js';
import dotenv from 'dotenv';

dotenv.config();

const createSampleData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get the test employer
    const employer = await User.findOne({ email: 'employer@test.com' });
    if (!employer) {
      console.error('Test employer not found. Please run create-test-user.js first.');
      return;
    }

    console.log('Using employer:', employer.firstName, employer.lastName);

    // Create sample departments
    const departments = [
      {
        name: 'IT',
        description: 'Information Technology department handling all tech operations',
        createdBy: employer._id,
        companyId: employer._id,
        isActive: true
      },
      {
        name: 'Software Engineering',
        description: 'Software development and engineering team',
        createdBy: employer._id,
        companyId: employer._id,
        isActive: true
      },
      {
        name: 'Human Resources',
        description: 'HR department managing employee relations and recruitment',
        createdBy: employer._id,
        companyId: employer._id,
        isActive: true
      }
    ];

    console.log('Creating departments...');
    const createdDepts = [];
    for (const deptData of departments) {
      try {
        const existingDept = await Department.findOne({ name: deptData.name, companyId: employer._id });
        if (!existingDept) {
          const dept = new Department(deptData);
          await dept.save();
          createdDepts.push(dept);
          console.log(`Created department: ${dept.name}`);
        } else {
          createdDepts.push(existingDept);
          console.log(`Department already exists: ${existingDept.name}`);
        }
      } catch (error) {
        if (error.code === 11000) {
          // Duplicate key error - department exists globally
          console.log(`Department name '${deptData.name}' already exists globally, skipping...`);
          // Try to find an existing department with this name
          const existingGlobalDept = await Department.findOne({ name: deptData.name });
          if (existingGlobalDept) {
            createdDepts.push(existingGlobalDept);
            console.log(`Using existing global department: ${existingGlobalDept.name}`);
          }
        } else {
          throw error;
        }
      }
    }

    // Create sample jobs
    const jobs = [
      {
        title: 'Software Engineer Intern',
        departmentId: createdDepts[1]._id, // Software Engineering
        type: 'Internship',
        description: 'Join our software engineering team for a hands-on internship experience. You will work on real projects and learn from experienced developers.',
        requirements: ['Currently pursuing a degree in Computer Science or related field', 'Basic programming knowledge', 'Strong problem-solving skills', 'Good communication skills'],
        responsibilities: ['Assist in software development', 'Participate in code reviews', 'Debug and fix issues', 'Write technical documentation'],
        salary: '50000',
        location: 'Colombo, Sri Lanka',
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        positions: 3,
        isActive: true,
        isFeatured: true,
        createdBy: employer._id,
        companyId: employer._id
      },
      {
        title: 'Junior Software Developer',
        departmentId: createdDepts[1]._id, // Software Engineering
        type: 'Permanent',
        description: 'Looking for a passionate junior developer to join our growing team. Great opportunity to grow your skills.',
        requirements: ['Bachelor degree in Computer Science', '1-2 years of experience', 'Knowledge of JavaScript/React', 'Team player'],
        responsibilities: ['Develop web applications', 'Collaborate with senior developers', 'Write clean code', 'Participate in agile ceremonies'],
        salary: '80000',
        location: 'Remote',
        deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days from now
        positions: 2,
        isActive: true,
        isFeatured: false,
        createdBy: employer._id,
        companyId: employer._id
      },
      {
        title: 'IT Support Specialist',
        departmentId: createdDepts[0]._id, // IT
        type: 'Permanent',
        description: 'Manage and maintain our IT infrastructure and provide technical support to the team.',
        requirements: ['Diploma or degree in IT', 'Knowledge of networks and hardware', 'Good troubleshooting skills', 'Customer service oriented'],
        responsibilities: ['Provide IT support', 'Manage hardware and software', 'Network maintenance', 'User training'],
        salary: '60000',
        location: 'Colombo, Sri Lanka',
        deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000), // 20 days from now
        positions: 1,
        isActive: true,
        isFeatured: false,
        createdBy: employer._id,
        companyId: employer._id
      }
    ];

    console.log('Creating jobs...');
    for (const jobData of jobs) {
      const existingJob = await Job.findOne({ title: jobData.title, companyId: employer._id });
      if (!existingJob) {
        const job = new Job(jobData);
        await job.save();
        console.log(`Created job: ${job.title}`);
      } else {
        console.log(`Job already exists: ${existingJob.title}`);
      }
    }

    console.log('\n=== Sample Data Created Successfully ===');
    console.log('Departments:', createdDepts.length);
    console.log('Jobs:', jobs.length);
    console.log('\nYou can now login to the dashboard and see the data!');
    console.log('Login credentials:');
    console.log('Email: employer@test.com');
    console.log('Password: password123');

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error creating sample data:', error);
    process.exit(1);
  }
};

createSampleData();
