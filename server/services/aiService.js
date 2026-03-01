const Groq = require('groq-sdk');

const RESUME_PROMPT = (resumeText, targetRole = '', jobDescription = '') => {
  // Determine context mode
  const hasJD   = jobDescription.trim().length > 50;
  const hasRole = targetRole.trim().length > 0;

  const contextBlock = hasJD
    ? `
## Job Description Provided
The candidate is applying for this specific position. Use the job description below as the PRIMARY reference for scoring, keyword analysis, and suggestions.

JOB DESCRIPTION:
"""
${jobDescription.trim()}
"""
${hasRole ? `Target Role: "${targetRole}"` : ''}

INSTRUCTIONS FOR MISSING KEYWORDS:
- Read through the job description carefully
- List keywords, skills, tools, technologies, and qualifications that appear in the JD but are ABSENT from the resume
- Be specific: prefer "REST API" over "API", "Agile/Scrum" over "Agile"
- Only include terms that would actually be scanned by ATS software`
    : hasRole
    ? `
## Target Role
The candidate is targeting: "${targetRole}"
Use industry-standard ATS expectations for this role as context.

INSTRUCTIONS FOR MISSING KEYWORDS:
- List keywords, skills, and tools that ATS systems commonly scan for in "${targetRole}" job postings
- Only include terms genuinely absent from the resume
- Be specific and concrete (e.g. "Docker", "System Design", "TypeScript")`
    : `
## No Target Role Specified
Infer the most suitable role from the resume content and use that as context.

INSTRUCTIONS FOR MISSING KEYWORDS:
- Based on the inferred target role, list keywords commonly expected by ATS for that role
- Only include terms genuinely absent from the resume`;

  return `You are an expert ATS (Applicant Tracking System) specialist and resume coach with 15+ years of experience in HR and technical recruitment.
${contextBlock}

Analyze the resume below and return a JSON object with this EXACT structure (pure JSON, no markdown):

{
  "atsScore": <number 0-100>,
  "overallScore": <number 0-100>,
  "experienceLevel": "<Junior|Mid-Level|Senior|Executive>",
  "jobTitles": ["<suggested job title 1>", "<suggested job title 2>", "<suggested job title 3>"],
  "summary": "<2-3 sentence professional summary of the candidate>",
  "strengths": [
    "<specific strength found in this resume>",
    "<specific strength found in this resume>",
    "<specific strength found in this resume>",
    "<specific strength found in this resume>",
    "<specific strength found in this resume>"
  ],
  "weaknesses": [
    "<specific gap or weakness in this resume>",
    "<specific gap or weakness in this resume>",
    "<specific gap or weakness in this resume>",
    "<specific gap or weakness in this resume>"
  ],
  "suggestions": [
    "<actionable, specific improvement for this resume>",
    "<actionable, specific improvement for this resume>",
    "<actionable, specific improvement for this resume>",
    "<actionable, specific improvement for this resume>",
    "<actionable, specific improvement for this resume>"
  ],
  "missingKeywords": [
    "<keyword absent from resume but required by ${hasJD ? 'the job description' : hasRole ? targetRole + ' roles' : 'the inferred target role'}>",
    "<keyword absent from resume but required by ${hasJD ? 'the job description' : hasRole ? targetRole + ' roles' : 'the inferred target role'}>",
    "<keyword absent from resume but required by ${hasJD ? 'the job description' : hasRole ? targetRole + ' roles' : 'the inferred target role'}>",
    "<keyword absent from resume but required by ${hasJD ? 'the job description' : hasRole ? targetRole + ' roles' : 'the inferred target role'}>",
    "<keyword absent from resume but required by ${hasJD ? 'the job description' : hasRole ? targetRole + ' roles' : 'the inferred target role'}>",
    "<keyword absent from resume but required by ${hasJD ? 'the job description' : hasRole ? targetRole + ' roles' : 'the inferred target role'}>"
  ],
  "technicalSkills": ["<skill actually listed in resume>", "<skill actually listed in resume>", "<skill actually listed in resume>"],
  "softSkills": ["<soft skill found in resume>", "<soft skill found in resume>", "<soft skill found in resume>"],
  "formattingIssues": [
    "<concrete formatting or structure issue in this resume>",
    "<concrete formatting or structure issue in this resume>"
  ]
}

ATS Score Guidelines:
- 90-100: Excellent — highly compatible, strong keyword match
- 70-89: Good — minor improvements needed
- 50-69: Average — several keywords and sections missing
- Below 50: Poor — major revision required
${hasJD ? '\nNote: ATS score should reflect how well the resume matches the provided job description specifically.' : ''}

RESUME TEXT:
---
${resumeText}
---

Return ONLY the JSON object. No explanation, no markdown.`;
};

const extractJSON = (text) => {
  const cleaned = text
    .replace(/^```json\s*/im, '')
    .replace(/^```\s*/im, '')
    .replace(/```\s*$/im, '')
    .trim();
  const start = cleaned.indexOf('{');
  const end   = cleaned.lastIndexOf('}');
  if (start === -1 || end === -1) throw new Error('No JSON object found in AI response');
  return JSON.parse(cleaned.substring(start, end + 1));
};

const analyzeResume = async (resumeText, targetRole = '', jobDescription = '') => {
  if (!process.env.GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY is not set in server/.env');
  }

  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  const hasJD = jobDescription.trim().length > 50;

  const chat = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      {
        role: 'system',
        content: 'You are an expert resume analyst. Always respond with pure JSON only — no markdown, no explanation.',
      },
      {
        role: 'user',
        content: RESUME_PROMPT(resumeText, targetRole, jobDescription),
      },
    ],
    temperature: 0.3,
    max_tokens: 2048,
    response_format: { type: 'json_object' },
  });

  const text = chat.choices[0]?.message?.content || '';
  const mode = hasJD ? 'JD-based' : targetRole ? `role: ${targetRole}` : 'inferred role';
  console.log(`✅ Groq analysis complete (${mode})`);
  return extractJSON(text);
};

module.exports = { analyzeResume };
