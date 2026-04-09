// Simple test of PDF generation without database
const { jsPDF } = require('jspdf');

console.log('Testing PDF generation...');

try {
  // Create a simple PDF
  const doc = new jsPDF();
  
  // Add some content
  doc.setFontSize(20);
  doc.text('Test PDF Document', 20, 20);
  doc.setFontSize(12);
  doc.text('This is a test PDF to verify the download works correctly.', 20, 40);
  doc.text('If you can read this, the PDF generation is working.', 20, 50);
  
  // Test different output methods
  console.log('Testing datauri method...');
  const dataUri = doc.output('datauristring');
  console.log('Data URI length:', dataUri.length);
  
  console.log('Testing arraybuffer method...');
  const arrayBuffer = doc.output('arraybuffer');
  console.log('ArrayBuffer length:', arrayBuffer.byteLength);
  
  console.log('Testing buffer method...');
  const buffer = doc.output('buffer');
  console.log('Buffer type:', typeof buffer);
  console.log('Buffer length:', buffer ? buffer.length : 'null');
  
  // Save using different methods
  const fs = require('fs');
  
  // Method 1: Using datauri
  const base64Data = dataUri.split(',')[1];
  const bufferFromUri = Buffer.from(base64Data, 'base64');
  fs.writeFileSync('test_datauri.pdf', bufferFromUri);
  console.log('Saved test_datauri.pdf using datauri method');
  
  // Method 2: Using arraybuffer
  const bufferFromArrayBuffer = Buffer.from(arrayBuffer);
  fs.writeFileSync('test_arraybuffer.pdf', bufferFromArrayBuffer);
  console.log('Saved test_arraybuffer.pdf using arraybuffer method');
  
  // Method 3: Using buffer directly (if available)
  if (buffer) {
    fs.writeFileSync('test_buffer.pdf', buffer);
    console.log('Saved test_buffer.pdf using buffer method');
  } else {
    console.log('Buffer method returned null, skipping');
  }
  
  console.log('All test PDFs saved successfully!');
  
} catch (error) {
  console.error('PDF generation failed:', error);
}
