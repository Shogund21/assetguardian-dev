
import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Camera, Upload, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ExtractedReading {
  type: string;
  value: string;
  unit: string;
  confidence: number;
  location?: string;
}

interface AIImageReaderProps {
  onReadingsExtracted: (readings: ExtractedReading[], imageUrl: string) => void;
  equipmentType?: string;
}

const AIImageReader = ({ onReadingsExtracted, equipmentType }: AIImageReaderProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [extractedReadings, setExtractedReadings] = useState<ExtractedReading[]>([]);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } // Use back camera on mobile
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraActive(true);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast({
        title: "Camera Error",
        description: "Unable to access camera. Please try uploading an image instead.",
        variant: "destructive",
      });
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      setIsCameraActive(false);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const imageData = canvas.toDataURL('image/jpeg', 0.8);
        setCapturedImage(imageData);
        stopCamera();
        processImage(imageData);
      }
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageData = e.target?.result as string;
        setCapturedImage(imageData);
        processImage(imageData);
      };
      reader.readAsDataURL(file);
    }
  };

  const processImage = async (imageData: string) => {
    setIsProcessing(true);
    try {
      console.log('Processing image for equipment type:', equipmentType);
      
      const { data, error } = await supabase.functions.invoke('extract-readings-from-image', {
        body: {
          image: imageData,
          equipmentType: equipmentType || 'general'
        }
      });

      if (error) throw error;

      console.log('Image extraction response:', data);
      
      if (data.status === 'needs_better_image') {
        toast({
          title: "Image Quality Too Low",
          description: "Readings detected but confidence below 98%. Please retake with better lighting and focus.",
          variant: "destructive",
        });
        setExtractedReadings([]);
        return;
      }
      
      if (data.status === 'success' && data.readings && data.readings.length > 0) {
        setExtractedReadings(data.readings);
        toast({
          title: "Readings Extracted!",
          description: `Found ${data.readings.length} high-confidence readings.`,
        });
        onReadingsExtracted(data.readings, imageData);
      } else {
        toast({
          title: "No Readings Found",
          description: "No clear readings detected. Try a clearer photo of displays or gauges.",
          variant: "destructive",
        });
        setExtractedReadings([]);
      }
    } catch (error) {
      console.error('Error processing image:', error);
      toast({
        title: "Processing Error",
        description: "Failed to extract readings from image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const reset = () => {
    setCapturedImage(null);
    setExtractedReadings([]);
    stopCamera();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="h-5 w-5" />
          AI Image Reading
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!capturedImage && !isCameraActive && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              onClick={startCamera}
              className="flex items-center gap-2 h-12"
              variant="outline"
            >
              <Camera className="h-4 w-4" />
              Take Photo
            </Button>
            
            <Button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 h-12"
              variant="outline"
            >
              <Upload className="h-4 w-4" />
              Upload Image
            </Button>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
        />

        {isCameraActive && (
          <div className="space-y-4">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full rounded-lg"
            />
            <div className="flex gap-2 justify-center">
              <Button onClick={capturePhoto} size="lg">
                <Camera className="h-4 w-4 mr-2" />
                Capture
              </Button>
              <Button onClick={stopCamera} variant="outline">
                Cancel
              </Button>
            </div>
          </div>
        )}

        <canvas ref={canvasRef} className="hidden" />

        {capturedImage && (
          <div className="space-y-4">
            <div className="relative">
              <img
                src={capturedImage}
                alt="Captured equipment"
                className="w-full rounded-lg max-h-64 object-contain border"
              />
              {isProcessing && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                  <div className="text-white text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                    <p>Extracting readings...</p>
                  </div>
                </div>
              )}
            </div>

            {extractedReadings.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2 text-green-700">
                  <CheckCircle className="h-4 w-4" />
                  Extracted Readings
                </h4>
                {extractedReadings.map((reading, index) => (
                  <div key={index} className="flex justify-between items-center p-2 bg-green-50 rounded border">
                    <span className="font-medium">{reading.type}</span>
                    <div className="text-right">
                      <span className="text-lg">{reading.value} {reading.unit}</span>
                      <div className="text-xs text-gray-500">
                        {Math.round(reading.confidence * 100)}% confident
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-2">
              <Button onClick={reset} variant="outline" className="flex-1">
                Try Another Image
              </Button>
              {extractedReadings.length === 0 && !isProcessing && (
                <Button onClick={() => processImage(capturedImage)} variant="outline" className="flex-1">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Retry Extraction
                </Button>
              )}
            </div>
          </div>
        )}

        <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded">
          <p className="font-medium mb-1">Enhanced AI Reading - Phase 1 Improvements:</p>
          <ul className="text-xs space-y-1">
            <li>• <strong>Latest AI Model:</strong> Using GPT-4.1 with multi-model validation</li>
            <li>• <strong>Equipment-Specific Training:</strong> Enhanced prompts with industry examples</li>
            <li>• <strong>Image Quality:</strong> Ensure displays are clearly visible and well-lit</li>
            <li>• <strong>Camera Tips:</strong> Hold steady, avoid reflections, get close to displays</li>
            <li>• <strong>Cross-Validation:</strong> Two AI models verify each reading for accuracy</li>
            <li>• <strong>Confidence Threshold:</strong> Only accepts readings with 98%+ confidence</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default AIImageReader;
