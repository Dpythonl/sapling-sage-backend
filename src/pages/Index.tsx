import { useState, useRef } from "react";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import DataUpload, { SaplingData, ImageAnalysis } from "@/components/DataUpload";
import DataPreview from "@/components/DataPreview";
import PredictionResults from "@/components/PredictionResults";
import { Leaf, Eye, Sprout, Droplets } from "lucide-react";

const Index = () => {
  const [saplingData, setSaplingData] = useState<SaplingData[] | null>(null);
  const [imageAnalysis, setImageAnalysis] = useState<ImageAnalysis | null>(null);
  const uploadRef = useRef<HTMLDivElement>(null);

  const handleGetStarted = () => {
    uploadRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleDataLoaded = (data: SaplingData[], analysis?: ImageAnalysis) => {
    setSaplingData(data);
    setImageAnalysis(analysis || null);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main>
        <HeroSection onGetStarted={handleGetStarted} />
        
        <div ref={uploadRef}>
          <DataUpload onDataLoaded={handleDataLoaded} />
        </div>

        {/* Image Analysis Summary (for TIF files) */}
        {imageAnalysis && (
          <section className="py-8">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto">
                <h3 className="font-display text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                  <Eye className="w-5 h-5 text-primary" />
                  Image Analysis Results
                </h3>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  <div className="glass-card rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Leaf className="w-4 h-4 text-success" />
                      <span className="text-sm text-muted-foreground">Vegetation Coverage</span>
                    </div>
                    <p className="text-2xl font-bold text-foreground">{imageAnalysis.vegetationCoverage}%</p>
                  </div>
                  <div className="glass-card rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Sprout className="w-4 h-4 text-primary" />
                      <span className="text-sm text-muted-foreground">Healthy Vegetation</span>
                    </div>
                    <p className="text-2xl font-bold text-foreground">{imageAnalysis.healthyVegetation}%</p>
                  </div>
                  <div className="glass-card rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Droplets className="w-4 h-4 text-accent" />
                      <span className="text-sm text-muted-foreground">Soil Visibility</span>
                    </div>
                    <p className="text-2xl font-bold text-foreground">{imageAnalysis.soilVisibility}%</p>
                  </div>
                  <div className="glass-card rounded-lg p-4 sm:col-span-2 lg:col-span-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Eye className="w-4 h-4 text-warning" />
                      <span className="text-sm text-muted-foreground">Assessment</span>
                    </div>
                    <p className="text-sm font-medium text-foreground">{imageAnalysis.overallAssessment}</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {saplingData && (
          <>
            <DataPreview data={saplingData} />
            <PredictionResults data={saplingData} />
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8 mt-16">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">
            © 2026 ModelNurture. Saving trees Saving Lives.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
