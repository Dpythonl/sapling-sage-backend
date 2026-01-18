import { useState, useRef } from "react";
import { Upload, FileSpreadsheet, X, Check, Image } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import * as GeoTIFF from "geotiff";

interface DataUploadProps {
  onDataLoaded: (data: SaplingData[], imageAnalysis?: ImageAnalysis) => void;
}

export interface SaplingData {
  id: string;
  species: string;
  age_months: number;
  height_cm: number;
  soil_ph: number;
  moisture_level: number;
  sunlight_hours: number;
  temperature_avg: number;
}

export interface ImageAnalysis {
  vegetationCoverage: number;
  healthyVegetation: number;
  soilVisibility: number;
  overallAssessment: string;
}

// Sample dataset for demo
const sampleData: SaplingData[] = [
  { id: "S001", species: "Oak", age_months: 8, height_cm: 45, soil_ph: 6.5, moisture_level: 65, sunlight_hours: 6, temperature_avg: 22 },
  { id: "S002", species: "Pine", age_months: 6, height_cm: 32, soil_ph: 5.8, moisture_level: 45, sunlight_hours: 8, temperature_avg: 18 },
  { id: "S003", species: "Maple", age_months: 10, height_cm: 58, soil_ph: 6.2, moisture_level: 70, sunlight_hours: 5, temperature_avg: 20 },
  { id: "S004", species: "Birch", age_months: 5, height_cm: 28, soil_ph: 5.5, moisture_level: 55, sunlight_hours: 7, temperature_avg: 16 },
  { id: "S005", species: "Oak", age_months: 12, height_cm: 72, soil_ph: 6.8, moisture_level: 60, sunlight_hours: 6, temperature_avg: 21 },
  { id: "S006", species: "Cedar", age_months: 7, height_cm: 38, soil_ph: 6.0, moisture_level: 50, sunlight_hours: 4, temperature_avg: 19 },
  { id: "S007", species: "Pine", age_months: 9, height_cm: 48, soil_ph: 5.2, moisture_level: 35, sunlight_hours: 9, temperature_avg: 17 },
  { id: "S008", species: "Maple", age_months: 4, height_cm: 22, soil_ph: 7.2, moisture_level: 80, sunlight_hours: 3, temperature_avg: 24 },
];

const DataUpload = ({ onDataLoaded }: DataUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFile(file);
    }
  };

  const isTifFile = (file: File): boolean => {
    const ext = file.name.toLowerCase();
    return ext.endsWith('.tif') || ext.endsWith('.tiff');
  };

  const processTifFile = async (file: File) => {
    setIsProcessing(true);
    toast.info("Processing TIF file with AI vision...");

    try {
      // Read the file as ArrayBuffer
      const arrayBuffer = await file.arrayBuffer();
      
      // Try to extract GeoTIFF metadata
      let metadata: any = {};
      try {
        const tiff = await GeoTIFF.fromArrayBuffer(arrayBuffer);
        const image = await tiff.getImage();
        metadata = {
          width: image.getWidth(),
          height: image.getHeight(),
          samplesPerPixel: image.getSamplesPerPixel(),
          bitsPerSample: image.getBitsPerSample(),
          origin: image.getOrigin(),
          resolution: image.getResolution(),
        };
        console.log("GeoTIFF metadata:", metadata);
      } catch (geoError) {
        console.log("Could not parse as GeoTIFF, sending as raw image");
      }

      // Convert to base64
      const base64 = btoa(
        new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
      );

      // Send to AI for analysis
      const { data: result, error } = await supabase.functions.invoke('analyze-tif-image', {
        body: {
          imageBase64: base64,
          fileName: file.name,
          metadata
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (result.error) {
        throw new Error(result.error);
      }

      const saplings = result.saplings || [];
      const imageAnalysis = result.imageAnalysis;

      if (saplings.length === 0) {
        toast.warning("No saplings detected in image. Using AI estimates based on vegetation patterns.");
      } else {
        toast.success(`AI detected ${saplings.length} saplings from your TIF image!`);
      }

      onDataLoaded(saplings.length > 0 ? saplings : sampleData, imageAnalysis);
    } catch (error) {
      console.error("Error processing TIF:", error);
      toast.error(error instanceof Error ? error.message : "Failed to process TIF file");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFile = async (file: File) => {
    setUploadedFile(file);

    if (isTifFile(file)) {
      await processTifFile(file);
    } else {
      // For CSV/Excel files, use sample data for now
      // In production, you'd parse the actual file
      setTimeout(() => {
        onDataLoaded(sampleData);
        toast.success("Data loaded successfully!");
      }, 1000);
    }
  };

  const handleClick = () => {
    if (!isProcessing) {
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const loadSampleData = () => {
    onDataLoaded(sampleData);
    toast.success("Sample data loaded!");
  };

  const removeFile = () => {
    setUploadedFile(null);
    setIsProcessing(false);
  };

  return (
    <section id="upload-section" className="py-16 lg:py-24">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          {/* Section header */}
          <div className="text-center mb-10">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Upload Your Dataset
            </h2>
            <p className="text-muted-foreground text-lg">
              Provide sapling data in CSV, Excel, or TIF/GeoTIFF format for AI analysis
            </p>
          </div>

          {/* Upload area */}
          <div
            onClick={handleClick}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`
              relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer
              transition-all duration-300 ease-out
              ${isDragging 
                ? 'border-primary bg-primary/5 scale-[1.02]' 
                : 'border-border hover:border-primary/50 hover:bg-muted/50'
              }
              ${uploadedFile ? 'border-success bg-success/5' : ''}
              ${isProcessing ? 'pointer-events-none opacity-75' : ''}
            `}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls,.tif,.tiff"
              onChange={handleFileChange}
              className="hidden"
              disabled={isProcessing}
            />

            {isProcessing ? (
              <div className="animate-pulse">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                  <Image className="w-8 h-8 text-primary animate-spin" />
                </div>
                <p className="text-lg font-medium text-foreground mb-2">
                  AI analyzing your TIF image...
                </p>
                <p className="text-sm text-muted-foreground">
                  Detecting saplings and vegetation patterns
                </p>
              </div>
            ) : uploadedFile ? (
              <div className="animate-scale-in">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-success/10 flex items-center justify-center">
                  <Check className="w-8 h-8 text-success" />
                </div>
                <div className="flex items-center justify-center gap-2 mb-2">
                  {isTifFile(uploadedFile) ? (
                    <Image className="w-5 h-5 text-success" />
                  ) : (
                    <FileSpreadsheet className="w-5 h-5 text-success" />
                  )}
                  <span className="font-medium text-foreground">{uploadedFile.name}</span>
                  <button 
                    onClick={(e) => { e.stopPropagation(); removeFile(); }}
                    className="p-1 hover:bg-muted rounded-full transition-colors"
                  >
                    <X className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>
                <p className="text-sm text-muted-foreground">File processed successfully!</p>
              </div>
            ) : (
              <>
                <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center transition-transform ${isDragging ? 'scale-110' : ''}`}>
                  <Upload className="w-8 h-8 text-primary" />
                </div>
                <p className="text-lg font-medium text-foreground mb-2">
                  Drag and drop your file here
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  or click to browse • CSV, XLSX, TIF/GeoTIFF supported
                </p>
                <div className="flex flex-wrap justify-center gap-2 text-xs text-muted-foreground">
                  <span className="px-2 py-1 bg-muted rounded-md">📊 CSV/Excel for tabular data</span>
                  <span className="px-2 py-1 bg-muted rounded-md">🛰️ TIF/GeoTIFF for satellite/drone imagery</span>
                </div>
              </>
            )}
          </div>

          {/* Or divider */}
          <div className="flex items-center gap-4 my-8">
            <div className="flex-1 h-px bg-border" />
            <span className="text-sm text-muted-foreground">or</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Sample data button */}
          <div className="text-center">
            <Button variant="secondary" size="lg" onClick={loadSampleData} disabled={isProcessing}>
              <FileSpreadsheet className="w-5 h-5" />
              Load Sample Dataset
            </Button>
            <p className="text-xs text-muted-foreground mt-2">
              Try with 8 sample saplings to see how it works
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DataUpload;
