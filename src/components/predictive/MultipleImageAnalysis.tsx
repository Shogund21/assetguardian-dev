import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Camera, 
  Upload, 
  Loader2, 
  CheckCircle, 
  AlertCircle, 
  X, 
  Download,
  FileText,
  Images,
  Save,
  Database
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ImageAnalysisService, type ImageAnalysisBatch } from "@/services/imageAnalysisService";

interface ExtractedReading {
  type: string;
  value: string;
  unit: string;
  confidence: number;
  location?: string;
}

interface ProcessedImage {
  id: string;
  imageData: string;
  fileName: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  readings: ExtractedReading[];
  error?: string;
}

interface MultipleImageAnalysisProps {
  equipmentId?: string;
  equipmentType?: string;
  equipmentName?: string;
}

const MultipleImageAnalysis = ({ equipmentId, equipmentType, equipmentName }: MultipleImageAnalysisProps) => {
  const [images, setImages] = useState<ProcessedImage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [currentBatch, setCurrentBatch] = useState<ImageAnalysisBatch | null>(null);
  const [currentProcessingIndex, setCurrentProcessingIndex] = useState(-1);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraActive(true);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast({
        title: "Camera Error",
        description: "Unable to access camera. Please try uploading images instead.",
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
        const newImage: ProcessedImage = {
          id: Date.now().toString(),
          imageData,
          fileName: `Camera_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.jpg`,
          status: 'pending',
          readings: []
        };
        setImages(prev => [...prev, newImage]);
      }
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    files.forEach((file, index) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageData = e.target?.result as string;
        const newImage: ProcessedImage = {
          id: `${Date.now()}_${index}`,
          imageData,
          fileName: file.name,
          status: 'pending',
          readings: []
        };
        setImages(prev => [...prev, newImage]);
      };
      reader.readAsDataURL(file);
    });

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const processAllImages = async () => {
    if (images.length === 0) return;

    setIsProcessing(true);
    const pendingImages = images.filter(img => img.status === 'pending' || img.status === 'error');
    let totalReadings = 0;

    try {
      // Create a batch for this processing session
      const batch = await ImageAnalysisService.createBatch({
        equipment_id: equipmentId,
        equipment_name: equipmentName,
        equipment_type: equipmentType,
        batch_name: `Image Analysis - ${new Date().toLocaleString()}`,
        total_images: pendingImages.length,
        company_id: undefined // Will be set by the service based on user context
      });
      setCurrentBatch(batch);

      for (let i = 0; i < pendingImages.length; i++) {
        const image = pendingImages[i];
        setCurrentProcessingIndex(i);
        
        // Update status to processing
        setImages(prev => prev.map(img => 
          img.id === image.id ? { ...img, status: 'processing' as const } : img
        ));

        try {
          console.log(`Processing image ${i + 1}/${pendingImages.length}:`, image.fileName);
          
          const { data, error } = await supabase.functions.invoke('extract-readings-from-image', {
            body: {
              image: image.imageData,
              equipmentType: equipmentType || 'general',
              fileName: image.fileName
            }
          });

          if (error) throw error;

          if (data.status === 'success' && data.readings && data.readings.length > 0) {
            // Save readings to staging table
            const stagingData = data.readings.map((reading: ExtractedReading) => ({
              batch_id: batch.id,
              image_id: image.id,
              image_filename: image.fileName,
              equipment_id: equipmentId,
              sensor_type: reading.type,
              value: parseFloat(reading.value),
              unit: reading.unit,
              confidence: reading.confidence,
              location_on_image: reading.location
            }));

            await ImageAnalysisService.addStagedReadings(stagingData);
            totalReadings += data.readings.length;

            setImages(prev => prev.map(img => 
              img.id === image.id ? { 
                ...img, 
                status: 'completed' as const, 
                readings: data.readings,
                error: undefined
              } : img
            ));
          } else {
            setImages(prev => prev.map(img => 
              img.id === image.id ? { 
                ...img, 
                status: 'error' as const,
                error: 'No clear readings detected'
              } : img
            ));
          }
        } catch (error) {
          console.error(`Error processing image ${image.fileName}:`, error);
          setImages(prev => prev.map(img => 
            img.id === image.id ? { 
              ...img, 
              status: 'error' as const,
              error: 'Failed to process image'
            } : img
          ));
        }

        // Small delay between processing
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // Update batch with final counts
      await ImageAnalysisService.updateBatchProgress(batch.id, {
        processed_images: pendingImages.length,
        total_readings: totalReadings,
        status: 'completed'
      });

    } catch (error) {
      console.error('Error creating batch:', error);
      toast({
        title: "Batch Creation Failed",
        description: "Failed to create processing batch",
        variant: "destructive",
      });
    }

    setIsProcessing(false);
    setCurrentProcessingIndex(-1);

    const completedImages = images.filter(img => img.status === 'completed');
    
    toast({
      title: "Batch Processing Complete",
      description: `Processed ${pendingImages.length} images and extracted ${totalReadings} readings.`,
    });
  };

  const saveAllReadings = async () => {
    if (!currentBatch) {
      toast({
        title: "No Batch Found",
        description: "Please process images first to create a batch",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const result = await ImageAnalysisService.saveStagedReadings(currentBatch.id);
      
      if (result.success) {
        toast({
          title: "Readings Saved Successfully",
          description: `Saved ${result.saved_count} readings to the database and created maintenance check`,
        });
        
        // Reset the current batch after successful save
        setCurrentBatch(null);
      } else {
        throw new Error(result.error || 'Failed to save readings');
      }
    } catch (error) {
      console.error('Error saving readings:', error);
      toast({
        title: "Save Failed",
        description: error instanceof Error ? error.message : "Failed to save readings to database",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const removeImage = (imageId: string) => {
    setImages(prev => prev.filter(img => img.id !== imageId));
  };

  const exportResults = () => {
    const completedImages = images.filter(img => img.status === 'completed');
    const results = {
      equipment: {
        id: equipmentId,
        name: equipmentName,
        type: equipmentType
      },
      processedAt: new Date().toISOString(),
      summary: {
        totalImages: images.length,
        successfullyProcessed: completedImages.length,
        totalReadingsExtracted: completedImages.reduce((sum, img) => sum + img.readings.length, 0)
      },
      results: completedImages.map(img => ({
        fileName: img.fileName,
        readings: img.readings
      }))
    };

    const blob = new Blob([JSON.stringify(results, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `readings_analysis_${equipmentName || 'equipment'}_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getStatusIcon = (status: ProcessedImage['status']) => {
    switch (status) {
      case 'pending':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case 'processing':
        return <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error':
        return <X className="h-4 w-4 text-red-600" />;
    }
  };

  const getStatusColor = (status: ProcessedImage['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'error':
        return 'bg-red-100 text-red-800';
    }
  };

  const completedImages = images.filter(img => img.status === 'completed');
  const totalReadings = completedImages.reduce((sum, img) => sum + img.readings.length, 0);
  const progressPercentage = images.length > 0 ? (completedImages.length / images.length) * 100 : 0;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Images className="h-5 w-5" />
            Multiple Image AI Analysis
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Upload multiple images of equipment displays, gauges, and screens for batch AI analysis
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isCameraActive && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                onClick={startCamera}
                className="flex items-center gap-2 h-12"
                variant="outline"
              >
                <Camera className="h-4 w-4" />
                Take Photos
              </Button>
              
              <Button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 h-12"
                variant="outline"
              >
                <Upload className="h-4 w-4" />
                Upload Images
              </Button>

              {images.length > 0 && (
                <Button
                  onClick={processAllImages}
                  disabled={isProcessing}
                  className="flex items-center gap-2 h-12"
                >
                  {isProcessing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <FileText className="h-4 w-4" />
                  )}
                  Process All
                </Button>
              )}
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
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
                  Done
                </Button>
              </div>
            </div>
          )}

          <canvas ref={canvasRef} className="hidden" />

          {images.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  {images.length} images • {completedImages.length} processed • {totalReadings} readings extracted
                </div>
                <div className="flex gap-2">
                  {currentBatch && totalReadings > 0 && (
                    <Button
                      onClick={saveAllReadings}
                      disabled={isSaving}
                      size="sm"
                      className="flex items-center gap-1"
                    >
                      {isSaving ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Save className="h-3 w-3" />
                      )}
                      Save All Readings
                    </Button>
                  )}
                  {completedImages.length > 0 && (
                    <Button
                      onClick={exportResults}
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-1"
                    >
                      <Download className="h-3 w-3" />
                      Export
                    </Button>
                  )}
                </div>
              </div>

              {isProcessing && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Processing images...</span>
                    <span>{Math.round(progressPercentage)}%</span>
                  </div>
                  <Progress value={progressPercentage} className="w-full" />
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {images.map((image, index) => (
                  <Card key={image.id} className="relative">
                    <div className="absolute top-2 right-2 z-10">
                      <Button
                        onClick={() => removeImage(image.id)}
                        size="sm"
                        variant="destructive"
                        className="h-6 w-6 p-0"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                    
                    <div className="aspect-video relative overflow-hidden rounded-t-lg">
                      <img
                        src={image.imageData}
                        alt={image.fileName}
                        className="w-full h-full object-cover"
                      />
                      {image.status === 'processing' && currentProcessingIndex === index && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <div className="text-white text-center">
                            <Loader2 className="h-6 w-6 animate-spin mx-auto mb-1" />
                            <p className="text-xs">Processing...</p>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <CardContent className="p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium truncate flex-1">
                          {image.fileName}
                        </span>
                        <Badge variant="secondary" className={`ml-2 ${getStatusColor(image.status)}`}>
                          {getStatusIcon(image.status)}
                          <span className="ml-1 capitalize">{image.status}</span>
                        </Badge>
                      </div>

                      {image.status === 'completed' && image.readings.length > 0 && (
                        <div className="space-y-1">
                          <div className="text-xs font-medium text-green-700">
                            {image.readings.length} readings found:
                          </div>
                          {image.readings.slice(0, 3).map((reading, readingIndex) => (
                            <div key={readingIndex} className="text-xs bg-green-50 p-1 rounded">
                              <span className="font-medium">{reading.type}:</span> {reading.value} {reading.unit}
                            </div>
                          ))}
                          {image.readings.length > 3 && (
                            <div className="text-xs text-muted-foreground">
                              +{image.readings.length - 3} more...
                            </div>
                          )}
                        </div>
                      )}

                      {image.status === 'error' && (
                        <div className="text-xs text-red-600">
                          {image.error}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {totalReadings > 0 && (
            <>
              <Separator />
              <Card className="border-green-200 bg-green-50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-green-800">Analysis Summary</h4>
                    {currentBatch && (
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                        <Database className="h-3 w-3 mr-1" />
                        Batch Created - Ready to Save
                      </Badge>
                    )}
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="text-2xl font-bold text-green-700">{images.length}</div>
                      <div className="text-green-600">Images</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-700">{completedImages.length}</div>
                      <div className="text-green-600">Processed</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-700">{totalReadings}</div>
                      <div className="text-green-600">Readings</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-700">
                        {completedImages.length > 0 ? Math.round((totalReadings / completedImages.length) * 10) / 10 : 0}
                      </div>
                      <div className="text-green-600">Avg/Image</div>
                    </div>
                  </div>
                  {currentBatch && (
                    <div className="mt-3 text-xs text-blue-700 bg-blue-50 p-2 rounded">
                      <strong>Batch:</strong> {currentBatch.batch_name}<br/>
                      <strong>Status:</strong> Ready to save {totalReadings} readings to database
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}

          <div className="text-sm text-muted-foreground bg-blue-50 p-3 rounded">
            <p className="font-medium mb-1">Batch Processing Tips:</p>
            <ul className="text-xs space-y-1">
              <li>• Upload multiple images of different equipment displays and gauges</li>
              <li>• Ensure each image is well-lit and displays are clearly visible</li>
              <li>• Processing happens sequentially to maintain accuracy</li>
              <li>• Export results as JSON for further analysis or reporting</li>
              <li>• Each image is processed independently with equipment-specific AI models</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MultipleImageAnalysis;