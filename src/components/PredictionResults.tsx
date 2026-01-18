import { useState, useEffect } from "react";
import { Leaf, TrendingUp, AlertTriangle, Sparkles, ThumbsUp } from "lucide-react";
import { SaplingData } from "./DataUpload";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PredictionResultsProps {
  data: SaplingData[];
}

interface Prediction {
  id: string;
  survivalProbability: number;
  growthPotential: "high" | "medium" | "low";
  recommendation: string;
  factors: string[];
}

interface PredictionWithSapling extends Prediction {
  sapling: SaplingData;
}

const PredictionResults = ({ data }: PredictionResultsProps) => {
  const [predictions, setPredictions] = useState<PredictionWithSapling[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const analyzeSaplings = async () => {
      setIsAnalyzing(true);
      setProgress(0);
      setError(null);

      // Simulate progress while waiting for AI
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 5, 85));
      }, 300);

      try {
        const { data: result, error: fnError } = await supabase.functions.invoke('analyze-saplings', {
          body: { saplings: data }
        });

        clearInterval(progressInterval);

        if (fnError) {
          throw new Error(fnError.message);
        }

        if (result.error) {
          throw new Error(result.error);
        }

        setProgress(100);

        // Map predictions to include sapling data
        const predictionsWithSaplings: PredictionWithSapling[] = result.predictions.map((pred: Prediction) => {
          const sapling = data.find(s => s.id === pred.id);
          return {
            ...pred,
            sapling: sapling || data[0] // Fallback
          };
        });

        setPredictions(predictionsWithSaplings);
        toast.success(`Successfully analyzed ${predictionsWithSaplings.length} saplings with AI`);
      } catch (err) {
        clearInterval(progressInterval);
        console.error('Analysis error:', err);
        const errorMessage = err instanceof Error ? err.message : 'Analysis failed';
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setIsAnalyzing(false);
      }
    };

    analyzeSaplings();
  }, [data]);

  const survivalCount = predictions.filter(p => p.survivalProbability >= 60).length;
  const highGrowthCount = predictions.filter(p => p.growthPotential === "high").length;

  if (isAnalyzing) {
    return (
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-xl mx-auto text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
              <Sparkles className="w-10 h-10 text-primary" />
            </div>
            <h3 className="font-display text-2xl font-bold text-foreground mb-4">
              AI Analyzing Saplings...
            </h3>
            <p className="text-muted-foreground mb-6">
              Gemini is evaluating environmental factors and growth patterns
            </p>
            <Progress value={progress} className="h-2" />
            <p className="text-sm text-muted-foreground mt-2">{progress}% complete</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-xl mx-auto text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="w-10 h-10 text-destructive" />
            </div>
            <h3 className="font-display text-2xl font-bold text-foreground mb-4">
              Analysis Failed
            </h3>
            <p className="text-muted-foreground mb-6">{error}</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Summary cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="glass-card rounded-xl p-6 animate-scale-in">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center">
                  <ThumbsUp className="w-6 h-6 text-success" />
                </div>
                <div>
                  <p className="text-3xl font-display font-bold text-foreground">{survivalCount}</p>
                  <p className="text-sm text-muted-foreground">Likely to Survive</p>
                </div>
              </div>
            </div>

            <div className="glass-card rounded-xl p-6 animate-scale-in" style={{ animationDelay: '0.1s' }}>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-3xl font-display font-bold text-foreground">{highGrowthCount}</p>
                  <p className="text-sm text-muted-foreground">High Growth Potential</p>
                </div>
              </div>
            </div>

            <div className="glass-card rounded-xl p-6 animate-scale-in" style={{ animationDelay: '0.2s' }}>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-warning/10 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-warning" />
                </div>
                <div>
                  <p className="text-3xl font-display font-bold text-foreground">{data.length - survivalCount}</p>
                  <p className="text-sm text-muted-foreground">Need Attention</p>
                </div>
              </div>
            </div>
          </div>

          {/* Prediction cards */}
          <h3 className="font-display text-2xl font-bold text-foreground mb-6">
            AI Predictions
          </h3>

          <div className="grid md:grid-cols-2 gap-4">
            {predictions.map((prediction, index) => (
              <div 
                key={prediction.id}
                className="glass-card rounded-xl p-6 animate-fade-in"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Leaf className="w-4 h-4 text-primary" />
                      <span className="font-semibold text-foreground">
                        {prediction.sapling.species}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        #{prediction.id}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {prediction.sapling.age_months} months • {prediction.sapling.height_cm}cm
                    </p>
                  </div>
                  <div className={`
                    px-3 py-1 rounded-full text-xs font-semibold
                    ${prediction.growthPotential === 'high' 
                      ? 'bg-success/10 text-success' 
                      : prediction.growthPotential === 'medium'
                      ? 'bg-accent/10 text-accent'
                      : 'bg-destructive/10 text-destructive'
                    }
                  `}>
                    {prediction.growthPotential.toUpperCase()} GROWTH
                  </div>
                </div>

                {/* Survival meter */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Survival Probability</span>
                    <span className="font-semibold text-foreground">{prediction.survivalProbability}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ${
                        prediction.survivalProbability >= 70 
                          ? 'bg-success' 
                          : prediction.survivalProbability >= 50
                          ? 'bg-accent'
                          : 'bg-destructive'
                      }`}
                      style={{ width: `${prediction.survivalProbability}%` }}
                    />
                  </div>
                </div>

                {/* Factors */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {prediction.factors.map((factor, i) => (
                    <span 
                      key={i}
                      className="text-xs px-2 py-1 rounded-md bg-secondary text-secondary-foreground"
                    >
                      {factor}
                    </span>
                  ))}
                </div>

                {/* Recommendation */}
                <p className="text-sm text-muted-foreground italic">
                  💡 {prediction.recommendation}
                </p>
              </div>
            ))}
          </div>

          {/* Export button */}
          <div className="text-center mt-10">
            <Button variant="hero" size="lg">
              Export Full Report
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PredictionResults;
