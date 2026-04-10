// Test PDF corruption issue
const { jsPDF } = require('jspdf');
const fs = require('fs');

console.log('=== Testing PDF Corruption Issue ===');

// Test 1: Basic PDF generation
console.log('\n1. Testing basic PDF generation...');
try {
  const doc = new jsPDF();
  doc.text('Test PDF', 20, 20);
  
  // Test different output methods
  const methods = [
    { name: 'arraybuffer', output: doc.output('arraybuffer') },
    { name: 'blob', output: doc.output('blob') },
    { name: 'datauristring', output: doc.output('datauristring') },
    { name: 'dataurlnewwindow', output: doc.output('dataurlnewwindow') },
    { name: 'pdfobjectnewwindow', output: doc.output('pdfobjectnewwindow') }
  ];
  
  methods.forEach(method => {
    console.log(`Method: ${method.name}`);
    console.log(`  Type: ${typeof method.output}`);
    console.log(`  Size: ${method.output ? method.output.length || method.output.byteLength || 'unknown' : 'null'}`);
    
    // Save to file for comparison
    if (method.output) {
      let buffer;
      if (method.name === 'arraybuffer') {
        buffer = Buffer.from(method.output);
      } else if (method.name === 'datauristring') {
        const base64Data = method.output.split(',')[1];
        buffer = Buffer.from(base64Data, 'base64');
      } else if (method.name === 'blob') {
        buffer = Buffer.from(method.output);
      }
      
      if (buffer) {
        fs.writeFileSync(`test_${method.name}.pdf`, buffer);
        console.log(`  Saved: test_${method.name}.pdf (${buffer.length} bytes)`);
      }
    }
  });
  
} catch (error) {
  console.error('Basic PDF test failed:', error);
}

// Test 2: Simulate Express response
console.log('\n2. Testing Express response simulation...');
try {
  const doc = new jsPDF();
  
  // Add content similar to the actual controller
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('CURRICULUM VITAE', 105, 20, { align: 'center' });
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('Name: Test User', 20, 40);
  doc.text('Email: test@example.com', 20, 50);
  doc.text('Phone: 1234567890', 20, 60);
  doc.text('Address: 123 Test Street', 20, 70);
  
  // Test the exact method used in controller
  const arrayBuffer = doc.output('arraybuffer');
  const pdfBuffer = Buffer.from(arrayBuffer);
  
  console.log(`PDF Buffer Size: ${pdfBuffer.length} bytes`);
  
  // Test different response methods
  const responseMethods = [
    { name: 'res.send(buffer)', buffer: pdfBuffer },
    { name: 'res.end(buffer)', buffer: pdfBuffer },
    { name: 'res.write(buffer)', buffer: pdfBuffer }
  ];
  
  responseMethods.forEach(method => {
    fs.writeFileSync(`test_response_${method.name.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`, method.buffer);
    console.log(`Saved: test_response_${method.name.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`);
  });
  
} catch (error) {
  console.error('Express response test failed:', error);
}

// Test 3: Check PDF headers
console.log('\n3. Testing PDF headers...');
try {
  const doc = new jsPDF();
  doc.text('Test PDF', 20, 20);
  
  const arrayBuffer = doc.output('arraybuffer');
  const pdfBuffer = Buffer.from(arrayBuffer);
  
  // Check PDF signature
  const header = pdfBuffer.slice(0, 5).toString();
  console.log(`PDF Header: "${header}"`);
  console.log(`Valid PDF header: ${header === '%PDF-'}`);
  
  // Check end of PDF
  const footer = pdfBuffer.slice(-5).toString();
  console.log(`PDF Footer: "${footer}"`);
  console.log(`Contains EOF: ${footer.includes('EOF')}`);
  
  // Save for manual inspection
  fs.writeFileSync('test_header_check.pdf', pdfBuffer);
  console.log('Saved: test_header_check.pdf');
  
} catch (error) {
  console.error('PDF header test failed:', error);
}

console.log('\n=== Test Complete ===');
console.log('Check the generated PDF files manually to see which ones are valid.');
