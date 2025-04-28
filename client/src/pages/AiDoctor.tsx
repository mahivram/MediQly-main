import "regenerator-runtime/runtime";
import { useRef, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot, Send, User, Brain, Activity, Sparkles, Upload, FileText, Image as ImageIcon, X, Mic, Volume, Camera, List, Globe2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { motion, AnimatePresence } from "framer-motion";
import { Player } from "@lottiefiles/react-lottie-player";
import { HealthMetrics } from "@/components/health/HealthMetrics";
import { FuturisticBackground } from "@/components/health/FuturisticBackground";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import MainLayout from "@/components/layout/MainLayout";
import { useSpeechRecognition } from 'react-speech-kit';

interface Language {
  code: string;
  name: string;
  flag: string;
  rtl?: boolean;
}

const languages: Language[] = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'hi', name: 'हिंदी', flag: '🇮🇳' },
  { code: 'bn', name: 'বাংলা', flag: '🇧🇩' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦', rtl: true },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'ur', name: 'اردو', flag: '🇵🇰', rtl: true },
  { code: 'te', name: 'తెలుగు', flag: '🇮🇳' },
  { code: 'ta', name: 'தமிழ்', flag: '🇮🇳' },
  { code: 'mr', name: 'मराठी', flag: '🇮🇳' },
];

const translations = {
  en: {
    welcomeTitle: "Welcome to AI Doctor",
    welcomeDescription: "How can I help you today?",
    selectSymptoms: "Select your symptoms",
    writeDescription: "Write or speak",
    uploadReport: "Upload report",
    speak: "Speak now",
    listening: "Listening...",
    checkHealth: "Check my health",
    cancel: "Cancel",
    askAnything: "Ask me anything about your health...",
  },
  es: {
    welcomeTitle: "Bienvenido al Doctor IA",
    welcomeDescription: "¿Cómo puedo ayudarte hoy?",
    selectSymptoms: "Selecciona tus síntomas",
    writeDescription: "Escribir o hablar",
    uploadReport: "Subir informe",
    speak: "Habla ahora",
    listening: "Escuchando...",
    checkHealth: "Revisar mi salud",
    cancel: "Cancelar",
    askAnything: "Pregúntame cualquier cosa sobre tu salud...",
  },
  // Add more languages as needed
};

interface Message {
  role: "user" | "assistant";
  content: string;
  isAudio?: boolean;
  language?: string;
}

interface HealthData {
  type: string;
  data: {
    labels: string[];
    values: number[];
    label: string;
    color: string;
  };
}

interface CommonSymptom {
  id: string;
  label: string;
  icon: string;
  description: string;
}

const commonSymptoms: CommonSymptom[] = [
  { id: 'fever', label: '🤒 Fever', icon: '🌡️', description: 'Body feels hot' },
  { id: 'headache', label: '🤕 Headache', icon: '🤕', description: 'Pain in head' },
  { id: 'cough', label: '😷 Cough', icon: '🤧', description: 'Continuous coughing' },
  { id: 'stomach', label: '🤢 Stomach Pain', icon: '😣', description: 'Pain in stomach' },
  { id: 'tired', label: '😫 Feeling Tired', icon: '😴', description: 'No energy' },
  { id: 'body-pain', label: '🤒 Body Pain', icon: '🤕', description: 'Pain in body' },
];

const commonSymptomsTranslations = {
  en: [
    { id: 'fever', label: '🤒 Fever', icon: '🌡️', description: 'Body feels hot' },
    { id: 'headache', label: '🤕 Headache', icon: '🤕', description: 'Pain in head' },
    { id: 'cough', label: '😷 Cough', icon: '🤧', description: 'Continuous coughing' },
    { id: 'stomach', label: '🤢 Stomach Pain', icon: '😣', description: 'Pain in stomach' },
    { id: 'tired', label: '😫 Feeling Tired', icon: '😴', description: 'No energy' },
    { id: 'body-pain', label: '🤒 Body Pain', icon: '🤕', description: 'Pain in body' },
  ],
  hi: [
    { id: 'fever', label: '🤒 बुखार', icon: '🌡️', description: 'शरीर गरम महसूस होता है' },
    { id: 'headache', label: '🤕 सिरदर्द', icon: '🤕', description: 'सिर में दर्द' },
    { id: 'cough', label: '😷 खांसी', icon: '🤧', description: 'लगातार खांसी' },
    { id: 'stomach', label: '🤢 पेट दर्द', icon: '😣', description: 'पेट में दर्द' },
    { id: 'tired', label: '😫 थकान', icon: '😴', description: 'ऊर्जा नहीं है' },
    { id: 'body-pain', label: '🤒 शरीर दर्द', icon: '🤕', description: 'शरीर में दर्द' },
  ],
  // Add more languages as needed
};

const uiTranslations = {
  en: {
    welcomeTitle: "AI Health Assistant",
    welcomeDescription: "I'm your AI Doctor Assistant, equipped with advanced medical knowledge and natural language understanding. How can I help you today?",
    selectSymptoms: "Select Symptoms",
    writeDescription: "Write or Speak",
    uploadReport: "Upload Report",
    speak: "Speak Now",
    listening: "Listening...",
    checkHealth: "Check My Health",
    cancel: "Cancel",
    askAnything: "Ask me anything about your health...",
    tellHealth: "Tell Me About Your Health",
    describeFeeling: "Select your symptoms or describe how you're feeling in simple words.",
    capabilities: "Capabilities",
    accuracy: "Accuracy",
    whatCanYouDo: "What can you help me with?",
    howAccurate: "How do you ensure medical accuracy?",
    analyzing: "Analyzing your request...",
    pleaseDescribeSymptoms: "Please describe your symptoms or select from the common symptoms",
    whatIUnderstand: "What I Understand",
    importantFindings: "Important Findings",
    whatThisMightBe: "What This Might Be",
    whatToDoNext: "What To Do Next",
    whenToSeeDoctor: "When to See a Doctor",
    needsImmediateAttention: "This needs immediate medical attention",
    shouldSeeDoctor: "You should see a doctor soon",
    canTreatAtHome: "You can treat this at home but see a doctor if it gets worse"
  },
  es: {
    welcomeTitle: "Asistente de Salud IA",
    welcomeDescription: "Soy tu Asistente Médico IA, equipado con conocimientos médicos avanzados y comprensión del lenguaje natural. ¿Cómo puedo ayudarte hoy?",
    selectSymptoms: "Seleccionar Síntomas",
    writeDescription: "Escribir o Hablar",
    uploadReport: "Subir Informe",
    speak: "Hablar Ahora",
    listening: "Escuchando...",
    checkHealth: "Revisar mi Salud",
    cancel: "Cancelar",
    askAnything: "Pregúntame cualquier cosa sobre tu salud...",
    tellHealth: "Cuéntame sobre tu Salud",
    describeFeeling: "Selecciona tus síntomas o describe cómo te sientes en palabras simples.",
    capabilities: "Capacidades",
    accuracy: "Precisión",
    whatCanYouDo: "¿En qué puedes ayudarme?",
    howAccurate: "¿Cómo aseguras la precisión médica?",
    analyzing: "Analizando su consulta...",
    pleaseDescribeSymptoms: "Por favor describe tus síntomas o selecciona de los síntomas comunes",
    whatIUnderstand: "Lo que Entiendo",
    importantFindings: "Hallazgos Importantes",
    whatThisMightBe: "Qué Podría Ser",
    whatToDoNext: "Qué Hacer Después",
    whenToSeeDoctor: "Cuándo Ver al Médico",
    needsImmediateAttention: "Esto necesita atención médica inmediata",
    shouldSeeDoctor: "Deberías ver a un médico pronto",
    canTreatAtHome: "Puedes tratarlo en casa pero consulta al médico si empeora"
  },
  hi: {
    welcomeTitle: "एआई स्वास्थ्य सहायक",
    welcomeDescription: "मैं आपका एआई डॉक्टर सहायक हूं, उन्नत चिकित्सा ज्ञान और प्राकृतिक भाषा समझ से लैस। मैं आज आपकी कैसे मदद कर सकता हूं?",
    selectSymptoms: "लक्षण चुनें",
    writeDescription: "लिखें या बोलें",
    uploadReport: "रिपोर्ट अपलोड करें",
    speak: "अब बोलें",
    listening: "सुन रहा हूं...",
    checkHealth: "मेरी सेहत जांचें",
    cancel: "रद्द करें",
    askAnything: "अपनी सेहत के बारे में कुछ भी पूछें...",
    tellHealth: "अपनी सेहत के बारे में बताएं",
    describeFeeling: "अपने लक्षण चुनें या बताएं कि आप कैसा महसूस कर रहे हैं।",
    capabilities: "क्षमताएं",
    accuracy: "सटीकता",
    whatCanYouDo: "आप मेरी कैसे मदद कर सकते हैं?",
    howAccurate: "आप चिकित्सा सटीकता कैसे सुनिश्चित करते हैं?",
    analyzing: "आपके प्रश्न का विश्लेषण कर रहा हूं...",
    pleaseDescribeSymptoms: "कृपया अपने लक्षणों का वर्णन करें या सामान्य लक्षणों में से चुनें",
    whatIUnderstand: "मैं क्या समझता हूं",
    importantFindings: "महत्वपूर्ण निष्कर्ष",
    whatThisMightBe: "यह क्या हो सकता है",
    whatToDoNext: "आगे क्या करें",
    whenToSeeDoctor: "डॉक्टर को कब दिखाएं",
    needsImmediateAttention: "इसे तत्काल चिकित्सा ध्यान की आवश्यकता है",
    shouldSeeDoctor: "आपको जल्द ही डॉक्टर को दिखाना चाहिए",
    canTreatAtHome: "आप इसका घर पर इलाज कर सकते हैं लेकिन अगर स्थिति बिगड़े तो डॉक्टर को दिखाएं"
  },
  // Add more languages as needed
};

const AiDoctor = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [healthData, setHealthData] = useState<HealthData | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [showWelcome, setShowWelcome] = useState(true);
  const [reportText, setReportText] = useState("");
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [voiceText, setVoiceText] = useState("");
  const recordingTimerRef = useRef<any>(null);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [showSymptomSelector, setShowSymptomSelector] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState<Language>(languages[0]);
  const [isTranslating, setIsTranslating] = useState(false);
  const { listen, listening, stop } = useSpeechRecognition({
    onResult: (result: string) => {
      setInput(result);
      setVoiceText(result);
    },
    onError: (error: Error) => {
      console.error('Speech recognition error:', error);
      toast.error(
        currentLanguage.code === 'en'
          ? "Failed to recognize speech. Please try again."
          : "Error al reconocer el habla. Por favor, inténtelo de nuevo."
      );
      stopRecording();
    }
  });

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const extractHealthMetrics = (content: string) => {
    // Simple pattern matching for demonstration
    const bloodPressureMatch = content.match(/blood pressure.*?(\d+)/i);
    const heartRateMatch = content.match(/heart rate.*?(\d+)/i);
    
    if (bloodPressureMatch || heartRateMatch) {
      const today = new Date().toLocaleDateString();
      const labels = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        return date.toLocaleDateString();
      }).reverse();

      const values = Array.from({ length: 7 }, (_, i) => {
        const baseValue = bloodPressureMatch ? 120 : 75;
        return baseValue + Math.random() * 10 - 5;
      });

      return {
        type: bloodPressureMatch ? "Blood Pressure" : "Heart Rate",
        data: {
          labels,
          values,
          label: bloodPressureMatch ? "Blood Pressure (mmHg)" : "Heart Rate (BPM)",
          color: bloodPressureMatch ? "#3b82f6" : "#ef4444",
        },
      };
    }
    return null;
  };

  // Function to translate text
  const translateText = async (text: string, targetLang: string) => {
    try {
      setIsTranslating(true);
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer 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",
        },
        body: JSON.stringify({
          model: "mixtral-8x7b-32768",
          messages: [
            {
              role: "system",
              content: `You are a medical translator. Translate the following text to ${targetLang} while preserving medical terminology and emojis. Keep the translation simple and easy to understand.`,
            },
            { role: "user", content: text },
          ],
          temperature: 0.3,
          max_tokens: 1000,
        }),
      });

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error('Translation error:', error);
      return text;
    } finally {
      setIsTranslating(false);
    }
  };

  // Update recording duration
  useEffect(() => {
    if (listening) {
      recordingTimerRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(recordingTimerRef.current);
      setRecordingDuration(0);
    }

    return () => {
      clearInterval(recordingTimerRef.current);
    };
  }, [listening]);

  const startRecording = () => {
    try {
      listen({ 
        lang: currentLanguage.code,
        interimResults: true,
        continuous: true
      });
      setIsRecording(true);
      
      toast.success(
        currentLanguage.code === 'en' ? "Listening... Speak now"
        : currentLanguage.code === 'es' ? "Escuchando... Hable ahora"
        : currentLanguage.code === 'hi' ? "सुन रहा हूं... अब बोलें"
        : currentLanguage.code === 'ar' ? "جاري الاستماع... تحدث الآن"
        : currentLanguage.code === 'zh' ? "正在听... 请说话"
        : "Listening... Speak now"
      );
    } catch (error) {
      console.error('Speech recognition error:', error);
      toast.error(
        currentLanguage.code === 'en'
          ? "Failed to start voice recognition. Please try again."
          : "Error al iniciar el reconocimiento de voz. Por favor, inténtelo de nuevo."
      );
      stopRecording();
    }
  };

  const stopRecording = () => {
    stop();
    setIsRecording(false);
    if (input.trim()) {
      handleSubmit(new Event('submit') as any);
    }
  };

  // Format recording duration
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Modified handleSubmit to include translation
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = { 
      role: "user", 
      content: input,
      language: currentLanguage.code 
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setShowWelcome(false);

    try {
      const systemMessage = {
        role: "system",
        content: `You are a friendly and caring AI health assistant. IMPORTANT: You MUST respond in ${currentLanguage.name} language ONLY. 

When responding:
- Use ${currentLanguage.name} language for ALL responses
- Use simple, easy-to-understand words in ${currentLanguage.name}
- If you must use medical terms, explain them in simple ${currentLanguage.name} words in parentheses
- Break down your response into short, clear sections using emojis
- Give practical advice that anyone can follow
- Use friendly, reassuring language in ${currentLanguage.name}
- Always remind that you're an AI and they should consult real doctors
- Keep your responses short and clear
- If you detect any serious conditions, clearly state in ${currentLanguage.name} that they need to see a doctor immediately

Remember: NEVER respond in English unless ${currentLanguage.code} is 'en'. Always use ${currentLanguage.name} language.`
      };

      const contextMessages = messages.slice(-5).map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      // Start the API call
      const responsePromise = fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer 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"
        },
        body: JSON.stringify({
          model: "mixtral-8x7b-32768",
          messages: [
            systemMessage,
            ...contextMessages,
            {
              role: "user",
              content: input
            }
          ],
          temperature: 0.7,
          max_tokens: 1024,
          stop: null,
          n: 1
        })
      });

      // Create a delay promise for minimum animation time (8 seconds)
      const delayPromise = new Promise(resolve => setTimeout(resolve, 8000));

      // Wait for both the API response and the minimum delay
      const [response] = await Promise.all([responsePromise, delayPromise]);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error?.message || `API request failed with status ${response.status}`
        );
      }

      const data = await response.json();
      
      if (!data?.choices?.[0]?.message?.content) {
        throw new Error('Invalid response format from API');
      }

      // Add an additional small delay before showing the response
      await new Promise(resolve => setTimeout(resolve, 1000));

      const assistantMessage: Message = {
        role: "assistant",
        content: data.choices[0].message.content,
        language: currentLanguage.code
      };
      setMessages((prev) => [...prev, assistantMessage]);

      // Extract and set health metrics if present
      const metrics = extractHealthMetrics(assistantMessage.content);
      if (metrics) {
        setHealthData(metrics);
      }
    } catch (error) {
      console.error("Error:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to get a response";
      toast.error(errorMessage);
      
      // Translate error message based on current language
      const errorMessages = {
        en: `I apologize, but I'm having trouble responding right now. Please try again in a moment or rephrase your question.\n\nIf you're experiencing urgent health concerns, please contact your healthcare provider directly.`,
        es: `Lo siento, pero estoy teniendo problemas para responder en este momento. Por favor, inténtelo de nuevo en un momento o reformule su pregunta.\n\nSi tiene problemas de salud urgentes, póngase en contacto con su médico directamente.`,
        hi: `मैं क्षमा चाहता हूं, लेकिन मुझे अभी जवाब देने में परेशानी हो रही है। कृपया कुछ देर बाद फिर से प्रयास करें या अपना प्रश्न दोबारा पूछें।\n\nयदि आपको तत्काल स्वास्थ्य संबंधी चिंता है, तो कृपया सीधे अपने स्वास्थ्य सेवा प्रदाता से संपर्क करें।`,
        ar: `عذراً، لكنني أواجه مشكلة في الرد حالياً. يرجى المحاولة مرة اخرى بعد قليل أو إعادة صياغة سؤالك.\n\nإذا كنت تعاني من مشاكل صحية عاجلة، يرجى الاتصال بمقدم الرعاية الصحية مباشرة.`,
        zh: `抱歉，我现在回答有困难。请稍后重试或重新表述您的问题。\n\n如果您有紧急健康问题，请直接联系您的医疗服务提供者。`,
      };
      
      setMessages((prev) => [...prev, {
        role: "assistant",
        content: errorMessages[currentLanguage.code] || errorMessages.en,
        language: currentLanguage.code
      }]);
    } finally {
      // Add a final delay before removing loading state
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsLoading(false);
    }
  };

  const handleSymptomSelect = (symptomId: string) => {
    setSelectedSymptoms(prev => {
      const newSymptoms = prev.includes(symptomId)
        ? prev.filter(id => id !== symptomId)
        : [...prev, symptomId];
      
      // Automatically create a description from selected symptoms
      const description = commonSymptoms
        .filter(symptom => newSymptoms.includes(symptom.id))
        .map(symptom => symptom.description)
        .join(". ");
      
      setReportText(description);
      return newSymptoms;
    });
  };

  const analyzeReport = async () => {
    if (!reportText.trim() && selectedSymptoms.length === 0) {
      toast.error(t('pleaseDescribeSymptoms'));
      return;
    }

    const symptomsText = selectedSymptoms.length > 0
      ? getLocalizedSymptoms()
          .filter(symptom => selectedSymptoms.includes(symptom.id))
          .map(symptom => symptom.label)
          .join(", ")
      : "";

    const userMessage: Message = {
      role: "user",
      content: `Please analyze these symptoms and provide a simple explanation:\n\n${symptomsText}\n${reportText}`,
      language: currentLanguage.code
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setShowWelcome(false);
    setShowReportDialog(false);

    try {
      const systemMessage = {
        role: "system",
        content: `You are a friendly and caring AI health assistant. IMPORTANT: You MUST respond in ${currentLanguage.name} language ONLY.

When analyzing symptoms:
- Use ${currentLanguage.name} language for ALL responses
- Use simple, easy-to-understand words in ${currentLanguage.name}
- If you must use medical terms, explain them in simple ${currentLanguage.name} words in parentheses
- Break down your response into these sections using emojis:
  * 🔍 ${t('whatIUnderstand')}
  * ❗ ${t('importantFindings')}
  * 🏥 ${t('whatThisMightBe')}
  * 👉 ${t('whatToDoNext')}
  * ⚠️ ${t('whenToSeeDoctor')}
- Rate the urgency in ${currentLanguage.name} using simple terms like:
  * "${t('needsImmediateAttention')}"
  * "${t('shouldSeeDoctor')}"
  * "${t('canTreatAtHome')}"
- Give practical advice that anyone can follow
- Use friendly, reassuring language in ${currentLanguage.name}
- Always remind that you're an AI and they should consult real doctors
- Keep your responses short and clear
- If you detect any serious conditions, clearly state in ${currentLanguage.name} that they need to see a doctor immediately

Remember: NEVER respond in English unless ${currentLanguage.code} is 'en'. Always use ${currentLanguage.name} language.`
      };

      const contextMessages = messages.slice(-5).map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer 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"
        },
        body: JSON.stringify({
          model: "mixtral-8x7b-32768",
          messages: [
            systemMessage,
            ...contextMessages,
            {
              role: "user",
              content: `Please analyze these symptoms and provide a simple explanation in ${currentLanguage.name}:\n\n${symptomsText}\n${reportText}`
            }
          ],
          temperature: 0.7,
          max_tokens: 1024,
          stop: null,
          n: 1
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error?.message || `API request failed with status ${response.status}`
        );
      }

      const data = await response.json();
      
      if (!data?.choices?.[0]?.message?.content) {
        throw new Error('Invalid response format from API');
      }

      const assistantMessage: Message = {
        role: "assistant",
        content: data.choices[0].message.content,
        language: currentLanguage.code
      };
      setMessages((prev) => [...prev, assistantMessage]);

      // Extract and set health metrics if present
      const metrics = extractHealthMetrics(assistantMessage.content);
      if (metrics) {
        setHealthData(metrics);
      }
    } catch (error) {
      console.error("Error:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to analyze symptoms";
      toast.error(errorMessage);
      
      // Translate error message based on current language
      const errorMessages = {
        en: `I apologize, but I'm having trouble analyzing your symptoms right now. Please try again in a moment.\n\nIf you're experiencing severe symptoms or urgent health concerns, please contact your healthcare provider immediately.`,
        es: `Lo siento, pero estoy teniendo problemas para analizar sus síntomas en este momento. Por favor, inténtelo de nuevo en un momento.\n\nSi experimenta síntomas graves o tiene problemas de salud urgentes, póngase en contacto con su médico inmediatamente.`,
        hi: `मैं क्षमा चाहता हूं, लेकिन मुझे अभी आपके लक्षणों का विश्लेषण करने में परेशानी हो रही है। कृपया कुछ देर बाद फिर से प्रयास करें।\n\nयदि आप गंभीर लक्षण या तत्काल स्वास्थ्य संबंधी चिंता महसूस कर रहे हैं, तो कृपया तुरंत अपने स्वास्थ्य सेवा प्रदाता से संपर्क करें।`,
        ar: `عذراً، لكنني أواجه مشكلة في تحليل أعراضك حالياً. يرجى المحاولة مرة أخرى بعد قليل.\n\nإذا كنت تعاني من أعراض شديدة أو مشاكل صحية عاجلة، يرجى الاتصال بمقدم الرعاية الصحية فوراً.`,
        zh: `抱歉，我现在无法分析您的症状。请稍后重试。\n\n如果您出现严重症状或紧急健康问题，请立即联系您的医疗服务提供者。`,
      };
      
      setMessages((prev) => [...prev, {
        role: "assistant",
        content: errorMessages[currentLanguage.code] || errorMessages.en,
        language: currentLanguage.code
      }]);
    } finally {
      setIsLoading(false);
      setReportText("");
      setSelectedSymptoms([]);
    }
  };

  const handleFileUpload = async (file: File) => {
    setIsProcessingFile(true);
    setUploadedFile(file);

    try {
      if (file.type === 'application/pdf') {
        // For PDF files, we'll use pdf.js to extract text
        const reader = new FileReader();
        reader.onload = async (e) => {
          try {
            // Note: In a production environment, you would want to process this on the server
            // For now, we'll just read it as text
            const text = await extractTextFromPDF(e.target?.result as ArrayBuffer);
            setReportText(text);
          } catch (error) {
            console.error('Error processing PDF:', error);
            toast.error('Failed to process PDF file. Please try copying the text manually.');
          }
        };
        reader.readAsArrayBuffer(file);
      } else if (file.type.startsWith('image/')) {
        // For images, we'll use Tesseract.js for OCR
        const reader = new FileReader();
        reader.onload = async (e) => {
          try {
            // Note: In a production environment, you would want to do OCR on the server
            // For now, we'll just show a message
            toast.info('Image processing would be handled on the server in production');
            setReportText('Image uploaded: ' + file.name + '\n\nPlease paste the report text manually for now.');
          } catch (error) {
            console.error('Error processing image:', error);
            toast.error('Failed to process image. Please try copying the text manually.');
          }
        };
        reader.readAsDataURL(file);
      }
    } catch (error) {
      console.error('Error processing file:', error);
      toast.error('Failed to process file. Please try copying the text manually.');
    } finally {
      setIsProcessingFile(false);
    }
  };

  const extractTextFromPDF = async (arrayBuffer: ArrayBuffer): Promise<string> => {
    // This is a placeholder. In a real implementation, you would:
    // 1. Either use pdf.js in the browser
    // 2. Or better, send the file to your server for processing
    return new Promise((resolve) => {
      resolve('PDF uploaded: ' + uploadedFile?.name + '\n\nPlease paste the report text manually for now.');
    });
  };

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      validateAndUploadFile(file);
    }
  };

  const validateAndUploadFile = (file: File) => {
    const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error('Please upload a PDF or image file (JPEG, PNG, WEBP)');
      return;
    }
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      toast.error('File size should be less than 10MB');
      return;
    }
    handleFileUpload(file);
  };

  // Language selector component
  const LanguageSelector = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="w-auto px-3 flex gap-2">
          <Globe2 className="h-4 w-4" />
          <span>{currentLanguage.flag}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[200px]">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => handleLanguageChange(lang)}
            className="flex items-center gap-2"
          >
            <span>{lang.flag}</span>
            <span>{lang.name}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const handleLanguageChange = async (newLanguage: Language) => {
    setCurrentLanguage(newLanguage);
    // Update speech recognition language
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    // Translate the UI elements that are currently visible
    if (newLanguage.code !== 'en') {
      setIsTranslating(true);
      // Translate relevant UI elements
      setIsTranslating(false);
    }
  };

  const t = (key: string) => {
    const translations = uiTranslations[currentLanguage.code] || uiTranslations.en;
    return translations[key] || uiTranslations.en[key];
  };

  const getLocalizedSymptoms = () => {
    return commonSymptomsTranslations[currentLanguage.code] || commonSymptomsTranslations.en;
  };

  return (
    <MainLayout>
      <div className="flex-1 overflow-hidden bg-background/50">
        <div className="mb-4 flex justify-between items-center">
          <h1 className="text-3xl font-bold primary-grad">{t('welcomeTitle')}</h1>
          <LanguageSelector />
        </div>

        <Card className={cn(
          "h-[calc(100vh-12rem)] flex flex-col backdrop-blur-sm bg-background/50 border-primary/20",
          currentLanguage.rtl && "rtl"
        )}>
          <ScrollArea className="flex-1 p-4 space-y-4" ref={scrollAreaRef}>
            <AnimatePresence>
              {showWelcome && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="text-center space-y-4 py-8"
                >
                  <div className="relative w-48 h-48 mx-auto">
                    <Player
                      autoplay
                      loop
                      speed={0.5}
                      src="https://assets5.lottiefiles.com/packages/lf20_xyadoh9h.json"
                      style={{ width: '100%', height: '100%' }}
                    />
                    <motion.div
                      className="absolute -inset-4 bg-primary/10 rounded-full z-[-1]"
                      animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.1, 0.3],
                      }}
                      transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    />
                  </div>
                  <h2 className="text-2xl font-bold text-primary">{t('welcomeTitle')}</h2>
                  <p className="text-muted-foreground">
                    {t('welcomeDescription')}
                  </p>
                  <div className="flex gap-4 justify-center flex-wrap">
                    <Button variant="outline" onClick={() => setShowReportDialog(true)}>
                      <Upload className="w-4 h-4 mr-2" />
                      {t('uploadReport')}
                    </Button>
                    <Button variant="outline" onClick={() => setInput(t('whatCanYouDo'))}>
                      <Brain className="w-4 h-4 mr-2" />
                      {t('capabilities')}
                    </Button>
                    <Button variant="outline" onClick={() => setInput(t('howAccurate'))}>
                      <Activity className="w-4 h-4 mr-2" />
                      {t('accuracy')}
                    </Button>
                  </div>
                </motion.div>
              )}

              {messages.map((message, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className={`flex gap-3 mb-6 ${
                    message.role === "assistant" ? "flex-row" : "flex-row-reverse"
                  }`}
                >
                  <motion.div 
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.2 }}
                    className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1"
                  >
                    {message.role === "assistant" ? (
                      <Bot className="w-5 h-5" />
                    ) : (
                      <User className="w-5 h-5" />
                    )}
                  </motion.div>
                  <motion.div
                    initial={{ x: message.role === "assistant" ? -20 : 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                    className={`rounded-lg px-6 py-4 max-w-[85%] backdrop-blur-sm ${
                      message.role === "assistant"
                        ? "bg-card/50 border border-primary/20 shadow-lg hover:shadow-xl transition-shadow"
                        : "bg-primary text-primary-foreground"
                    }`}
                  >
                    {message.role === "assistant" ? (
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {message.content}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    )}
                  </motion.div>
                </motion.div>
              ))}

              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-3 pl-6 pr-4"
                >
                  <div className="w-12 h-12 flex-shrink-0 relative">
                    <motion.div
                      className="absolute inset-0 bg-primary/20 rounded-full"
                      animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.6, 0.3]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                      style={{ transformOrigin: 'center' }}
                    />
                    <motion.div
                      className="absolute inset-0 border-2 border-primary rounded-full"
                      animate={{
                        rotate: 360,
                        scale: [1, 1.1, 1]
                      }}
                      transition={{
                        rotate: {
                          duration: 3,
                          repeat: Infinity,
                          ease: "linear"
                        },
                        scale: {
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }
                      }}
                      style={{ transformOrigin: 'center' }}
                    />
                    <motion.div
                      className="absolute inset-2 bg-primary/10 rounded-full flex items-center justify-center"
                      animate={{
                        scale: [0.8, 1, 0.8],
                        opacity: [0.5, 1, 0.5]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                      style={{ transformOrigin: 'center' }}
                    >
                      <Brain className="w-5 h-5 text-primary" />
                    </motion.div>
                  </div>
                  <div className="flex-1 rounded-lg px-4 py-3 bg-card/50 border border-primary/20 shadow-lg relative overflow-hidden backdrop-blur-sm">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          {currentLanguage.code === 'en' ? 'AI Doctor is analyzing your request...' :
                           currentLanguage.code === 'es' ? 'El Doctor IA está analizando su consulta...' :
                           currentLanguage.code === 'hi' ? 'एआई डॉक्टर आपके प्रश्न का विश्लेषण कर रहा है...' :
                           currentLanguage.code === 'ar' ? 'الطبيب الذكي يحلل طلبك...' :
                           currentLanguage.code === 'zh' ? 'AI医生正在分析您的请求...' :
                           'AI Doctor is analyzing your request...'}
                        </span>
                        <motion.div
                          className="w-6 h-6 relative"
                          animate={{
                            rotate: 360
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "linear"
                          }}
                        >
                          <motion.div
                            className="absolute inset-0 border-2 border-primary/50 rounded-full border-t-transparent"
                            animate={{
                              scale: [1, 1.2, 1],
                              opacity: [0.5, 1, 0.5]
                            }}
                            transition={{
                              duration: 1.5,
                              repeat: Infinity,
                              ease: "easeInOut"
                            }}
                          />
                        </motion.div>
                      </div>
                      <div className="relative h-1.5 bg-primary/20 rounded-full overflow-hidden">
                        <motion.div
                          className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 via-primary to-violet-500"
                          animate={{
                            width: ['0%', '100%'],
                            x: ['-100%', '100%']
                          }}
                          transition={{
                            duration: 2.5,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                        />
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                          animate={{
                            x: ['-100%', '100%']
                          }}
                          transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            ease: "linear"
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {healthData && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4"
              >
                <HealthMetrics data={healthData.data} />
              </motion.div>
            )}
          </ScrollArea>

          {/* Chat Input Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="border-t border-primary/20 mt-4 pt-4 bg-background/80 backdrop-blur-sm"
          >
            <form onSubmit={handleSubmit} className="p-4 flex gap-3">
              <div className="flex-1 flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setShowReportDialog(true)}
                  className="flex-shrink-0 hover:scale-105 transition-transform"
                >
                  <List className="h-4 w-4" />
                </Button>
                <div className="relative">
                  <Button
                    type="button"
                    variant={listening ? "default" : "outline"}
                    size="icon"
                    onClick={listening ? stopRecording : startRecording}
                    className={cn(
                      "flex-shrink-0 transition-all duration-300",
                      listening && "bg-red-500 hover:bg-red-600",
                      listening ? "scale-110" : "hover:scale-105"
                    )}
                  >
                    <Mic className={cn(
                      "h-4 w-4",
                      listening && "text-white animate-pulse"
                    )} />
                  </Button>
                  {listening && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-8 left-1/2 -translate-x-1/2 bg-red-500 text-white text-xs px-2 py-1 rounded-full whitespace-nowrap"
                    >
                      {formatDuration(recordingDuration)}
                    </motion.div>
                  )}
                </div>
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={listening ? 
                    (currentLanguage.code === 'en' ? "Listening... Speak now"
                    : currentLanguage.code === 'es' ? "Escuchando... Hable ahora"
                    : currentLanguage.code === 'hi' ? "सुन रहा हूं... अब बोलें"
                    : currentLanguage.code === 'ar' ? "جاري الاستماع... تحدث الآن"
                    : currentLanguage.code === 'zh' ? "正在听... 请说话"
                    : "Listening... Speak now")
                    : t('askAnything')
                  }
                  disabled={isLoading}
                  className={cn(
                    "flex-1 bg-card/50 backdrop-blur-sm border-primary/20 focus:ring-2 ring-primary/20 transition-all",
                    currentLanguage.rtl && "text-right",
                    listening && "border-red-500/50 ring-red-500/20"
                  )}
                  dir={currentLanguage.rtl ? "rtl" : "ltr"}
                />
              </div>
              <Button 
                type="submit" 
                disabled={isLoading || (listening && !voiceText.trim())}
                className="hover:scale-105 transition-transform"
              >
                <Send className="w-4 h-4 mr-2" />
                {t('checkHealth')}
              </Button>
            </form>
          </motion.div>
        </Card>

        {/* Report Dialog */}
        <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{t('tellHealth')}</DialogTitle>
              <DialogDescription>
                {t('describeFeeling')}
              </DialogDescription>
            </DialogHeader>
            
            <Tabs defaultValue="symptoms" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="symptoms">{t('selectSymptoms')}</TabsTrigger>
                <TabsTrigger value="text">{t('writeDescription')}</TabsTrigger>
                <TabsTrigger value="file">{t('uploadReport')}</TabsTrigger>
              </TabsList>
              
              <TabsContent value="symptoms">
                <div className="grid grid-cols-2 gap-3 p-4">
                  {getLocalizedSymptoms().map((symptom) => (
                    <Button
                      key={symptom.id}
                      variant={selectedSymptoms.includes(symptom.id) ? "default" : "outline"}
                      className="h-auto py-4 flex flex-col items-center gap-2"
                      onClick={() => handleSymptomSelect(symptom.id)}
                    >
                      <span className="text-2xl">{symptom.icon}</span>
                      <span className="text-sm text-center">{symptom.label}</span>
                    </Button>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="text">
                <div className="space-y-4">
                  <Textarea
                    placeholder={t('describeFeeling')}
                    value={reportText}
                    onChange={(e) => setReportText(e.target.value)}
                    className={cn("min-h-[150px]", currentLanguage.rtl && "text-right")}
                    dir={currentLanguage.rtl ? "rtl" : "ltr"}
                  />
                  <div className="flex justify-center">
                    <Button
                      variant="outline"
                      className="flex items-center gap-2"
                      onClick={startRecording}
                      disabled={listening}
                    >
                      <Mic className={cn("h-4 w-4", listening && "text-red-500 animate-pulse")} />
                      {listening ? t('listening') : t('speak')}
                    </Button>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="file">
                <div
                  className={cn(
                    "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
                    "hover:border-primary/50 hover:bg-primary/5"
                  )}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleFileDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept=".pdf,image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) validateAndUploadFile(file);
                    }}
                  />
                  
                  {isProcessingFile ? (
                    <div className="flex flex-col items-center gap-2">
                      <Player
                        autoplay
                        loop
                        speed={0.5}
                        src="https://assets10.lottiefiles.com/packages/lf20_p8bfn5to.json"
                        style={{ height: '100px' }}
                      />
                      <p className="text-sm text-muted-foreground">Processing file...</p>
                    </div>
                  ) : uploadedFile ? (
                    <div className="flex flex-col items-center gap-4">
                      <div className="flex items-center gap-2">
                        {uploadedFile.type === 'application/pdf' ? (
                          <FileText className="h-8 w-8 text-primary" />
                        ) : (
                          <ImageIcon className="h-8 w-8 text-primary" />
                        )}
                        <span className="text-sm">{uploadedFile.name}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setUploadedFile(null);
                          setReportText('');
                        }}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Remove File
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <Upload className="h-8 w-8 text-primary mb-2" />
                      <p className="text-sm font-medium">Click to upload or drag and drop</p>
                      <p className="text-xs text-muted-foreground">PDF or Image (max 10MB)</p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => {
                setShowReportDialog(false);
                setUploadedFile(null);
                setReportText("");
                setSelectedSymptoms([]);
              }}>
                {t('cancel')}
              </Button>
              <Button 
                onClick={analyzeReport} 
                disabled={(!reportText.trim() && selectedSymptoms.length === 0) || isProcessingFile}
                className="gap-2"
              >
                <Activity className="h-4 w-4" />
                {t('checkHealth')}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
};

export default AiDoctor; 