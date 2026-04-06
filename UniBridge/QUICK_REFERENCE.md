# 🚀 Quick Reference Guide - Admin Examination Dashboard

## 📋 Directory Quick Links

### Backend
```
Backend/
├── models/
│   ├── ExamTest.js           ← Exam schema
│   ├── Question.js           ← Question schema
│   ├── ApplicantExam.js      ← Results schema
│   └── User.js
├── controllers/
│   ├── examTestController.js      ← Exam CRUD
│   ├── questionController.js      ← Question CRUD
│   ├── resultsController.js       ← Results & Stats
│   └── ...
└── routes/
    └── admin.js              ← All routes (UPDATED)
```

### Frontend
```
Frontend/src/
├── pages/Admin/
│   ├── CreateExam.tsx        ← Create form
│   ├── AddQuestions.tsx      ← Question form
│   ├── ViewExams.tsx         ← Exam table
│   ├── ViewQuestions.tsx     ← Question cards
│   ├── ViewResults.tsx       ← Results table
│   └── ...
├── components/Admin/
│   └── AdminSidebar.tsx      ← Navigation (UPDATED)
├── services/
│   └── examService.ts        ← API calls
├── App.tsx                   ← Routes (UPDATED)
└── ...
```

---

## 🔗 Routes & Navigation

### Admin Routes

```javascript
// Create Exam
Route: /admin/exams/create
Component: CreateExam
API: POST /api/admin/exams

// Add Questions
Route: /admin/exams/questions/add
Component: AddQuestions
API: POST /api/admin/questions

// View Exams
Route: /admin/exams/view
Component: ViewExams
API: GET /api/admin/exams, DELETE /api/admin/exams/:id

// View Questions
Route: /admin/exams/questions/view
Component: ViewQuestions
API: GET /api/admin/questions/:examId, DELETE /api/admin/questions/:id

// View Results
Route: /admin/exams/results
Component: ViewResults
API: GET /api/admin/results, GET /api/admin/results/stats/summary
```

---

## 💾 API Quick Reference

### Exam Endpoints

```bash
# Create
POST /api/admin/exams
Body: {title, description, timeLimit, passingScore}
Returns: Exam object

# Get All
GET /api/admin/exams
Returns: Array of exams with questionCount

# Get One
GET /api/admin/exams/:id
Returns: Single exam object

# Update
PUT /api/admin/exams/:id
Body: {title?, description?, timeLimit?, passingScore?, status?}
Returns: Updated exam

# Delete
DELETE /api/admin/exams/:id
Returns: Success message (cascades to questions)
```

### Question Endpoints

```bash
# Add Question
POST /api/admin/questions
Body: {examId, text, options[], correctAnswer, marks}
Returns: Question object

# Get by Exam
GET /api/admin/questions/:examId
Returns: Questions array for exam

# Get All
GET /api/admin/questions
Returns: All questions (populated exam)

# Update
PUT /api/admin/questions/:id
Body: {text?, options[]?, correctAnswer?, marks?}
Returns: Updated question

# Delete
DELETE /api/admin/questions/:id
Returns: Success message
```

### Result Endpoints

```bash
# Get All Results
GET /api/admin/results
Returns: Array of all results

# Get by Exam
GET /api/admin/results/:examId
Returns: Results for specific exam

# Get Details
GET /api/admin/results/:examId/:email
Returns: Full result with answers

# Get Statistics
GET /api/admin/results/stats/summary
Returns: Overall statistics
```

---

## 📊 Database Models Quick Reference

### ExamTest
```javascript
{
  _id: ObjectId,
  title: String,              // required, max 100
  description: String,        // max 1000
  timeLimit: Number,          // required, min 1
  passingScore: Number,       // required, 0-100
  totalMarks: Number,         // auto-calculated
  status: String,             // "active" or "inactive"
  createdAt: Date,
  updatedAt: Date
}
// Virtual: questionCount
```

### Question
```javascript
{
  _id: ObjectId,
  examId: ObjectId,           // required, ref ExamTest
  text: String,               // required, max 500
  options: [String],          // required, exactly 4
  correctAnswer: Number,      // required, 0-3
  marks: Number,              // required, min 1
  createdAt: Date,
  updatedAt: Date
}
// Index: examId
```

### ApplicantExam
```javascript
{
  _id: ObjectId,
  examId: ObjectId,           // required, ref ExamTest
  applicantEmail: String,     // required, lowercase
  answers: [{
    questionId: ObjectId,
    selectedAnswer: Number,   // 0-3 or -1 (not answered)
    isCorrect: Boolean,
    marksObtained: Number
  }],
  score: Number,              // auto-calculated
  totalMarks: Number,         // from exam
  passFail: String,           // "pass" or "fail"
  percentage: Number,         // (score/totalMarks)*100
  startedAt: Date,
  endedAt: Date,
  status: String,             // "started", "submitted", "evaluated"
  createdAt: Date,
  updatedAt: Date
}
// Indexes: examId, applicantEmail
```

---

## 🎨 Component Props & State

### CreateExam Component
```typescript
// State
formData: {
  title: string;
  description: string;
  timeLimit: string;
  passingScore: string;
}
loading: boolean;
success: boolean;

// Methods
handleChange(e): void
handleSubmit(e): Promise<void>
```

### AddQuestions Component
```typescript
// State
exams: Exam[];
selectedExam: string;
questions: Question[];
loading: boolean;
examsLoading: boolean;

// Methods
loadExams(): Promise<void>
handleQuestionChange(index, field, value): void
addQuestion(): void
removeQuestion(index): void
handleSubmit(e): Promise<void>
```

### ViewExams Component
```typescript
// State
exams: Exam[];
loading: boolean;
deleteId: string | null;

// Methods
loadExams(): Promise<void>
handleDelete(): Promise<void>
```

### ViewQuestions Component
```typescript
// State
exams: Exam[];
questions: Question[];
selectedExam: string;
loading: boolean;
questionsLoading: boolean;

// Methods
loadExams(): Promise<void>
handleExamChange(examId): Promise<void>
handleDelete(): Promise<void>
```

### ViewResults Component
```typescript
// State
exams: Exam[];
results: Result[];
stats: Statistics;
selectedExam: string;
loading: boolean;

// Methods
loadExams(): Promise<void>
loadStats(): Promise<void>
handleExamChange(examId): Promise<void>
```

---

## 🔧 Using the Service

```typescript
import examService from "@/services/examService";

// Create Exam
await examService.createExam({
  title: "Java Quiz",
  description: "...",
  timeLimit: 60,
  passingScore: 50
})

// Get Exams
const exams = await examService.getAllExams();

// Add Question
await examService.addQuestion({
  examId: "...",
  text: "Question?",
  options: ["A", "B", "C", "D"],
  correctAnswer: 0,
  marks: 5
})

// Get Results Stats
const stats = await examService.getResultsStatistics();
```

---

## 🚨 Error Handling Pattern

```typescript
try {
  setLoading(true);
  const response = await examService.createExam(data);
  
  if (response.success) {
    toast({ title: "Success", description: "..." });
    // Update state
  }
} catch (error: any) {
  toast({
    title: "Error",
    description: error.message || "Failed",
    variant: "destructive"
  });
} finally {
  setLoading(false);
}
```

---

## 🔐 Authentication

All admin endpoints require:
1. Valid JWT token in Authorization header
2. Admin role verified in middleware
3. Token format: `Authorization: Bearer {token}`

---

## 📝 Form Validation Rules

### Exam Validation
- Title: Required, 1-100 chars
- TimeLimit: Required, minimum 1
- PassingScore: 0-100%
- Description: 0-1000 chars (optional)

### Question Validation
- ExamID: Required, must exist
- Text: Required, 1-500 chars
- Options: Required, exactly 4
- CorrectAnswer: Required, 0-3
- Marks: Required, minimum 1

---

## 🎯 Common Tasks

### Create an Exam
```
1. Go to /admin/exams/create
2. Fill form (title, timeLimit, passingScore)
3. Click "Create Exam"
4. Get exam ID from response
```

### Add Questions to Exam
```
1. Go to /admin/exams/questions/add
2. Select exam from dropdown
3. Fill question form
4. Click "Add Another Question" if needed
5. Click "Add Questions" to submit
```

### View Results
```
1. Go to /admin/exams/results
2. See statistics cards at top
3. Select exam from dropdown (optional)
4. View results in table
```

---

## 🔍 Debugging Tips

### Issue: Exam not found
```
- Check examId is correct
- Verify exam exists in DB
- Check MongoDB connection
```

### Issue: Questions not showing
```
- Verify correct examId is used
- Check questionCount increments
- Refresh page
```

### Issue: 401 Unauthorized
```
- Check token is valid
- Verify token is in header
- Check admin role
- Check token isn't expired
```

### Issue: Frontend shows blank
```
- Check console for errors (F12)
- Verify routes are added to App.tsx
- Check imports are correct
- Verify service is working
```

---

## 📈 Performance Considerations

- ✅ Indexed queries on examId for fast lookups
- ✅ Virtual fields for calculated data
- ✅ Aggregation pipeline for statistics
- ✅ Lazy loading of questions
- ✅ Pagination ready (add params if needed)

---

## 🔄 Data Update Flow

```
User Input
    ↓
Component State Updates
    ↓
API Call via Service
    ↓
Backend Validation
    ↓
Database Update
    ↓
Response Returned
    ↓
Component Re-render
    ↓
Toast Notification
```

---

## 📚 Related Documentation

- **Full API Docs**: ADMIN_DASHBOARD_DOCUMENTATION.md
- **Testing Guide**: TESTING_GUIDE.md
- **Implementation**: IMPLEMENTATION_SUMMARY.md

---

## 🆘 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| Exams not loading | Check MongoDB connection & admin role |
| Questions not saving | Verify examId exists, check marks value |
| Results showing wrong score | Verify answers array, check calculations |
| Buttons not responding | Check loading state, verify token |
| Page blank | Check console, verify imports, clear cache |

---

## ✅ Verification Checklist

- [ ] Can create exam
- [ ] Can see exam in list
- [ ] Can add questions
- [ ] Questions show in table
- [ ] Can delete question
- [ ] Can delete exam
- [ ] Can view results (if available)
- [ ] Statistics show correctly
- [ ] All buttons work
- [ ] Form validation works

---

## 🎓 Code Examples

### Create Exam Request
```bash
curl -X POST http://localhost:5000/api/admin/exams \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer token" \
  -d '{
    "title": "JavaScript Basics",
    "description": "Test your JS knowledge",
    "timeLimit": 45,
    "passingScore": 60
  }'
```

### Add Question Request
```bash
curl -X POST http://localhost:5000/api/admin/questions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer token" \
  -d '{
    "examId": "507f...",
    "text": "What is a closure?",
    "options": [
      "Function inside function",
      "A type of loop",
      "Variable declaration",
      "None"
    ],
    "correctAnswer": 0,
    "marks": 5
  }'
```

---

## 🚀 Next Steps

1. **Test all features** in frontend
2. **Verify all endpoints** work
3. **Check error handling**
4. **Test with real data**
5. **Add filtering/pagination** if needed
6. **Implement student exam taking**
7. **Add email notifications**
8. **Setup analytics dashboard**

---

**Last Updated**: March 21, 2024
**Status**: ✅ Complete & Ready for Use

**Happy Coding! 🎉**
