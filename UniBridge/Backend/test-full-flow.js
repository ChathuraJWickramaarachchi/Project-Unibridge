// Test the full PDF download flow
const express = require('express');
const { jsPDF } = require('jspdf');

// Create a mock Express response
const mockResponse = () => {
  let headers = {};
  let statusCode = 200;
  let responseData = null;
  
  return {
    setHeader: (name, value) => {
      headers[name] = value;
    },
    status: (code) => {
      statusCode = code;
      return {
        json: (data) => {
          responseData = JSON.stringify(data);
        }
      };
    },
    send: (data) => {
      responseData = data;
    },
    getHeaders: () => headers,
    getStatusCode: () => statusCode,
    getData: () => responseData
  };
};

// Mock payment data
const mockPayment = {
  _id: 'test-payment-id',
  cvData: {
    fullName: "Test User",
    email: "test@example.com",
    phone: "1234567890",
    address: "123 Test Street",
    education: "Bachelor in Computer Science",
    skills: "JavaScript, React, Node.js",
    experience: "2 years experience",
    careerObjective: "Seeking a challenging position"
  },
  paymentDetails: {
    transactionId: "TEST_TXN_123"
  },
  downloadInfo: {
    downloadCount: 0,
    lastDownloadedAt: null
  },
  save: async () => {
    console.log('Mock payment saved');
    return mockPayment;
  }
};

// Mock request
const mockRequest = {
  params: { id: 'test-payment-id' },
  user: { _id: 'test-user-id' }
};

async function testFullFlow() {
  try {
    console.log('Testing full PDF download flow...');
    
    // Simulate the controller logic
    const res = mockResponse();
    
    // Update download count (mock)
    mockPayment.downloadInfo.downloadCount += 1;
    mockPayment.downloadInfo.lastDownloadedAt = new Date();
    
    // Generate CV PDF using jsPDF
    console.log('Starting PDF generation with jsPDF...');
    
    const doc = new jsPDF();
    console.log('jsPDF initialized successfully');
    
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
    
    // Generate PDF buffer using arraybuffer approach
    console.log('Generating PDF buffer...');
    const arrayBuffer = doc.output('arraybuffer');
    const pdfBuffer = Buffer.from(arrayBuffer);
    console.log('PDF generated successfully, size:', pdfBuffer.length, 'bytes');
    
    // Set headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${mockPayment.cvData.fullName.replace(/\s+/g, '_')}_CV_${Date.now()}.pdf"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    
    console.log('Sending PDF response...');
    res.send(pdfBuffer);
    
    // Test the response
    console.log('Response headers:', res.getHeaders());
    console.log('Response status:', res.getStatusCode());
    console.log('Response data type:', typeof res.getData());
    console.log('Response data length:', res.getData().length);
    
    // Save the PDF to verify it's valid
    const fs = require('fs');
    fs.writeFileSync('full_flow_test.pdf', res.getData());
    console.log('Full flow test PDF saved as full_flow_test.pdf');
    
    // Test blob creation (simulate frontend)
    console.log('Testing blob creation...');
    const blobData = Buffer.from(res.getData());
    console.log('Blob data size:', blobData.length);
    
    console.log('Full flow test completed successfully!');
    
  } catch (error) {
    console.error('Full flow test failed:', error);
  }
}

testFullFlow();
