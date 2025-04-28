import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Mic, 
  MicOff, 
  X, 
  Loader2, 
  HelpCircle, 
  Activity,
  Navigation as NavIcon,
  Database,
  Settings,
  Command
} from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';
import { useAuth } from '@/auth/AuthProvider';
import '../styles/animations.css';

interface Command {
  keywords: string[];
  action: (params?: string) => void;
  description: string;
  category: 'navigation' | 'data' | 'action' | 'system';
  contextRequired?: boolean;
}

interface FitnessData {
  steps: number;
  calories: number;
  activeMinutes: number;
  distance: number;
  date: string;
}

interface AICommandResponse {
  command: string;
  action: string;
  parameters?: Record<string, any>;
  confidence: number;
}

interface CommandPattern {
  patterns: RegExp[];
  action: string;
  parameters?: Record<string, any>;
  contextRequired?: boolean;
  confidence: number;
}

interface Intent {
  type: 'navigation' | 'query' | 'action' | 'system';
  confidence: number;
  entities: Record<string, string>;
}

interface PageContext {
  path: string;
  keywords: string[];
  synonyms: string[];
  contextualHints: string[];
  description: string;
}

interface SemanticContext {
  intent: string;
  entities: Record<string, any>;
  confidence: number;
  context: Record<string, any>;
}

// Define available routes and their metadata
const AVAILABLE_ROUTES = {
  '/': {
    path: '/',
    name: 'Dashboard',
    aliases: ['home', 'dashboard', 'main', 'start', 'homepage'],
    description: 'Main dashboard with overview of all features'
  },
  '/health-tracker': {
    path: '/health-tracker',
    name: 'Health Tracker',
    aliases: ['health', 'fitness', 'tracking', 'metrics', 'health tracker', 'fitness data'],
    description: 'Health and fitness tracking dashboard'
  },
  '/appointments': {
    path: '/appointments',
    name: 'Appointments',
    aliases: ['appointments', 'schedule', 'booking', 'consultation', 'book appointment', 'doctor appointment'],
    description: 'Book and manage appointments'
  },
  '/preventive-health': {
    path: '/preventive-health',
    name: 'Preventive Health',
    aliases: ['preventive', 'prevention', 'health prevention', 'preventive care', 'preventive health'],
    description: 'Preventive health information and recommendations'
  },
  '/insurance': {
    path: '/insurance',
    name: 'Insurance',
    aliases: ['insurance', 'coverage', 'health insurance', 'medical insurance'],
    description: 'Insurance coverage and plans'
  },
  '/symptoms': {
    path: '/symptoms',
    name: 'Symptoms',
    aliases: ['symptoms', 'symptom checker', 'health symptoms', 'check symptoms'],
    description: 'Check and track symptoms'
  },
  '/bmi': {
    path: '/bmi',
    name: 'BMI Index',
    aliases: ['bmi', 'body mass index', 'weight index', 'bmi calculator'],
    description: 'BMI calculator and tracking'
  },
  '/medicine': {
    path: '/medicine',
    name: 'Medicine',
    aliases: ['medicine', 'medications', 'prescriptions', 'drugs', 'pharmacy'],
    description: 'Medicine and prescription management'
  },
  '/ai-doctor': {
    path: '/ai-doctor',
    name: 'AI Doctor',
    aliases: ['ai doctor', 'virtual doctor', 'ai consultation', 'ai health assistant'],
    description: 'AI-powered health consultation'
  },
  '/chat': {
    path: '/chat',
    name: 'Chat with Doctor',
    aliases: ['chat', 'doctor chat', 'message doctor', 'chat with doctor', 'doctor consultation'],
    description: 'Chat with a healthcare professional'
  }
} as const;

type AvailableRoute = keyof typeof AVAILABLE_ROUTES;

// Helper function to validate routes
const isValidRoute = (path: string): path is AvailableRoute => {
  return path in AVAILABLE_ROUTES;
};

const VoiceNavigation: React.FC = () => {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [showHelp, setShowHelp] = useState(false);
  const [isSupported, setIsSupported] = useState<boolean | null>(null);
  const [fitnessData, setFitnessData] = useState<FitnessData | null>(null);
  const [lastCommand, setLastCommand] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('overview');
  
  const recognitionRef = useRef<any>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { currentUser, userType } = useAuth();

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  // Add new state for visualization
  const [visualizerData, setVisualizerData] = useState<number[]>(Array(10).fill(0.2));
  const visualizerInterval = useRef<NodeJS.Timeout | null>(null);

  // Add new state for button press
  const [isButtonPressed, setIsButtonPressed] = useState(false);
  const buttonPressTimer = useRef<NodeJS.Timeout | null>(null);
  const longPressDelay = 300; // ms to consider a press as a long press

  // Add semantic analysis state
  const [semanticContext, setSemanticContext] = useState<SemanticContext | null>(null);
  const conversationHistory = useRef<string[]>([]);

  // Enhanced page context mapping
  const pageContexts: PageContext[] = [
    {
      path: '/health-tracker',
      keywords: ['health', 'fitness', 'workout', 'exercise', 'activity', 'wellness'],
      synonyms: ['wellbeing', 'shape', 'condition', 'training', 'gym'],
      contextualHints: ['track', 'monitor', 'check', 'see', 'view', 'look at', 'show'],
      description: 'health and fitness tracking dashboard'
    },
    {
      path: '/preventive-health',
      keywords: ['preventive', 'prevention', 'health prevention', 'preventive care', 'preventive health'],
      synonyms: ['wellbeing', 'shape', 'condition', 'training', 'gym'],
      contextualHints: ['track', 'monitor', 'check', 'see', 'view', 'look at', 'show'],
      description: 'preventive health information and recommendations'
    },
    {
      path: '/appointments',
      keywords: ['appointment', 'schedule', 'booking', 'consultation', 'visit'],
      synonyms: ['meeting', 'session', 'reservation', 'slot', 'timing'],
      contextualHints: ['book', 'schedule', 'check', 'view', 'see', 'manage'],
      description: 'appointment scheduling and management'
    },
    {
      path: '/',
      keywords: ['home', 'dashboard', 'main', 'start'],
      synonyms: ['front', 'landing', 'beginning', 'overview'],
      contextualHints: ['go back', 'return', 'start over', 'main'],
      description: 'main dashboard'
    }
  ];

  // Listen for tab changes
  useEffect(() => {
    const handleTabChange = (event: CustomEvent) => {
      setActiveTab(event.detail);
    };

    window.addEventListener('switchGoogleFitTab', handleTabChange as EventListener);

    return () => {
      window.removeEventListener('switchGoogleFitTab', handleTabChange as EventListener);
    };
  }, []);

  // Fetch latest fitness data
  const fetchLatestFitnessData = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/fitness-data/latest`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      setFitnessData(response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching fitness data:', error);
      return null;
    }
  };

  // Enhanced natural language processing patterns
  const nlpPatterns = useCallback((): CommandPattern[] => [
    // Navigation patterns
    {
      patterns: [
        /(?:go|navigate|take me|show|open)?\s*(?:to|the)?\s*(?:main|home|front)?\s*dashboard/i,
        /(?:back|return)\s*(?:to)?\s*(?:the)?\s*(?:main|home|front)?\s*page/i
      ],
      action: 'navigate',
      parameters: { path: '/' },
      confidence: 0.9
    },
    {
      patterns: [
        /(?:go|navigate|take me|show|open)?\s*(?:to|the)?\s*(?:my)?\s*health(?:\s*tracker|\s*dashboard)?/i,
        /(?:show|check|view|open)\s*(?:my)?\s*(?:health|fitness)\s*(?:stats|data|information)?/i
      ],
      action: 'navigate',
      parameters: { path: '/health-tracker' },
      confidence: 0.9
    },
    {
      patterns: [
        /(?:go|navigate|take me|show|open)?\s*(?:to|the)?\s*(?:my)?\s*profile/i,
        /(?:show|view|open)\s*(?:my)?\s*(?:account|profile)\s*(?:settings|info|page)?/i
      ],
      action: 'navigate',
      parameters: { path: '/preventive-health' },
      confidence: 0.9
    },
    {
      patterns: [
        /(?:go|navigate|take me|show|open)?\s*(?:to|the)?\s*(?:my)?\s*appointments/i,
        /(?:show|view|check)\s*(?:my)?\s*(?:scheduled)?\s*(?:appointments|bookings|schedule)/i
      ],
      action: 'navigate',
      parameters: { path: '/appointments' },
      confidence: 0.9
    },
    // Data query patterns
    {
      patterns: [
        /(?:how many|what(?:'s| is) my|tell me|show|check)\s*(?:my)?\s*(?:total)?\s*steps?(?:\s*count|\s*today|\s*so far)?/i,
        /(?:have I|did I)?\s*(?:walk|take|do)\s*(?:enough)?\s*steps?(?:\s*today)?/i
      ],
      action: 'queryData',
      parameters: { dataType: 'steps' },
      confidence: 0.85
    },
    {
      patterns: [
        /(?:how many|what(?:'s| is) my|tell me|show|check)\s*(?:my)?\s*(?:total)?\s*calories?(?:\s*burned|\s*today)?/i,
        /(?:have I|did I)?\s*burn(?:ed)?\s*(?:enough)?\s*calories?(?:\s*today)?/i
      ],
      action: 'queryData',
      parameters: { dataType: 'calories' },
      confidence: 0.85
    },
    {
      patterns: [
        /(?:how|what(?:'s| is) my|tell me|show|check)\s*(?:long|much time|active time|duration)\s*(?:was I|have I been|am I)\s*active(?:\s*today)?/i,
        /(?:show|tell me|check)\s*(?:my)?\s*(?:activity|active)\s*(?:time|duration|minutes)(?:\s*today)?/i
      ],
      action: 'queryData',
      parameters: { dataType: 'activeMinutes' },
      confidence: 0.85
    },
    // Tab switching patterns
    {
      patterns: [
        /(?:show|display|view|open)\s*(?:the|my)?\s*(?:fitness)?\s*(?:analytics|charts|graphs|statistics)/i,
        /(?:switch|change)\s*(?:to)?\s*(?:the)?\s*(?:charts?|analytics)\s*(?:view|tab)?/i
      ],
      action: 'switchTab',
      parameters: { tab: 'charts' },
      contextRequired: true,
      confidence: 0.8
    },
    {
      patterns: [
        /(?:show|display|view|open)\s*(?:the|my)?\s*(?:fitness)?\s*(?:overview|summary)/i,
        /(?:switch|change)\s*(?:to)?\s*(?:the)?\s*(?:overview|summary)\s*(?:view|tab)?/i
      ],
      action: 'switchTab',
      parameters: { tab: 'overview' },
      contextRequired: true,
      confidence: 0.8
    },
    // System commands
    {
      patterns: [
        /(?:show|tell me|what are|list)\s*(?:the|available)?\s*commands?/i,
        /(?:what|how)\s*(?:can I|should I)\s*(?:say|do|ask)/i,
        /help(?:\s*me)?/i
      ],
      action: 'system',
      parameters: { command: 'help' },
      confidence: 0.95
    },
    {
      patterns: [
        /(?:go|take me|navigate)\s*back/i,
        /(?:return|back)\s*(?:to)?\s*(?:the)?\s*(?:previous|last)\s*page/i
      ],
      action: 'system',
      parameters: { command: 'back' },
      confidence: 0.9
    }
  ], []);

  const classifyIntent = (text: string): Intent => {
    // Normalize text
    const normalizedText = text.toLowerCase().trim();
    const words = normalizedText.split(/\s+/);
    
    // Common words for different intents
    const navigationWords = ['go', 'take', 'show', 'open', 'navigate', 'view', 'see', 'display'];
    const queryWords = ['how', 'what', 'tell', 'check', 'get', 'find', 'show'];
    const actionWords = ['switch', 'change', 'update', 'set', 'turn', 'enable', 'disable'];
    const systemWords = ['help', 'back', 'return', 'close', 'exit'];

    // Extract potential entities
    const entities: Record<string, string> = {};
    
    // Look for page/section references
    if (normalizedText.includes('dashboard') || normalizedText.includes('home')) {
      entities.page = '/';
    } else if (normalizedText.includes('health-tracker') || normalizedText.includes('health')) {
      entities.page = '/health-tracker';
    } else if (normalizedText.includes('preventive-health') || normalizedText.includes('profile')) {
      entities.page = '/preventive-health';
    } else if (normalizedText.includes('appointments') || normalizedText.includes('schedule')) {
      entities.page = '/appointments';
    }

    // Look for data types
    if (normalizedText.includes('step')) {
      entities.dataType = 'steps';
    } else if (normalizedText.includes('calorie')) {
      entities.dataType = 'calories';
    } else if (normalizedText.includes('active') || normalizedText.includes('activity')) {
      entities.dataType = 'activeMinutes';
    } else if (normalizedText.includes('distance') || normalizedText.includes('walked')) {
      entities.dataType = 'distance';
    }

    // Look for view types
    if (normalizedText.includes('chart') || normalizedText.includes('graph') || normalizedText.includes('analytics')) {
      entities.view = 'charts';
    } else if (normalizedText.includes('overview') || normalizedText.includes('summary')) {
      entities.view = 'overview';
    }

    // Calculate intent scores
    let scores = {
      navigation: 0,
      query: 0,
      action: 0,
      system: 0
    };

    // Score based on intent words
    words.forEach(word => {
      if (navigationWords.includes(word)) scores.navigation += 0.3;
      if (queryWords.includes(word)) scores.query += 0.3;
      if (actionWords.includes(word)) scores.action += 0.3;
      if (systemWords.includes(word)) scores.system += 0.3;
    });

    // Score based on entities
    if (entities.page) scores.navigation += 0.4;
    if (entities.dataType) scores.query += 0.4;
    if (entities.view) scores.action += 0.4;

    // Get the highest scoring intent
    const intentScores = Object.entries(scores);
    intentScores.sort(([, a], [, b]) => b - a);
    const [topIntent, topScore] = intentScores[0];

    return {
      type: topIntent as Intent['type'],
      confidence: topScore,
      entities
    };
  };

  const analyzeNavigationIntent = (text: string): { path: string; confidence: number } | null => {
    const normalizedText = text.toLowerCase().trim();
    const words = normalizedText.split(/\s+/);
    
    // Score each page based on matching keywords and context
    const pageScores = pageContexts.map(page => {
      let score = 0;
      
      // Check for exact keyword matches
      page.keywords.forEach(keyword => {
        if (normalizedText.includes(keyword)) score += 0.4;
      });

      // Check for synonym matches
      page.synonyms.forEach(synonym => {
        if (normalizedText.includes(synonym)) score += 0.3;
      });

      // Check for contextual hints
      page.contextualHints.forEach(hint => {
        if (normalizedText.includes(hint)) score += 0.2;
      });

      // Check for semantic similarity using word proximity
      let proximityScore = 0;
      words.forEach((word, index) => {
        // Check if this word is a keyword or synonym
        const isRelevant = [...page.keywords, ...page.synonyms].some(k => k.includes(word));
        if (isRelevant) {
          // Look at surrounding words for contextual hints
          const context = words.slice(Math.max(0, index - 2), index + 3);
          page.contextualHints.forEach(hint => {
            if (context.some(w => hint.includes(w))) proximityScore += 0.1;
          });
        }
      });
      score += proximityScore;

      // Boost score based on current context
      if (location.pathname === page.path) {
        score *= 0.8; // Reduce likelihood of navigating to current page
      }

      // Boost score for navigation-indicating phrases
      const navigationPhrases = [
        'take me to', 'go to', 'navigate to', 'show me', 'open', 'want to see',
        'looking for', 'need to check', 'can you show', 'where is'
      ];
      navigationPhrases.forEach(phrase => {
        if (normalizedText.includes(phrase)) score += 0.2;
      });

      return { path: page.path, score };
    });

    // Get the highest scoring page
    pageScores.sort((a, b) => b.score - a.score);
    const bestMatch = pageScores[0];

    // Return the result if confidence is high enough
    return bestMatch.score > 0.3 ? { path: bestMatch.path, confidence: bestMatch.score } : null;
  };

  const processSemanticCommand = (text: string): SemanticContext => {
    // Normalize and clean the input
    const normalizedText = text.toLowerCase().trim();
    
    // Extract semantic meaning
    const semanticPatterns = {
      navigation: [
        { pattern: /(take|bring|show|go|navigate|move|head|direct).*?(to|into|towards|at)/i, weight: 0.8 },
        { pattern: /(open|access|visit|view|see|check|find)/i, weight: 0.6 },
        { pattern: /(where|location|page|screen|section)/i, weight: 0.5 },
        { pattern: /(back|return|previous|last)/i, weight: 0.7 }
      ],
      query: [
        { pattern: /(how|what|when|tell|show|display).*(many|much|long|status|progress)/i, weight: 0.8 },
        { pattern: /(check|see|view|get|fetch|find).*(data|info|stats|numbers|metrics)/i, weight: 0.7 },
        { pattern: /(my|current|today|now|latest).*(steps|calories|activity|distance)/i, weight: 0.9 }
      ],
      action: [
        { pattern: /(switch|change|toggle|flip|move).*(to|between|into)/i, weight: 0.8 },
        { pattern: /(show|display|view).*(chart|graph|analytics|overview|summary)/i, weight: 0.7 },
        { pattern: /(update|modify|edit|set|adjust)/i, weight: 0.6 }
      ],
      system: [
        { pattern: /(help|assist|guide|support|explain)/i, weight: 0.9 },
        { pattern: /(close|exit|quit|end|stop)/i, weight: 0.8 },
        { pattern: /(settings|preferences|options|config)/i, weight: 0.7 }
      ]
    };

    // Calculate intent scores
    const intentScores = Object.entries(semanticPatterns).map(([intent, patterns]) => {
      let score = 0;
      patterns.forEach(({ pattern, weight }) => {
        if (pattern.test(normalizedText)) {
          score += weight;
        }
      });
      return { intent, score };
    });

    // Find primary intent
    intentScores.sort((a, b) => b.score - a.score);
    const primaryIntent = intentScores[0];

    // Extract entities based on intent
    const entities: Record<string, any> = {};
    
    // Location entities
    const locationMatch = normalizedText.match(/(to|at|in|on)\s+(?:the\s+)?([a-z\s]+?)(?:\s+(?:page|screen|section|dashboard))?(?:\s+|$)/i);
    if (locationMatch) {
      entities.location = locationMatch[2].trim();
    }

    // Data type entities
    const dataTypes = ['steps', 'calories', 'activity', 'distance', 'health', 'fitness'];
    dataTypes.forEach(type => {
      if (normalizedText.includes(type)) {
        entities.dataType = type;
      }
    });

    // Time context
    const timePatterns = {
      current: /(now|current|present|moment)/i,
      today: /(today|this day)/i,
      week: /(this week|weekly|past 7 days)/i,
      month: /(this month|monthly|past 30 days)/i
    };

    Object.entries(timePatterns).forEach(([timeContext, pattern]) => {
      if (pattern.test(normalizedText)) {
        entities.timeContext = timeContext;
      }
    });

    // Build context from current state and history
    const context = {
      currentPath: location.pathname,
      previousCommands: conversationHistory.current.slice(-3),
      userType,
      hasFitnessData: !!fitnessData,
      timeOfDay: new Date().getHours(),
      activeTab
    };

    // Update conversation history
    conversationHistory.current = [...conversationHistory.current.slice(-5), normalizedText];

    // Calculate final confidence score
    const confidence = Math.min(
      (primaryIntent.score +
        (Object.keys(entities).length * 0.2) +
        (context.previousCommands.length * 0.1)
      ) / 2,
      1
    );

    return {
      intent: primaryIntent.intent,
      entities,
      confidence,
      context
    };
  };

  const executeSemanticAction = async (semanticContext: SemanticContext) => {
    const { intent, entities, confidence, context } = semanticContext;
    
    if (confidence < 0.3) {
      return {
        success: false,
        feedback: "I'm not quite sure what you want to do. Could you be more specific?",
        action: null
      };
    }

    // Handle navigation intent
    if (intent === 'navigation') {
      const targetPath = determineTargetPath(entities.location, context);
      if (targetPath && targetPath !== location.pathname) {
        return {
          success: true,
          feedback: `Taking you to ${getPageDescription(targetPath)}`,
          action: () => navigate(targetPath)
        };
      }
    }

    // Handle query intent
    if (intent === 'query' && entities.dataType) {
      const data = await fetchLatestFitnessData();
      if (data) {
        const response = formatDataResponse(entities.dataType, data, entities.timeContext);
        return {
          success: true,
          feedback: response,
          action: null
        };
      }
    }

    // Handle action intent
    if (intent === 'action' && context.currentPath === '/health-tracker') {
      const view = determineViewType(entities);
      if (view) {
        return {
          success: true,
          feedback: `Switching to ${view} view`,
          action: () => window.dispatchEvent(new CustomEvent('switchGoogleFitTab', { detail: view }))
        };
      }
    }

    // Handle system intent
    if (intent === 'system') {
      if (normalizedText.includes('help')) {
        return {
          success: true,
          feedback: 'Showing available commands',
          action: () => setShowHelp(true)
        };
      }
      if (normalizedText.includes('back')) {
        return {
          success: true,
          feedback: 'Going back to previous page',
          action: () => navigate(-1)
        };
      }
    }

    return {
      success: false,
      feedback: "I understood your request but I'm not sure how to help with that",
      action: null
    };
  };

  const determineTargetPath = (location: string, context: any): string | null => {
    if (!location) return null;
    
    const normalizedLocation = location.toLowerCase();
    
    // Check direct path matches
    for (const route of Object.values(AVAILABLE_ROUTES)) {
      if (route.aliases.some(alias => normalizedLocation.includes(alias))) {
        return route.path;
      }
    }

    // Handle special cases
    if (normalizedLocation.includes('back')) {
      return 'BACK';
    }
    
    return null;
  };

  const formatDataResponse = (metric: string, data: any, timeContext: string): string => {
    const formatValue = (value: number): string => {
      switch (metric) {
        case 'steps':
          return `${value.toLocaleString()} steps`;
        case 'calories':
          return `${value} calories`;
        case 'distance':
          return `${value} kilometers`;
        case 'activeMinutes':
          return `${value} active minutes`;
        default:
          return value.toString();
      }
    };

    if (!data) return "No data available for the requested metric.";

    const value = data[metric];
    if (value === undefined) return "That metric is not available.";

    return `For ${timeContext}, you have ${formatValue(value)}.`;
  };

  const getPageDescription = (path: string): string => {
    if (isValidRoute(path)) {
      return AVAILABLE_ROUTES[path].name;
    }
    return 'the requested page';
  };

  const processCommand = async (command: string) => {
    setIsProcessing(true);
    setFeedback('Processing your command...');

    try {
      const userContext = {
        userType,
        hasFitnessData: !!fitnessData,
        timeOfDay: new Date().getHours(),
        previousCommands: conversationHistory.current.slice(-3),
        activeTab,
        currentPath: location.pathname,
        availableRoutes: Object.keys(AVAILABLE_ROUTES)
      };

      const response = await axios.post(
        `${API_BASE_URL}/api/ai/process-command`,
        {
          command,
          currentPath: location.pathname,
          userContext
        },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const result = response.data;

      if (result.error) {
        throw new Error(result.error);
      }

      if (result.confidence > 0.3) {
        setFeedback(result.response);

        // Handle navigation with route validation and success toast
        if (result.intent === 'navigation' && result.targetPath) {
          if (!isValidRoute(result.targetPath)) {
            setFeedback("I'm sorry, that page is not available.");
            toast({
              title: "Navigation Error",
              description: "The requested page is not available in this application.",
              variant: "destructive",
            });
            return;
          }

          if (result.targetPath !== location.pathname) {
            navigate(result.targetPath);
            setFeedback(`Navigating to ${getPageDescription(result.targetPath)}`);
            // Add success toast for navigation
            toast({
              title: "Navigation Successful",
              description: `Navigated to ${getPageDescription(result.targetPath)}`,
              variant: "default",
            });
          }
        }

        // Handle data queries
        if (result.intent === 'query') {
          if (result.action === 'fetchFitnessData') {
            const data = await fetchLatestFitnessData();
            if (data) {
              setFeedback(formatDataResponse(result.parameters.metric || 'steps', data, result.parameters.timeRange || 'today'));
            }
          } else if (result.action === 'viewProgress') {
            // Handle progress view
            if (result.targetPath && result.targetPath !== location.pathname) {
              navigate(result.targetPath);
            }
            if (result.parameters.view === 'progress') {
              window.dispatchEvent(new CustomEvent('switchGoogleFitTab', { 
                detail: 'charts'
              }));
            }
          }
        }

        // Handle view/tab switching
        if (result.intent === 'action') {
          switch (result.action) {
            case 'switchTab':
              window.dispatchEvent(new CustomEvent('switchGoogleFitTab', { 
                detail: result.parameters.tab 
              }));
              break;
            case 'refresh':
              window.location.reload();
              break;
            case 'toggleView':
              if (result.parameters.view) {
                window.dispatchEvent(new CustomEvent('switchGoogleFitTab', { 
                  detail: result.parameters.view 
                }));
              }
              break;
          }
        }

        // Handle system commands
        if (result.intent === 'system') {
          switch (result.action) {
            case 'help':
              setShowHelp(true);
              break;
            case 'back':
              navigate(-1);
              break;
            case 'home':
              navigate('/');
              break;
          }
        }

        // Update conversation history
        conversationHistory.current = [...conversationHistory.current.slice(-5), command];
      } else {
        setFeedback("I'm not quite sure what you want to do. Could you be more specific?");
        toast({
          title: "Need More Information",
          description: "Please try being more specific about what you'd like to do",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('Error processing command:', error);
      
      // Extract the most relevant error message
      let errorMessage = 'An error occurred while processing your request.';
      if (error.response?.data?.details) {
        errorMessage = error.response.data.details;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }

      // Set user-friendly feedback
      setFeedback(`Sorry, I couldn't process that command. ${errorMessage}`);
      
      // Show toast with more detailed error
      toast({
        title: "Error Processing Command",
        description: errorMessage,
        variant: "destructive",
        duration: 5000,
      });

      // If it's an authentication error, we might want to handle it specially
      if (error.response?.status === 401) {
        toast({
          title: "Authentication Error",
          description: "Please log in again to continue using voice commands.",
          variant: "destructive",
          duration: 7000,
        });
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // Initialize speech recognition with visualization
  const initializeSpeechRecognition = useCallback(() => {
    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        setIsSupported(false);
        throw new Error('Speech recognition is not supported');
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setFeedback('Listening... Hold the mic button and speak');
        // Start voice visualizer
        if (visualizerInterval.current) clearInterval(visualizerInterval.current);
        visualizerInterval.current = setInterval(() => {
          setVisualizerData(prev => 
            prev.map(() => Math.random() * 0.8 + 0.2)
          );
        }, 100);
      };

      recognition.onend = () => {
        setIsListening(false);
        // Stop voice visualizer
        if (visualizerInterval.current) {
          clearInterval(visualizerInterval.current);
          setVisualizerData(Array(10).fill(0.2));
        }
      };

      recognition.onresult = (event: any) => {
        const last = event.results.length - 1;
        const command = event.results[last][0].transcript.toLowerCase();
        setTranscript(command);
        if (event.results[last].isFinal) {
          setLastCommand(command);
          processCommand(command);
        }
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        handleRecognitionError(event.error);
      };

      recognitionRef.current = recognition;
      setIsSupported(true);
    } catch (error) {
      console.error('Speech recognition initialization error:', error);
      setIsSupported(false);
      toast({
        title: "Not Supported",
        description: "Voice navigation is not supported in your browser.",
        variant: "destructive",
      });
    }
  }, []);

  // Modify button handlers for click instead of hold
  const handleButtonClick = () => {
    if (!isListening && recognitionRef.current) {
      setIsOpen(true);
      try {
        recognitionRef.current.start();
      } catch (error) {
        console.error('Failed to start recognition:', error);
        handleRecognitionError('aborted');
      }
    } else if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsOpen(false);
      setTranscript('');
      setFeedback('');
      setIsListening(false);
      if (visualizerInterval.current) {
        clearInterval(visualizerInterval.current);
        setVisualizerData(Array(10).fill(0.2));
      }
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (buttonPressTimer.current) {
        clearTimeout(buttonPressTimer.current);
      }
      if (visualizerInterval.current) {
        clearInterval(visualizerInterval.current);
      }
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  useEffect(() => {
    initializeSpeechRecognition();
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [initializeSpeechRecognition]);

  const handleRecognitionError = (error: string) => {
    setIsListening(false);
    let errorMessage = 'An error occurred. Please try again.';
    
    switch (error) {
      case 'network':
        errorMessage = 'Network error. Please check your connection.';
        break;
      case 'no-speech':
        errorMessage = 'No speech detected. Please try again.';
        break;
      case 'audio-capture':
        errorMessage = 'No microphone detected.';
        break;
      case 'not-allowed':
        errorMessage = 'Microphone access denied.';
        break;
      case 'aborted':
        // Don't show toast for cancelled listening
        setFeedback('');
        return;
    }

    setFeedback(errorMessage);
    toast({
      title: "Error",
      description: errorMessage,
      variant: "destructive",
    });
  };

  if (isSupported === false) return null;

  const groupedCommands = nlpPatterns().reduce((acc, cmd) => {
    if (!acc[cmd.category]) {
      acc[cmd.category] = [];
    }
    acc[cmd.category].push(cmd);
    return acc;
  }, {} as Record<string, CommandPattern[]>);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'navigation':
        return <NavIcon className="h-4 w-4" />;
      case 'data':
        return <Database className="h-4 w-4" />;
      case 'action':
        return <Command className="h-4 w-4" />;
      case 'system':
        return <Settings className="h-4 w-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen && (
        <Card className="mb-4 p-4 w-[400px] bg-[#1A2333]/95 backdrop-blur-lg border-none shadow-lg relative animate-slide-up">
          <div className="absolute inset-0 bg-gradient-to-b from-[#00FFF3]/5 to-transparent rounded-lg pointer-events-none"></div>
          
          <div className="space-y-4">
            {/* Voice Visualizer */}
            {isListening && (
              <div className="flex items-center justify-center gap-1 h-8">
                {visualizerData.map((height, index) => (
                  <div
                    key={index}
                    className="w-1 bg-[#00FFF3] rounded-full animate-wave"
                    style={{
                      height: `${height * 32}px`,
                      animationDelay: `${index * 0.1}s`
                    }}
                  />
                ))}
              </div>
            )}

            {showHelp ? (
              <div className="space-y-4 animate-fade-in">
                <h3 className="text-[#00FFF3] font-medium flex items-center gap-2">
                  <Command className="h-5 w-5" />
                  Available Commands
                </h3>
                {Object.entries(groupedCommands).map(([category, cmds]) => (
                  <div key={category} className="space-y-2 bg-[#0B1120]/50 rounded-lg p-3">
                    <h4 className="text-sm font-medium text-[#00FFF3] capitalize flex items-center gap-2">
                      {getCategoryIcon(category)}
                      {category}
                    </h4>
                    <ul className="space-y-1 text-gray-400 text-sm">
                      {cmds.map((cmd, index) => (
                        <li key={index} className="flex items-center gap-2 hover:text-[#00FFF3] transition-colors">
                          • {cmd.description}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
                <Button
                  variant="ghost"
                  className="text-[#00FFF3] text-sm mt-2 w-full hover:bg-[#00FFF3]/10"
                  onClick={() => setShowHelp(false)}
                >
                  Close Help
                </Button>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center">
                  <div className="text-[#00FFF3] text-sm font-medium">
                    {transcript && (
                      <div className="animate-fade-in flex items-center gap-2">
                        <Mic className="h-4 w-4" />
                        You said: "{transcript}"
                      </div>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-gray-400 hover:text-[#00FFF3]"
                    onClick={() => setShowHelp(true)}
                  >
                    <HelpCircle className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="text-gray-400 text-sm min-h-[20px] flex items-center gap-2">
                  {isProcessing && <Loader2 className="h-4 w-4 animate-spin" />}
                  {feedback}
                </div>

                {lastCommand && (
                  <div className="text-xs text-gray-500 flex items-center gap-2 animate-fade-in">
                    <Command className="h-3 w-3" />
                    Last command: "{lastCommand}"
                  </div>
                )}
              </>
            )}
          </div>
        </Card>
      )}

      <div className="relative">
        {/* Pulse rings */}
        {isListening && (
          <>
            <div className="absolute inset-0 rounded-full bg-[#00FFF3]/20 animate-pulse-ring"></div>
            <div className="absolute inset-0 rounded-full bg-[#00FFF3]/10 animate-pulse-ring" style={{ animationDelay: '0.4s' }}></div>
          </>
        )}
        
        <Button
          onClick={handleButtonClick}
          className={`
            relative rounded-full w-12 h-12 flex items-center justify-center transition-all duration-300
            ${isListening
              ? 'bg-[#00FFF3] text-[#0B1120] animate-pulse-shadow'
              : 'bg-[#1A2333] text-[#00FFF3] hover:bg-[#1A2333]/80'
            }
          `}
        >
          {isListening ? (
            <Mic className="h-6 w-6 animate-pulse" />
          ) : (
            <Mic className="h-6 w-6" />
          )}
        </Button>
      </div>
    </div>
  );
};

export default VoiceNavigation; 