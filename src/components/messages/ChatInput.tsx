import { Image as ImageIcon, Camera, Send, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useRef, useState } from "react";
import { CameraModal } from "./CameraModal";

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: (images?: File[]) => void;
}

export function ChatInput({ value, onChange, onSend }: ChatInputProps) {
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      addImages(files);
    }
  };

  const addImages = (files: File[]) => {
    setSelectedImages(prev => [...prev, ...files]);
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setPreviews(prev => [...prev, ...newPreviews]);
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    URL.revokeObjectURL(previews[index]);
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (!value.trim() && selectedImages.length === 0) return;
    onSend(selectedImages);
    // Cleanup previews
    previews.forEach(url => URL.revokeObjectURL(url));
    setSelectedImages([]);
    setPreviews([]);
  };

  return (
    <div className="p-4 md:p-6 bg-white border-t md:border-none">
      <CameraModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={(file) => addImages([file])}
      />

      {/* Image Previews */}
      {previews.length > 0 && (
        <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar pb-2">
          {previews.map((url, index) => (
            <div key={url} className="relative flex-shrink-0">
              <img src={url} className="h-20 w-20 object-cover rounded-xl border border-gray-100" alt="preview" />
              <button
                onClick={() => removeImage(index)}
                className="absolute -top-1 -right-1 bg-gray-900 text-white rounded-full p-0.5 shadow-md"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center gap-2 md:gap-4">
        <div className="flex items-center gap-1">
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            multiple
            onChange={handleImageChange}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all"
          >
            <ImageIcon className="h-6 w-6" />
          </button>
          <button
            onClick={() => setIsCameraOpen(true)}
            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all"
          >
            <Camera className="h-6 w-6" />
          </button>
        </div>
        <div className="flex-1 relative">
          <Input
            placeholder="Type a message..."
            className="w-full bg-gray-50 border-none h-11 md:h-13 rounded-full px-5 md:px-7 text-base focus-visible:ring-1 focus-visible:ring-blue-100 transition-all font-medium"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          />
        </div>
        <button
          onClick={handleSubmit}
          className="bg-[#2222EE] p-2.5 md:p-3 rounded-full text-white hover:bg-blue-700 transition-all"
        >
          <Send className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
