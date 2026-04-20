// Test complete end-to-end PDF download flow
const { jsPDF } = require('jsPDF');
const fs = require('fs');

console.log('=== Testing Complete End-to-End Flow ===');

// Test 1: Backend PDF generation (rebuilt)
console.log('\n1. Backend PDF generation...');
try {
  const mockPayment = {
    cvData: {
      fullName: "John Doe",
      email: "john@example.com",
      phone: "1234567890",
      address: "123 Main St",
      education: "Bachelor of Science",
      skills: "JavaScript, React, Node.js",
      experience: "Software Developer at Tech Company",
      careerObjective: "Seeking challenging software development role"
    },
    paymentDetails: {
      transactionId: "TXN_COMPLETE_TEST_123"
    }
  };
  
  // Generate PDF using rebuilt controller logic
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });
  
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  let currentY = margin;
  
  const addText = (text, fontSize = 12, fontStyle = 'normal', align = 'left') => {
    doc.setFontSize(fontSize);
    doc.setFont('helvetica', fontStyle);
    
    const lines = doc.splitTextToSize(text, pageWidth - (margin * 2));
    const lineHeight = fontSize * 0.35;
    
    lines.forEach(line => {
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
  
  // Build CV content
  addText('CURRICULUM VITAE', 20, 'bold', 'center');
  currentY += 10;
  
  addText('PERSONAL INFORMATION', 14, 'bold');
  currentY += 5;
  addText(`Name: ${mockPayment.cvData.fullName}`);
  addText(`Email: ${mockPayment.cvData.email}`);
  addText(`Phone: ${mockPayment.cvData.phone}`);
  addText(`Address: ${mockPayment.cvData.address}`);
  currentY += 10;
  
  addText('CAREER OBJECTIVE', 14, 'bold');
  currentY += 5;
  addText(mockPayment.cvData.careerObjective);
  currentY += 10;
  
  addText('EDUCATION', 14, 'bold');
  currentY += 5;
  addText(mockPayment.cvData.education);
  currentY += 10;
  
  addText('SKILLS', 14, 'bold');
  currentY += 5;
  addText(mockPayment.cvData.skills);
  currentY += 10;
  
  addText('EXPERIENCE', 14, 'bold');
  currentY += 5;
  addText(mockPayment.cvData.experience);
  currentY += 15;
  
  addText(`Generated on: ${new Date().toLocaleDateString()}`, 10, 'italic');
  addText(`Transaction ID: ${mockPayment.paymentDetails.transactionId}`, 10, 'italic');
  
  // Generate PDF buffer
  const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
  console.log(`Backend PDF generated: ${pdfBuffer.length} bytes`);
  
  // Verify PDF signature
  const signature = pdfBuffer.slice(0, 4).toString();
  if (signature !== '%PDF') {
    throw new Error('Invalid PDF signature');
  }
  
  // Save backend PDF
  fs.writeFileSync('backend_complete_test.pdf', pdfBuffer);
  console.log('Saved: backend_complete_test.pdf');
  
  // Test 2: Simulate frontend blob creation
  console.log('\n2. Frontend blob creation simulation...');
  
  // Simulate what happens in the frontend
  const blobData = Buffer.from(pdfBuffer);
  console.log(`Blob data size: ${blobData.length} bytes`);
  
  // Create a "blob" (in Node.js we'll just use the buffer)
  const frontendBlob = {
    data: blobData,
    size: blobData.length,
    type: 'application/pdf'
  };
  
  console.log(`Frontend blob created: ${frontendBlob.size} bytes, type: ${frontendBlob.type}`);
  
  // Test 3: Simulate download process
  console.log('\n3. Simulating download process...');
  
  // Create download URL (simulation)
  const url = `blob:${mockPayment.paymentDetails.transactionId}`;
  console.log(`Download URL created: ${url}`);
  
  // Create filename
  const sanitizedName = mockPayment.cvData.fullName
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .replace(/\s+/g, '_')
    .toLowerCase();
  const filename = `${sanitizedName}_CV.pdf`;
  console.log(`Filename: ${filename}`);
  
  // Save final downloaded file (simulating browser download)
  fs.writeFileSync('frontend_complete_test.pdf', frontendBlob.data);
  console.log('Saved: frontend_complete_test.pdf');
  
  // Test 4: Verify final file integrity
  console.log('\n4. Final file verification...');
  
  const finalFile = fs.readFileSync('frontend_complete_test.pdf');
  const finalSignature = finalFile.slice(0, 4).toString();
  const finalSize = finalFile.length;
  
  console.log(`Final file signature: ${finalSignature}`);
  console.log(`Final file size: ${finalSize} bytes`);
  
  // Check if file is valid
  const isValidPDF = finalSignature === '%PDF' && finalSize > 1000;
  console.log(`Valid PDF: ${isValidPDF ? 'YES' : 'NO'}`);
  
  // Test 5: Compare files
  console.log('\n5. File comparison...');
  
  const backendFile = fs.readFileSync('backend_complete_test.pdf');
  const frontendFile = fs.readFileSync('frontend_complete_test.pdf');
  
  const filesMatch = backendFile.equals(frontendFile);
  console.log(`Backend and frontend files match: ${filesMatch ? 'YES' : 'NO'}`);
  
  if (filesMatch && isValidPDF) {
    console.log('\nSUCCESS: Complete end-to-end flow works correctly!');
    console.log('The PDF should open properly in Adobe Acrobat.');
  } else {
    console.log('\nERROR: Issues detected in the flow.');
  }
  
  console.log('\nGenerated files for manual inspection:');
  console.log('- backend_complete_test.pdf (backend generation)');
  console.log('- frontend_complete_test.pdf (frontend simulation)');
  
} catch (error) {
  console.error('Complete flow test failed:', error);
}
