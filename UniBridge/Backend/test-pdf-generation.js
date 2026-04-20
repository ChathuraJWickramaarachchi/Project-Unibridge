const { jsPDF } = require('jspdf');

// Test PDF generation with CV data
const testCVData = {
  fullName: "Test User PDF",
  email: "testuser@example.com",
  phone: "1234567890",
  address: "123 Test Street",
  education: "Bachelor in Computer Science",
  skills: "JavaScript, React, Node.js, MongoDB",
  experience: "3 years of software development experience",
  careerObjective: "Seeking a challenging position in software development"
};

const doc = new jsPDF();

// Set font
doc.setFont('helvetica');

let yPosition = 20;
const lineHeight = 7;
const pageWidth = doc.internal.pageSize.width;
const margin = 20;

// Helper function to check if we need a new page
const checkPageBreak = (requiredHeight = lineHeight) => {
  if (yPosition + requiredHeight > doc.internal.pageSize.height - 20) {
    doc.addPage();
    yPosition = 20;
    return true;
  }
  return false;
};

// Helper function to add text with word wrap
const addText = (text, fontSize = 12, fontStyle = 'normal') => {
  doc.setFontSize(fontSize);
  doc.setFont('helvetica', fontStyle);
  const lines = doc.splitTextToSize(text, pageWidth - 2 * margin);
  
  lines.forEach(line => {
    checkPageBreak();
    doc.text(line, margin, yPosition);
    yPosition += lineHeight;
  });
  return yPosition;
};

// Title
doc.setFontSize(20);
doc.setFont('helvetica', 'bold');
doc.text('CURRICULUM VITAE', pageWidth / 2, yPosition, { align: 'center' });
yPosition += 15;

// Personal Information Section
yPosition = addText('Personal Information:', 16, 'bold');
yPosition += 5;

const personalInfo = [
  `Name: ${testCVData.fullName}`,
  `Email: ${testCVData.email}`,
  `Phone: ${testCVData.phone}`,
  `Address: ${testCVData.address}`
];

personalInfo.forEach(info => {
  yPosition = addText(info);
});

yPosition += 10;

// Career Objective (if exists)
if (testCVData.careerObjective) {
  yPosition = addText('Career Objective:', 16, 'bold');
  yPosition += 5;
  yPosition = addText(testCVData.careerObjective);
  yPosition += 10;
}

// Education Section
yPosition = addText('Education:', 16, 'bold');
yPosition += 5;
yPosition = addText(testCVData.education);
yPosition += 10;

// Skills Section
yPosition = addText('Skills:', 16, 'bold');
yPosition += 5;
yPosition = addText(testCVData.skills);
yPosition += 10;

// Experience Section
yPosition = addText('Experience:', 16, 'bold');
yPosition += 5;
yPosition = addText(testCVData.experience);
yPosition += 15;

// Footer information
doc.setFontSize(10);
doc.setFont('helvetica', 'italic');
yPosition = addText(`Generated on: ${new Date().toLocaleDateString()}`);
yPosition = addText(`Transaction ID: TEST_TXN_123`);

// Generate PDF buffer
const pdfBuffer = Buffer.from(doc.output('arraybuffer'));

console.log('PDF generated successfully!');
console.log('PDF size:', pdfBuffer.length, 'bytes');

// Save to file to test
require('fs').writeFileSync('test_cv_output.pdf', pdfBuffer);
console.log('PDF saved as test_cv_output.pdf');
