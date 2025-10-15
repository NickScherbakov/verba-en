const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');

async function extractPDF() {
    const pdfPath = path.join(__dirname, '../books/Verbitskaya_EGE_2025_Angliiskii_Yazyk.pdf');
    const dataBuffer = fs.readFileSync(pdfPath);
    
    try {
        const data = await pdf(dataBuffer);
        
        console.log('PDF Info:');
        console.log('- Pages:', data.numpages);
        console.log('- Text length:', data.text.length);
        console.log('\n--- First 2000 characters ---\n');
        console.log(data.text.substring(0, 2000));
        console.log('\n--- Structure Analysis ---\n');
        
        // Save full text to file for analysis
        const outputPath = path.join(__dirname, '../data/pdf-content.txt');
        fs.mkdirSync(path.dirname(outputPath), { recursive: true });
        fs.writeFileSync(outputPath, data.text);
        console.log('Full text saved to:', outputPath);
        
        return data;
    } catch (error) {
        console.error('Error extracting PDF:', error);
        throw error;
    }
}

extractPDF();
