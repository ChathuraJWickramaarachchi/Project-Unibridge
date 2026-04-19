import mongoose from 'mongoose';
import User from './models/User.js';
import Department from './models/Department.js';
import dotenv from 'dotenv';

dotenv.config();

const createEmployerDepartments = async () => {
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

    console.log('Creating departments for employer:', employer.firstName, employer.lastName, 'ID:', employer._id);

    // Create departments specifically for this employer using allowed enum values
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
      }
    ];

    console.log('Creating departments...');
    const createdDepts = [];
    for (const deptData of departments) {
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
    }

    console.log('\n=== Departments Created Successfully ===');
    console.log('Departments:', createdDepts.length);
    createdDepts.forEach(dept => {
      console.log(`- ${dept.name} (${dept._id})`);
    });

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error creating departments:', error);
    process.exit(1);
  }
};

createEmployerDepartments();
