import { SaplingData } from "./DataUpload";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface DataPreviewProps {
  data: SaplingData[];
}

const DataPreview = ({ data }: DataPreviewProps) => {
  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <h3 className="font-display text-2xl font-bold text-foreground mb-2">
              Dataset Preview
            </h3>
            <p className="text-muted-foreground">
              {data.length} saplings loaded for analysis
            </p>
          </div>

          <div className="glass-card rounded-xl overflow-hidden animate-fade-in">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold">ID</TableHead>
                    <TableHead className="font-semibold">Species</TableHead>
                    <TableHead className="font-semibold text-right">Age (months)</TableHead>
                    <TableHead className="font-semibold text-right">Height (cm)</TableHead>
                    <TableHead className="font-semibold text-right">Soil pH</TableHead>
                    <TableHead className="font-semibold text-right">Moisture %</TableHead>
                    <TableHead className="font-semibold text-right">Sunlight (hrs)</TableHead>
                    <TableHead className="font-semibold text-right">Temp (°C)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((sapling, index) => (
                    <TableRow 
                      key={sapling.id}
                      className="animate-fade-in"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <TableCell className="font-mono text-sm">{sapling.id}</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
                          {sapling.species}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">{sapling.age_months}</TableCell>
                      <TableCell className="text-right">{sapling.height_cm}</TableCell>
                      <TableCell className="text-right">{sapling.soil_ph}</TableCell>
                      <TableCell className="text-right">{sapling.moisture_level}</TableCell>
                      <TableCell className="text-right">{sapling.sunlight_hours}</TableCell>
                      <TableCell className="text-right">{sapling.temperature_avg}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DataPreview;
