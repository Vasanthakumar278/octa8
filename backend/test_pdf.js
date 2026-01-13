const pdfParse = require('pdf-parse');
console.log('Type of pdfParse:', typeof pdfParse);
console.log('Value of pdfParse:', pdfParse);
try {
    const fs = require('fs');
    // Create dummy buffer
    const buffer = Buffer.from('dummy pdf content');
    pdfParse(buffer).then(data => {
        console.log('Success:', data.text);
    }).catch(err => {
        console.log('Error calling function:', err.message);
    });
} catch (e) {
    console.log('Immediate calling error:', e.message);
}
