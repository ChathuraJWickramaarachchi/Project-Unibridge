// Test PDF generation in the same context as the controller
const { jsPDF } = require('jspdf');

// Mock payment data similar to what the controller receives
const mockPayment = {
  cvData: {
    fullName: "Debug PDF User",
    email: "testuser@example.com",
    phone: "1234567890",
    address: "123 Test Street",
    education: "Bachelor in Computer Science",
    skills: "JavaScript, React, Node.js",
    experience: "2 years experience",
    careerObjective: "Seeking a challenging position"
  },
  paymentDetails: {
    transactionId: "TEST_TXN_123"
  }
};

console.log('Testing PDF generation with controller logic...');

try {
  // Generate CV PDF using jsPDF (same as controller)
  console.log('Starting PDF generation...');
  let doc;
  try {
    doc = new jsPDF();
    console.log('jsPDF initialized successfully');
  } catch (error) {
    console.error('Error initializing jsPDF:', error);
    throw error;
  }
  
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
    `Name: ${mockPayment.cvData.fullName}`,
    `Email: ${mockPayment.cvData.email}`,
    `Phone: ${mockPayment.cvData.phone}`,
    `Address: ${mockPayment.cvData.address}`
  ];
  
  personalInfo.forEach(info => {
    yPosition = addText(info);
  });
  
  yPosition += 10;
  
  // Career Objective (if exists)
  if (mockPayment.cvData.careerObjective) {
    yPosition = addText('Career Objective:', 16, 'bold');
    yPosition += 5;
    yPosition = addText(mockPayment.cvData.careerObjective);
    yPosition += 10;
  }
  
  // Education Section
  yPosition = addText('Education:', 16, 'bold');
  yPosition += 5;
  yPosition = addText(mockPayment.cvData.education);
  yPosition += 10;
  
  // Skills Section
  yPosition = addText('Skills:', 16, 'bold');
  yPosition += 5;
  yPosition = addText(mockPayment.cvData.skills);
  yPosition += 10;
  
  // Experience Section
  yPosition = addText('Experience:', 16, 'bold');
  yPosition += 5;
  yPosition = addText(mockPayment.cvData.experience);
  yPosition += 15;
  
  // Footer information
  doc.setFontSize(10);
  doc.setFont('helvetica', 'italic');
  yPosition = addText(`Generated on: ${new Date().toLocaleDateString()}`);
  yPosition = addText(`Transaction ID: ${mockPayment.paymentDetails.transactionId}`);
  
  // Generate PDF buffer
  console.log('Generating PDF buffer...');
  let pdfBuffer;
  try {
    // Use datauri output method which is more reliable
    const pdfDataUri = doc.output('datauristring');
    const base64Data = pdfDataUri.split(',')[1];
    pdfBuffer = Buffer.from(base64Data, 'base64');
    console.log('PDF buffer generated successfully, size:', pdfBuffer.length, 'bytes');
    
    // Save the test PDF
    require('fs').writeFileSync('controller_test.pdf', pdfBuffer);
    console.log('Controller test PDF saved as controller_test.pdf');
    
  } catch (error) {
    console.error('Error generating PDF buffer:', error);
    throw error;
  }
  
} catch (error) {
  console.error('Error in controller PDF generation:', error);
}
