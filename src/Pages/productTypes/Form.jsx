import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft, Info, Ruler, Tag, Workflow as WorkflowIcon } from "lucide-react";
import * as productTypeService from "../../services/productTypeService";
import * as employeeService from "../../services/employeeService";
import MeasurementTemplateBuilder from "./MeasurementTemplateBuilder";
import ProductOptionsBuilder from "./ProductOptionsBuilder";
import WorkflowBuilder from "./WorkflowBuilder";

const TABS = [
  { id: "basic", label: "Basic Information", icon: Info },
  { id: "measurements", label: "Measurement Template", icon: Ruler },
  { id: "options", label: "Product Options", icon: Tag },
  { id: "workflow", label: "Production Workflow", icon: WorkflowIcon },
];

const hasDuplicates = (items) => new Set(items).size !== items.length;

const validate = ({ name, basePrice, measurementTemplate, options, workflow }) => {
  if (!name.trim()) return "Product name is required.";
  if (basePrice === "" || basePrice === null) return "Base price is required.";
  if (Number(basePrice) < 0) return "Base price cannot be negative.";

  if (hasDuplicates(measurementTemplate.map((f) => f.id.trim()))) {
    return "Duplicate measurement id.";
  }
  if (hasDuplicates(measurementTemplate.map((f) => f.label.trim().toLowerCase()))) {
    return "Duplicate measurement label.";
  }
  for (const field of measurementTemplate) {
    if (!field.id.trim() || !field.label.trim()) {
      return "Every measurement field needs an id and a label.";
    }
  }

  if (hasDuplicates(options.map((o) => o.name.trim().toLowerCase()))) {
    return "Duplicate option name.";
  }
  for (const option of options) {
    if (!option.name.trim() || option.values.length === 0) {
      return "Every option needs a name and at least one value.";
    }
    if (hasDuplicates(option.values.map((v) => v.trim().toLowerCase()))) {
      return `Duplicate option value in "${option.name}".`;
    }
  }

  if (hasDuplicates(workflow.map((s) => s.sequence))) {
    return "Duplicate workflow sequence.";
  }
  if (hasDuplicates(workflow.map((s) => s.step.trim().toLowerCase()))) {
    return "Duplicate workflow step.";
  }
  for (const step of workflow) {
    if (!step.step.trim() || !step.requiredSkill) {
      return "Every workflow step needs a name and a required skill.";
    }
  }

  return null;
};

const ProductTypeForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [tab, setTab] = useState("basic");
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [skills, setSkills] = useState([]);
  const [skillsLoading, setSkillsLoading] = useState(true);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [basePrice, setBasePrice] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [measurementTemplate, setMeasurementTemplate] = useState([]);
  const [options, setOptions] = useState([]);
  const [workflow, setWorkflow] = useState([]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    (async () => {
      try {
        const data = await employeeService.getSkills();
        setSkills(data);
      } catch {
        toast.error("Failed to load employee skills");
      } finally {
        setSkillsLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (!isEdit) return;
    (async () => {
      try {
        setLoading(true);
        const productType = await productTypeService.getProductTypeById(id);
        setName(productType.name);
        setDescription(productType.description || "");
        setBasePrice(String(productType.basePrice));
        setIsActive(productType.isActive);
        setMeasurementTemplate(
          [...productType.measurementTemplate].sort((a, b) => a.displayOrder - b.displayOrder),
        );
        setOptions(productType.options);
        setWorkflow([...productType.workflow].sort((a, b) => a.sequence - b.sequence));
      } catch {
        toast.error("Failed to load product type");
        navigate("/product-types");
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      setErrors({ name: "Product name is required." });
      setTab("basic");
      return;
    }
    if (basePrice === "" || Number(basePrice) < 0) {
      setErrors({ basePrice: "Enter a valid, non-negative price." });
      setTab("basic");
      return;
    }
    setErrors({});

    const error = validate({ name, basePrice, measurementTemplate, options, workflow });
    if (error) {
      toast.error(error);
      return;
    }

    const payload = {
      name: name.trim(),
      description: description.trim(),
      basePrice: Number(basePrice),
      isActive,
      measurementTemplate: measurementTemplate.map((f, i) => ({ ...f, displayOrder: i })),
      options,
      workflow,
    };

    setSaving(true);
    try {
      if (isEdit) {
        await productTypeService.updateProductType(id, payload);
        toast.success("Product type updated successfully.");
        navigate(`/product-types/${id}`);
      } else {
        const { productType } = await productTypeService.createProductType(payload);
        toast.success("Product type created successfully.");
        navigate(`/product-types/${productType._id}`);
      }
    } catch (err) {
      toast.error(err?.response?.data?.error || "Failed to save product type");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-8 font-body">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate("/product-types")}
            className="p-2 rounded-xl hover:bg-stone-100 transition-colors text-on-surface-variant"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-semibold text-on-surface tracking-tight font-newsreader">
              {isEdit ? "Edit Product Type" : "Create Product Type"}
            </h1>
            <p className="text-on-surface-variant mt-1 text-sm">
              Define the garment template's info, measurements, options, and workflow.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div
            className="bg-white rounded-2xl overflow-hidden"
            style={{ boxShadow: "0 4px 20px rgba(31,58,50,0.06)" }}
          >
            <div className="flex flex-wrap border-b border-stone-100 px-4">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTab(t.id)}
                  className={`flex items-center gap-1.5 px-4 py-3.5 text-sm font-bold border-b-2 transition-colors ${
                    tab === t.id
                      ? "border-primary text-primary"
                      : "border-transparent text-on-surface-variant hover:text-on-surface"
                  }`}
                >
                  <t.icon className="w-3.5 h-3.5" />
                  {t.label}
                </button>
              ))}
            </div>

            <div className="p-6">
              {tab === "basic" && (
                <div className="space-y-4 max-w-lg">
                  <div>
                    <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                      Product Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Men's Kameez"
                      className={`w-full px-3 py-2.5 bg-stone-50 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                        errors.name ? "border-red-400" : "border-transparent"
                      }`}
                    />
                    {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                      Description
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2.5 bg-stone-50 rounded-xl border-none text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                      Base Price (Rs.)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={basePrice}
                      onChange={(e) => setBasePrice(e.target.value)}
                      className={`w-full px-3 py-2.5 bg-stone-50 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                        errors.basePrice ? "border-red-400" : "border-transparent"
                      }`}
                    />
                    {errors.basePrice && (
                      <p className="mt-1 text-xs text-red-600">{errors.basePrice}</p>
                    )}
                  </div>
                  <label className="flex items-center gap-2 text-sm font-medium text-on-surface">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="w-4 h-4 accent-primary"
                    />
                    Active
                  </label>
                </div>
              )}

              {tab === "measurements" && (
                <MeasurementTemplateBuilder
                  value={measurementTemplate}
                  onChange={setMeasurementTemplate}
                />
              )}

              {tab === "options" && (
                <ProductOptionsBuilder value={options} onChange={setOptions} />
              )}

              {tab === "workflow" && (
                <WorkflowBuilder
                  value={workflow}
                  onChange={setWorkflow}
                  skills={skills}
                  skillsLoading={skillsLoading}
                />
              )}
            </div>
          </div>

          <div className="flex gap-3 mt-6 max-w-lg">
            <button
              type="button"
              onClick={() => navigate("/product-types")}
              className="flex-1 py-3 border border-stone-200 text-on-surface-variant font-bold rounded-full text-sm hover:bg-stone-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-3 bg-primary text-on-primary font-bold rounded-full text-sm hover:bg-primary-container transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {saving && (
                <div className="w-4 h-4 rounded-full border-2 border-on-primary/30 border-t-on-primary animate-spin" />
              )}
              {saving ? "Saving…" : isEdit ? "Update Product Type" : "Save Product Type"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductTypeForm;
