const express = require('express');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const fs = require('fs');
const { spawn } = require('child_process');

const router = express.Router();
// Configure multer to handle file uploads
const upload = multer({ dest: 'uploads/'});

router.post('/match', upload.single('resume'), async (req, res) => {
        console.log('Inside the match route!');
        const filePath = req.file.path;
        const jobDescription = req.body.jobDescription; // Get job description from form data

        try {
                const dataBuffer = fs.readFileSync(filePath);
                const pdfText = (await pdfParse(dataBuffer)).text;
                
                console.log('Running python script...');
                const python = spawn('python', ['./model/match_model.py']);
                let resultData = '';
                let errorData = '';

                console.log('Collecting results...');
                // Pass both resume text and job description to Python script
                python.stdin.write(JSON.stringify({ 
                        resume: pdfText,
                        jobDescription: jobDescription 
                }));
                python.stdin.end();
                
                console.log('Adding to result data');
                // Only collect stdout for JSON results
                python.stdout.on('data', (data) => {
                        resultData += data.toString();
                });
                
                // Collect stderr separately for debugging
                python.stderr.on('data', (data) => {
                        errorData += data.toString();
                        console.error('Python debug: ', data.toString());
                });

                python.on('close', (code) => {
                        if (code !== 0) {
                                console.log('Issue with the model');
                                console.error('Python stderr:', errorData);
                                return res.status(500).json({ error: 'Model failed' });
                        }
                        
                        try {
                                // Parse only the stdout data which should be valid JSON
                                const results = JSON.parse(resultData.trim());
                                res.json(results);
                        } catch (parseError) {
                                console.error('JSON parse error:', parseError);
                                console.error('Received data:', resultData);
                                console.error('Error data:', errorData);
                                res.status(500).json({ error: 'Invalid JSON response from model' });
                        }
                });
        } catch (err) {
                console.error(err);
                res.status(500).json({ error: 'Failed to process resume' });
        } finally {
                fs.unlinkSync(filePath);
        }
});

module.exports = router;