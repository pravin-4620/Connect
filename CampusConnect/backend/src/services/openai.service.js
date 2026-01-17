import OpenAI from 'openai';

// Only initialize OpenAI if API key is provided
let openai = null;
if (process.env.OPENAI_API_KEY) {
    openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
    });
    console.log('✅ OpenAI service initialized');
} else {
    console.warn('⚠️  OPENAI_API_KEY not set - AI features will be disabled');
}

/**
 * Analyze resume using GPT-4
 * @param {string} resumeText - Extracted text from resume
 * @returns {Object} Analysis results with ATS score, keywords, and suggestions
 */
export const analyzeResume = async (resumeText) => {
    try {
        // Check if OpenAI is available
        if (!openai) {
            console.warn('OpenAI not configured - returning fallback resume analysis');
            return {
                atsScore: 75,
                missingKeywords: ['Configure OpenAI API key for detailed analysis'],
                formattingIssues: [],
                contentSuggestions: {
                    summary: 'OpenAI API key not configured. Add OPENAI_API_KEY to environment variables for AI-powered resume analysis.',
                    experience: 'AI analysis unavailable',
                    education: 'AI analysis unavailable',
                    skills: 'AI analysis unavailable'
                },
                overallFeedback: 'To enable AI-powered resume analysis, please configure your OpenAI API key in the environment variables.'
            };
        }

        const prompt = `You are an expert ATS (Applicant Tracking System) analyzer and career counselor. Analyze the following resume and provide:

1. ATS Score (0-100): How well the resume would perform in ATS systems
2. Missing Keywords: Important keywords that should be added for better ATS performance
3. Formatting Issues: Any formatting problems that might affect ATS parsing
4. Content Suggestions: Specific improvements for each section
5. Overall Feedback: General advice to improve the resume

Resume Text:
${resumeText}

Provide your response in the following JSON format:
{
  "atsScore": <number 0-100>,
  "missingKeywords": ["keyword1", "keyword2", ...],
  "formattingIssues": ["issue1", "issue2", ...],
  "contentSuggestions": {
    "summary": "suggestion for summary section",
    "experience": "suggestion for experience section",
    "education": "suggestion for education section",
    "skills": "suggestion for skills section"
  },
  "overallFeedback": "general feedback and recommendations"
}`;

        const response = await openai.chat.completions.create({
            model: 'gpt-4',
            messages: [
                {
                    role: 'system',
                    content: 'You are an expert resume analyzer. Provide detailed, actionable feedback in JSON format.'
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            temperature: 0.7,
            max_tokens: 1500,
            response_format: { type: 'json_object' }
        });

        const analysis = JSON.parse(response.choices[0].message.content);
        return analysis;
    } catch (error) {
        console.error('Resume analysis error:', error);

        // Return fallback analysis if API fails
        return {
            atsScore: 0,
            missingKeywords: [],
            formattingIssues: ['Unable to analyze resume at this time'],
            contentSuggestions: {
                summary: 'Please try again later',
                experience: 'Service temporarily unavailable',
                education: 'Service temporarily unavailable',
                skills: 'Service temporarily unavailable'
            },
            overallFeedback: 'Resume analysis service is currently unavailable. Please try again later.'
        };
    }
};

/**
 * Categorize email using GPT-3.5
 * @param {string} subject - Email subject
 * @param {string} body - Email body (first 500 chars)
 * @returns {string} Category: PLACEMENT, ACADEMIC, PERSONAL, or SPAM
 */
export const categorizeEmail = async (subject, body) => {
    try {
        // Check if OpenAI is available
        if (!openai) {
            console.warn('OpenAI not configured - using default email category');
            return 'PERSONAL';
        }

        const emailContent = `Subject: ${subject}\n\nBody: ${body.substring(0, 500)}`;

        const prompt = `Categorize the following email into one of these categories:
- PLACEMENT: Related to job placements, internships, company drives, recruitment
- ACADEMIC: Related to courses, assignments, exams, grades, academic activities
- PERSONAL: Personal communications, social events, non-academic/non-placement
- SPAM: Promotional emails, advertisements, irrelevant content

Email:
${emailContent}

Respond with only the category name (PLACEMENT, ACADEMIC, PERSONAL, or SPAM).`;

        const response = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [
                {
                    role: 'system',
                    content: 'You are an email categorization assistant. Respond with only the category name.'
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            temperature: 0.3,
            max_tokens: 10
        });

        const category = response.choices[0].message.content.trim().toUpperCase();

        // Validate category
        const validCategories = ['PLACEMENT', 'ACADEMIC', 'PERSONAL', 'SPAM'];
        if (validCategories.includes(category)) {
            return category;
        }

        // Default to PERSONAL if invalid category
        return 'PERSONAL';
    } catch (error) {
        console.error('Email categorization error:', error);
        // Default category on error
        return 'PERSONAL';
    }
};

/**
 * Generate interview questions based on job role
 * @param {string} jobRole - Job role/position
 * @param {Array<string>} skills - Required skills
 * @returns {Array<Object>} Array of interview questions
 */
export const generateInterviewQuestions = async (jobRole, skills) => {
    try {
        // Check if OpenAI is available
        if (!openai) {
            console.warn('OpenAI not configured - returning empty questions array');
            return [];
        }

        const prompt = `Generate 10 technical and behavioral interview questions for a ${jobRole} position requiring skills: ${skills.join(', ')}.

Provide questions in the following JSON format:
{
  "questions": [
    {
      "type": "technical" or "behavioral",
      "question": "the question text",
      "difficulty": "easy", "medium", or "hard"
    }
  ]
}`;

        const response = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [
                {
                    role: 'system',
                    content: 'You are an expert technical interviewer. Generate relevant interview questions.'
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            temperature: 0.8,
            max_tokens: 1000,
            response_format: { type: 'json_object' }
        });

        const result = JSON.parse(response.choices[0].message.content);
        return result.questions || [];
    } catch (error) {
        console.error('Interview questions generation error:', error);
        return [];
    }
};

/**
 * Analyze student performance and provide recommendations
 * @param {Object} studentData - Student performance data
 * @returns {Object} Analysis and recommendations
 */
export const analyzeStudentPerformance = async (studentData) => {
    try {
        // Check if OpenAI is available
        if (!openai) {
            console.warn('OpenAI not configured - student performance analysis unavailable');
            return null;
        }

        const { cgpa, skills, testScores, year, department } = studentData;

        const prompt = `Analyze the following student's performance and provide personalized recommendations:

Student Profile:
- Year: ${year}
- Department: ${department}
- CGPA: ${cgpa}
- Skills: ${skills.join(', ')}
- Recent Test Scores: ${testScores.join(', ')}

Provide analysis in JSON format:
{
  "strengths": ["strength1", "strength2", ...],
  "weaknesses": ["weakness1", "weakness2", ...],
  "recommendations": {
    "skillsToLearn": ["skill1", "skill2", ...],
    "coursesToTake": ["course1", "course2", ...],
    "careerPaths": ["path1", "path2", ...]
  },
  "placementReadiness": "High/Medium/Low",
  "actionPlan": "detailed action plan"
}`;

        const response = await openai.chat.completions.create({
            model: 'gpt-4',
            messages: [
                {
                    role: 'system',
                    content: 'You are an academic advisor and career counselor.'
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            temperature: 0.7,
            max_tokens: 1000,
            response_format: { type: 'json_object' }
        });

        return JSON.parse(response.choices[0].message.content);
    } catch (error) {
        console.error('Student performance analysis error:', error);
        return null;
    }
};
