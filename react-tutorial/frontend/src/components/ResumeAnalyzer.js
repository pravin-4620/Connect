import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';

const ResumeAnalyzer = ({ onClose }) => {
  const { isDark } = useTheme();
  const [resumeText, setResumeText] = useState('');
  const [file, setFile] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('upload');
  const [expandedCategory, setExpandedCategory] = useState(null);

  // Resume Worded-style scoring criteria (Total: 100 points)
  const scoringCriteria = {
    impact: { weight: 25, label: 'Impact', description: 'Quantified achievements & results' },
    brevity: { weight: 15, label: 'Brevity', description: 'Concise & well-structured content' },
    style: { weight: 15, label: 'Style', description: 'Professional writing & formatting' },
    sections: { weight: 20, label: 'Sections', description: 'Complete resume structure' },
    skills: { weight: 15, label: 'Skills', description: 'Technical & soft skills coverage' },
    ats: { weight: 10, label: 'ATS', description: 'Applicant Tracking System compatibility' }
  };

  // Comprehensive skill database
  const skillDatabase = {
    programming: ['javascript', 'python', 'java', 'c++', 'c#', 'ruby', 'go', 'rust', 'typescript', 'php', 'swift', 'kotlin', 'scala', 'r', 'matlab', 'perl', 'shell', 'bash', 'powershell', 'lua'],
    frontend: ['react', 'angular', 'vue', 'svelte', 'next.js', 'nuxt', 'gatsby', 'html', 'css', 'sass', 'less', 'tailwind', 'bootstrap', 'material-ui', 'styled-components', 'webpack', 'vite', 'redux', 'mobx'],
    backend: ['node.js', 'express', 'django', 'flask', 'fastapi', 'spring', 'spring boot', '.net', 'asp.net', 'rails', 'laravel', 'gin', 'fiber', 'graphql', 'rest api', 'microservices'],
    database: ['mysql', 'postgresql', 'mongodb', 'redis', 'oracle', 'sql server', 'firebase', 'dynamodb', 'cassandra', 'elasticsearch', 'neo4j', 'sqlite', 'mariadb', 'couchdb'],
    cloud: ['aws', 'azure', 'gcp', 'google cloud', 'docker', 'kubernetes', 'terraform', 'ansible', 'jenkins', 'ci/cd', 'devops', 'cloudformation', 'lambda', 'ec2', 's3', 'heroku', 'vercel', 'netlify'],
    dataScience: ['machine learning', 'deep learning', 'tensorflow', 'pytorch', 'keras', 'pandas', 'numpy', 'scikit-learn', 'opencv', 'nlp', 'computer vision', 'data analysis', 'data visualization', 'tableau', 'power bi', 'jupyter', 'spark', 'hadoop'],
    mobile: ['react native', 'flutter', 'swift', 'kotlin', 'ios', 'android', 'xamarin', 'ionic', 'cordova'],
    tools: ['git', 'github', 'gitlab', 'bitbucket', 'jira', 'confluence', 'slack', 'figma', 'sketch', 'postman', 'swagger', 'linux', 'unix', 'windows server'],
    methodologies: ['agile', 'scrum', 'kanban', 'waterfall', 'tdd', 'bdd', 'ci/cd', 'devops', 'pair programming', 'code review'],
    softSkills: ['leadership', 'communication', 'teamwork', 'problem-solving', 'critical thinking', 'project management', 'time management', 'presentation', 'mentoring', 'collaboration', 'adaptability', 'creativity']
  };

  // Strong action verbs by category
  const strongActionVerbs = {
    leadership: ['led', 'directed', 'managed', 'supervised', 'oversaw', 'coordinated', 'headed', 'orchestrated', 'spearheaded', 'pioneered'],
    achievement: ['achieved', 'accomplished', 'attained', 'exceeded', 'surpassed', 'outperformed', 'delivered', 'completed', 'won'],
    creation: ['developed', 'created', 'designed', 'built', 'established', 'founded', 'launched', 'introduced', 'initiated', 'constructed'],
    improvement: ['improved', 'enhanced', 'optimized', 'streamlined', 'upgraded', 'revamped', 'transformed', 'modernized', 'automated', 'accelerated'],
    analysis: ['analyzed', 'evaluated', 'assessed', 'examined', 'investigated', 'researched', 'studied', 'reviewed', 'diagnosed'],
    collaboration: ['collaborated', 'partnered', 'cooperated', 'liaised', 'consulted', 'contributed', 'supported', 'facilitated', 'enabled']
  };

  // Weak/generic words to avoid
  const weakWords = ['responsible for', 'helped', 'assisted', 'worked on', 'duties included', 'tasked with', 'involved in', 'participated in', 'handled', 'dealt with', 'various', 'numerous', 'several', 'many', 'some'];

  // Filler words
  const fillerWords = ['very', 'really', 'just', 'actually', 'basically', 'literally', 'simply', 'quite', 'rather', 'somewhat', 'perhaps', 'maybe', 'probably', 'kind of', 'sort of'];

  // Required resume sections
  const requiredSections = {
    contact: { required: true, keywords: ['email', 'phone', 'linkedin', 'github', 'portfolio', 'address', 'location', '@', '.com', 'http', 'www'], weight: 10 },
    summary: { required: false, keywords: ['summary', 'objective', 'profile', 'about', 'professional summary', 'career objective'], weight: 5 },
    experience: { required: true, keywords: ['experience', 'work experience', 'professional experience', 'employment', 'work history', 'career history'], weight: 25 },
    education: { required: true, keywords: ['education', 'academic', 'university', 'college', 'degree', 'bachelor', 'master', 'phd', 'b.tech', 'm.tech', 'b.e', 'm.e', 'bsc', 'msc', 'mba'], weight: 20 },
    skills: { required: true, keywords: ['skills', 'technical skills', 'competencies', 'expertise', 'proficiencies', 'technologies'], weight: 20 },
    projects: { required: false, keywords: ['projects', 'personal projects', 'academic projects', 'portfolio'], weight: 10 },
    certifications: { required: false, keywords: ['certifications', 'certificates', 'credentials', 'licenses', 'certified'], weight: 5 },
    achievements: { required: false, keywords: ['achievements', 'awards', 'honors', 'recognition', 'accomplishments'], weight: 5 }
  };

  const handleFileUpload = (e) => {
    const uploadedFile = e.target.files[0];
    if (uploadedFile) {
      setFile(uploadedFile);
      const reader = new FileReader();
      reader.onload = (event) => {
        setResumeText(event.target.result);
      };
      reader.readAsText(uploadedFile);
    }
  };

  // Resume Worded-style comprehensive analysis
  const analyzeResume = () => {
    if (!resumeText.trim()) {
      alert('Please enter or upload resume content');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      const text = resumeText.toLowerCase();
      const originalText = resumeText;
      const lines = originalText.split('\n').filter(line => line.trim());
      const words = text.split(/\s+/).filter(w => w.length > 0);
      const wordCount = words.length;
      const bulletPoints = lines.filter(line => /^[\s]*[-•*▪▸►◦‣⁃]/.test(line) || /^\d+\./.test(line.trim()));

      // ============ IMPACT SCORE (25 points) ============
      let impactScore = 0;
      const impactDetails = { strengths: [], weaknesses: [], tips: [] };

      // Check for quantified results (numbers, percentages, dollar amounts)
      const quantifiedResults = originalText.match(/(\d+%|\$[\d,]+|\d+x|\d+\+|\d+K|\d+M|[0-9,]+\s*(users|customers|clients|people|employees|team members|projects|applications|systems))/gi) || [];
      
      if (quantifiedResults.length >= 5) {
        impactScore += 10;
        impactDetails.strengths.push(`Excellent quantification with ${quantifiedResults.length} metrics found`);
      } else if (quantifiedResults.length >= 3) {
        impactScore += 7;
        impactDetails.strengths.push(`Good quantification with ${quantifiedResults.length} metrics`);
        impactDetails.tips.push('Add 2-3 more quantified achievements for maximum impact');
      } else if (quantifiedResults.length >= 1) {
        impactScore += 4;
        impactDetails.weaknesses.push(`Only ${quantifiedResults.length} quantified result(s) found`);
        impactDetails.tips.push('Add percentages, dollar amounts, or numbers to show impact (e.g., "Increased sales by 25%")');
      } else {
        impactDetails.weaknesses.push('No quantified achievements found');
        impactDetails.tips.push('CRITICAL: Add numbers to every bullet point (e.g., "Reduced load time by 40%", "Managed team of 5 engineers")');
      }

      // Check for strong action verbs
      const allActionVerbs = Object.values(strongActionVerbs).flat();
      const usedActionVerbs = allActionVerbs.filter(verb => text.includes(verb));
      const uniqueActionVerbs = [...new Set(usedActionVerbs)];

      if (uniqueActionVerbs.length >= 10) {
        impactScore += 8;
        impactDetails.strengths.push(`Strong variety of action verbs (${uniqueActionVerbs.length} unique verbs)`);
      } else if (uniqueActionVerbs.length >= 5) {
        impactScore += 5;
        impactDetails.tips.push('Use more varied action verbs from different categories');
      } else {
        impactScore += 2;
        impactDetails.weaknesses.push('Limited use of strong action verbs');
        impactDetails.tips.push('Start bullets with action verbs like: Led, Developed, Achieved, Optimized, Increased');
      }

      // Check for weak words
      const foundWeakWords = weakWords.filter(word => text.includes(word.toLowerCase()));
      if (foundWeakWords.length === 0) {
        impactScore += 7;
        impactDetails.strengths.push('No weak phrases detected');
      } else if (foundWeakWords.length <= 2) {
        impactScore += 4;
        impactDetails.weaknesses.push(`Found weak phrases: "${foundWeakWords.join('", "')}"`);
        impactDetails.tips.push('Replace weak phrases with strong action verbs');
      } else {
        impactDetails.weaknesses.push(`Multiple weak phrases found: "${foundWeakWords.slice(0, 3).join('", "')}"`);
        impactDetails.tips.push('Remove phrases like "responsible for" and "helped with" - use direct action verbs instead');
      }

      // ============ BREVITY SCORE (15 points) ============
      let brevityScore = 0;
      const brevityDetails = { strengths: [], weaknesses: [], tips: [] };

      // Check bullet point length
      const avgBulletLength = bulletPoints.length > 0 
        ? bulletPoints.reduce((acc, bp) => acc + bp.split(/\s+/).length, 0) / bulletPoints.length 
        : 0;

      if (avgBulletLength > 0 && avgBulletLength <= 20) {
        brevityScore += 5;
        brevityDetails.strengths.push(`Bullet points are concise (avg ${Math.round(avgBulletLength)} words)`);
      } else if (avgBulletLength > 20 && avgBulletLength <= 30) {
        brevityScore += 3;
        brevityDetails.tips.push('Consider shortening some bullet points to under 20 words');
      } else if (avgBulletLength > 30) {
        brevityDetails.weaknesses.push('Bullet points are too long');
        brevityDetails.tips.push('Break long bullets into multiple points or trim unnecessary words');
      }

      // Check overall word count
      if (wordCount >= 300 && wordCount <= 600) {
        brevityScore += 5;
        brevityDetails.strengths.push(`Ideal resume length (${wordCount} words)`);
      } else if (wordCount >= 200 && wordCount <= 800) {
        brevityScore += 3;
        if (wordCount < 300) brevityDetails.tips.push('Consider adding more detail about your achievements');
        if (wordCount > 600) brevityDetails.tips.push('Consider trimming less relevant content');
      } else if (wordCount < 200) {
        brevityDetails.weaknesses.push(`Resume too short (${wordCount} words)`);
        brevityDetails.tips.push('Add more details about your experience and projects');
      } else {
        brevityDetails.weaknesses.push(`Resume too long (${wordCount} words)`);
        brevityDetails.tips.push('Focus on recent and relevant experience only');
      }

      // Check for filler words
      const foundFillerWords = fillerWords.filter(word => text.includes(word.toLowerCase()));
      if (foundFillerWords.length === 0) {
        brevityScore += 5;
        brevityDetails.strengths.push('No filler words detected');
      } else if (foundFillerWords.length <= 3) {
        brevityScore += 3;
        brevityDetails.tips.push(`Remove filler words: "${foundFillerWords.join('", "')}"`);
      } else {
        brevityDetails.weaknesses.push(`Multiple filler words found: "${foundFillerWords.slice(0, 4).join('", "')}"`);
        brevityDetails.tips.push('Eliminate filler words for more impactful writing');
      }

      // ============ STYLE SCORE (15 points) ============
      let styleScore = 0;
      const styleDetails = { strengths: [], weaknesses: [], tips: [] };

      // Check for consistent formatting
      const startsWithAction = bulletPoints.filter(bp => {
        const firstWord = bp.replace(/^[\s\-•*▪▸►◦‣⁃\d.]+/, '').trim().split(/\s+/)[0]?.toLowerCase();
        return allActionVerbs.some(verb => firstWord?.startsWith(verb.slice(0, -2)) || firstWord === verb);
      });

      if (bulletPoints.length > 0) {
        const actionVerbRatio = startsWithAction.length / bulletPoints.length;
        if (actionVerbRatio >= 0.7) {
          styleScore += 5;
          styleDetails.strengths.push('Consistent use of action verbs at bullet start');
        } else if (actionVerbRatio >= 0.4) {
          styleScore += 3;
          styleDetails.tips.push('Start more bullet points with action verbs');
        } else {
          styleDetails.weaknesses.push('Inconsistent bullet point structure');
          styleDetails.tips.push('Begin each bullet with a strong action verb (past tense for past roles)');
        }
      }

      // Check for first person pronouns
      const pronouns = ['i ', 'me ', 'my ', 'myself'];
      const hasPronouns = pronouns.some(p => text.includes(p));
      if (!hasPronouns) {
        styleScore += 5;
        styleDetails.strengths.push('Correctly avoids first-person pronouns');
      } else {
        styleDetails.weaknesses.push('Contains first-person pronouns');
        styleDetails.tips.push('Remove "I", "me", "my" - use implied first person');
      }

      // Check for consistent tense
      const pastTenseVerbs = originalText.match(/\b\w+ed\b/gi) || [];
      const presentTenseVerbs = originalText.match(/\b(manage|develop|create|lead|work|build|design)s?\b/gi) || [];
      
      if (pastTenseVerbs.length > presentTenseVerbs.length * 2) {
        styleScore += 5;
        styleDetails.strengths.push('Consistent use of past tense');
      } else if (presentTenseVerbs.length > pastTenseVerbs.length) {
        styleScore += 3;
        styleDetails.tips.push('Use past tense for previous roles, present for current');
      } else {
        styleScore += 4;
      }

      // ============ SECTIONS SCORE (20 points) ============
      let sectionsScore = 0;
      const sectionsDetails = { strengths: [], weaknesses: [], tips: [], found: [] };

      Object.entries(requiredSections).forEach(([section, config]) => {
        const found = config.keywords.some(keyword => text.includes(keyword.toLowerCase()));
        if (found) {
          sectionsDetails.found.push(section);
          if (config.required) {
            sectionsScore += config.weight * 0.6;
          } else {
            sectionsScore += config.weight * 0.4;
          }
        } else if (config.required) {
          sectionsDetails.weaknesses.push(`Missing required section: ${section}`);
          sectionsDetails.tips.push(`Add a ${section} section to your resume`);
        }
      });

      if (sectionsDetails.found.length >= 6) {
        sectionsDetails.strengths.push(`Comprehensive resume with ${sectionsDetails.found.length} sections`);
      } else if (sectionsDetails.found.length >= 4) {
        sectionsDetails.strengths.push(`Good section coverage (${sectionsDetails.found.length} sections)`);
      }

      // ============ SKILLS SCORE (15 points) ============
      let skillsScore = 0;
      const skillsDetails = { strengths: [], weaknesses: [], tips: [], found: {} };

      let totalSkillsFound = 0;
      Object.entries(skillDatabase).forEach(([category, skills]) => {
        const found = skills.filter(skill => text.includes(skill.toLowerCase()));
        if (found.length > 0) {
          skillsDetails.found[category] = found;
          totalSkillsFound += found.length;
        }
      });

      const categoriesWithSkills = Object.keys(skillsDetails.found).length;
      
      if (totalSkillsFound >= 15) {
        skillsScore += 8;
        skillsDetails.strengths.push(`Excellent skill coverage (${totalSkillsFound} skills across ${categoriesWithSkills} categories)`);
      } else if (totalSkillsFound >= 8) {
        skillsScore += 5;
        skillsDetails.strengths.push(`Good skill coverage (${totalSkillsFound} skills)`);
        skillsDetails.tips.push('Consider adding more relevant technical skills');
      } else if (totalSkillsFound >= 4) {
        skillsScore += 3;
        skillsDetails.weaknesses.push(`Limited skills detected (${totalSkillsFound})`);
        skillsDetails.tips.push('Add more technical skills relevant to your target role');
      } else {
        skillsDetails.weaknesses.push('Very few skills detected');
        skillsDetails.tips.push('Create a dedicated Skills section with technical competencies');
      }

      // Check for skill diversity
      if (categoriesWithSkills >= 4) {
        skillsScore += 4;
        skillsDetails.strengths.push('Good diversity across skill categories');
      } else if (categoriesWithSkills >= 2) {
        skillsScore += 2;
        skillsDetails.tips.push('Diversify your skills across more categories');
      }

      // Check for in-demand skills
      const inDemandSkills = ['python', 'javascript', 'react', 'aws', 'docker', 'kubernetes', 'machine learning', 'sql', 'git', 'agile'];
      const foundInDemand = inDemandSkills.filter(skill => text.includes(skill));
      if (foundInDemand.length >= 4) {
        skillsScore += 3;
        skillsDetails.strengths.push(`Includes ${foundInDemand.length} high-demand skills`);
      } else {
        skillsDetails.tips.push('Consider adding in-demand skills like: Python, JavaScript, AWS, Docker, Git');
      }

      // ============ ATS SCORE (10 points) ============
      let atsScore = 0;
      const atsDetails = { strengths: [], weaknesses: [], tips: [] };

      // Check for standard section headers
      const standardHeaders = ['experience', 'education', 'skills', 'projects', 'summary'];
      const hasStandardHeaders = standardHeaders.filter(h => text.includes(h)).length;
      if (hasStandardHeaders >= 3) {
        atsScore += 3;
        atsDetails.strengths.push('Uses standard section headers');
      } else {
        atsDetails.tips.push('Use standard section headers: Experience, Education, Skills, Projects');
      }

      // Check for contact info
      const hasEmail = text.includes('@') && text.includes('.com');
      const hasPhone = /\d{3}[-.\s]?\d{3}[-.\s]?\d{4}|\+\d{1,3}[-.\s]?\d{10}/.test(text);
      const hasLinkedIn = text.includes('linkedin');
      
      if (hasEmail && hasPhone) {
        atsScore += 3;
        atsDetails.strengths.push('Contact information is complete');
      } else {
        if (!hasEmail) atsDetails.tips.push('Add your email address');
        if (!hasPhone) atsDetails.tips.push('Add your phone number');
      }

      if (hasLinkedIn) {
        atsScore += 1;
        atsDetails.strengths.push('LinkedIn profile included');
      } else {
        atsDetails.tips.push('Add your LinkedIn profile URL');
      }

      // Check for special characters that might cause ATS issues
      const problematicChars = originalText.match(/[│┃║╔╗╚╝═─┐┘┌└★☆●○◆◇▲△▼▽♦♣♠♥]/g);
      if (!problematicChars || problematicChars.length === 0) {
        atsScore += 2;
        atsDetails.strengths.push('No problematic special characters');
      } else {
        atsDetails.weaknesses.push('Contains special characters that may cause ATS issues');
        atsDetails.tips.push('Replace decorative characters with standard bullets (• or -)');
      }

      // Check for keyword density
      const jobKeywords = ['managed', 'developed', 'created', 'implemented', 'team', 'project', 'analysis', 'solution', 'process', 'system'];
      const keywordCount = jobKeywords.filter(kw => text.includes(kw)).length;
      if (keywordCount >= 6) {
        atsScore += 1;
        atsDetails.strengths.push('Good keyword density');
      }

      // Calculate total score
      const totalScore = Math.min(100, Math.round(
        impactScore + brevityScore + styleScore + sectionsScore + skillsScore + atsScore
      ));

      // Generate priority improvements
      const priorityImprovements = [];
      
      if (quantifiedResults.length < 3) {
        priorityImprovements.push({
          priority: 'HIGH',
          title: 'Add Quantified Achievements',
          description: 'Add numbers, percentages, or metrics to at least 5 bullet points',
          examples: ['Increased sales by 25%', 'Reduced costs by $50K', 'Led team of 8 engineers', 'Delivered project 2 weeks ahead of schedule']
        });
      }

      if (uniqueActionVerbs.length < 8) {
        priorityImprovements.push({
          priority: 'HIGH',
          title: 'Strengthen Action Verbs',
          description: 'Start each bullet with a powerful action verb',
          examples: ['Led', 'Achieved', 'Developed', 'Optimized', 'Spearheaded', 'Transformed']
        });
      }

      if (foundWeakWords.length > 0) {
        priorityImprovements.push({
          priority: 'MEDIUM',
          title: 'Remove Weak Phrases',
          description: `Replace: ${foundWeakWords.slice(0, 3).join(', ')}`,
          examples: ['"Responsible for managing" → "Managed"', '"Helped develop" → "Developed"', '"Worked on" → "Built"']
        });
      }

      if (sectionsDetails.weaknesses.length > 0) {
        priorityImprovements.push({
          priority: 'MEDIUM',
          title: 'Complete Missing Sections',
          description: sectionsDetails.weaknesses.join(', '),
          examples: []
        });
      }

      if (totalSkillsFound < 10) {
        priorityImprovements.push({
          priority: 'LOW',
          title: 'Expand Skills Section',
          description: 'Add more relevant technical and soft skills',
          examples: Object.entries(skillDatabase).slice(0, 3).map(([cat, skills]) => `${cat}: ${skills.slice(0, 4).join(', ')}`)
        });
      }

      setAnalysis({
        totalScore,
        wordCount,
        bulletCount: bulletPoints.length,
        categories: {
          impact: { score: impactScore, max: 25, ...impactDetails },
          brevity: { score: brevityScore, max: 15, ...brevityDetails },
          style: { score: styleScore, max: 15, ...styleDetails },
          sections: { score: sectionsScore, max: 20, ...sectionsDetails },
          skills: { score: skillsScore, max: 15, ...skillsDetails },
          ats: { score: atsScore, max: 10, ...atsDetails }
        },
        priorityImprovements,
        detectedSkills: skillsDetails.found,
        actionVerbsUsed: uniqueActionVerbs,
        quantifiedResults,
        weakWordsFound: foundWeakWords
      });

      setLoading(false);
    }, 2000);
  };

  const getScoreColor = (score, max) => {
    const percentage = (score / max) * 100;
    if (percentage >= 80) return isDark ? 'text-green-400' : 'text-green-600';
    if (percentage >= 60) return isDark ? 'text-yellow-400' : 'text-yellow-600';
    if (percentage >= 40) return isDark ? 'text-orange-400' : 'text-orange-600';
    return isDark ? 'text-red-400' : 'text-red-600';
  };

  const getScoreBg = (score, max) => {
    const percentage = (score / max) * 100;
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 60) return 'bg-yellow-500';
    if (percentage >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getOverallGrade = (score) => {
    if (score >= 90) return { grade: 'A+', label: 'Exceptional', color: 'text-green-500' };
    if (score >= 80) return { grade: 'A', label: 'Excellent', color: 'text-green-500' };
    if (score >= 70) return { grade: 'B+', label: 'Very Good', color: 'text-blue-500' };
    if (score >= 60) return { grade: 'B', label: 'Good', color: 'text-blue-500' };
    if (score >= 50) return { grade: 'C+', label: 'Above Average', color: 'text-yellow-500' };
    if (score >= 40) return { grade: 'C', label: 'Average', color: 'text-yellow-500' };
    if (score >= 30) return { grade: 'D', label: 'Below Average', color: 'text-orange-500' };
    return { grade: 'F', label: 'Needs Work', color: 'text-red-500' };
  };

  const themeClasses = {
    bg: isDark ? 'bg-gray-900' : 'bg-white',
    bgSecondary: isDark ? 'bg-gray-800' : 'bg-gray-50',
    bgTertiary: isDark ? 'bg-gray-700' : 'bg-gray-100',
    text: isDark ? 'text-gray-100' : 'text-gray-900',
    textSecondary: isDark ? 'text-gray-300' : 'text-gray-600',
    textMuted: isDark ? 'text-gray-400' : 'text-gray-500',
    border: isDark ? 'border-gray-700' : 'border-gray-200',
    card: isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200',
    input: isDark ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${isDark ? 'bg-black/80' : 'bg-black/50'}`}>
      <div className={`w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-none shadow-2xl ${themeClasses.bg}`}>
        {/* Header */}
        <div className={`sticky top-0 z-10 flex items-center justify-between p-6 border-b ${themeClasses.bg} ${themeClasses.border}`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-none ${isDark ? 'bg-gray-700' : 'bg-gray-900'}`}>
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h2 className={`text-xl font-bold ${themeClasses.text}`}>AI Resume Analyzer</h2>
              <p className={`text-sm ${themeClasses.textMuted}`}>Comprehensive professional analysis</p>
            </div>
          </div>
          <button onClick={onClose} className={`p-2 rounded-none transition-colors ${isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          {!analysis ? (
            <>
              {/* Tabs */}
              <div className="flex gap-2 mb-6">
                <button
                  onClick={() => setActiveTab('upload')}
                  className={`px-4 py-2 rounded-none font-medium transition-colors ${activeTab === 'upload' 
                    ? isDark ? 'bg-gray-700 text-white' : 'bg-gray-900 text-white'
                    : `${themeClasses.bgTertiary} ${themeClasses.textSecondary} hover:opacity-80`}`}
                >
                  Upload File
                </button>
                <button
                  onClick={() => setActiveTab('paste')}
                  className={`px-4 py-2 rounded-none font-medium transition-colors ${activeTab === 'paste' 
                    ? isDark ? 'bg-gray-700 text-white' : 'bg-gray-900 text-white'
                    : `${themeClasses.bgTertiary} ${themeClasses.textSecondary} hover:opacity-80`}`}
                >
                  Paste Text
                </button>
              </div>

              {activeTab === 'upload' ? (
                <div className={`border-2 border-dashed rounded-none p-8 text-center ${themeClasses.border}`}>
                  <input type="file" accept=".txt,.doc,.docx,.pdf" onChange={handleFileUpload} className="hidden" id="resume-upload" />
                  <label htmlFor="resume-upload" className="cursor-pointer">
                    <div className="flex flex-col items-center">
                      <div className={`p-4 rounded-full mb-4 ${themeClasses.bgTertiary}`}>
                        <svg className={`w-8 h-8 ${themeClasses.textMuted}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                      </div>
                      <p className={`font-medium ${themeClasses.text}`}>{file ? file.name : 'Click to upload your resume'}</p>
                      <p className={`text-sm mt-1 ${themeClasses.textMuted}`}>Supports TXT, DOC, DOCX, PDF</p>
                    </div>
                  </label>
                </div>
              ) : (
                <textarea
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  placeholder="Paste your resume content here..."
                  rows={12}
                  className={`w-full p-4 rounded-none border resize-none focus:ring-2 focus:ring-gray-500 focus:border-transparent ${themeClasses.input}`}
                />
              )}

              <button
                onClick={analyzeResume}
                disabled={loading || !resumeText.trim()}
                className={`w-full mt-6 py-3 rounded-none font-semibold text-white transition-all ${
                  loading || !resumeText.trim() 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-900 hover:bg-gray-800'
                }`}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Analyzing with AI...
                  </span>
                ) : (
                  'Analyze Resume'
                )}
              </button>

              {/* What we analyze section */}
              <div className={`mt-8 p-6 rounded-none ${themeClasses.bgSecondary}`}>
                <h3 className={`text-lg font-semibold mb-4 ${themeClasses.text}`}>What We Analyze</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {Object.entries(scoringCriteria).map(([key, { label, description, weight }]) => (
                    <div key={key} className={`p-3 rounded-none ${themeClasses.bgTertiary}`}>
                      <div className="flex items-center justify-between mb-1">
                        <span className={`font-medium ${themeClasses.text}`}>{label}</span>
                        <span className={`text-sm font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{weight} pts</span>
                      </div>
                      <p className={`text-xs ${themeClasses.textMuted}`}>{description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Results */}
              <div className="space-y-6">
                {/* Overall Score Card */}
                <div className={`p-6 rounded-none ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className={`text-lg font-semibold ${themeClasses.text}`}>Resume Score</h3>
                      <p className={`text-sm ${themeClasses.textMuted}`}>{analysis.wordCount} words • {analysis.bulletCount} bullet points</p>
                    </div>
                    <div className="flex items-center gap-6">
                      {/* Circular Score */}
                      <div className="relative w-24 h-24">
                        <svg className="w-24 h-24 transform -rotate-90">
                          <circle cx="48" cy="48" r="40" stroke={isDark ? '#374151' : '#e5e7eb'} strokeWidth="8" fill="none" />
                          <circle
                            cx="48" cy="48" r="40"
                            stroke={analysis.totalScore >= 70 ? '#22c55e' : analysis.totalScore >= 50 ? '#eab308' : '#ef4444'}
                            strokeWidth="8" fill="none"
                            strokeDasharray={`${(analysis.totalScore / 100) * 251.2} 251.2`}
                            strokeLinecap="round"
                          />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className={`text-2xl font-bold ${getOverallGrade(analysis.totalScore).color}`}>{analysis.totalScore}</span>
                          <span className={`text-xs ${themeClasses.textMuted}`}>/100</span>
                        </div>
                      </div>
                      <div className="text-center">
                        <div className={`text-3xl font-bold ${getOverallGrade(analysis.totalScore).color}`}>
                          {getOverallGrade(analysis.totalScore).grade}
                        </div>
                        <div className={`text-sm ${themeClasses.textMuted}`}>{getOverallGrade(analysis.totalScore).label}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Category Scores */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {Object.entries(analysis.categories).map(([key, category]) => (
                    <button
                      key={key}
                      onClick={() => setExpandedCategory(expandedCategory === key ? null : key)}
                      className={`p-4 rounded-none border transition-all ${themeClasses.card} ${expandedCategory === key ? 'ring-2 ring-gray-500' : ''} hover:shadow-md`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className={`font-medium capitalize ${themeClasses.text}`}>{scoringCriteria[key].label}</span>
                        <span className={`text-lg font-bold ${getScoreColor(category.score, category.max)}`}>
                          {category.score}/{category.max}
                        </span>
                      </div>
                      <div className={`h-2 rounded-full ${themeClasses.bgTertiary} overflow-hidden`}>
                        <div
                          className={`h-full rounded-full ${getScoreBg(category.score, category.max)} transition-all duration-500`}
                          style={{ width: `${(category.score / category.max) * 100}%` }}
                        />
                      </div>
                      <p className={`text-xs mt-2 ${themeClasses.textMuted}`}>{scoringCriteria[key].description}</p>
                      <div className={`text-xs mt-1 ${themeClasses.textMuted}`}>
                        {expandedCategory === key ? '▲ Hide details' : '▼ Show details'}
                      </div>
                    </button>
                  ))}
                </div>

                {/* Expanded Category Details */}
                {expandedCategory && (
                  <div className={`p-6 rounded-none border ${themeClasses.card}`}>
                    <h4 className={`text-lg font-semibold mb-4 capitalize ${themeClasses.text}`}>
                      {scoringCriteria[expandedCategory].label} Analysis
                    </h4>
                    
                    {analysis.categories[expandedCategory].strengths?.length > 0 && (
                      <div className="mb-4">
                        <h5 className={`font-medium mb-2 flex items-center gap-2 ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          Strengths
                        </h5>
                        <ul className="space-y-1">
                          {analysis.categories[expandedCategory].strengths.map((item, idx) => (
                            <li key={idx} className={`text-sm ${isDark ? 'text-green-300' : 'text-green-700'}`}>• {item}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {analysis.categories[expandedCategory].weaknesses?.length > 0 && (
                      <div className="mb-4">
                        <h5 className={`font-medium mb-2 flex items-center gap-2 ${isDark ? 'text-red-400' : 'text-red-600'}`}>
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                          Issues Found
                        </h5>
                        <ul className="space-y-1">
                          {analysis.categories[expandedCategory].weaknesses.map((item, idx) => (
                            <li key={idx} className={`text-sm ${isDark ? 'text-red-300' : 'text-red-700'}`}>• {item}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {analysis.categories[expandedCategory].tips?.length > 0 && (
                      <div>
                        <h5 className={`font-medium mb-2 flex items-center gap-2 ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                          </svg>
                          Recommendations
                        </h5>
                        <ul className="space-y-1">
                          {analysis.categories[expandedCategory].tips.map((item, idx) => (
                            <li key={idx} className={`text-sm ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>→ {item}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {expandedCategory === 'skills' && analysis.categories.skills.found && (
                      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                        <h5 className={`font-medium mb-3 ${themeClasses.text}`}>Detected Skills by Category</h5>
                        <div className="space-y-2">
                          {Object.entries(analysis.categories.skills.found).map(([cat, skills]) => (
                            <div key={cat}>
                              <span className={`text-sm font-medium capitalize ${themeClasses.textSecondary}`}>{cat}: </span>
                              <div className="inline-flex flex-wrap gap-1">
                                {skills.map(skill => (
                                  <span key={skill} className={`px-2 py-0.5 text-xs rounded-full ${isDark ? 'bg-purple-900/50 text-purple-300' : 'bg-purple-100 text-purple-700'}`}>
                                    {skill}
                                  </span>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {expandedCategory === 'sections' && analysis.categories.sections.found && (
                      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                        <h5 className={`font-medium mb-3 ${themeClasses.text}`}>Sections Detected</h5>
                        <div className="flex flex-wrap gap-2">
                          {Object.keys(requiredSections).map(section => {
                            const found = analysis.categories.sections.found.includes(section);
                            return (
                              <span
                                key={section}
                                className={`px-3 py-1 text-sm rounded-full capitalize ${
                                  found
                                    ? isDark ? 'bg-green-900/50 text-green-300' : 'bg-green-100 text-green-700'
                                    : isDark ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-400'
                                }`}
                              >
                                {found && '✓ '}{section}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Priority Improvements */}
                {analysis.priorityImprovements.length > 0 && (
                  <div className={`p-6 rounded-none ${isDark ? 'bg-gradient-to-r from-orange-900/30 to-red-900/30' : 'bg-gradient-to-r from-orange-50 to-red-50'}`}>
                    <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${isDark ? 'text-orange-400' : 'text-orange-700'}`}>
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
                      </svg>
                      Top Priority Improvements
                    </h3>
                    <div className="space-y-4">
                      {analysis.priorityImprovements.map((improvement, idx) => (
                        <div key={idx} className={`p-4 rounded-none ${themeClasses.bgSecondary}`}>
                          <div className="flex items-start gap-3">
                            <span className={`px-2 py-0.5 text-xs font-bold rounded ${
                              improvement.priority === 'HIGH' ? 'bg-red-500 text-white' :
                              improvement.priority === 'MEDIUM' ? 'bg-yellow-500 text-black' :
                              'bg-blue-500 text-white'
                            }`}>
                              {improvement.priority}
                            </span>
                            <div className="flex-1">
                              <h4 className={`font-semibold ${themeClasses.text}`}>{improvement.title}</h4>
                              <p className={`text-sm mt-1 ${themeClasses.textSecondary}`}>{improvement.description}</p>
                              {improvement.examples.length > 0 && (
                                <div className="mt-2">
                                  <p className={`text-xs font-medium ${themeClasses.textMuted}`}>Examples:</p>
                                  <div className="flex flex-wrap gap-2 mt-1">
                                    {improvement.examples.map((ex, exIdx) => (
                                      <code key={exIdx} className={`text-xs px-2 py-1 rounded ${themeClasses.bgTertiary} ${themeClasses.textSecondary}`}>
                                        {ex}
                                      </code>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className={`p-4 rounded-none text-center ${themeClasses.bgSecondary}`}>
                    <div className={`text-2xl font-bold ${themeClasses.text}`}>{analysis.quantifiedResults.length}</div>
                    <div className={`text-sm ${themeClasses.textMuted}`}>Quantified Results</div>
                  </div>
                  <div className={`p-4 rounded-none text-center ${themeClasses.bgSecondary}`}>
                    <div className={`text-2xl font-bold ${themeClasses.text}`}>{analysis.actionVerbsUsed.length}</div>
                    <div className={`text-sm ${themeClasses.textMuted}`}>Action Verbs</div>
                  </div>
                  <div className={`p-4 rounded-none text-center ${themeClasses.bgSecondary}`}>
                    <div className={`text-2xl font-bold ${themeClasses.text}`}>{Object.values(analysis.detectedSkills).flat().length}</div>
                    <div className={`text-sm ${themeClasses.textMuted}`}>Skills Detected</div>
                  </div>
                  <div className={`p-4 rounded-none text-center ${themeClasses.bgSecondary}`}>
                    <div className={`text-2xl font-bold ${analysis.weakWordsFound.length > 0 ? 'text-red-500' : isDark ? 'text-green-400' : 'text-green-600'}`}>
                      {analysis.weakWordsFound.length}
                    </div>
                    <div className={`text-sm ${themeClasses.textMuted}`}>Weak Phrases</div>
                  </div>
                </div>

                {/* Action Verbs Found */}
                {analysis.actionVerbsUsed.length > 0 && (
                  <div className={`p-6 rounded-none border ${themeClasses.card}`}>
                    <h3 className={`text-lg font-semibold mb-3 ${themeClasses.text}`}>Strong Action Verbs Used</h3>
                    <div className="flex flex-wrap gap-2">
                      {analysis.actionVerbsUsed.map(verb => (
                        <span key={verb} className={`px-3 py-1 text-sm rounded-full capitalize ${isDark ? 'bg-green-900/50 text-green-300' : 'bg-green-100 text-green-700'}`}>
                          {verb}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-4">
                  <button
                    onClick={() => {
                      setAnalysis(null);
                      setExpandedCategory(null);
                    }}
                    className={`flex-1 py-3 rounded-none font-semibold transition-colors ${themeClasses.bgTertiary} ${themeClasses.text} hover:opacity-80`}
                  >
                    Analyze Another Resume
                  </button>
                  <button
                    onClick={() => {
                      const report = `RESUME ANALYSIS REPORT
========================
Overall Score: ${analysis.totalScore}/100 (${getOverallGrade(analysis.totalScore).label})

CATEGORY SCORES:
${Object.entries(analysis.categories).map(([key, cat]) => `• ${scoringCriteria[key].label}: ${cat.score}/${cat.max}`).join('\n')}

PRIORITY IMPROVEMENTS:
${analysis.priorityImprovements.map(imp => `[${imp.priority}] ${imp.title}: ${imp.description}`).join('\n')}

DETECTED SKILLS: ${Object.values(analysis.detectedSkills).flat().join(', ')}

ACTION VERBS USED: ${analysis.actionVerbsUsed.join(', ')}

QUANTIFIED RESULTS: ${analysis.quantifiedResults.length} found
`;
                      navigator.clipboard.writeText(report);
                      alert('Detailed report copied to clipboard!');
                    }}
                    className="flex-1 py-3 rounded-none font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 transition-all"
                  >
                    Copy Full Report
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResumeAnalyzer;
