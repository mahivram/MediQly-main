import { useState, useEffect } from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface VideoPlayerProps {
  videoId: string;
  isShort?: boolean;
  isMuted?: boolean;
  autoplay?: boolean;
}

export function VideoPlayer({ 
  videoId, 
  isShort = false, 
  isMuted = true,
  autoplay = false 
}: VideoPlayerProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const embedUrl = `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&playsinline=1&enablejsapi=1${autoplay ? '&autoplay=1' : ''}${isMuted ? '&mute=1' : ''}`;
  
  useEffect(() => {
    // Prevent body scroll when in fullscreen
    if (isFullscreen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isFullscreen]);

  if (isShort) {
    return (
      <div className="relative w-full h-full">
        <iframe
          src={embedUrl}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 w-full h-full"
        />
      </div>
    );
  }

  return (
    <>
      <Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
        <DialogContent className="sm:max-w-[90vw] max-h-[90vh] p-0">
          <div className="aspect-video w-full">
            <iframe
              src={embedUrl}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            />
          </div>
        </DialogContent>
      </Dialog>
      
      <div 
        className="aspect-video relative cursor-pointer" 
        onClick={() => setIsFullscreen(true)}
      >
        <iframe
          src={embedUrl}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 w-full h-full"
        />
      </div>
    </>
  );
} 