// Test the completely rebuilt PDF download flow
const { jsPDF } = require('jspdf');
const fs = require('fs');

console.log('=== Testing Rebuilt PDF Download Flow ===');

// Test 1: Rebuilt PDF generation
console.log('\n1. Testing rebuilt PDF generation...');
try {
  // Mock payment data
  const mockPayment = {
    cvData: {
      fullName: "Test Rebuilt User",
      email: "test@example.com",
      phone: "1234567890",
      address: "123 Test Street",
      education: "Bachelor in Computer Science",
      skills: "JavaScript, React, Node.js",
      experience: "2 years experience",
      careerObjective: "Seeking a challenging position"
    },
    paymentDetails: {
      transactionId: "TEST_REBUILT_123"
    }
  };
  
  // Create new PDF document (same as rebuilt controller)
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });
  
  // PDF dimensions
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  let currentY = margin;
  
  // Helper function to add text with automatic line breaks
  const addText = (text, fontSize = 12, fontStyle = 'normal', align = 'left') => {
    doc.setFontSize(fontSize);
    doc.setFont('helvetica', fontStyle);
    
    const lines = doc.splitTextToSize(text, pageWidth - (margin * 2));
    const lineHeight = fontSize * 0.35; // Standard line height for PDF
    
    lines.forEach(line => {
      // Check if we need a new page
      if (currentY + lineHeight > pageHeight - margin) {
        doc.addPage();
        currentY = margin;
      }
      
      if (align === 'center') {
        doc.text(line, pageWidth / 2, currentY, { align: 'center' });
      } else {
        doc.text(line, margin, currentY);
      }
      
      currentY += lineHeight;
    });
    
    return currentY;
  };
  
  // CV Title
  addText('CURRICULUM VITAE', 20, 'bold', 'center');
  currentY += 10;
  
  // Personal Information Section
  addText('PERSONAL INFORMATION', 14, 'bold');
  currentY += 5;
  
  addText(`Name: ${mockPayment.cvData.fullName}`);
  addText(`Email: ${mockPayment.cvData.email}`);
  addText(`Phone: ${mockPayment.cvData.phone}`);
  addText(`Address: ${mockPayment.cvData.address}`);
  currentY += 10;
  
  // Career Objective
  addText('CAREER OBJECTIVE', 14, 'bold');
  currentY += 5;
  addText(mockPayment.cvData.careerObjective);
  currentY += 10;
  
  // Education Section
  addText('EDUCATION', 14, 'bold');
  currentY += 5;
  addText(mockPayment.cvData.education);
  currentY += 10;
  
  // Skills Section
  addText('SKILLS', 14, 'bold');
  currentY += 5;
  addText(mockPayment.cvData.skills);
  currentY += 10;
  
  // Experience Section
  addText('EXPERIENCE', 14, 'bold');
  currentY += 5;
  addText(mockPayment.cvData.experience);
  currentY += 15;
  
  // Footer
  addText(`Generated on: ${new Date().toLocaleDateString()}`, 10, 'italic');
  addText(`Transaction ID: ${mockPayment.paymentDetails.transactionId}`, 10, 'italic');
  
  // Generate PDF as raw bytes (same as rebuilt controller)
  console.log('Generating PDF buffer...');
  const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
  console.log(`PDF generated successfully, size: ${pdfBuffer.length} bytes`);
  
  // Verify PDF signature
  const pdfSignature = pdfBuffer.slice(0, 4).toString();
  console.log(`PDF signature: ${pdfSignature}`);
  
  if (pdfSignature !== '%PDF') {
    throw new Error('Invalid PDF signature detected');
  }
  
  // Save test PDF
  fs.writeFileSync('test_rebuilt_cv.pdf', pdfBuffer);
  console.log('Saved: test_rebuilt_cv.pdf');
  
  // Test 2: Verify PDF structure
  console.log('\n2. Verifying PDF structure...');
  
  // Check PDF header
  const header = pdfBuffer.slice(0, 10).toString();
  console.log(`PDF header: "${header}"`);
  
  // Check for PDF version
  const version = header.match(/%PDF-\d\.\d/);
  console.log(`PDF version: ${version ? version[0] : 'Not found'}`);
  
  // Check for EOF marker
  const tail = pdfBuffer.slice(-20).toString();
  console.log(`PDF tail: "${tail}"`);
  const hasEOF = tail.includes('%%EOF');
  console.log(`Has EOF marker: ${hasEOF}`);
  
  // Test 3: Simulate Express response
  console.log('\n3. Simulating Express response...');
  
  // Mock Express response
  const mockRes = {
    headers: {},
    setHeader: function(name, value) {
      this.headers[name] = value;
      console.log(`Set header: ${name} = ${value}`);
    },
    end: function(data) {
      console.log(`Response ended with ${data.length} bytes`);
      
      // Save simulated response
      fs.writeFileSync('test_simulated_response.pdf', data);
      console.log('Saved: test_simulated_response.pdf');
      
      // Verify the saved file
      const savedBuffer = fs.readFileSync('test_simulated_response.pdf');
      const savedSignature = savedBuffer.slice(0, 4).toString();
      console.log(`Saved file signature: ${savedSignature}`);
      
      if (savedSignature === '%PDF') {
        console.log('SUCCESS: PDF file is valid!');
      } else {
        console.log('ERROR: PDF file is corrupted!');
      }
    }
  };
  
  // Set headers (same as rebuilt controller)
  mockRes.setHeader('Content-Type', 'application/pdf');
  mockRes.setHeader('Content-Disposition', `attachment; filename="${mockPayment.cvData.fullName.replace(/[^a-zA-Z0-9]/g, '_')}_CV.pdf"`);
  mockRes.setHeader('Content-Length', pdfBuffer.length);
  mockRes.setHeader('Cache-Control', 'no-cache');
  mockRes.setHeader('Pragma', 'no-cache');
  
  // Send response (same as rebuilt controller)
  mockRes.end(pdfBuffer);
  
  console.log('\n=== Rebuilt Flow Test Complete ===');
  console.log('Check the generated PDF files:');
  console.log('- test_rebuilt_cv.pdf (direct generation)');
  console.log('- test_simulated_response.pdf (simulated Express response)');
  
} catch (error) {
  console.error('Rebuilt flow test failed:', error);
}
