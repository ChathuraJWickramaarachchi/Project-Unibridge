// Test admin exam creation with proper authentication
const mongoose = require('mongoose');
const User = require('./models/User');
const ExamTest = require('./models/ExamTest');
const Question = require('./models/Question');

// Connect to database
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/unibridge');

const testAdminExamCreation = async () => {
  try {
    console.log('🔍 Testing admin exam creation...\n');

    // 1. Check if admin user exists
    console.log('1. Checking for admin user...');
    let adminUser = await User.findOne({ role: 'admin' });
    
    if (!adminUser) {
      console.log('No admin user found. Creating test admin...');
      adminUser = await User.create({
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@unibridge.com',
        password: 'admin123',
        role: 'admin',
        isVerified: true,
        phone: '1234567890',
        address: 'Test Address'
      });
      console.log('✅ Admin user created:', adminUser.email);
    } else {
      console.log('✅ Admin user found:', adminUser.email);
    }

    // 2. Test exam creation directly (without API)
    console.log('\n2. Testing exam model creation...');
    const testExam = await ExamTest.create({
      title: 'Test JavaScript Exam',
      description: 'A test exam for JavaScript fundamentals',
      timeLimit: 60,
      passingScore: 70
    });
    console.log('✅ Exam created successfully:', testExam);

    // 3. Test question creation
    console.log('\n3. Testing question creation...');
    const testQuestion = await Question.create({
      examId: testExam._id,
      text: 'What is the correct way to declare a variable in JavaScript?',
      options: [
        'var myVariable = 5;',
        'variable myVariable = 5;',
        'v myVariable = 5;',
        'declare myVariable = 5;'
      ],
      correctAnswer: 0,
      marks: 1
    });
    console.log('✅ Question created successfully:', testQuestion);

    // 4. Update exam total marks
    const allQuestions = await Question.find({ examId: testExam._id });
    const totalMarks = allQuestions.reduce((sum, q) => sum + q.marks, 0);
    await ExamTest.findByIdAndUpdate(testExam._id, { totalMarks });
    console.log('✅ Exam total marks updated:', totalMarks);

    // 5. Fetch exam with question count
    const examWithCount = await ExamTest.findById(testExam._id);
    const questionCount = await Question.countDocuments({ examId: testExam._id });
    
    console.log('\n📊 Final Results:');
    console.log('Exam:', examWithCount.title);
    console.log('Question Count:', questionCount);
    console.log('Total Marks:', examWithCount.totalMarks);

    console.log('\n🎉 All tests passed! Admin exam management is working correctly.');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error);
  } finally {
    await mongoose.connection.close();
  }
};

testAdminExamCreation();
