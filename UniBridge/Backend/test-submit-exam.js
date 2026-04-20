import axios from 'axios';

async function testExamSubmission() {
  try {
    console.log('Testing exam submission...');

    // Get public exams
    const examsResponse = await axios.get('http://localhost:5001/api/exams/public');
    console.log('Exams:', examsResponse.data);

    if (!examsResponse.data.success || examsResponse.data.data.length === 0) {
      console.log('No exams available');
      return;
    }

    const exam = examsResponse.data.data[0];
    console.log('Using exam:', exam._id, exam.title);

    // Get questions
    const questionsResponse = await axios.get(`http://localhost:5001/api/exams/public/${exam._id}/questions`);
    console.log('Questions count:', questionsResponse.data.data.length);

    // Prepare answers (all correct for simplicity)
    const answers = questionsResponse.data.data.map(q => q.correctAnswer);

    // Submit exam
    const submitData = {
      applicantEmail: 'teststudent@example.com',
      answers: answers,
      duration: 30
    };

    console.log('Submitting exam with data:', submitData);

    const submitResponse = await axios.post(`http://localhost:5001/api/exams/public/${exam._id}/submit`, submitData);
    console.log('Submit response:', submitResponse.data);

  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

testExamSubmission();