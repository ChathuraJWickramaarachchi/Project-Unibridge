const { jsPDF } = require('jspdf');

// Test PDF generation with the same code as the controller
console.log('Testing PDF generation...');

try {
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
    `Name: Test User`,
    `Email: test@example.com`,
    `Phone: 1234567890`,
    `Address: 123 Test Street`
  ];
  
  personalInfo.forEach(info => {
    yPosition = addText(info);
  });
  
  yPosition += 10;
  
  // Education Section
  yPosition = addText('Education:', 16, 'bold');
  yPosition += 5;
  yPosition = addText('Bachelor in Computer Science');
  yPosition += 10;
  
  // Skills Section
  yPosition = addText('Skills:', 16, 'bold');
  yPosition += 5;
  yPosition = addText('JavaScript, React, Node.js');
  yPosition += 10;
  
  // Experience Section
  yPosition = addText('Experience:', 16, 'bold');
  yPosition += 5;
  yPosition = addText('2 years experience');
  yPosition += 15;
  
  // Footer information
  doc.setFontSize(10);
  doc.setFont('helvetica', 'italic');
  yPosition = addText(`Generated on: ${new Date().toLocaleDateString()}`);
  yPosition = addText(`Transaction ID: TEST_TXN_123`);
  
  console.log('PDF content created, testing output methods...');
  
  // Test different output methods
  try {
    console.log('Testing datauristring output...');
    const pdfDataUri = doc.output('datauristring');
    console.log('DataUri length:', pdfDataUri.length);
    
    const base64Data = pdfDataUri.split(',')[1];
    const pdfBuffer = Buffer.from(base64Data, 'base64');
    console.log('PDF buffer size:', pdfBuffer.length, 'bytes');
    
    // Save the test PDF
    require('fs').writeFileSync('test_debug.pdf', pdfBuffer);
    console.log('Test PDF saved as test_debug.pdf');
    
    // Also test arraybuffer method
    console.log('Testing arraybuffer output...');
    const arrayBuffer = doc.output('arraybuffer');
    console.log('ArrayBuffer size:', arrayBuffer.byteLength, 'bytes');
    
  } catch (error) {
    console.error('Error in PDF output:', error);
  }
  
} catch (error) {
  console.error('Error in PDF generation:', error);
}
