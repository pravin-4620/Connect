import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';

const SkillAssessment = ({ onClose, assessmentId = null, mode = 'browse' }) => {
  const { isDark } = useTheme();
  const [activeTab, setActiveTab] = useState(mode === 'take' ? 'take' : 'browse');
  const [loading, setLoading] = useState(false);
  const [assessments, setAssessments] = useState([]);
  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [testStarted, setTestStarted] = useState(false);
  const [testSubmitted, setTestSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [myResults, setMyResults] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const answersRef = useRef(answers);

  // Keep ref in sync
  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  useEffect(() => {
    fetchAssessments();
    fetchCategories();
    fetchMyResults();
  }, []);

  // Use ref for handleSubmitTest to avoid stale closure
  const handleSubmitTestRef = useRef(null);

  useEffect(() => {
    let timer;
    if (testStarted && timeLeft > 0 && !testSubmitted) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            if (handleSubmitTestRef.current) {
              handleSubmitTestRef.current();
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [testStarted, timeLeft, testSubmitted]);

  const fetchAssessments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5001/api/assessments', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setAssessments(data.assessments || []);
      }
    } catch (error) {
      console.error('Error fetching assessments:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5001/api/assessments/categories', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories || []);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchMyResults = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5001/api/assessments/results/my', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setMyResults(data.results || []);
      }
    } catch (error) {
      console.error('Error fetching results:', error);
    }
  };

  const startTest = async (assessment) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5001/api/assessments/${assessment._id}/start`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setSelectedAssessment(data.assessment);
        setTimeLeft(data.assessment.duration * 60);
        setAnswers({});
        setCurrentQuestion(0);
        setTestStarted(true);
        setTestSubmitted(false);
        setResult(null);
        setActiveTab('take');
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to start test');
      }
    } catch (error) {
      console.error('Error starting test:', error);
      alert('Failed to start test');
    }
  };

  const handleAnswerChange = (questionId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleSubmitTest = useCallback(async () => {
    if (testSubmitted) return;
    setTestSubmitted(true);
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const currentAnswers = answersRef.current;
      const formattedAnswers = Object.entries(currentAnswers).map(([questionId, answer]) => ({
        questionId,
        answer: Array.isArray(answer) ? answer : [answer]
      }));

      const response = await fetch(`http://localhost:5001/api/assessments/${selectedAssessment._id}/submit`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ answers: formattedAnswers })
      });

      if (response.ok) {
        const data = await response.json();
        setResult(data.result);
        setActiveTab('result');
        fetchMyResults();
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to submit test');
        setTestSubmitted(false);
      }
    } catch (error) {
      console.error('Error submitting test:', error);
      alert('Failed to submit test');
      setTestSubmitted(false);
    } finally {
      setLoading(false);
    }
  }, [selectedAssessment, testSubmitted]);

  // Keep ref updated
  useEffect(() => {
    handleSubmitTestRef.current = handleSubmitTest;
  }, [handleSubmitTest]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-100 text-green-700';
      case 'Medium': return 'bg-yellow-100 text-yellow-700';
      case 'Hard': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const filteredAssessments = selectedCategory 
    ? assessments.filter(a => a.skillCategory === selectedCategory)
    : assessments;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${isDark ? 'bg-black/70' : 'bg-black/50'}`}>
      <div className={`w-full max-w-5xl max-h-[90vh] overflow-hidden rounded-none shadow-2xl flex flex-col ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-none ${isDark ? 'bg-gray-700' : 'bg-gray-900'}`}>
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <div>
              <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>Skill Assessments</h2>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Test your skills and earn certificates</p>
            </div>
          </div>
          {testStarted && !testSubmitted && (
            <div className={`flex items-center gap-2 px-4 py-2 rounded-none ${
              timeLeft < 300 ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
            }`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-bold text-lg">{formatTime(timeLeft)}</span>
            </div>
          )}
          {!testStarted && (
            <button onClick={onClose} className={`p-2 rounded-none transition-colors ${isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Tabs (hidden during test) */}
        {!testStarted && (
          <div className={`flex gap-2 p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            <button
              onClick={() => setActiveTab('browse')}
              className={`px-4 py-2 rounded-none font-medium transition-colors ${activeTab === 'browse' 
                ? isDark ? 'bg-gray-700 text-white' : 'bg-gray-900 text-white'
                : isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              Available Tests
            </button>
            <button
              onClick={() => setActiveTab('results')}
              className={`px-4 py-2 rounded-none font-medium transition-colors ${activeTab === 'results' 
                ? isDark ? 'bg-gray-700 text-white' : 'bg-gray-900 text-white'
                : isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              My Results ({myResults.length})
            </button>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Browse Tab */}
          {activeTab === 'browse' && !testStarted && (
            <div className="space-y-6">
              {/* Category Filter */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedCategory('')}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    !selectedCategory 
                      ? 'bg-purple-500 text-white' 
                      : isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  All
                </button>
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                      selectedCategory === cat 
                        ? 'bg-purple-500 text-white' 
                        : isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Assessment Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredAssessments.filter(a => a.status === 'Published').map(assessment => (
                  <div
                    key={assessment._id}
                    className={`p-5 rounded-none border ${isDark ? 'bg-gray-750 border-gray-700' : 'bg-white border-gray-200'}`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <span className={`px-2 py-1 text-xs rounded-full ${isDark ? 'bg-purple-900 text-purple-300' : 'bg-purple-100 text-purple-700'}`}>
                        {assessment.skillCategory}
                      </span>
                      <span className={`px-2 py-1 text-xs rounded-full ${getDifficultyColor(assessment.difficulty || 'Medium')}`}>
                        {assessment.difficulty || 'Medium'}
                      </span>
                    </div>
                    <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                      {assessment.title}
                    </h3>
                    <p className={`text-sm mb-4 line-clamp-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {assessment.description || 'Test your skills in this assessment'}
                    </p>
                    <div className={`flex flex-wrap gap-3 text-sm mb-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {assessment.totalQuestions || assessment.questions?.length || 0} Questions
                      </span>
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {assessment.duration} mins
                      </span>
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Pass: {assessment.passingScore}%
                      </span>
                    </div>
                    <button
                      onClick={() => startTest(assessment)}
                      className="w-full py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-none font-medium hover:from-purple-600 hover:to-pink-600 transition-all"
                    >
                      Start Test
                    </button>
                  </div>
                ))}
              </div>

              {filteredAssessments.filter(a => a.status === 'Published').length === 0 && (
                <div className={`text-center py-12 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <p className="text-lg font-medium">No assessments available</p>
                  <p className="text-sm mt-1">Check back later for new tests</p>
                </div>
              )}
            </div>
          )}

          {/* Take Test Tab */}
          {activeTab === 'take' && testStarted && selectedAssessment && !testSubmitted && (
            <div className="space-y-6">
              {/* Progress Bar */}
              <div className={`p-4 rounded-none ${isDark ? 'bg-gray-750' : 'bg-gray-50'}`}>
                <div className="flex justify-between mb-2">
                  <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    Question {currentQuestion + 1} of {selectedAssessment.questions.length}
                  </span>
                  <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {Object.keys(answers).length} answered
                  </span>
                </div>
                <div className={`w-full h-2 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                  <div 
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all"
                    style={{ width: `${((currentQuestion + 1) / selectedAssessment.questions.length) * 100}%` }}
                  />
                </div>
              </div>

              {/* Question */}
              {selectedAssessment.questions[currentQuestion] && (
                <div className={`p-6 rounded-none border ${isDark ? 'bg-gray-750 border-gray-700' : 'bg-white border-gray-200'}`}>
                  <div className="flex items-center justify-between mb-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      selectedAssessment.questions[currentQuestion].type === 'MCQ' 
                        ? 'bg-blue-100 text-blue-700'
                        : selectedAssessment.questions[currentQuestion].type === 'True/False'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-orange-100 text-orange-700'
                    }`}>
                      {selectedAssessment.questions[currentQuestion].type}
                    </span>
                    <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      {selectedAssessment.questions[currentQuestion].points} points
                    </span>
                  </div>
                  
                  <h3 className={`text-lg font-medium mb-6 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                    {selectedAssessment.questions[currentQuestion].question}
                  </h3>

                  {/* MCQ Options */}
                  {selectedAssessment.questions[currentQuestion].type === 'MCQ' && (
                    <div className="space-y-3">
                      {selectedAssessment.questions[currentQuestion].options.map((option, idx) => (
                        <label
                          key={idx}
                          className={`flex items-center p-4 rounded-none border cursor-pointer transition-all ${
                            answers[selectedAssessment.questions[currentQuestion]._id] === option
                              ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30'
                              : isDark ? 'border-gray-700 hover:border-gray-600' : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <input
                            type="radio"
                            name={`question-${currentQuestion}`}
                            value={option}
                            checked={answers[selectedAssessment.questions[currentQuestion]._id] === option}
                            onChange={(e) => handleAnswerChange(selectedAssessment.questions[currentQuestion]._id, e.target.value)}
                            className="w-4 h-4 text-purple-500"
                          />
                          <span className={`ml-3 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{option}</span>
                        </label>
                      ))}
                    </div>
                  )}

                  {/* True/False Options */}
                  {selectedAssessment.questions[currentQuestion].type === 'True/False' && (
                    <div className="flex gap-4">
                      {['True', 'False'].map(option => (
                        <label
                          key={option}
                          className={`flex-1 flex items-center justify-center p-4 rounded-none border cursor-pointer transition-all ${
                            answers[selectedAssessment.questions[currentQuestion]._id] === option
                              ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30'
                              : isDark ? 'border-gray-700 hover:border-gray-600' : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <input
                            type="radio"
                            name={`question-${currentQuestion}`}
                            value={option}
                            checked={answers[selectedAssessment.questions[currentQuestion]._id] === option}
                            onChange={(e) => handleAnswerChange(selectedAssessment.questions[currentQuestion]._id, e.target.value)}
                            className="w-4 h-4 text-purple-500"
                          />
                          <span className={`ml-2 font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{option}</span>
                        </label>
                      ))}
                    </div>
                  )}

                  {/* Short Answer / Essay / Coding */}
                  {['Short Answer', 'Essay', 'Coding'].includes(selectedAssessment.questions[currentQuestion].type) && (
                    <textarea
                      value={answers[selectedAssessment.questions[currentQuestion]._id] || ''}
                      onChange={(e) => handleAnswerChange(selectedAssessment.questions[currentQuestion]._id, e.target.value)}
                      rows={selectedAssessment.questions[currentQuestion].type === 'Essay' ? 8 : 4}
                      placeholder={
                        selectedAssessment.questions[currentQuestion].type === 'Coding'
                          ? 'Write your code here...'
                          : 'Type your answer here...'
                      }
                      className={`w-full px-4 py-3 rounded-none border ${isDark 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300 text-gray-800 placeholder-gray-400'} ${
                        selectedAssessment.questions[currentQuestion].type === 'Coding' ? 'font-mono' : ''
                      }`}
                    />
                  )}
                </div>
              )}

              {/* Navigation */}
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
                  disabled={currentQuestion === 0}
                  className={`px-4 py-2 rounded-none font-medium transition-colors ${
                    currentQuestion === 0
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : isDark ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  ← Previous
                </button>

                {/* Question Dots */}
                <div className="flex gap-1 flex-wrap justify-center max-w-md">
                  {selectedAssessment.questions.map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentQuestion(idx)}
                      className={`w-8 h-8 rounded-full text-xs font-medium transition-all ${
                        idx === currentQuestion
                          ? 'bg-purple-500 text-white'
                          : answers[q._id]
                          ? 'bg-green-500 text-white'
                          : isDark ? 'bg-gray-700 text-gray-400' : 'bg-gray-200 text-gray-600'
                      }`}
                    >
                      {idx + 1}
                    </button>
                  ))}
                </div>

                {currentQuestion < selectedAssessment.questions.length - 1 ? (
                  <button
                    onClick={() => setCurrentQuestion(prev => Math.min(selectedAssessment.questions.length - 1, prev + 1))}
                    className={`px-4 py-2 rounded-none font-medium transition-colors ${
                      isDark ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Next →
                  </button>
                ) : (
                  <button
                    onClick={handleSubmitTest}
                    disabled={loading}
                    className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-none font-medium hover:from-purple-600 hover:to-pink-600"
                  >
                    {loading ? 'Submitting...' : 'Submit Test'}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Result Tab */}
          {activeTab === 'result' && result && (
            <div className={`max-w-lg mx-auto text-center p-8 rounded-none ${isDark ? 'bg-gray-750' : 'bg-gray-50'}`}>
              <div className={`w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center ${
                result.passed ? 'bg-green-100' : 'bg-red-100'
              }`}>
                {result.passed ? (
                  <svg className="w-12 h-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ) : (
                  <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
              </div>
              
              <h2 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                {result.passed ? 'Congratulations!' : 'Keep Practicing!'}
              </h2>
              <p className={`mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {result.passed 
                  ? 'You have successfully passed the assessment!' 
                  : 'You did not pass this time, but you can try again.'}
              </p>

              <div className={`p-6 rounded-none mb-6 ${isDark ? 'bg-gray-700' : 'bg-white'}`}>
                <div className="text-5xl font-bold mb-2" style={{
                  background: result.passed 
                    ? 'linear-gradient(to right, #10b981, #34d399)' 
                    : 'linear-gradient(to right, #ef4444, #f87171)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>
                  {result.percentage?.toFixed(1)}%
                </div>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  Score: {result.score} / {result.totalPoints || selectedAssessment?.totalPoints}
                </p>
              </div>

              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => {
                    setTestStarted(false);
                    setSelectedAssessment(null);
                    setActiveTab('browse');
                  }}
                  className={`px-6 py-2 rounded-none font-medium ${isDark 
                    ? 'bg-gray-700 text-white hover:bg-gray-600' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  Back to Tests
                </button>
                <button
                  onClick={onClose}
                  className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-none font-medium hover:from-purple-600 hover:to-pink-600"
                >
                  Done
                </button>
              </div>
            </div>
          )}

          {/* Results History Tab */}
          {activeTab === 'results' && !testStarted && (
            <div className="space-y-4">
              {myResults.length > 0 ? (
                myResults.map(result => (
                  <div
                    key={result._id}
                    className={`p-4 rounded-none border ${isDark ? 'bg-gray-750 border-gray-700' : 'bg-white border-gray-200'}`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                          {result.assessment?.title || 'Assessment'}
                        </h3>
                        <p className={`text-sm ${isDark ? 'zealot-gray-400' : 'text-gray-600'}`}>
                          {result.assessment?.skillCategory}
                        </p>
                        <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'} mt-1`}>
                          Completed: {new Date(result.completedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className={`text-2xl font-bold ${result.passed ? 'text-green-500' : 'text-red-500'}`}>
                          {result.percentage?.toFixed(1)}%
                        </div>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          result.passed 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {result.passed ? 'Passed' : 'Failed'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className={`text-center py-12 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <p className="text-lg font-medium">No results yet</p>
                  <p className="text-sm mt-1">Take an assessment to see your results here</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SkillAssessment;
