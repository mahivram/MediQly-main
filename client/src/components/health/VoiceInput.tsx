import 'regenerator-runtime/runtime';
import { useEffect, useState, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  isListening: boolean;
  setIsListening: (isListening: boolean) => void;
}

export const VoiceInput = ({ onTranscript, isListening, setIsListening }: VoiceInputProps) => {
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentTranscript, setCurrentTranscript] = useState('');

  // Initialize speech recognition
  useEffect(() => {
    const initializeSpeechRecognition = async () => {
      try {
        // Request microphone permission
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(track => track.stop());

        // Check browser support
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
          setError("Browser doesn't support speech recognition");
          toast.error("Browser doesn't support speech recognition.");
          return;
        }

        // Create recognition instance
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognitionInstance = new SpeechRecognition();
        
        // Configure recognition
        recognitionInstance.continuous = true;
        recognitionInstance.interimResults = true;
        recognitionInstance.lang = 'en-US';

        // Set up event handlers
        recognitionInstance.onstart = () => {
          console.log('Speech recognition started');
          setIsListening(true);
          setCurrentTranscript('');
        };

        recognitionInstance.onend = () => {
          console.log('Speech recognition ended');
          setIsListening(false);
        };

        recognitionInstance.onerror = (event) => {
          console.error('Speech recognition error:', event.error);
          setError(`Recognition error: ${event.error}`);
          toast.error(`Speech recognition error: ${event.error}`);
          setIsListening(false);
        };

        recognitionInstance.onresult = (event) => {
          const transcript = Array.from(event.results)
            .map(result => result[0].transcript)
            .join(' ');
          
          console.log('Received transcript:', transcript);
          setCurrentTranscript(transcript);
          onTranscript(transcript);
        };

        setRecognition(recognitionInstance);
        setIsInitialized(true);
        console.log('Speech recognition initialized successfully');
      } catch (err) {
        console.error('Error initializing speech recognition:', err);
        setError("Failed to initialize microphone. Please check permissions.");
        toast.error("Failed to initialize microphone. Please check permissions.");
      }
    };

    initializeSpeechRecognition();

    // Cleanup
    return () => {
      if (recognition) {
        recognition.stop();
      }
    };
  }, []);

  const handleToggle = useCallback(async () => {
    if (!recognition) return;

    try {
      if (!isListening) {
        console.log('Starting speech recognition...');
        setError(null);
        
        // Check microphone permission
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          stream.getTracks().forEach(track => track.stop());
        } catch (err) {
          console.error('Microphone permission denied:', err);
          toast.error("Please grant microphone permission to use voice input.");
          return;
        }

        recognition.start();
        toast.success("Listening...");
      } else {
        console.log('Stopping speech recognition...');
        recognition.stop();
        setCurrentTranscript('');
      }
    } catch (err) {
      console.error('Error toggling speech recognition:', err);
      setError("Failed to toggle voice input");
      toast.error("Failed to start voice input. Please try again.");
    }
  }, [recognition, isListening]);

  if (!isInitialized || error) {
    return (
      <Button
        variant="secondary"
        size="icon"
        disabled={true}
        title={error || "Initializing..."}
      >
        {error ? (
          <Mic className="h-4 w-4 opacity-50" />
        ) : (
          <Loader2 className="h-4 w-4 animate-spin" />
        )}
      </Button>
    );
  }

  return (
    <Button
      variant={isListening ? "destructive" : "secondary"}
      size="icon"
      onClick={handleToggle}
      className="relative"
      title={isListening ? "Click to stop" : "Click to start voice input"}
    >
      {isListening ? (
        <>
          <MicOff className="h-4 w-4" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
        </>
      ) : (
        <Mic className="h-4 w-4" />
      )}
      {currentTranscript && isListening && (
        <span className="absolute -bottom-8 left-0 right-0 text-xs text-muted-foreground whitespace-nowrap overflow-hidden text-ellipsis">
          {currentTranscript}
        </span>
      )}
    </Button>
  );
}; 