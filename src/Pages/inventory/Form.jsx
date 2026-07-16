import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useTenantNavigate } from "../../hooks/useTenantNavigate";
import { toast } from "sonner";
import { ArrowLeft, Upload } from "lucide-react";
import * as inventoryService from "../../services/inventoryService";
import Spinner from "../../components/Spinner";

const UNITS = ["meter", "yard", "piece", "roll"];

const InventoryForm = () => {
  const navigate = useTenantNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  const [fabricName, setFabricName] = useState("");
  const [fabricCode, setFabricCode] = useState("");
  const [category, setCategory] = useState("");
  const [color, setColor] = useState("");
  const [supplier, setSupplier] = useState("");
  const [unit, setUnit] = useState("meter");
  const [availableQuantity, setAvailableQuantity] = useState("0");
  const [minimumStockLevel, setMinimumStockLevel] = useState("0");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [sellingPrice, setSellingPrice] = useState("");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!isEdit) return;
    (async () => {
      try {
        setLoading(true);
        const item = await inventoryService.getInventoryById(id);
        setFabricName(item.fabricName);
        setFabricCode(item.fabricCode);
        setCategory(item.category || "");
        setColor(item.color || "");
        setSupplier(item.supplier || "");
        setUnit(item.unit);
        setAvailableQuantity(String(item.availableQuantity));
        setMinimumStockLevel(String(item.minimumStockLevel ?? 0));
        setPurchasePrice(item.purchasePrice !== undefined && item.purchasePrice !== null ? String(item.purchasePrice) : "");
        setSellingPrice(item.sellingPrice !== undefined && item.sellingPrice !== null ? String(item.sellingPrice) : "");
        setDescription(item.description || "");
        setIsActive(item.isActive);
        setImagePreview(item.image || null);
      } catch {
        toast.error("Failed to load inventory item");
        navigate("/inventory");
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isEdit]);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!fabricName.trim() || !fabricCode.trim()) {
      setErrors({ fabricName: !fabricName.trim() ? "Fabric name is required." : undefined });
      toast.error("Fabric name and code are required.");
      return;
    }
    if (Number(availableQuantity) < 0) {
      toast.error("Available quantity cannot be negative.");
      return;
    }
    setErrors({});

    const fields = {
      fabricName: fabricName.trim(),
      fabricCode: fabricCode.trim(),
      category: category.trim(),
      color: color.trim(),
      supplier: supplier.trim(),
      unit,
      minimumStockLevel: Number(minimumStockLevel) || 0,
      purchasePrice: purchasePrice === "" ? undefined : Number(purchasePrice),
      sellingPrice: sellingPrice === "" ? undefined : Number(sellingPrice),
      description: description.trim(),
      isActive,
    };
    if (!isEdit) fields.availableQuantity = Number(availableQuantity) || 0;

    let payload;
    if (imageFile) {
      payload = new FormData();
      Object.entries(fields).forEach(([key, value]) => {
        if (value !== undefined) payload.append(key, value);
      });
      payload.append("image", imageFile);
    } else {
      payload = fields;
    }

    setSaving(true);
    try {
      if (isEdit) {
        await inventoryService.updateInventory(id, payload);
        toast.success("Inventory item updated successfully.");
        navigate(`/inventory/${id}`);
      } else {
        const { item } = await inventoryService.createInventory(payload);
        toast.success("Inventory item created successfully.");
        navigate(`/inventory/${item._id}`);
      }
    } catch (err) {
      toast.error(err?.response?.data?.error || "Failed to save inventory item");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <Spinner size="xl" />
      </div>
    );
  }

  return (
    <div className="p-8 font-body">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate("/inventory")}
            className="p-2 rounded-xl hover:bg-stone-100 transition-colors text-on-surface-variant"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-semibold text-on-surface tracking-tight font-newsreader">
              {isEdit ? "Edit Fabric" : "Add Fabric"}
            </h1>
            <p className="text-on-surface-variant mt-1 text-sm">
              {isEdit
                ? "Update this fabric's details. Stock is adjusted separately."
                : "Add a new fabric to your inventory."}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div
            className="bg-white rounded-2xl p-6 space-y-4"
            style={{ boxShadow: "0 4px 20px rgba(26,26,26,0.08)" }}
          >
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-xl bg-stone-50 border border-stone-200 overflow-hidden flex items-center justify-center shrink-0">
                {imagePreview ? (
                  <img src={imagePreview} alt="Fabric" className="w-full h-full object-cover" />
                ) : (
                  <Upload className="w-6 h-6 text-stone-300" />
                )}
              </div>
              <label className="px-4 py-2 border border-stone-200 rounded-full text-sm font-bold text-on-surface-variant hover:bg-stone-50 cursor-pointer transition-colors">
                Upload Image
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                  Fabric Name
                </label>
                <input
                  type="text"
                  value={fabricName}
                  onChange={(e) => setFabricName(e.target.value)}
                  placeholder="e.g. Egyptian Cotton"
                  className={`w-full px-3 py-2.5 bg-stone-50 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                    errors.fabricName ? "border-red-400" : "border-transparent"
                  }`}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                  Fabric Code
                </label>
                <input
                  type="text"
                  value={fabricCode}
                  onChange={(e) => setFabricCode(e.target.value)}
                  placeholder="e.g. FB-001"
                  className="w-full px-3 py-2.5 bg-stone-50 rounded-xl border border-transparent text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                  Category
                </label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="e.g. Cotton"
                  className="w-full px-3 py-2.5 bg-stone-50 rounded-xl border border-transparent text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                  Color
                </label>
                <input
                  type="text"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-full px-3 py-2.5 bg-stone-50 rounded-xl border border-transparent text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                  Supplier
                </label>
                <input
                  type="text"
                  value={supplier}
                  onChange={(e) => setSupplier(e.target.value)}
                  className="w-full px-3 py-2.5 bg-stone-50 rounded-xl border border-transparent text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                  Unit
                </label>
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full px-3 py-2.5 bg-stone-50 rounded-xl border border-transparent text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 capitalize"
                >
                  {UNITS.map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
              </div>
              {!isEdit && (
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                    Opening Stock
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={availableQuantity}
                    onChange={(e) => setAvailableQuantity(e.target.value)}
                    className="w-full px-3 py-2.5 bg-stone-50 rounded-xl border border-transparent text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              )}
              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                  Minimum Stock Level
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={minimumStockLevel}
                  onChange={(e) => setMinimumStockLevel(e.target.value)}
                  className="w-full px-3 py-2.5 bg-stone-50 rounded-xl border border-transparent text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                  Purchase Price (Rs.)
                </label>
                <input
                  type="number"
                  min="0"
                  value={purchasePrice}
                  onChange={(e) => setPurchasePrice(e.target.value)}
                  className="w-full px-3 py-2.5 bg-stone-50 rounded-xl border border-transparent text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                  Selling Price (Rs.)
                </label>
                <input
                  type="number"
                  min="0"
                  value={sellingPrice}
                  onChange={(e) => setSellingPrice(e.target.value)}
                  className="w-full px-3 py-2.5 bg-stone-50 rounded-xl border border-transparent text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
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

          <div className="flex gap-3 mt-6 max-w-lg">
            <button
              type="button"
              onClick={() => navigate("/inventory")}
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
                <Spinner size="sm" tone="on-primary" />
              )}
              {saving ? "Saving…" : isEdit ? "Update Fabric" : "Save Fabric"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InventoryForm;
