import mongoose from 'mongoose';
import User from './models/User.js';
import Department from './models/Department.js';
import Job from './models/Job.js';
import dotenv from 'dotenv';

dotenv.config();

const resetDepartmentsForEmployer = async () => {
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

    console.log('Resetting departments for employer:', employer.firstName, employer.lastName, 'ID:', employer._id);

    // Delete existing departments (they belong to a different company)
    console.log('Deleting existing departments...');
    await Department.deleteMany({});
    console.log('All existing departments deleted');

    // Delete existing jobs to avoid conflicts
    console.log('Deleting existing jobs...');
    await Job.deleteMany({});
    console.log('All existing jobs deleted');

    // Create departments specifically for this employer
    const departments = [
      {
        name: 'IT',
        description: 'Information Technology department handling all tech operations and software development',
        createdBy: employer._id,
        companyId: employer._id,
        isActive: true,
        icon: 'Monitor',
        color: '#3B82F6'
      },
      {
        name: 'Software Engineering',
        description: 'Software development and engineering team focused on creating innovative solutions',
        createdBy: employer._id,
        companyId: employer._id,
        isActive: true,
        icon: 'Code2',
        color: '#10B981'
      },
      {
        name: 'Quality Assurance',
        description: 'QA department ensuring product quality and testing excellence',
        createdBy: employer._id,
        companyId: employer._id,
        isActive: true,
        icon: 'CheckCircle',
        color: '#F59E0B'
      },
      {
        name: 'Human Resources',
        description: 'HR department managing employee relations and recruitment',
        createdBy: employer._id,
        companyId: employer._id,
        isActive: true,
        icon: 'Users',
        color: '#EC4899'
      },
      {
        name: 'Networking',
        description: 'Network infrastructure and communications department',
        createdBy: employer._id,
        companyId: employer._id,
        isActive: true,
        icon: 'Network',
        color: '#8B5CF6'
      }
    ];

    console.log('Creating new departments...');
    const createdDepts = [];
    for (const deptData of departments) {
      const dept = new Department(deptData);
      await dept.save();
      createdDepts.push(dept);
      console.log(`Created department: ${dept.name} (ID: ${dept._id})`);
    }

    // Create sample jobs for this employer
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
        title: 'QA Testing Intern',
        departmentId: createdDepts[2]._id, // Quality Assurance
        type: 'Internship',
        description: 'Great opportunity to learn software testing and quality assurance processes.',
        requirements: ['Currently studying Computer Science or related field', 'Attention to detail', 'Analytical thinking'],
        responsibilities: ['Test software applications', 'Write test cases', 'Report bugs', 'Work with development team'],
        salary: '35000',
        location: 'Hybrid',
        deadline: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000), // 25 days from now
        positions: 2,
        isActive: true,
        isFeatured: false,
        createdBy: employer._id,
        companyId: employer._id
      }
    ];

    console.log('Creating sample jobs...');
    for (const jobData of jobs) {
      const job = new Job(jobData);
      await job.save();
      console.log(`Created job: ${job.title} in ${jobData.departmentId === createdDepts[1]._id ? 'Software Engineering' : 'Quality Assurance'}`);
    }

    console.log('\n=== Setup Complete ===');
    console.log('Departments created:', createdDepts.length);
    console.log('Jobs created:', jobs.length);
    console.log('\nLogin credentials:');
    console.log('Email: employer@test.com');
    console.log('Password: password123');
    console.log('\nYou can now login to the dashboard and see the data!');

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error setting up data:', error);
    process.exit(1);
  }
};

resetDepartmentsForEmployer();
