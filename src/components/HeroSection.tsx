import { Leaf, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";

interface HeroSectionProps {
  onGetStarted: () => void;
}

const HeroSection = ({ onGetStarted }: HeroSectionProps) => {

  // 👉 ADD YOUR IMAGES HERE
  const demoImages = [
    "/demo.jpeg",
    "/demo1.jpeg", // second image
  ];

  const [currentDemo, setCurrentDemo] = useState(0);

  return (
    <section className="relative overflow-hidden py-20 lg:py-32">
      {/* Background decorations */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-pulse-slow" />
        <div
          className="absolute bottom-20 right-10 w-96 h-96 bg-success/5 rounded-full blur-3xl animate-pulse-slow"
          style={{ animationDelay: "2s" }}
        />
      </div>

      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary mb-8 animate-fade-in">
            <Sparkles className="w-4 h-4 text-accent" />
            <span className="text-sm font-medium text-secondary-foreground">
              AI-Powered solutions for Govt. of Odisha
            </span>
          </div>

          {/* Main heading */}
          <h1
            className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight animate-slide-up"
            style={{ animationDelay: "0.1s" }}
          >
            Predict Sapling{" "}
            <span className="gradient-text">Survival & Growth</span>
          </h1>

          {/* Subheading */}
          <p
            className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed animate-slide-up"
            style={{ animationDelay: "0.2s" }}
          >
            Upload your dataset and let our AI analyze environmental factors,
            soil conditions, and plant characteristics to predict which saplings
            will thrive.
          </p>

          {/* CTA Buttons */}
          <div
            className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up"
            style={{ animationDelay: "0.3s" }}
          >
            <Button variant="hero" size="xl" onClick={onGetStarted}>
              <Leaf className="w-5 h-5" />
              Analyze Dataset
            </Button>

            {/* View Demo Modal */}
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="glass" size="lg">
                  View Demo
                </Button>
              </DialogTrigger>

              <DialogContent className="max-w-4xl p-4 animate-in fade-in zoom-in">
                <DialogHeader>
                  <DialogTitle>Demo Preview</DialogTitle>
                </DialogHeader>

                {/* IMAGE SLIDER */}
                <div className="relative">

                  <img
                    src={demoImages[currentDemo]}
                    alt="Demo Screenshot"
                    className="rounded-lg w-full max-h-[75vh] object-contain"
                  />

                  {/* Left Button */}
                  <button
                    onClick={() =>
                      setCurrentDemo((prev) =>
                        prev === 0 ? demoImages.length - 1 : prev - 1
                      )
                    }
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/60 text-white px-3 py-1 rounded-full"
                  >
                    ‹
                  </button>

                  {/* Right Button */}
                  <button
                    onClick={() =>
                      setCurrentDemo((prev) =>
                        prev === demoImages.length - 1 ? 0 : prev + 1
                      )
                    }
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/60 text-white px-3 py-1 rounded-full"
                  >
                    ›
                  </button>

                </div>

              </DialogContent>
            </Dialog>
          </div>

          {/* Stats */}
          <div
            className="grid grid-cols-3 gap-8 mt-16 pt-8 border-t border-border/50 animate-fade-in"
            style={{ animationDelay: "0.5s" }}
          >
            <div>
              <p className="text-3xl md:text-4xl font-display font-bold text-primary">
                93-97%
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Prediction Accuracy
              </p>
            </div>

            <div>
              <p className="text-3xl md:text-4xl font-display font-bold text-primary">
                18K+
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Saplings Analyzed
              </p>
            </div>

            <div>
              <p className="text-3xl md:text-4xl font-display font-bold text-primary">
                12
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Species Supported
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
