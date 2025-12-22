import React, { useState, useEffect, useCallback } from 'react';
import { useTheme } from '../context/ThemeContext';
import gmailConfig from '../config/gmailConfig';

const EmailInbox = ({ onClose, userRole }) => {
  const { isDark } = useTheme();
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emails, setEmails] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');
  const [gapiInited, setGapiInited] = useState(false);
  const [gisInited, setGisInited] = useState(false);
  const [tokenClient, setTokenClient] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState({});

  // Email categories
  const categories = {
    all: { name: 'All Mails', color: 'gray' },
    recruitment: { name: 'Recruitment', color: 'gray' },
    academic: { name: 'Academic', color: 'gray' },
    events: { name: 'Events', color: 'gray' },
    administrative: { name: 'Administrative', color: 'gray' },
    updates: { name: 'Updates', color: 'gray' },
    social: { name: 'Social', color: 'gray' },
    finance: { name: 'Finance', color: 'gray' },
    personal: { name: 'Personal', color: 'gray' },
    spam: { name: 'Spam', color: 'gray' }
  };

  // Category configuration for AI categorization
  const categoryConfig = {
    recruitment: {
      keywords: ['job', 'interview', 'position', 'hiring', 'recruitment', 'opportunity', 'career', 
                 'opening', 'vacancy', 'application', 'resume', 'cv', 'candidate', 'recruiter',
                 'placement', 'offer letter', 'joining', 'hr', 'human resources', 'campus placement',
                 'internship', 'fresher', 'experience', 'salary', 'package', 'ctc'],
      domains: ['linkedin.com', 'naukri.com', 'indeed.com', 'glassdoor.com', 'google.com', 
                'microsoft.com', 'amazon.com', 'tcs.com', 'infosys.com', 'wipro.com', 'hirect.in',
                'angel.co', 'instahyre.com', 'cutshort.io'],
      weight: 10
    },
    academic: {
      keywords: ['assignment', 'exam', 'grade', 'course', 'lecture', 'class', 'professor', 
                 'semester', 'test', 'quiz', 'study', 'research', 'paper', 'thesis', 'project',
                 'submission', 'deadline', 'marks', 'syllabus', 'attendance', 'faculty', 'cgpa',
                 'result', 'practical', 'lab', 'workshop', 'training'],
      domains: ['edu', 'ac.in', 'college', 'university', 'school'],
      weight: 9
    },
    events: {
      keywords: ['event', 'workshop', 'seminar', 'conference', 'meetup', 'webinar', 'hackathon',
                 'competition', 'fest', 'cultural', 'technical', 'sports', 'invitation', 'rsvp',
                 'register', 'registration', 'participate', 'venue', 'schedule', 'ceremony'],
      domains: ['eventbrite.com', 'meetup.com', 'zoom.us', 'teams.microsoft.com'],
      weight: 8
    },
    administrative: {
      keywords: ['notice', 'announcement', 'policy', 'fee', 'payment', 'hostel', 'library',
                 'transport', 'admission', 'enrollment', 'document', 'certificate', 'id card',
                 'form', 'application', 'verification', 'approval', 'permission', 'leave'],
      domains: ['college', 'university', 'admin'],
      weight: 7
    },
    updates: {
      keywords: ['update', 'news', 'newsletter', 'notification', 'alert', 'reminder',
                 'bulletin', 'circular', 'information', 'notice', 'announcement', 'digest'],
      domains: [],
      weight: 6
    },
    social: {
      keywords: ['facebook', 'twitter', 'instagram', 'linkedin', 'notification', 'like',
                 'comment', 'share', 'follow', 'friend request', 'message', 'tagged', 'mention'],
      domains: ['facebook.com', 'twitter.com', 'instagram.com', 'linkedin.com', 'discord.com'],
      weight: 5
    },
    finance: {
      keywords: ['bank', 'account', 'transaction', 'payment', 'credit', 'debit', 'statement',
                 'balance', 'transfer', 'upi', 'card', 'loan', 'insurance', 'investment', 'otp'],
      domains: ['paytm.com', 'phonepe.com', 'gpay.com', 'bank', 'icici', 'hdfc', 'sbi', 'axis'],
      weight: 4
    },
    personal: {
      keywords: ['personal', 'family', 'friend', 'birthday', 'congratulations', 'wishes', 'hello', 'hi'],
      domains: ['gmail.com', 'yahoo.com', 'outlook.com'],
      weight: 3
    },
    spam: {
      keywords: ['unsubscribe', 'marketing', 'promotion', 'advertisement', 'spam', 'win', 'prize',
                 'free', 'click here', 'limited time', 'act now', 'congratulations you won', 'lottery'],
      domains: [],
      weight: 2
    }
  };

  // Initialize Google API
  const initializeGapi = useCallback(() => {
    if (window.gapi) {
      window.gapi.load('client', async () => {
        try {
          await window.gapi.client.init({
            apiKey: gmailConfig.API_KEY,
            discoveryDocs: [gmailConfig.DISCOVERY_DOC],
          });
          setGapiInited(true);
        } catch (error) {
          console.error('Error initializing GAPI:', error);
        }
      });
    }
  }, []);

  // Initialize Google Identity Services
  const initializeGis = useCallback(() => {
    if (window.google && gmailConfig.CLIENT_ID !== 'YOUR_CLIENT_ID_HERE.apps.googleusercontent.com') {
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: gmailConfig.CLIENT_ID,
        scope: gmailConfig.SCOPES,
        callback: (response) => {
          if (response.access_token) {
            setIsConnected(true);
            fetchEmails();
          }
        },
      });
      setTokenClient(client);
      setGisInited(true);
    }
  }, []);

  useEffect(() => {
    if (gmailConfig.DEMO_MODE) {
      // Load demo emails
      loadDemoEmails();
    } else {
      initializeGapi();
      initializeGis();
    }
  }, [initializeGapi, initializeGis]);

  // Categorize email using AI
  const categorizeEmail = (email) => {
    const scores = {};
    const from = (email.from || '').toLowerCase();
    const subject = (email.subject || '').toLowerCase();
    const snippet = (email.snippet || '').toLowerCase();
    const content = `${subject} ${snippet}`;

    for (const [category, config] of Object.entries(categoryConfig)) {
      let score = 0;

      // Check keywords
      for (const keyword of config.keywords) {
        const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
        const matches = content.match(regex);
        if (matches) {
          score += matches.length * config.weight;
        }
      }

      // Check sender domain
      for (const domain of config.domains) {
        if (from.includes(domain)) {
          score += config.weight * 5;
        }
      }

      // Boost score if keyword in subject
      for (const keyword of config.keywords) {
        if (subject.includes(keyword)) {
          score += config.weight * 2;
        }
      }

      scores[category] = score;
    }

    // Find category with highest score
    let maxScore = 0;
    let bestCategory = 'personal';
    
    for (const [category, score] of Object.entries(scores)) {
      if (score > maxScore) {
        maxScore = score;
        bestCategory = category;
      }
    }

    return { category: bestCategory, confidence: Math.min(maxScore / 50, 1) };
  };

  // Load demo emails
  const loadDemoEmails = () => {
    setLoading(true);
    const demoEmails = [
      {
        id: '1',
        from: 'hr@tcs.com',
        subject: 'Campus Placement Drive - Software Engineer Position',
        snippet: 'Dear Student, We are excited to announce the upcoming campus placement drive for Software Engineer positions. The interview process will include technical rounds and HR discussion...',
        date: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        isRead: false,
        hasAttachment: true
      },
      {
        id: '2',
        from: 'professor@college.ac.in',
        subject: 'Assignment Submission Deadline Extended',
        snippet: 'The deadline for the final project submission has been extended to next Friday. Please ensure your research paper follows the format discussed in class...',
        date: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        isRead: true,
        hasAttachment: false
      },
      {
        id: '3',
        from: 'events@techfest.com',
        subject: 'Hackathon Registration Confirmation',
        snippet: 'Thank you for registering for TechHack 2024! Your team registration is confirmed. The hackathon starts on January 15th. Please find venue details attached...',
        date: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
        isRead: false,
        hasAttachment: true
      },
      {
        id: '4',
        from: 'noreply@linkedin.com',
        subject: 'You have 5 new profile views',
        snippet: 'Your profile was viewed by recruiters from Google, Microsoft, and Amazon. Upgrade to Premium to see who viewed your profile...',
        date: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
        isRead: true,
        hasAttachment: false
      },
      {
        id: '5',
        from: 'admin@university.edu',
        subject: 'Fee Payment Reminder - Last Date Approaching',
        snippet: 'This is a reminder that the last date for fee payment is approaching. Please complete your payment by the due date to avoid late fees...',
        date: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
        isRead: false,
        hasAttachment: false
      },
      {
        id: '6',
        from: 'noreply@hdfcbank.com',
        subject: 'Transaction Alert: Rs. 5000 debited from your account',
        snippet: 'Your A/c XXXX1234 is debited for Rs.5000.00 on 20-Dec-24. UPI Ref No: 123456789. Balance: Rs.25,000.00...',
        date: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
        isRead: true,
        hasAttachment: false
      },
      {
        id: '7',
        from: 'recruiter@infosys.com',
        subject: 'Interview Scheduled - Full Stack Developer Role',
        snippet: 'Congratulations! Your application for Full Stack Developer position has been shortlisted. Your interview is scheduled for December 28th at 10:00 AM...',
        date: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
        isRead: false,
        hasAttachment: true
      },
      {
        id: '8',
        from: 'newsletter@medium.com',
        subject: 'Your Daily Digest: Top Stories in Tech',
        snippet: 'AI is transforming the industry... Top 10 programming languages for 2024... How to ace your technical interviews...',
        date: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
        isRead: true,
        hasAttachment: false
      },
      {
        id: '9',
        from: 'mentor@college.ac.in',
        subject: 'Career Guidance Session - Next Week',
        snippet: 'Dear mentee, I would like to schedule a career guidance session with you next week. Please share your available slots...',
        date: new Date(Date.now() - 1000 * 60 * 60 * 60).toISOString(),
        isRead: false,
        hasAttachment: false
      },
      {
        id: '10',
        from: 'promotions@shopping.com',
        subject: '🎉 Flash Sale! Up to 70% OFF - Limited Time Only!',
        snippet: 'Hurry up! Click here to grab the best deals. This offer expires in 24 hours. Unsubscribe from marketing emails...',
        date: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
        isRead: true,
        hasAttachment: false
      },
      {
        id: '11',
        from: 'hr@wipro.com',
        subject: 'Offer Letter - Associate Software Engineer',
        snippet: 'Dear Candidate, We are pleased to offer you the position of Associate Software Engineer at Wipro. Please find your offer letter attached. Your CTC will be 4.5 LPA...',
        date: new Date(Date.now() - 1000 * 60 * 60 * 96).toISOString(),
        isRead: false,
        hasAttachment: true
      },
      {
        id: '12',
        from: 'exams@university.edu',
        subject: 'Exam Schedule Released - Winter Semester 2024',
        snippet: 'The examination schedule for Winter Semester 2024 has been released. Please check your exam dates and venues. Hall tickets will be available from...',
        date: new Date(Date.now() - 1000 * 60 * 60 * 120).toISOString(),
        isRead: true,
        hasAttachment: true
      }
    ];

    // Categorize demo emails
    const categorizedEmails = demoEmails.map(email => ({
      ...email,
      ...categorizeEmail(email)
    }));

    setEmails(categorizedEmails);
    calculateStats(categorizedEmails);
    setIsConnected(true);
    setLoading(false);
  };

  // Fetch real emails from Gmail
  const fetchEmails = async () => {
    setLoading(true);
    try {
      const response = await window.gapi.client.gmail.users.messages.list({
        userId: 'me',
        maxResults: 50,
        labelIds: ['INBOX'],
      });

      if (response.result.messages) {
        const emailPromises = response.result.messages.map(async (msg) => {
          const emailResponse = await window.gapi.client.gmail.users.messages.get({
            userId: 'me',
            id: msg.id,
            format: 'full'
          });
          
          const email = emailResponse.result;
          const headers = email.payload.headers;
          
          const getHeader = (name) => {
            const header = headers.find(h => h.name.toLowerCase() === name.toLowerCase());
            return header ? header.value : '';
          };

          return {
            id: email.id,
            from: getHeader('From'),
            subject: getHeader('Subject'),
            snippet: email.snippet,
            date: getHeader('Date'),
            isRead: !email.labelIds.includes('UNREAD'),
            hasAttachment: email.payload.parts?.some(p => p.filename && p.filename.length > 0) || false
          };
        });

        const fetchedEmails = await Promise.all(emailPromises);
        const categorizedEmails = fetchedEmails.map(email => ({
          ...email,
          ...categorizeEmail(email)
        }));

        setEmails(categorizedEmails);
        calculateStats(categorizedEmails);
      }
    } catch (error) {
      console.error('Error fetching emails:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate category statistics
  const calculateStats = (emailList) => {
    const statsObj = { all: emailList.length };
    for (const category of Object.keys(categories)) {
      if (category !== 'all') {
        statsObj[category] = emailList.filter(e => e.category === category).length;
      }
    }
    setStats(statsObj);
  };

  // Handle Gmail connect
  const handleConnect = () => {
    if (gmailConfig.DEMO_MODE) {
      loadDemoEmails();
    } else if (tokenClient) {
      tokenClient.requestAccessToken({ prompt: 'consent' });
    }
  };

  // Handle disconnect
  const handleDisconnect = () => {
    if (!gmailConfig.DEMO_MODE && window.gapi?.client?.getToken()) {
      window.google.accounts.oauth2.revoke(window.gapi.client.getToken().access_token);
      window.gapi.client.setToken('');
    }
    setIsConnected(false);
    setEmails([]);
    setSelectedEmail(null);
    setStats({});
  };

  // Filter emails by category and search
  const filteredEmails = emails.filter(email => {
    const matchesCategory = activeCategory === 'all' || email.category === activeCategory;
    const matchesSearch = !searchQuery || 
      email.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.from.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.snippet.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Format date
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    if (diff < 604800000) return date.toLocaleDateString('en-US', { weekday: 'short' });
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Get category color class - using professional gray theme
  const getCategoryColor = (category, isDarkMode = isDark) => {
    return isDarkMode ? 'bg-gray-600' : 'bg-gray-700';
  };

  const themeClasses = {
    bg: isDark ? 'bg-gray-800' : 'bg-white',
    bgSecondary: isDark ? 'bg-gray-700' : 'bg-gray-50',
    text: isDark ? 'text-white' : 'text-gray-900',
    textMuted: isDark ? 'text-gray-400' : 'text-gray-500',
    border: isDark ? 'border-gray-700' : 'border-gray-200',
    input: isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${isDark ? 'bg-black/80' : 'bg-black/50'}`}>
      <div className={`w-full max-w-6xl h-[85vh] overflow-hidden shadow-2xl flex flex-col ${themeClasses.bg}`}>
        {/* Header */}
        <div className={`flex items-center justify-between p-4 border-b ${themeClasses.border}`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 ${isDark ? 'bg-gray-700' : 'bg-gray-900'}`}>
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h2 className={`text-xl font-bold ${themeClasses.text}`}>Email Inbox</h2>
              <p className={`text-sm ${themeClasses.textMuted}`}>AI-powered email categorization</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {isConnected && (
              <button
                onClick={() => gmailConfig.DEMO_MODE ? loadDemoEmails() : fetchEmails()}
                className={`p-2 transition-colors ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                title="Refresh"
              >
                <svg className={`w-5 h-5 ${themeClasses.textMuted} ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            )}
            <button onClick={onClose} className={`p-2 transition-colors ${isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {!isConnected ? (
          // Connect screen
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center max-w-md">
              <div className={`w-24 h-24 mx-auto mb-6 flex items-center justify-center ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <svg className={`w-12 h-12 ${themeClasses.textMuted}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className={`text-2xl font-bold mb-3 ${themeClasses.text}`}>Connect Your Gmail</h3>
              <p className={`mb-6 ${themeClasses.textMuted}`}>
                Import your emails and let AI automatically categorize them into Recruitment, Academic, Events, and more!
              </p>
              
              <div className={`p-4 mb-6 text-left ${themeClasses.bgSecondary}`}>
                <h4 className={`font-semibold mb-2 ${themeClasses.text}`}>Features:</h4>
                <ul className={`space-y-2 text-sm ${themeClasses.textMuted}`}>
                  <li className="flex items-center gap-2">
                    <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>✓</span> AI-powered categorization
                  </li>
                  <li className="flex items-center gap-2">
                    <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>✓</span> Priority inbox for recruitment emails
                  </li>
                  <li className="flex items-center gap-2">
                    <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>✓</span> Smart filtering by category
                  </li>
                  <li className="flex items-center gap-2">
                    <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>✓</span> Quick search across all emails
                  </li>
                </ul>
              </div>

              {gmailConfig.DEMO_MODE && (
                <div className={`p-3 mb-4 border ${isDark ? 'bg-gray-700 border-gray-600 text-gray-300' : 'bg-gray-100 border-gray-300 text-gray-700'} text-sm`}>
                  <strong>Demo Mode:</strong> Using sample emails. Configure Gmail API for real integration.
                </div>
              )}

              <button
                onClick={handleConnect}
                className={`w-full py-3 font-semibold text-white transition-all ${
                  isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-900 hover:bg-gray-800'
                }`}
              >
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  {gmailConfig.DEMO_MODE ? 'Try Demo Mode' : 'Connect with Google'}
                </span>
              </button>
            </div>
          </div>
        ) : (
          // Email inbox
          <div className="flex-1 flex overflow-hidden">
            {/* Sidebar - Categories */}
            <div className={`w-64 border-r ${themeClasses.border} overflow-y-auto`}>
              <div className="p-4">
                <h3 className={`text-xs font-semibold uppercase tracking-wider mb-3 ${themeClasses.textMuted}`}>Categories</h3>
                {Object.entries(categories).map(([key, cat]) => (
                  <button
                    key={key}
                    onClick={() => setActiveCategory(key)}
                    className={`w-full flex items-center justify-between px-3 py-2 mb-1 transition-colors ${
                      activeCategory === key
                        ? isDark ? 'bg-gray-700 text-white' : 'bg-gray-900 text-white'
                        : `${themeClasses.text} ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-sm">{cat.name}</span>
                    </span>
                    {stats[key] > 0 && (
                      <span className={`text-xs px-2 py-0.5 ${
                        activeCategory === key
                          ? 'bg-white/20'
                          : isDark ? 'bg-gray-600' : 'bg-gray-200'
                      }`}>
                        {stats[key]}
                      </span>
                    )}
                  </button>
                ))}
              </div>
              
              {/* Disconnect button */}
              <div className={`p-4 border-t ${themeClasses.border}`}>
                <button
                  onClick={handleDisconnect}
                  className={`w-full py-2 text-sm font-medium transition-colors ${
                    isDark ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Disconnect Gmail
                </button>
              </div>
            </div>

            {/* Email list */}
            <div className={`w-96 border-r ${themeClasses.border} flex flex-col`}>
              {/* Search */}
              <div className={`p-3 border-b ${themeClasses.border}`}>
                <div className="relative">
                  <svg className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${themeClasses.textMuted}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search emails..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`w-full pl-10 pr-4 py-2 border ${themeClasses.input} focus:ring-2 focus:ring-gray-500 focus:border-transparent`}
                  />
                </div>
              </div>

              {/* Email list */}
              <div className="flex-1 overflow-y-auto">
                {loading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className={`animate-spin w-8 h-8 border-4 ${isDark ? 'border-gray-600 border-t-white' : 'border-gray-300 border-t-gray-900'}`}></div>
                  </div>
                ) : filteredEmails.length === 0 ? (
                  <div className={`flex flex-col items-center justify-center h-full ${themeClasses.textMuted}`}>
                    <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <p>No emails found</p>
                  </div>
                ) : (
                  filteredEmails.map(email => (
                    <div
                      key={email.id}
                      onClick={() => setSelectedEmail(email)}
                      className={`p-4 border-b cursor-pointer transition-colors ${themeClasses.border} ${
                        selectedEmail?.id === email.id
                          ? isDark ? 'bg-gray-700' : 'bg-gray-100'
                          : isDark ? 'hover:bg-gray-750' : 'hover:bg-gray-50'
                      } ${!email.isRead ? 'font-semibold' : ''}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-2 h-2 mt-2 ${getCategoryColor(email.category)}`}></div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className={`text-sm truncate ${themeClasses.text}`}>
                              {email.from.split('<')[0].trim()}
                            </span>
                            <span className={`text-xs ${themeClasses.textMuted}`}>
                              {formatDate(email.date)}
                            </span>
                          </div>
                          <p className={`text-sm truncate mb-1 ${themeClasses.text}`}>
                            {email.subject}
                          </p>
                          <p className={`text-xs truncate ${themeClasses.textMuted}`}>
                            {email.snippet}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className={`text-xs px-2 py-0.5 ${getCategoryColor(email.category)} text-white`}>
                              {categories[email.category]?.name || 'Unknown'}
                            </span>
                            {email.hasAttachment && (
                              <svg className={`w-4 h-4 ${themeClasses.textMuted}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                              </svg>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Email detail */}
            <div className="flex-1 flex flex-col overflow-hidden">
              {selectedEmail ? (
                <>
                  <div className={`p-6 border-b ${themeClasses.border}`}>
                    <div className="flex items-start justify-between mb-4">
                      <h3 className={`text-xl font-bold ${themeClasses.text}`}>{selectedEmail.subject}</h3>
                      <span className={`px-3 py-1 text-sm ${getCategoryColor(selectedEmail.category)} text-white`}>
                        {categories[selectedEmail.category]?.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 flex items-center justify-center text-white font-bold ${isDark ? 'bg-gray-600' : 'bg-gray-500'}`}>
                        {selectedEmail.from.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className={`font-medium ${themeClasses.text}`}>{selectedEmail.from}</p>
                        <p className={`text-sm ${themeClasses.textMuted}`}>
                          {new Date(selectedEmail.date).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className={`flex-1 p-6 overflow-y-auto ${themeClasses.text}`}>
                    <p className="whitespace-pre-wrap leading-relaxed">{selectedEmail.snippet}</p>
                    
                    {/* AI Analysis */}
                    <div className={`mt-6 p-4 border ${themeClasses.border} ${themeClasses.bgSecondary}`}>
                      <h4 className={`font-semibold mb-2 flex items-center gap-2 ${themeClasses.text}`}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        AI Analysis
                      </h4>
                      <div className="space-y-2 text-sm">
                        <p>
                          <span className={themeClasses.textMuted}>Category: </span>
                          <span className={`px-2 py-0.5 ${getCategoryColor(selectedEmail.category)} text-white`}>
                            {categories[selectedEmail.category]?.name}
                          </span>
                        </p>
                        <p>
                          <span className={themeClasses.textMuted}>Confidence: </span>
                          <span className={themeClasses.text}>
                            {Math.round((selectedEmail.confidence || 0.8) * 100)}%
                          </span>
                        </p>
                        <p className={themeClasses.textMuted}>
                          {selectedEmail.category === 'recruitment' && 'This email appears to be related to job opportunities, interviews, or placement activities.'}
                          {selectedEmail.category === 'academic' && 'This email appears to be related to your academic activities like assignments, exams, or courses.'}
                          {selectedEmail.category === 'events' && 'This email appears to be an invitation or information about an event, workshop, or seminar.'}
                          {selectedEmail.category === 'administrative' && 'This email appears to be related to administrative matters like fees, documents, or notices.'}
                          {selectedEmail.category === 'updates' && 'This email appears to be a general update or notification.'}
                          {selectedEmail.category === 'social' && 'This email appears to be from a social media platform.'}
                          {selectedEmail.category === 'finance' && 'This email appears to be related to financial transactions or banking.'}
                          {selectedEmail.category === 'personal' && 'This email appears to be a personal message.'}
                          {selectedEmail.category === 'spam' && 'This email appears to be promotional or spam content.'}
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className={`flex-1 flex items-center justify-center ${themeClasses.textMuted}`}>
                  <div className="text-center">
                    <svg className="w-20 h-20 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <p>Select an email to read</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailInbox;
