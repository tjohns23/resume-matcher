// import logo from './logo.svg';
import './App.css';
import './index.css'; // or './globals.css' depending on your filename
import { useState } from 'react';
const API_URL = process.env.REACT_APP_API_URL;


function App() {
  // const [resume, setResume] = useState('');
  const [job, setJob] = useState('');
  const [result, setResult] = useState(null);

  const [resumeFile, setResumeFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const handleFileChange = (e) => {
    setResumeFile(e.target.files[0]);
    setResult(null);
    setError(null);
  };

  const handleJobChange = (e) => {
    setJob(e.target.value);
    setResult(null);
    setError(null);
  };

  const handleUpload = async () => {
    if (!resumeFile) {
      setError('Please upload a PDF resume first');
      return;
    }

    if (!job.trim()) {
      setError('Please enter a job description');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('resume', resumeFile);
      formData.append('jobDescription', job);

      console.log('Sending match request to backend...');
      const response = await fetch(`${API_URL}/api/match`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to get match result');
      }

      console.log('Awaiting data from backend!');
      const data = await response.json();
      console.log('Backend data received');
      setResult(data);
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-xl mb-4">
        <p className="text-base font-semibold mb-3 text-gray-600">
          A Note From The Developer: 
        </p>
        <p className="text-base font-semibold mb-6 text-gray-600">
          This matcher leverages cutting edge artifical intelligence techniques that have
          changed resume screening technology used by many companies across the nation. It's 
          built to reflect how modern resume screening tools evalute relevance based on keywords,
          skills, and contextual similarity.
        </p>
      </div>
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-blue-600">
          Resume Matcher
        </h1>

        <div className="mb-4">
          <label className="block font-semibold mb-2">Upload Resume (PDF):</label>
          <input 
            type="file" 
            accept=".pdf" 
            onChange={handleFileChange} 
            className="w-full border p-2 rounded-lg"
          />
          {resumeFile && (
            <p className="text-sm text-gray-600 mt-1">Selected: {resumeFile.name}</p>
          )}
        </div>

        <div className="mb-6">
          <label className="block font-semibold mb-2">Job Description:</label>
          <textarea
            value={job}
            onChange={handleJobChange}
            placeholder="Paste the job description here..."
            className="w-full border p-3 rounded-lg h-32 resize-vertical"
            rows="4"
          />
        </div>

        <button 
          onClick={handleUpload} 
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition disabled:bg-gray-400"
          disabled={loading}
        >
          {loading ? 'Matching...' : 'Find Match Score'}
        </button>

        {error && (
          <div className="mt-6 p-4 bg-red-100 border-l-4 border-red-500 rounded">
            <p className="text-red-700 font-semibold">{error}</p>
          </div>
        )}

        {result && (
          <div className="mt-6 p-4 bg-green-100 border-l-4 border-green-500 rounded">
            <h3 className="font-semibold mb-3 text-green-800">Match Results:</h3>
            {Array.isArray(result) ? (
              <div className="space-y-2">
                {result.map((job, index) => (
                  <div key={index} className="bg-white p-3 rounded border">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{job.job_title}</span>
                      <span className="text-lg font-bold text-blue-600">
                        {(job.similarity * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <pre className="text-sm bg-white p-3 rounded overflow-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;