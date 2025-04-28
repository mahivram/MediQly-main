import express from 'express';
import Groq from 'groq-sdk';
import auth from '../middleware/auth.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const router = express.Router();

// Initialize Groq client with explicit API key
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || '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'
});

// Verify API key is loaded
if (!process.env.GROQ_API_KEY) {
  console.warn('Warning: Using fallback GROQ_API_KEY. Please check your .env file.');
}

// Helper function to validate command response
const validateCommandResponse = (result) => {
  const requiredFields = ['intent', 'confidence', 'response'];
  const missingFields = requiredFields.filter(field => !(field in result));
  
  if (missingFields.length > 0) {
    throw new Error(`Invalid response format. Missing fields: ${missingFields.join(', ')}`);
  }

  if (typeof result.confidence !== 'number' || result.confidence < 0 || result.confidence > 1) {
    throw new Error('Invalid confidence value. Must be a number between 0 and 1');
  }

  if (!['navigation', 'query', 'action', 'system'].includes(result.intent)) {
    throw new Error(`Invalid intent value: ${result.intent}`);
  }

  return true;
};

// Process voice commands
router.post('/process-command', auth, async (req, res) => {
  try {
    const { command, currentPath, userContext } = req.body;

    // Validate input
    if (!command) {
      return res.status(400).json({
        error: 'Invalid Request',
        details: 'No command provided. Please provide a voice command to process.'
      });
    }

    if (command.length > 500) {
      return res.status(400).json({
        error: 'Invalid Request',
        details: 'Command is too long. Please keep commands under 500 characters.'
      });
    }

    console.log('Processing command:', command);
    console.log('Current path:', currentPath);
    console.log('User context:', userContext);

    const systemPrompt = `You are an AI assistant that processes voice commands for a health tracking application.
Your task is to understand the user's intent and provide appropriate navigation or action responses.
You should respond in a clear, concise manner and always maintain the specified JSON format.

IMPORTANT: You must ONLY navigate to these specific available routes:

1. Dashboard (/):
   - Main application dashboard
   - Overview of all features
   - Quick access to main functions
   - Recent activity summary

2. Health Tracker (/health-tracker):
   - Health and fitness tracking
   - Activity metrics
   - Progress monitoring
   - Health analytics

3. Appointments (/appointments):
   - Schedule appointments
   - Manage bookings
   - View consultation history
   - Check availability

4. Preventive Health (/preventive-health):
   - Health prevention information
   - Recommendations
   - Preventive care guidelines
   - Health risk assessments

5. Insurance (/insurance):
   - Insurance coverage details
   - Health plans
   - Policy information
   - Claims management

6. Symptoms (/symptoms):
   - Symptom checker
   - Health symptom tracking
   - Condition monitoring
   - Health alerts

7. BMI Index (/bmi):
   - BMI calculator
   - Weight tracking
   - Body metrics
   - Health goals

8. Medicine (/medicine):
   - Medication management
   - Prescription tracking
   - Drug information
   - Pharmacy services

9. AI Doctor (/ai-doctor):
   - AI health consultation
   - Virtual health assistant
   - Health recommendations
   - Automated health checks

10. Chat with Doctor (/chat):
    - Live doctor consultation
    - Medical chat
    - Healthcare professional messaging
    - Online medical advice

Special Views and Actions:
1. Analytics View (in Health Tracker):
   - Switch to charts view
   - View detailed statistics
   - See progress graphs

2. Overview Mode:
   - Switch to summary view
   - Quick stats display
   - Basic metrics view

3. System Commands:
   - Help: Show available commands
   - Back: Return to previous page
   - Home: Go to main dashboard
   - Refresh: Update current view

Navigation Rules:
1. ONLY navigate to these exact paths: /, /health-tracker, /appointments, /preventive-health, /insurance, /symptoms, /bmi, /medicine, /ai-doctor, /chat
2. If a requested route is not in this list, respond with an error
3. Use exact paths as shown above
4. Do not make up or guess routes

Example Commands:
1. "take me to appointments" -> navigate to "/appointments"
2. "show me my health data" -> navigate to "/health-tracker"
3. "check my symptoms" -> navigate to "/symptoms"
4. "calculate my bmi" -> navigate to "/bmi"
5. "go back to home" -> navigate to "/"`;

    const userPrompt = `Process this voice command and determine the appropriate action.
Command: "${command}"
Current Location: ${currentPath}
User Context: ${JSON.stringify(userContext, null, 2)}

Available Routes: ${userContext.availableRoutes.join(', ')}

Respond with a JSON object that includes:
{
  "intent": "navigation" | "query" | "action" | "system",
  "confidence": 0.0-1.0,
  "targetPath": "/path" or null,
  "action": "specific action" or null,
  "parameters": {
    "tab": string | null,
    "view": string | null,
    "timeRange": string | null,
    "metric": string | null,
    "additionalParams": object | null
  },
  "response": "user-friendly response"
}

If navigation is requested to a route that's not in availableRoutes, set:
{
  "intent": "error",
  "confidence": 1.0,
  "targetPath": null,
  "action": null,
  "parameters": {},
  "response": "I'm sorry, but that page is not available in this application."
}

Examples:
1. Valid navigation:
{
  "intent": "navigation",
  "confidence": 0.9,
  "targetPath": "/health-tracker",
  "action": null,
  "parameters": {},
  "response": "Taking you to your health dashboard"
}

2. Invalid navigation:
{
  "intent": "error",
  "confidence": 1.0,
  "targetPath": null,
  "action": null,
  "parameters": {},
  "response": "I'm sorry, but that page is not available in this application."
}`;

    try {
      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: userPrompt
          }
        ],
        model: "mixtral-8x7b-32768",
        temperature: 0.3,
        max_tokens: 1000
      });

      if (!completion.choices || !completion.choices[0]?.message?.content) {
        throw new Error('Invalid or empty response from AI service');
      }

      let result;
      try {
        result = JSON.parse(completion.choices[0].message.content);
      } catch (parseError) {
        console.error('Failed to parse AI response:', completion.choices[0].message.content);
        throw new Error('Failed to parse AI response as JSON. The response was not in the expected format.');
      }

      // Validate the response format
      validateCommandResponse(result);

      // Enhance the response with additional context
      result.currentPath = currentPath;
      result.processed = true;
      result.timestamp = new Date().toISOString();
      result.commandProcessed = command;

      console.log('Processed result:', result);
      res.json(result);

    } catch (aiError) {
      console.error('AI Service Error:', aiError);
      res.status(500).json({
        error: 'AI Processing Error',
        details: aiError.message,
        command: command,
        timestamp: new Date().toISOString()
      });
    }

  } catch (error) {
    console.error('Command Processing Error:', error);
    
    // Determine the appropriate status code
    let statusCode = 500;
    if (error.message.includes('Invalid Request')) {
      statusCode = 400;
    } else if (error.message.includes('authentication')) {
      statusCode = 401;
    }

    // Send detailed error response
    res.status(statusCode).json({
      error: 'Command Processing Error',
      details: error.message,
      timestamp: new Date().toISOString(),
      command: req.body.command,
      path: req.body.currentPath
    });
  }
});

// Get command suggestions
router.get('/command-suggestions', auth, async (req, res) => {
  try {
    const { context } = req.query;

    const prompt = `Generate 5 natural voice command suggestions for a health tracking application.
Current context: ${context}

Focus on commands related to:
1. Navigation between pages
2. Checking health metrics
3. Managing appointments
4. Viewing analytics
5. Common user actions

The suggestions should be natural and conversational, like:
- "Show me my health dashboard"
- "How many steps have I taken today?"
- "Switch to the analytics view"
- "Check my upcoming appointments"
- "Go back to the main page"

Respond in JSON format:
{
  "suggestions": [
    {
      "command": "natural command",
      "description": "what it does",
      "category": "navigation|query|action|system"
    }
  ]
}`;

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are an AI assistant that helps users with voice commands in a health tracking application."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      model: "mixtral-8x7b-32768",
      temperature: 0.7,
      max_tokens: 1000
    });

    try {
      const suggestions = JSON.parse(completion.choices[0].message.content);
      res.json(suggestions);
    } catch (parseError) {
      console.error('Error parsing suggestions:', parseError);
      res.status(500).json({
        error: 'Failed to parse suggestions',
        details: parseError.message,
        rawResponse: completion.choices[0].message.content
      });
    }
  } catch (error) {
    console.error('Error generating suggestions:', error);
    res.status(500).json({
      error: 'Failed to generate command suggestions',
      details: error.message
    });
  }
});

export default router; 