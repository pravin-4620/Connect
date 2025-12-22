import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Calendar,
  CalendarDays,
  Clock,
  MapPin,
  Users,
  Plus,
  ChevronLeft,
  ChevronRight,
  X,
  Edit2,
  Trash2,
  Tag,
  Search,
  Grid,
  List,
  Check,
  AlertCircle
} from 'lucide-react';
import apiService from '../services/apiService';
import { useTheme } from '../context/ThemeContext';

const CalendarPanel = ({ 
  isOpen, 
  onClose, 
  user, 
  canManageEvents = false,
  showToast,
  myRegistrations = [],
  onRegisterForEvent
}) => {
  const { isDark } = useTheme();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('calendar'); // 'calendar' or 'list'
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filterType, setFilterType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingEvent, setEditingEvent] = useState(null);

  // Event form state
  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    eventType: 'Workshop',
    date: '',
    time: '',
    endTime: '',
    venue: '',
    mode: 'In-Person',
    category: 'Other',
    organizer: '',
    maxParticipants: '',
    requiresMentorApproval: false
  });

  const eventTypes = ['Workshop', 'Competition', 'Seminar', 'Hackathon', 'Career Fair', 'Webinar', 'Other'];
  const categories = ['Academic', 'Career', 'Technical', 'Cultural', 'Sports', 'Other'];
  const modes = ['In-Person', 'Virtual', 'Hybrid'];

  // Fetch events
  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiService.getEvents();
      if (response.success) {
        setEvents(response.data);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
      showToast?.('❌ Failed to load events');
    }
    setLoading(false);
  }, [showToast]);

  useEffect(() => {
    if (isOpen) {
      fetchEvents();
    }
  }, [isOpen, fetchEvents]);

  // Calendar helper functions
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    return { daysInMonth, startingDayOfWeek, year, month };
  };

  const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentDate);

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                      'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date().toISOString().split('T')[0]);
  };

  // Get events for a specific date
  const getEventsForDate = (day) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter(evt => {
      const evtDate = new Date(evt.date).toISOString().split('T')[0];
      return evtDate === dateStr;
    });
  };

  // Filter and search events
  const filteredEvents = useMemo(() => {
    return events.filter(evt => {
      const matchesType = filterType === 'all' || evt.eventType === filterType || evt.category === filterType;
      const matchesSearch = !searchQuery || 
        evt.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        evt.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        evt.venue?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesType && matchesSearch;
    });
  }, [events, filterType, searchQuery]);

  // Get events for selected date or all upcoming
  const displayEvents = useMemo(() => {
    if (selectedDate) {
      return filteredEvents.filter(evt => {
        const evtDate = new Date(evt.date).toISOString().split('T')[0];
        return evtDate === selectedDate;
      });
    }
    // Show upcoming events
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return filteredEvents
      .filter(evt => new Date(evt.date) >= today)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(0, 10);
  }, [filteredEvents, selectedDate]);

  // Handle event creation
  const handleCreateEvent = async () => {
    if (!eventForm.title || !eventForm.date) {
      showToast?.('❌ Title and date are required');
      return;
    }

    try {
      const payload = {
        ...eventForm,
        maxParticipants: eventForm.maxParticipants ? parseInt(eventForm.maxParticipants) : undefined
      };

      if (editingEvent) {
        const response = await apiService.updateEvent(editingEvent._id, payload);
        if (response.success) {
          showToast?.('✅ Event updated successfully!');
          fetchEvents();
        }
      } else {
        const response = await apiService.createEvent(payload);
        if (response.success) {
          showToast?.('✅ Event created successfully!');
          fetchEvents();
        }
      }
      setShowCreateModal(false);
      resetForm();
    } catch (error) {
      console.error('Error saving event:', error);
      showToast?.('❌ Failed to save event');
    }
  };

  // Handle event deletion
  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;

    try {
      const response = await apiService.deleteEvent(eventId);
      if (response.success) {
        showToast?.('✅ Event deleted');
        fetchEvents();
        setShowEventModal(false);
        setSelectedEvent(null);
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      showToast?.('❌ Failed to delete event');
    }
  };

  // Reset form
  const resetForm = () => {
    setEventForm({
      title: '',
      description: '',
      eventType: 'Workshop',
      date: '',
      time: '',
      endTime: '',
      venue: '',
      mode: 'In-Person',
      category: 'Other',
      organizer: '',
      maxParticipants: '',
      requiresMentorApproval: false
    });
    setEditingEvent(null);
  };

  // Open edit modal
  const openEditModal = (event) => {
    setEditingEvent(event);
    setEventForm({
      title: event.title || '',
      description: event.description || '',
      eventType: event.eventType || 'Workshop',
      date: event.date ? new Date(event.date).toISOString().split('T')[0] : '',
      time: event.time || '',
      endTime: event.endTime || '',
      venue: event.venue || event.location || '',
      mode: event.mode || 'In-Person',
      category: event.category || 'Other',
      organizer: event.organizer || '',
      maxParticipants: event.maxParticipants || '',
      requiresMentorApproval: event.requiresMentorApproval || false
    });
    setShowCreateModal(true);
    setShowEventModal(false);
  };

  // Check if user is registered for event
  const isRegistered = (eventId) => {
    return myRegistrations.some(reg => reg.event?._id === eventId);
  };

  // Get event type color
  const getEventTypeColor = (type) => {
    const colors = {
      'Workshop': isDark ? 'bg-blue-900/50 text-blue-300 border-blue-700' : 'bg-blue-100 text-blue-800 border-blue-200',
      'Competition': isDark ? 'bg-purple-900/50 text-purple-300 border-purple-700' : 'bg-purple-100 text-purple-800 border-purple-200',
      'Seminar': isDark ? 'bg-green-900/50 text-green-300 border-green-700' : 'bg-green-100 text-green-800 border-green-200',
      'Hackathon': isDark ? 'bg-orange-900/50 text-orange-300 border-orange-700' : 'bg-orange-100 text-orange-800 border-orange-200',
      'Career Fair': isDark ? 'bg-pink-900/50 text-pink-300 border-pink-700' : 'bg-pink-100 text-pink-800 border-pink-200',
      'Webinar': isDark ? 'bg-cyan-900/50 text-cyan-300 border-cyan-700' : 'bg-cyan-100 text-cyan-800 border-cyan-200',
      'Other': isDark ? 'bg-gray-700 text-gray-300 border-gray-600' : 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colors[type] || colors['Other'];
  };

  // Theme classes
  const themeClasses = {
    bg: isDark ? 'bg-gray-900' : 'bg-white',
    bgSecondary: isDark ? 'bg-gray-800' : 'bg-gray-50',
    text: isDark ? 'text-gray-100' : 'text-gray-900',
    textMuted: isDark ? 'text-gray-400' : 'text-gray-600',
    textSubtle: isDark ? 'text-gray-500' : 'text-gray-500',
    border: isDark ? 'border-gray-700' : 'border-gray-200',
    hover: isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100',
    input: isDark ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300 text-gray-900',
    button: isDark ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-900 hover:bg-gray-800 text-white',
    buttonSecondary: isDark ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50',
    card: isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200',
    icon: isDark ? 'text-gray-400' : 'text-gray-600',
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className={`${themeClasses.bg} w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden`}>
        {/* Header */}
        <div className={`flex items-center justify-between p-4 border-b ${themeClasses.border} ${themeClasses.bgSecondary}`}>
          <div className="flex items-center space-x-3">
            <Calendar className={`h-6 w-6 ${themeClasses.icon}`} />
            <h2 className={`text-xl font-semibold ${themeClasses.text}`}>Event Calendar</h2>
          </div>
          <div className="flex items-center space-x-3">
            {canManageEvents && (
              <button
                onClick={() => {
                  resetForm();
                  setShowCreateModal(true);
                }}
                className={`flex items-center space-x-2 px-4 py-2 ${themeClasses.button} transition-colors`}
              >
                <Plus className="h-4 w-4" />
                <span>Create Event</span>
              </button>
            )}
            <button
              onClick={onClose}
              className={`p-2 ${themeClasses.hover} transition-colors`}
            >
              <X className={`h-5 w-5 ${themeClasses.icon}`} />
            </button>
          </div>
        </div>

        {/* Toolbar */}
        <div className={`flex flex-wrap items-center justify-between gap-3 p-4 border-b ${themeClasses.border}`}>
          <div className="flex items-center space-x-3">
            {/* View toggle */}
            <div className={`flex border ${themeClasses.border}`}>
              <button
                onClick={() => setViewMode('calendar')}
                className={`px-3 py-1.5 text-sm flex items-center space-x-1 ${viewMode === 'calendar' ? themeClasses.button : `${themeClasses.bg} ${themeClasses.textMuted} ${themeClasses.hover}`}`}
              >
                <Grid className="h-4 w-4" />
                <span>Calendar</span>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1.5 text-sm flex items-center space-x-1 ${viewMode === 'list' ? themeClasses.button : `${themeClasses.bg} ${themeClasses.textMuted} ${themeClasses.hover}`}`}
              >
                <List className="h-4 w-4" />
                <span>List</span>
              </button>
            </div>

            {/* Filter */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className={`border px-3 py-1.5 text-sm ${themeClasses.input}`}
            >
              <option value="all">All Events</option>
              <optgroup label="Event Type">
                {eventTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </optgroup>
              <optgroup label="Category">
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </optgroup>
            </select>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${themeClasses.textSubtle}`} />
            <input
              type="text"
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`pl-9 pr-4 py-1.5 border w-64 text-sm ${themeClasses.input}`}
            />
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-hidden flex">
          {viewMode === 'calendar' ? (
            <>
              {/* Calendar View */}
              <div className="flex-1 p-4 overflow-auto">
                {/* Month Navigation */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => navigateMonth(-1)}
                      className={`p-2 ${themeClasses.hover} transition-colors`}
                    >
                      <ChevronLeft className={`h-5 w-5 ${themeClasses.icon}`} />
                    </button>
                    <h3 className={`text-lg font-semibold ${themeClasses.text} min-w-[200px] text-center`}>
                      {monthNames[month]} {year}
                    </h3>
                    <button
                      onClick={() => navigateMonth(1)}
                      className={`p-2 ${themeClasses.hover} transition-colors`}
                    >
                      <ChevronRight className={`h-5 w-5 ${themeClasses.icon}`} />
                    </button>
                  </div>
                  <button
                    onClick={goToToday}
                    className={`px-3 py-1.5 text-sm border ${themeClasses.buttonSecondary}`}
                  >
                    Today
                  </button>
                </div>

                {/* Calendar Grid */}
                <div className={`border ${themeClasses.border}`}>
                  {/* Day Headers */}
                  <div className={`grid grid-cols-7 ${themeClasses.bgSecondary} border-b ${themeClasses.border}`}>
                    {dayNames.map(day => (
                      <div key={day} className={`p-2 text-center text-sm font-medium ${themeClasses.textMuted}`}>
                        {day}
                      </div>
                    ))}
                  </div>

                  {/* Calendar Days */}
                  <div className="grid grid-cols-7">
                    {/* Empty cells for days before month starts */}
                    {Array.from({ length: startingDayOfWeek }).map((_, idx) => (
                      <div key={`empty-${idx}`} className={`p-2 min-h-[80px] ${themeClasses.bgSecondary} border-b border-r ${themeClasses.border}`} />
                    ))}

                    {/* Days of the month */}
                    {Array.from({ length: daysInMonth }).map((_, idx) => {
                      const day = idx + 1;
                      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                      const dayEvents = getEventsForDate(day);
                      const isToday = new Date().toISOString().split('T')[0] === dateStr;
                      const isSelected = selectedDate === dateStr;

                      return (
                        <div
                          key={day}
                          onClick={() => setSelectedDate(dateStr)}
                          className={`p-2 min-h-[80px] border-b border-r ${themeClasses.border} cursor-pointer transition-colors
                            ${isToday ? (isDark ? 'bg-blue-900/30' : 'bg-blue-50') : ''}
                            ${isSelected ? `${isDark ? 'bg-gray-700' : 'bg-gray-100'} ring-2 ring-inset ${isDark ? 'ring-gray-500' : 'ring-gray-900'}` : themeClasses.hover}`}
                        >
                          <div className={`text-sm font-medium mb-1 ${isToday ? 'text-blue-500' : themeClasses.text}`}>
                            {day}
                          </div>
                          <div className="space-y-1">
                            {dayEvents.slice(0, 2).map((evt, eIdx) => (
                              <div
                                key={evt._id || eIdx}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedEvent(evt);
                                  setShowEventModal(true);
                                }}
                                className={`text-xs px-1 py-0.5 truncate cursor-pointer hover:opacity-80 ${getEventTypeColor(evt.eventType)}`}
                              >
                                {evt.title}
                              </div>
                            ))}
                            {dayEvents.length > 2 && (
                              <div className={`text-xs ${themeClasses.textSubtle} px-1`}>
                                +{dayEvents.length - 2} more
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Events Sidebar */}
              <div className={`w-80 border-l ${themeClasses.border} ${themeClasses.bgSecondary} flex flex-col`}>
                <div className={`p-4 border-b ${themeClasses.border}`}>
                  <h3 className={`font-semibold ${themeClasses.text}`}>
                    {selectedDate 
                      ? `Events on ${new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}`
                      : 'Upcoming Events'}
                  </h3>
                  {selectedDate && (
                    <button
                      onClick={() => setSelectedDate(null)}
                      className="text-sm text-blue-500 hover:text-blue-400 mt-1"
                    >
                      Show all upcoming
                    </button>
                  )}
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {loading ? (
                    <div className={`text-center py-8 ${themeClasses.textMuted}`}>Loading events...</div>
                  ) : displayEvents.length === 0 ? (
                    <div className={`text-center py-8 ${themeClasses.textMuted}`}>
                      <CalendarDays className={`h-12 w-12 mx-auto mb-3 ${themeClasses.textSubtle}`} />
                      <p>No events found</p>
                    </div>
                  ) : (
                    displayEvents.map((evt, idx) => (
                      <div
                        key={evt._id || idx}
                        onClick={() => {
                          setSelectedEvent(evt);
                          setShowEventModal(true);
                        }}
                        className={`${themeClasses.card} border p-3 cursor-pointer hover:border-gray-400 transition-colors`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className={`font-medium ${themeClasses.text} text-sm`}>{evt.title}</h4>
                          <span className={`text-xs px-1.5 py-0.5 ${getEventTypeColor(evt.eventType)}`}>
                            {evt.eventType}
                          </span>
                        </div>
                        <div className={`space-y-1 text-xs ${themeClasses.textMuted}`}>
                          <div className="flex items-center space-x-1">
                            <CalendarDays className="h-3 w-3" />
                            <span>{new Date(evt.date).toLocaleDateString()}</span>
                          </div>
                          {evt.time && (
                            <div className="flex items-center space-x-1">
                              <Clock className="h-3 w-3" />
                              <span>{evt.time}{evt.endTime ? ` - ${evt.endTime}` : ''}</span>
                            </div>
                          )}
                          {(evt.venue || evt.location) && (
                            <div className="flex items-center space-x-1">
                              <MapPin className="h-3 w-3" />
                              <span className="truncate">{evt.venue || evt.location}</span>
                            </div>
                          )}
                        </div>
                        {isRegistered(evt._id) && (
                          <div className="mt-2 flex items-center space-x-1 text-green-500 text-xs">
                            <Check className="h-3 w-3" />
                            <span>Registered</span>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          ) : (
            /* List View */
            <div className="flex-1 overflow-auto p-4">
              {loading ? (
                <div className={`text-center py-12 ${themeClasses.textMuted}`}>Loading events...</div>
              ) : filteredEvents.length === 0 ? (
                <div className={`text-center py-12 ${themeClasses.textMuted}`}>
                  <CalendarDays className={`h-16 w-16 mx-auto mb-4 ${themeClasses.textSubtle}`} />
                  <p>No events found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredEvents
                    .sort((a, b) => new Date(a.date) - new Date(b.date))
                    .map((evt, idx) => {
                      const eventDate = new Date(evt.date);
                      const isPast = eventDate < new Date();
                      
                      return (
                        <div
                          key={evt._id || idx}
                          onClick={() => {
                            setSelectedEvent(evt);
                            setShowEventModal(true);
                          }}
                          className={`${themeClasses.card} border p-4 cursor-pointer hover:border-gray-400 transition-colors ${isPast ? 'opacity-60' : ''}`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <h3 className={`font-semibold ${themeClasses.text}`}>{evt.title}</h3>
                                <span className={`text-xs px-2 py-0.5 ${getEventTypeColor(evt.eventType)}`}>
                                  {evt.eventType}
                                </span>
                                {evt.category && (
                                  <span className={`text-xs px-2 py-0.5 ${isDark ? 'bg-gray-700 text-gray-300 border-gray-600' : 'bg-gray-100 text-gray-700 border-gray-200'} border`}>
                                    {evt.category}
                                  </span>
                                )}
                                {isPast && (
                                  <span className={`text-xs px-2 py-0.5 ${isDark ? 'bg-gray-700 text-gray-400' : 'bg-gray-200 text-gray-600'}`}>
                                    Past
                                  </span>
                                )}
                              </div>
                              {evt.description && (
                                <p className={`text-sm ${themeClasses.textMuted} mb-3 line-clamp-2`}>{evt.description}</p>
                              )}
                              <div className={`flex flex-wrap items-center gap-4 text-sm ${themeClasses.textMuted}`}>
                                <div className="flex items-center space-x-1">
                                  <CalendarDays className="h-4 w-4" />
                                  <span>{eventDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                </div>
                                {evt.time && (
                                  <div className="flex items-center space-x-1">
                                    <Clock className="h-4 w-4" />
                                    <span>{evt.time}{evt.endTime ? ` - ${evt.endTime}` : ''}</span>
                                  </div>
                                )}
                                {(evt.venue || evt.location) && (
                                  <div className="flex items-center space-x-1">
                                    <MapPin className="h-4 w-4" />
                                    <span>{evt.venue || evt.location}</span>
                                  </div>
                                )}
                                {evt.mode && (
                                  <div className="flex items-center space-x-1">
                                    <Tag className="h-4 w-4" />
                                    <span>{evt.mode}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex flex-col items-end space-y-2">
                              {canManageEvents && (
                                <div className="flex space-x-2">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      openEditModal(evt);
                                    }}
                                    className={`p-1.5 ${themeClasses.hover} transition-colors`}
                                  >
                                    <Edit2 className={`h-4 w-4 ${themeClasses.icon}`} />
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteEvent(evt._id);
                                    }}
                                    className={`p-1.5 ${isDark ? 'hover:bg-red-900/30' : 'hover:bg-red-50'} transition-colors`}
                                  >
                                    <Trash2 className="h-4 w-4 text-red-500" />
                                  </button>
                                </div>
                              )}
                              {isRegistered(evt._id) && (
                                <span className="flex items-center space-x-1 text-green-500 text-sm">
                                  <Check className="h-4 w-4" />
                                  <span>Registered</span>
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Event Detail Modal */}
      {showEventModal && selectedEvent && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
          <div className={`${themeClasses.bg} w-full max-w-lg max-h-[80vh] overflow-y-auto`}>
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className={`text-xl font-semibold ${themeClasses.text}`}>{selectedEvent.title}</h3>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className={`text-xs px-2 py-0.5 ${getEventTypeColor(selectedEvent.eventType)}`}>
                      {selectedEvent.eventType}
                    </span>
                    {selectedEvent.category && (
                      <span className={`text-xs px-2 py-0.5 ${isDark ? 'bg-gray-700 text-gray-300 border-gray-600' : 'bg-gray-100 text-gray-700 border-gray-200'} border`}>
                        {selectedEvent.category}
                      </span>
                    )}
                    {selectedEvent.status && (
                      <span className={`text-xs px-2 py-0.5 ${isDark ? 'bg-gray-700 text-gray-300 border-gray-600' : 'bg-gray-100 text-gray-700 border-gray-200'} border`}>
                        {selectedEvent.status}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowEventModal(false);
                    setSelectedEvent(null);
                  }}
                  className={`p-1 ${themeClasses.hover}`}
                >
                  <X className={`h-5 w-5 ${themeClasses.icon}`} />
                </button>
              </div>

              {selectedEvent.description && (
                <p className={`${themeClasses.textMuted} mb-4`}>{selectedEvent.description}</p>
              )}

              <div className="space-y-3 mb-6">
                <div className={`flex items-center space-x-3 ${themeClasses.textMuted}`}>
                  <CalendarDays className={`h-5 w-5 ${themeClasses.textSubtle}`} />
                  <span>{new Date(selectedEvent.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</span>
                </div>
                {selectedEvent.time && (
                  <div className={`flex items-center space-x-3 ${themeClasses.textMuted}`}>
                    <Clock className={`h-5 w-5 ${themeClasses.textSubtle}`} />
                    <span>{selectedEvent.time}{selectedEvent.endTime ? ` - ${selectedEvent.endTime}` : ''}</span>
                  </div>
                )}
                {(selectedEvent.venue || selectedEvent.location) && (
                  <div className={`flex items-center space-x-3 ${themeClasses.textMuted}`}>
                    <MapPin className={`h-5 w-5 ${themeClasses.textSubtle}`} />
                    <span>{selectedEvent.venue || selectedEvent.location}</span>
                  </div>
                )}
                {selectedEvent.mode && (
                  <div className={`flex items-center space-x-3 ${themeClasses.textMuted}`}>
                    <Tag className={`h-5 w-5 ${themeClasses.textSubtle}`} />
                    <span>{selectedEvent.mode}</span>
                  </div>
                )}
                {selectedEvent.organizer && (
                  <div className={`flex items-center space-x-3 ${themeClasses.textMuted}`}>
                    <Users className={`h-5 w-5 ${themeClasses.textSubtle}`} />
                    <span>Organized by: {selectedEvent.organizer}</span>
                  </div>
                )}
                {selectedEvent.maxParticipants && (
                  <div className={`flex items-center space-x-3 ${themeClasses.textMuted}`}>
                    <Users className={`h-5 w-5 ${themeClasses.textSubtle}`} />
                    <span>Max participants: {selectedEvent.maxParticipants} ({selectedEvent.registeredCount || 0} registered)</span>
                  </div>
                )}
                {selectedEvent.requiresMentorApproval && (
                  <div className={`flex items-center space-x-2 text-amber-500 ${isDark ? 'bg-amber-900/30 border-amber-700' : 'bg-amber-50 border-amber-200'} px-3 py-2 border`}>
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm">Requires mentor approval</span>
                  </div>
                )}
              </div>

              <div className={`flex items-center justify-between pt-4 border-t ${themeClasses.border}`}>
                {canManageEvents ? (
                  <div className="flex space-x-3">
                    <button
                      onClick={() => openEditModal(selectedEvent)}
                      className={`flex items-center space-x-2 px-4 py-2 border ${themeClasses.buttonSecondary}`}
                    >
                      <Edit2 className="h-4 w-4" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDeleteEvent(selectedEvent._id)}
                      className={`flex items-center space-x-2 px-4 py-2 border ${isDark ? 'border-red-700 text-red-400 hover:bg-red-900/30' : 'border-red-300 text-red-600 hover:bg-red-50'}`}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>Delete</span>
                    </button>
                  </div>
                ) : (
                  <div />
                )}
                
                {!canManageEvents && onRegisterForEvent && !isRegistered(selectedEvent._id) && (
                  <button
                    onClick={() => {
                      onRegisterForEvent(selectedEvent);
                      setShowEventModal(false);
                    }}
                    className={`px-6 py-2 ${themeClasses.button}`}
                  >
                    Register for Event
                  </button>
                )}
                {isRegistered(selectedEvent._id) && (
                  <span className={`flex items-center space-x-2 text-green-500 ${isDark ? 'bg-green-900/30 border-green-700' : 'bg-green-50 border-green-200'} px-4 py-2 border`}>
                    <Check className="h-4 w-4" />
                    <span>You are registered</span>
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Event Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
          <div className={`${themeClasses.bg} w-full max-w-2xl max-h-[85vh] overflow-y-auto`}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className={`text-xl font-semibold ${themeClasses.text}`}>
                  {editingEvent ? 'Edit Event' : 'Create New Event'}
                </h3>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    resetForm();
                  }}
                  className={`p-1 ${themeClasses.hover}`}
                >
                  <X className={`h-5 w-5 ${themeClasses.icon}`} />
                </button>
              </div>

              <div className="space-y-4">
                {/* Title */}
                <div>
                  <label className={`block text-sm font-medium ${themeClasses.textMuted} mb-1`}>
                    Event Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={eventForm.title}
                    onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                    className={`w-full border px-3 py-2 ${themeClasses.input}`}
                    placeholder="Enter event title"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className={`block text-sm font-medium ${themeClasses.textMuted} mb-1`}>Description</label>
                  <textarea
                    value={eventForm.description}
                    onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                    className={`w-full border px-3 py-2 ${themeClasses.input}`}
                    rows="3"
                    placeholder="Event description"
                  />
                </div>

                {/* Type and Category */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium ${themeClasses.textMuted} mb-1`}>Event Type</label>
                    <select
                      value={eventForm.eventType}
                      onChange={(e) => setEventForm({ ...eventForm, eventType: e.target.value })}
                      className={`w-full border px-3 py-2 ${themeClasses.input}`}
                    >
                      {eventTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${themeClasses.textMuted} mb-1`}>Category</label>
                    <select
                      value={eventForm.category}
                      onChange={(e) => setEventForm({ ...eventForm, category: e.target.value })}
                      className={`w-full border px-3 py-2 ${themeClasses.input}`}
                    >
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Date and Time */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className={`block text-sm font-medium ${themeClasses.textMuted} mb-1`}>
                      Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={eventForm.date}
                      onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
                      className={`w-full border px-3 py-2 ${themeClasses.input}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${themeClasses.textMuted} mb-1`}>Start Time</label>
                    <input
                      type="time"
                      value={eventForm.time}
                      onChange={(e) => setEventForm({ ...eventForm, time: e.target.value })}
                      className={`w-full border px-3 py-2 ${themeClasses.input}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${themeClasses.textMuted} mb-1`}>End Time</label>
                    <input
                      type="time"
                      value={eventForm.endTime}
                      onChange={(e) => setEventForm({ ...eventForm, endTime: e.target.value })}
                      className={`w-full border px-3 py-2 ${themeClasses.input}`}
                    />
                  </div>
                </div>

                {/* Venue and Mode */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium ${themeClasses.textMuted} mb-1`}>Venue/Location</label>
                    <input
                      type="text"
                      value={eventForm.venue}
                      onChange={(e) => setEventForm({ ...eventForm, venue: e.target.value })}
                      className={`w-full border px-3 py-2 ${themeClasses.input}`}
                      placeholder="e.g., Main Auditorium"
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${themeClasses.textMuted} mb-1`}>Mode</label>
                    <select
                      value={eventForm.mode}
                      onChange={(e) => setEventForm({ ...eventForm, mode: e.target.value })}
                      className={`w-full border px-3 py-2 ${themeClasses.input}`}
                    >
                      {modes.map(mode => (
                        <option key={mode} value={mode}>{mode}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Organizer and Max Participants */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium ${themeClasses.textMuted} mb-1`}>Organizer</label>
                    <input
                      type="text"
                      value={eventForm.organizer}
                      onChange={(e) => setEventForm({ ...eventForm, organizer: e.target.value })}
                      className={`w-full border px-3 py-2 ${themeClasses.input}`}
                      placeholder="e.g., Tech Club"
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${themeClasses.textMuted} mb-1`}>Max Participants</label>
                    <input
                      type="number"
                      value={eventForm.maxParticipants}
                      onChange={(e) => setEventForm({ ...eventForm, maxParticipants: e.target.value })}
                      className={`w-full border px-3 py-2 ${themeClasses.input}`}
                      placeholder="Leave empty for unlimited"
                    />
                  </div>
                </div>

                {/* Requires Mentor Approval */}
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="mentorApproval"
                    checked={eventForm.requiresMentorApproval}
                    onChange={(e) => setEventForm({ ...eventForm, requiresMentorApproval: e.target.checked })}
                    className={`h-4 w-4 ${themeClasses.border}`}
                  />
                  <label htmlFor="mentorApproval" className={`text-sm ${themeClasses.textMuted}`}>
                    Require mentor approval for student registration
                  </label>
                </div>
              </div>

              <div className={`flex justify-end space-x-3 mt-6 pt-4 border-t ${themeClasses.border}`}>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    resetForm();
                  }}
                  className={`px-4 py-2 border ${themeClasses.buttonSecondary}`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateEvent}
                  className={`px-6 py-2 ${themeClasses.button}`}
                >
                  {editingEvent ? 'Update Event' : 'Create Event'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarPanel;
