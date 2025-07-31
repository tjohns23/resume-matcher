import sys
import json
import re
from sentence_transformers import SentenceTransformer, util

# Load model once at startup
model = SentenceTransformer('all-MiniLM-L6-v2')

# Default job postings to compare against (fallback if no job description provided)
default_jobs = [
    {"title": "Software Engineer", "description": "Looking for experience with Python, teamwork, and React."},
    {"title": "Data Scientist", "description": "Needs skills in Python, machine learning, and SQL."}
]

def clean_text(text):
    # Remove non-printable characters (like Unicode leftovers or newlines from PDF)
    return re.sub(r'[^\x20-\x7E\n\r]', '', text)

def compare_resume(resume_text, job_description=None):
    if not isinstance(resume_text, str):
        raise ValueError(f"resume_text is not a string. Got: {type(resume_text)}")

    resume_text = clean_text(resume_text.strip())
    
    # Debug preview to stderr
    print("Resume text preview:", resume_text[:300], file=sys.stderr)

    # Model requires a list of strings
    resume_embedding = model.encode([resume_text], convert_to_tensor=True)

    results = []
    
    if job_description and job_description.strip():
        # Compare against the provided job description
        job_description = clean_text(job_description.strip())
        print("Job description preview:", job_description[:200], file=sys.stderr)
        
        job_embedding = model.encode([job_description], convert_to_tensor=True)
        similarity = util.cos_sim(resume_embedding, job_embedding).item()
        results.append({
            "job_title": "Provided Job Description",
            "similarity": round(similarity, 3)
        })
    else:
        # Fallback to default jobs if no job description provided
        print("No job description provided, using default jobs", file=sys.stderr)
        for job in default_jobs:
            job_embedding = model.encode([job['description']], convert_to_tensor=True)
            similarity = util.cos_sim(resume_embedding, job_embedding).item()
            results.append({
                "job_title": job['title'],
                "similarity": round(similarity, 3)
            })

    return results

if __name__ == "__main__":
    try:
        input_text = sys.stdin.read()
        parsed = json.loads(input_text)

        resume_text = parsed.get('resume')
        job_description = parsed.get('jobDescription')  
        
        results = compare_resume(resume_text, job_description)

        # Output the final result to stdout
        print(json.dumps(results))

    except Exception as e:
        # Send all error messages to stderr
        print(f"Python error: {str(e)}", file=sys.stderr)
        sys.exit(1)