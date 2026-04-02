# Quick Setup & Testing Guide

## Backend Setup

### 1. Verify Models are Created
Check that these files exist in `Backend/models/`:
- ✅ ExamTest.js
- ✅ Question.js
- ✅ ApplicantExam.js

### 2. Verify Controllers are Created
Check that these files exist in `Backend/controllers/`:
- ✅ examTestController.js
- ✅ questionController.js
- ✅ resultsController.js

### 3. Verify Routes are Updated
Check `Backend/routes/admin.js` includes:
- ✅ POST /api/admin/exams
- ✅ GET /api/admin/exams
- ✅ POST /api/admin/questions
- ✅ GET /api/admin/questions/:examId
- ✅ GET /api/admin/results

---

## Frontend Setup

### 1. Verify Pages are Created
Check that these files exist in `Frontend/src/pages/Admin/`:
- ✅ CreateExam.tsx
- ✅ AddQuestions.tsx
- ✅ ViewExams.tsx
- ✅ ViewQuestions.tsx
- ✅ ViewResults.tsx

### 2. Verify Service is Created
Check `Frontend/src/services/`:
- ✅ examService.ts

### 3. Verify Routes are Added
Check `Frontend/src/App.tsx`:
- ✅ /admin/exams/create
- ✅ /admin/exams/questions/add
- ✅ /admin/exams/view
- ✅ /admin/exams/questions/view
- ✅ /admin/exams/results

### 4. Verify Sidebar is Updated
Check `Frontend/src/components/Admin/AdminSidebar.tsx`:
- ✅ "Create Exam" menu item
- ✅ "Add Questions" menu item
- ✅ "View Exams" menu item
- ✅ "View Questions" menu item
- ✅ "View Results" menu item

---

## Testing the APIs

### Using cURL or Postman

#### 1. Create an Exam
```bash
curl -X POST http://localhost:5000/api/admin/exams \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "title": "Java Fundamentals",
    "description": "Test your Java basics",
    "timeLimit": 60,
    "passingScore": 50
  }'
```

#### 2. Get All Exams
```bash
curl -X GET http://localhost:5000/api/admin/exams \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

#### 3. Add Questions (after getting examId from step 1)
```bash
curl -X POST http://localhost:5000/api/admin/questions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "examId": "EXAM_ID_FROM_STEP_1",
    "text": "What is Java?",
    "options": ["Programming Language", "Coffee Brand", "Island", "All Above"],
    "correctAnswer": 0,
    "marks": 5
  }'
```

#### 4. Get Questions by Exam
```bash
curl -X GET http://localhost:5000/api/admin/questions/EXAM_ID \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

#### 5. Get All Results
```bash
curl -X GET http://localhost:5000/api/admin/results \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

#### 6. Get Results Statistics
```bash
curl -X GET http://localhost:5000/api/admin/results/stats/summary \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

---

## Testing in Frontend

### 1. Navigate to Admin Dashboard
```
http://localhost:5173/admin
```

### 2. Access Exam Management Features
- **Create Exam**: http://localhost:5173/admin/exams/create
- **Add Questions**: http://localhost:5173/admin/exams/questions/add
- **View Exams**: http://localhost:5173/admin/exams/view
- **View Questions**: http://localhost:5173/admin/exams/questions/view
- **View Results**: http://localhost:5173/admin/exams/results

### 3. Test Create Exam
1. Go to "Create Exam"
2. Fill in:
   - Title: "Java Fundamentals"
   - Description: "Test your Java basics"
   - Time Limit: 60 minutes
   - Passing Score: 50%
3. Click "Create Exam"
4. Should see success message

### 4. Test Add Questions
1. Go to "Add Questions"
2. Select the exam you created
3. Fill in:
   - Question Text: "What is Java?"
   - Options: "Programming Language", "Coffee", "Island", "All"
   - Correct Answer: "Programming Language"
   - Marks: 5
4. Click "Add Another Question" to add more
5. Click "Add Questions" to submit
6. Should see success message

### 5. Test View Exams
1. Go to "View Exams"
2. Should see table with all exams
3. Should see question count in badge
4. Can delete exams

### 6. Test View Questions
1. Go to "View Questions"
2. Select an exam from dropdown
3. Should see all questions for that exam
4. Correct answer should be highlighted in green
5. Can delete individual questions

### 7. Test View Results
1. Go to "View Results"
2. Should see statistics cards (Total, Passed, Failed, etc.)
3. Should see results table
4. Can filter by exam using dropdown

---

## Environment Variables

### Backend (.env)
```
MONGODB_URI=mongodb://localhost:27017/unibridge
JWT_SECRET=your_jwt_secret
PORT=5000
```

### Frontend (.env or .env.local)
```
VITE_API_BASE_URL=http://localhost:5000/api
```

---

## Common Issues & Solutions

### Issue: "Exam not found" error
**Solution**: Make sure you're using the correct examId from the previous request

### Issue: "Missing required fields" error
**Solution**: Check that all required fields are provided in the request

### Issue: "Cannot read property 'toObject'"
**Solution**: Make sure the exam actually exists before calling toObject()

### Issue: "401 Unauthorized"
**Solution**: Make sure you're sending a valid admin token in the Authorization header

### Issue: Questions not appearing
**Solution**: 
1. Make sure exam exists
2. Make sure questions are added to correct examId
3. Refresh the page

---

## Data Seed Script (Optional)

You can create this file to seed test data:

**File**: `Backend/seed-exams.js`

```javascript
require('dotenv').config();
const mongoose = require('mongoose');
const ExamTest = require('./models/ExamTest');
const Question = require('./models/Question');

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    // Create exam
    const exam = await ExamTest.create({
      title: "Java Fundamentals",
      description: "Test your Java basics",
      timeLimit: 60,
      passingScore: 50
    });

    console.log('✅ Exam created:', exam._id);

    // Create questions
    const questions = await Question.insertMany([
      {
        examId: exam._id,
        text: "What is Java?",
        options: ["Programming Language", "Coffee", "Island", "None"],
        correctAnswer: 0,
        marks: 5
      },
      {
        examId: exam._id,
        text: "What is OOP?",
        options: ["Object Oriented Programming", "Out Of Practice", "Over Optimized", "Outdated"],
        correctAnswer: 0,
        marks: 5
      },
      {
        examId: exam._id,
        text: "What is a Class?",
        options: ["Blueprint", "Instance", "Variable", "Method"],
        correctAnswer: 0,
        marks: 5
      },
      {
        examId: exam._id,
        text: "What is Encapsulation?",
        options: ["Data Hiding", "Method Overriding", "Inheritance", "Polymorphism"],
        correctAnswer: 0,
        marks: 5
      }
    ]);

    console.log('✅ Questions created:', questions.length);
    
    // Update exam with total marks
    exam.totalMarks = 20;
    await exam.save();

    console.log('✅ Data seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
```

**Run it with:**
```bash
node Backend/seed-exams.js
```

---

## Next Steps

1. **Test all CRUD operations** for exams and questions
2. **Verify statistics calculation** works correctly
3. **Test filtering and pagination** (if needed)
4. **Add more exam categories** if required
5. **Implement exam taking functionality** for students
6. **Add email notifications** for exam results

---

## Support Resources

- **API Documentation**: See ADMIN_DASHBOARD_DOCUMENTATION.md
- **Backend Routes**: Backend/routes/admin.js
- **Frontend Components**: Frontend/src/pages/Admin/
- **Service**: Frontend/src/services/examService.ts

---

## Success Checklist

- ✅ All backend models created
- ✅ All controllers implemented
- ✅ Routes configured
- ✅ Frontend pages created
- ✅ Service configured
- ✅ Routes added to App.tsx
- ✅ Sidebar updated
- ✅ Can create exams
- ✅ Can add questions
- ✅ Can view exams
- ✅ Can view questions
- ✅ Can view results
- ✅ Statistics working

**You're all set! 🚀**
