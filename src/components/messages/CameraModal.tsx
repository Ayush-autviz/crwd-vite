import { useRef, useState, useEffect } from "react";
import { X, Camera, RefreshCw } from "lucide-react";
import { Button } from "../ui/button";

interface CameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (file: File) => void;
}

export function CameraModal({ isOpen, onClose, onCapture }: CameraModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [isOpen, facingMode]);

  const startCamera = async () => {
    try {
      setError(null);
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode },
        audio: false,
      });
      setStream(newStream);
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
      }
    } catch (err) {
      console.error("Camera access error:", err);
      setError("Could not access camera. Please check permissions.");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], `capture-${Date.now()}.jpg`, { type: "image/jpeg" });
            onCapture(file);
            onClose();
          }
        }, "image/jpeg", 0.8);
      }
    }
  };

  const toggleCamera = () => {
    setFacingMode(prev => prev === "user" ? "environment" : "user");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black">
      <div className="relative w-full h-full flex flex-col">
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-10 bg-gradient-to-b from-black/50 to-transparent">
          <button onClick={onClose} className="text-white p-2 hover:bg-white/20 rounded-full transition-colors">
            <X className="h-6 w-6" />
          </button>
          <button onClick={toggleCamera} className="text-white p-2 hover:bg-white/20 rounded-full transition-colors">
            <RefreshCw className="h-6 w-6" />
          </button>
        </div>

        {/* Video Preview */}
        <div className="flex-1 flex items-center justify-center bg-black relative">
          {error ? (
            <div className="text-white text-center p-6">
              <p className="mb-4">{error}</p>
              <Button onClick={startCamera} variant="outline" className="border-white text-white hover:bg-white hover:text-black">
                Try Again
              </Button>
            </div>
          ) : (
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              className="w-full h-full object-cover md:max-w-3xl md:h-auto md:rounded-3xl"
            />
          )}
          <canvas ref={canvasRef} className="hidden" />
        </div>

        {/* Footer / Controls */}
        <div className="p-10 flex justify-center items-center bg-gradient-to-t from-black/50 to-transparent">
          <button 
            onClick={handleCapture}
            disabled={!!error || !stream}
            className="h-20 w-20 bg-white rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-all disabled:opacity-50 disabled:active:scale-100"
          >
            <div className="h-16 w-16 border-4 border-black/10 rounded-full flex items-center justify-center">
              <Camera className="h-8 w-8 text-black" />
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
