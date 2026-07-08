import { Ruler } from "lucide-react";

const Measurements = () => (
  <div className="p-8 font-body flex flex-col items-center justify-center min-h-[70vh] text-center">
    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
      <Ruler className="w-8 h-8 text-primary" />
    </div>
    <h1 className="text-2xl font-extrabold text-on-surface font-headline mb-2">
      Measurements
    </h1>
    <p className="text-on-surface-variant max-w-md">
      Recording client measurements per garment, tied to product types and order
      items, is coming soon.
    </p>
  </div>
);

export default Measurements;
