// Test Canvas image generation
const { createCanvas } = require('canvas');

console.log('Testing Canvas image generation...');

try {
  const width = 800;
  const height = 1000;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');
  
  console.log('Canvas created successfully');
  
  // Set background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);
  
  console.log('Background set');
  
  // Set font styles
  ctx.textAlign = 'center';
  ctx.fillStyle = '#1a1a1a';
  
  let yPosition = 60;
  const lineHeight = 25;
  const sectionGap = 40;
  const margin = 50;
  
  // Title
  ctx.font = 'bold 28px Arial';
  ctx.fillText('CURRICULUM VITAE', width / 2, yPosition);
  yPosition += sectionGap;
  
  console.log('Title added');
  
  // Personal Information Section
  ctx.textAlign = 'left';
  ctx.font = 'bold 20px Arial';
  ctx.fillText('Personal Information:', margin, yPosition);
  yPosition += lineHeight;
  
  ctx.font = '16px Arial';
  ctx.fillStyle = '#333333';
  ctx.fillText('Name: Test User', margin, yPosition);
  yPosition += lineHeight;
  ctx.fillText('Email: test@example.com', margin, yPosition);
  yPosition += lineHeight;
  ctx.fillText('Phone: 1234567890', margin, yPosition);
  yPosition += lineHeight;
  ctx.fillText('Address: 123 Test Street', margin, yPosition);
  yPosition += sectionGap;
  
  console.log('Personal info added');
  
  // Education Section
  ctx.fillStyle = '#1a1a1a';
  ctx.font = 'bold 20px Arial';
  ctx.fillText('Education:', margin, yPosition);
  yPosition += lineHeight;
  
  ctx.font = '16px Arial';
  ctx.fillStyle = '#333333';
  ctx.fillText('Bachelor in Computer Science', margin, yPosition);
  yPosition += sectionGap;
  
  console.log('Education added');
  
  // Skills Section
  ctx.fillStyle = '#1a1a1a';
  ctx.font = 'bold 20px Arial';
  ctx.fillText('Skills:', margin, yPosition);
  yPosition += lineHeight;
  
  ctx.font = '16px Arial';
  ctx.fillStyle = '#333333';
  ctx.fillText('JavaScript, React, Node.js', margin, yPosition);
  yPosition += sectionGap;
  
  console.log('Skills added');
  
  // Experience Section
  ctx.fillStyle = '#1a1a1a';
  ctx.font = 'bold 20px Arial';
  ctx.fillText('Experience:', margin, yPosition);
  yPosition += lineHeight;
  
  ctx.font = '16px Arial';
  ctx.fillStyle = '#333333';
  ctx.fillText('2 years experience', margin, yPosition);
  yPosition += sectionGap;
  
  console.log('Experience added');
  
  // Footer information
  ctx.font = 'italic 14px Arial';
  ctx.fillStyle = '#666666';
  ctx.fillText(`Generated on: ${new Date().toLocaleDateString()}`, margin, yPosition);
  yPosition += lineHeight;
  ctx.fillText('Transaction ID: TEST_TXN_123', margin, yPosition);
  
  console.log('Footer added');
  
  // Generate image buffer
  console.log('Generating image buffer...');
  const imageBuffer = canvas.toBuffer('image/png');
  console.log('Image generated successfully, size:', imageBuffer.length, 'bytes');
  
  // Save the test image
  require('fs').writeFileSync('test_canvas_image.png', imageBuffer);
  console.log('Test image saved as test_canvas_image.png');
  
} catch (error) {
  console.error('Error in Canvas image generation:', error);
}
