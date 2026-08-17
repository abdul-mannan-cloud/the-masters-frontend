import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ImageOff } from "lucide-react";
import { DEMO_CUSTOMER, prototypePreviewProducts } from "../data/previewPrototypeData";

// Super Admin-only visual prototype for the Product Type 2D preview feature.
// Everything here is hardcoded demo data (see src/data/previewPrototypeData.js)
// — no API calls, no MongoDB reads/writes, nothing shared with the real
// order/preview flow (components/GarmentPreview.jsx). Route access is gated
// the same way the existing Tenants page is (ProtectedRoute roles=["super_admin"]
// in App.jsx) — not a new/separate authorization mechanism.
const PreviewPrototype = () => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selected = prototypePreviewProducts[selectedIndex];
  const [previewEnabled, setPreviewEnabled] = useState(selected.previewEnabled);

  // Each demo product carries its own previewEnabled default (see data file —
  // e.g. Dupatta starts disabled, to also demonstrate the "preview not
  // configured for this product type" state) — switching products resets to
  // that default; the switch below still lets you override it manually.
  const handleSelectProduct = (index) => {
    setSelectedIndex(index);
    setPreviewEnabled(prototypePreviewProducts[index].previewEnabled);
  };

  return (
    <div className="p-8 font-body">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <div className="flex flex-wrap items-center gap-3 mb-1.5">
            <h1 className="text-2xl font-bold font-headline text-on-surface">
              Product Preview Prototype
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 text-[11px] font-bold uppercase tracking-wider">
              <Sparkles className="w-3 h-3" />
              Prototype / Demo Preview
            </span>
          </div>
          <p className="text-sm text-on-surface-variant max-w-xl">
            Hardcoded demo data, visible to Super Admin only. Demonstrates how a 2D garment
            preview could look before real product/garment assets exist. Nothing on this page is
            saved — no order, customer, or measurement record is ever created.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-stone-200 px-5 py-4 mb-5">
          <p className="text-[11px] font-bold uppercase tracking-widest text-on-surface-variant mb-0.5">
            Demo Order · Mock Data
          </p>
          <p className="text-sm font-semibold text-on-surface">
            {DEMO_CUSTOMER.name}{" "}
            <span className="text-on-surface-variant font-normal">
              · Order #{DEMO_CUSTOMER.orderNumber}
            </span>
          </p>
        </div>

        <div className="flex flex-wrap items-end justify-between gap-4 mb-5">
          <div>
            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
              Product Type
            </label>
            <select
              value={selectedIndex}
              onChange={(e) => handleSelectProduct(Number(e.target.value))}
              className="px-3 py-2 bg-white rounded-lg border border-stone-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 min-w-56"
            >
              {prototypePreviewProducts.map((p, i) => (
                <option key={p.productType} value={i}>
                  {p.productType}
                </option>
              ))}
            </select>
          </div>

          <label className="flex items-center gap-2.5 cursor-pointer select-none">
            <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
              Preview {previewEnabled ? "Enabled" : "Disabled"}
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={previewEnabled}
              onClick={() => setPreviewEnabled((v) => !v)}
              className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
                previewEnabled ? "bg-primary" : "bg-stone-300"
              }`}
            >
              <motion.span
                animate={{ x: previewEnabled ? 20 : 2 }}
                transition={{ type: "spring", stiffness: 500, damping: 32 }}
                className="absolute top-0.5 left-0 w-5 h-5 rounded-full bg-white shadow"
              />
            </button>
          </label>
        </div>

        <div
          className="bg-white rounded-2xl border border-stone-200 overflow-hidden"
          style={{ boxShadow: "0 4px 20px rgba(26,26,26,0.05)" }}
        >
          <div className="px-5 py-3 border-b border-stone-100">
            <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
              2D Preview
            </span>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={`${selectedIndex}-${previewEnabled}`}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="relative aspect-[4/5] bg-stone-50 flex items-center justify-center overflow-hidden">
                {previewEnabled ? (
                  <img
                    src={selected.image}
                    alt={selected.productType}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center px-6">
                    <ImageOff className="w-7 h-7 text-stone-300 mx-auto mb-1.5" />
                    <p className="text-xs text-on-surface-variant">
                      Preview turned off for this product.
                    </p>
                  </div>
                )}
              </div>

              <div className="px-5 py-4 space-y-4">
                <h2 className="text-lg font-bold font-headline text-on-surface">
                  {selected.productType}
                </h2>

                <div>
                  <p className="text-[11px] font-bold uppercase tracking-widest text-on-surface-variant mb-2">
                    Selected Design
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(selected.options).map(([name, value]) => (
                      <div key={name} className="text-sm">
                        <span className="text-on-surface-variant">{name}: </span>
                        <span className="font-semibold text-on-surface">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-[11px] font-bold uppercase tracking-widest text-on-surface-variant mb-2">
                    Measurements
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(selected.measurements).map(([name, value]) => (
                      <div
                        key={name}
                        className="flex items-center justify-between text-sm px-3 py-1.5 rounded-lg bg-stone-50"
                      >
                        <span className="text-on-surface-variant">{name}</span>
                        <span className="font-semibold text-on-surface">{value}&quot;</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-stone-100">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-widest text-on-surface-variant mb-0.5">
                      Fabric
                    </p>
                    <p className="text-sm font-semibold text-on-surface">{selected.fabric}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] font-bold uppercase tracking-widest text-on-surface-variant mb-0.5">
                      Price
                    </p>
                    <p className="text-lg font-bold font-headline text-primary">
                      Rs. {selected.price.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default PreviewPrototype;
