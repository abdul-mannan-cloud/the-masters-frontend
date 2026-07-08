import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft, Pencil, Trash2, Power } from "lucide-react";
import * as productTypeService from "../../services/productTypeService";
import StatusBadge from "../../components/StatusBadge";

const ProductTypeView = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [productType, setProductType] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProductType = async () => {
    try {
      setLoading(true);
      const data = await productTypeService.getProductTypeById(id);
      setProductType(data);
    } catch {
      toast.error("Failed to fetch product type");
      navigate("/product-types");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      await fetchProductType();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleToggleStatus = async () => {
    const activating = !productType.isActive;
    if (!activating && !window.confirm(`Deactivate "${productType.name}"?`))
      return;
    try {
      const { productType: updated } =
        await productTypeService.toggleProductTypeStatus(id, activating);
      setProductType(updated);
      toast.success(`Product type ${activating ? "activated" : "deactivated"}`);
    } catch (error) {
      toast.error(error?.response?.data?.error || "Failed to update status");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this product type?"))
      return;
    try {
      await productTypeService.deleteProductType(id);
      toast.success("Product type deleted successfully");
      navigate("/product-types");
    } catch (error) {
      toast.error(
        error?.response?.data?.error || "Failed to delete product type",
      );
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
      </div>
    );
  }

  if (!productType) return null;

  const sortedMeasurements = [...productType.measurementTemplate].sort(
    (a, b) => a.displayOrder - b.displayOrder,
  );
  const sortedWorkflow = [...productType.workflow].sort(
    (a, b) => a.sequence - b.sequence,
  );

  return (
    <div className="p-8 font-body">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate("/product-types")}
            className="p-2 rounded-xl hover:bg-slate-100 transition-colors text-on-surface-variant"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-extrabold text-on-surface tracking-tight font-headline">
                {productType.name}
              </h1>
              <StatusBadge
                status={productType.isActive ? "active" : "inactive"}
              />
            </div>
            <p className="text-on-surface-variant mt-1 text-sm">
              Rs. {productType.basePrice?.toLocaleString()} base price
            </p>
          </div>
          <button
            onClick={() => navigate(`/product-types/${id}/edit`)}
            className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 text-on-surface-variant font-bold rounded-full text-sm hover:bg-slate-50 transition-colors"
          >
            <Pencil className="w-4 h-4" />
            Edit
          </button>
          <button
            onClick={handleToggleStatus}
            className="p-2.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-full transition-colors"
            title={productType.isActive ? "Deactivate" : "Activate"}
          >
            <Power className="w-5 h-5" />
          </button>
          <button
            onClick={handleDelete}
            className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
            title="Delete"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div
            className="bg-white rounded-2xl p-6"
            style={{ boxShadow: "0 4px 20px rgba(30,58,138,0.05)" }}
          >
            <h3 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-4 font-headline">
              Basic Information
            </h3>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-xs text-on-surface-variant">Description</p>
                <p className="text-on-surface">
                  {productType.description || "—"}
                </p>
              </div>
              <div>
                <p className="text-xs text-on-surface-variant">Created</p>
                <p className="text-on-surface">
                  {new Date(productType.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          <div
            className="bg-white rounded-2xl p-6"
            style={{ boxShadow: "0 4px 20px rgba(30,58,138,0.05)" }}
          >
            <h3 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-4 font-headline">
              Measurement Template
            </h3>
            {sortedMeasurements.length === 0 ? (
              <p className="text-sm text-on-surface-variant">
                No measurement fields defined.
              </p>
            ) : (
              <div className="space-y-2">
                {sortedMeasurements.map((field) => (
                  <div
                    key={field.id}
                    className="flex items-center justify-between px-3 py-2 bg-slate-50 rounded-lg text-sm"
                  >
                    <span className="font-medium text-on-surface">
                      {field.label}
                    </span>
                    <span className="text-on-surface-variant">
                      {field.unit}
                      {field.required && (
                        <span className="ml-2 text-red-500 font-bold">
                          required
                        </span>
                      )}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div
            className="bg-white rounded-2xl p-6"
            style={{ boxShadow: "0 4px 20px rgba(30,58,138,0.05)" }}
          >
            <h3 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-4 font-headline">
              Product Options
            </h3>
            {productType.options.length === 0 ? (
              <p className="text-sm text-on-surface-variant">
                No options defined.
              </p>
            ) : (
              <div className="space-y-3">
                {productType.options.map((option) => (
                  <div key={option.name}>
                    <p className="text-sm font-bold text-on-surface mb-1.5">
                      {option.name}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {option.values.map((v) => (
                        <span
                          key={v}
                          className="px-2.5 py-1 bg-slate-50 rounded-full text-xs font-medium text-on-surface-variant"
                        >
                          {v}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div
            className="bg-white rounded-2xl p-6"
            style={{ boxShadow: "0 4px 20px rgba(30,58,138,0.05)" }}
          >
            <h3 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-4 font-headline">
              Production Workflow
            </h3>
            {sortedWorkflow.length === 0 ? (
              <p className="text-sm text-on-surface-variant">
                No workflow steps defined.
              </p>
            ) : (
              <div className="space-y-2">
                {sortedWorkflow.map((step) => (
                  <div
                    key={step.sequence}
                    className="flex items-center justify-between px-3 py-2 bg-slate-50 rounded-lg text-sm"
                  >
                    <div>
                      <span className="text-xs text-on-surface-variant mr-2">
                        {step.sequence}
                      </span>
                      <span className="font-medium text-on-surface">
                        {step.step}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-on-surface-variant text-xs">
                        {step.requiredSkill}
                      </p>
                      {step.estimatedDurationHours != null && (
                        <p className="text-on-surface-variant text-xs">
                          {step.estimatedDurationHours}h
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductTypeView;
