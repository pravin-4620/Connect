// AI Email Categorization Service
// This service uses AI/ML to automatically categorize emails

class AICategorizationService {
  constructor() {
    // Define categories with keywords and patterns
    this.categories = {
      'Recruitment': {
        keywords: ['job', 'interview', 'position', 'hiring', 'recruitment', 'opportunity', 'career', 
                   'opening', 'vacancy', 'application', 'resume', 'cv', 'candidate', 'recruiter',
                   'placement', 'offer letter', 'joining', 'hr', 'human resources', 'campus placement'],
        domains: ['linkedin.com', 'naukri.com', 'indeed.com', 'glassdoor.com', 'google.com', 
                  'microsoft.com', 'amazon.com', 'tcs.com', 'infosys.com', 'wipro.com'],
        weight: 10
      },
      'Academic': {
        keywords: ['assignment', 'exam', 'grade', 'course', 'lecture', 'class', 'professor', 
                   'semester', 'test', 'quiz', 'study', 'research', 'paper', 'thesis', 'project',
                   'submission', 'deadline', 'marks', 'syllabus', 'attendance', 'faculty'],
        domains: ['edu', 'ac.in', 'college', 'university', 'school'],
        weight: 9
      },
      'Events': {
        keywords: ['event', 'workshop', 'seminar', 'conference', 'meetup', 'webinar', 'hackathon',
                   'competition', 'fest', 'cultural', 'technical', 'sports', 'invitation', 'rsvp',
                   'register', 'registration', 'participate', 'venue', 'schedule'],
        domains: ['eventbrite.com', 'meetup.com', 'zoom.us'],
        weight: 8
      },
      'Administrative': {
        keywords: ['notice', 'announcement', 'policy', 'fee', 'payment', 'hostel', 'library',
                   'transport', 'admission', 'enrollment', 'document', 'certificate', 'id card',
                   'form', 'application', 'verification', 'approval', 'permission'],
        domains: ['college', 'university', 'admin'],
        weight: 7
      },
      'Updates': {
        keywords: ['update', 'news', 'newsletter', 'notification', 'alert', 'reminder',
                   'bulletin', 'circular', 'information', 'notice', 'announcement'],
        domains: [],
        weight: 6
      },
      'Social': {
        keywords: ['facebook', 'twitter', 'instagram', 'linkedin', 'notification', 'like',
                   'comment', 'share', 'follow', 'friend request', 'message', 'tagged'],
        domains: ['facebook.com', 'twitter.com', 'instagram.com', 'linkedin.com'],
        weight: 5
      },
      'Shopping': {
        keywords: ['order', 'delivery', 'shipped', 'tracking', 'purchase', 'payment', 'invoice',
                   'cart', 'checkout', 'discount', 'sale', 'offer', 'coupon', 'refund'],
        domains: ['amazon.com', 'flipkart.com', 'myntra.com', 'ajio.com', 'meesho.com'],
        weight: 4
      },
      'Finance': {
        keywords: ['bank', 'account', 'transaction', 'payment', 'credit', 'debit', 'statement',
                   'balance', 'transfer', 'upi', 'card', 'loan', 'insurance', 'investment'],
        domains: ['paytm.com', 'phonepe.com', 'gpay.com', 'bank', 'icici', 'hdfc', 'sbi'],
        weight: 4
      },
      'Personal': {
        keywords: ['personal', 'family', 'friend', 'birthday', 'congratulations', 'wishes'],
        domains: [],
        weight: 3
      },
      'Spam': {
        keywords: ['unsubscribe', 'marketing', 'promotion', 'advertisement', 'spam', 'win', 'prize',
                   'free', 'click here', 'limited time', 'act now', 'congratulations you won'],
        domains: [],
        weight: 2
      }
    };
  }

  // Main categorization function
  categorizeEmail(email) {
    const scores = {};
    
    // Extract email content for analysis
    const from = (email.from || '').toLowerCase();
    const subject = (email.subject || '').toLowerCase();
    const body = (email.body || '').toLowerCase();
    const snippet = (email.snippet || '').toLowerCase();
    const content = `${subject} ${body} ${snippet}`;

    // Calculate scores for each category
    for (const [category, config] of Object.entries(this.categories)) {
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
          score += config.weight * 5; // Domain matches are weighted more
        }
      }

      // Boost score for subject line matches
      for (const keyword of config.keywords) {
        const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
        if (subject.match(regex)) {
          score += config.weight * 2; // Subject matches are weighted more
        }
      }

      scores[category] = score;
    }

    // Find category with highest score
    let bestCategory = 'Personal'; // Default category
    let maxScore = 0;

    for (const [category, score] of Object.entries(scores)) {
      if (score > maxScore) {
        maxScore = score;
        bestCategory = category;
      }
    }

    // If no strong match, categorize based on labels
    if (maxScore === 0) {
      if (email.labelIds?.includes('CATEGORY_PROMOTIONS')) {
        bestCategory = 'Shopping';
      } else if (email.labelIds?.includes('CATEGORY_SOCIAL')) {
        bestCategory = 'Social';
      } else if (email.labelIds?.includes('CATEGORY_UPDATES')) {
        bestCategory = 'Updates';
      } else if (email.labelIds?.includes('SPAM')) {
        bestCategory = 'Spam';
      }
    }

    return {
      category: bestCategory,
      confidence: this.calculateConfidence(maxScore, scores),
      scores: scores
    };
  }

  // Calculate confidence level (0-100)
  calculateConfidence(maxScore, allScores) {
    if (maxScore === 0) return 30; // Low confidence for default categorization

    const totalScore = Object.values(allScores).reduce((sum, score) => sum + score, 0);
    const confidence = totalScore > 0 ? (maxScore / totalScore) * 100 : 30;
    
    return Math.min(Math.round(confidence), 100);
  }

  // Batch categorize multiple emails
  async categorizeEmails(emails, onProgress = null) {
    const categorizedEmails = [];
    
    for (let i = 0; i < emails.length; i++) {
      const email = emails[i];
      const result = this.categorizeEmail(email);
      
      categorizedEmails.push({
        ...email,
        category: result.category,
        categoryConfidence: result.confidence,
        categoryScores: result.scores
      });

      // Report progress
      if (onProgress) {
        onProgress({
          current: i + 1,
          total: emails.length,
          percentage: Math.round(((i + 1) / emails.length) * 100)
        });
      }

      // Simulate processing delay for better UX (can be removed in production)
      if (i % 10 === 0) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    return categorizedEmails;
  }

  // Get statistics about categorized emails
  getCategoryStats(emails) {
    const stats = {};
    
    for (const category of Object.keys(this.categories)) {
      stats[category] = {
        count: 0,
        unread: 0,
        important: 0
      };
    }

    for (const email of emails) {
      const category = email.category || 'Personal';
      if (stats[category]) {
        stats[category].count++;
        if (email.unread) stats[category].unread++;
        if (email.important) stats[category].important++;
      }
    }

    return stats;
  }

  // Get available categories
  getCategories() {
    return Object.keys(this.categories);
  }

  // Re-categorize a single email (for manual corrections)
  recategorizeEmail(email, newCategory) {
    if (!this.categories[newCategory]) {
      throw new Error(`Invalid category: ${newCategory}`);
    }

    return {
      ...email,
      category: newCategory,
      categoryConfidence: 100, // Manual categorization has 100% confidence
      manuallyCategorized: true
    };
  }

  // Train/improve categorization based on user feedback (placeholder for future ML integration)
  async provideFeedback(emailId, suggestedCategory, actualCategory) {
    // This would be used to improve the AI model
    // For now, just log the feedback
    console.log('Categorization feedback:', {
      emailId,
      suggestedCategory,
      actualCategory,
      timestamp: new Date()
    });

    // In production, this would send feedback to a backend ML service
    return true;
  }
}

const aiCategorizationService = new AICategorizationService();
export default aiCategorizationService;
