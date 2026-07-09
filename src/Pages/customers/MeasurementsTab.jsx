import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Plus,
  Eye,
  Pencil,
  Copy,
  History,
  RefreshCw,
  Trash2,
  Ruler,
} from "lucide-react";
import * as measurementService from "../../services/measurementService";
import * as productTypeService from "../../services/productTypeService";
import Modal from "../../components/Modal";
import StatusBadge from "../../components/StatusBadge";
import MeasurementForm from "./MeasurementForm";

let draftKeySeq = 0;
const nextDraftKey = () => `draft-${++draftKeySeq}`;

const ReadOnlyMeasurement = ({ measurement }) => (
  <div className="space-y-3">
    <div className="flex items-center justify-between">
      <p className="text-sm font-bold text-on-surface">
        {measurement.garmentType}
      </p>
      <StatusBadge status={measurement.lockedForOrder ? "locked" : "active"} />
    </div>
    <p className="text-sm text-on-surface-variant">
      Rs. {measurement.price?.toLocaleString()}
    </p>
    {measurement.label && (
      <p className="text-xs text-on-surface-variant">
        Occasion: {measurement.label}
      </p>
    )}
    <div className="space-y-1.5">
      {measurement.values.map((v) => (
        <div
          key={v.fieldId}
          className="flex justify-between text-sm px-3 py-1.5 bg-stone-50 rounded-lg"
        >
          <span className="text-on-surface-variant">{v.label}</span>
          <span className="font-medium text-on-surface">
            {v.value} {v.unit}
          </span>
        </div>
      ))}
    </div>
    {measurement.notes && (
      <p className="text-xs text-on-surface-variant">
        Notes: {measurement.notes}
      </p>
    )}
    {measurement.createdAt && (
      <p className="text-xs text-on-surface-variant">
        Captured {new Date(measurement.createdAt).toLocaleDateString()}
      </p>
    )}
  </div>
);

// mode "create": no customerId yet — measurements are held as local drafts and
// only sent to the API together with the customer, via onDraftsChange.
// mode "manage": customerId exists — every action hits the API directly.
const MeasurementsTab = ({ mode, customerId, drafts, onDraftsChange }) => {
  const [measurements, setMeasurements] = useState([]);
  const [loading, setLoading] = useState(mode === "manage");
  const [productTypes, setProductTypes] = useState([]);
  const [productTypesLoading, setProductTypesLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState({});
  const [viewing, setViewing] = useState(null);
  // { action: 'add' | 'edit' | 'duplicate' | 'newVersion', source? } — source is
  // the existing measurement/draft this action was triggered from, if any.
  const [formState, setFormState] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await productTypeService.getAllProductTypes({
          isActive: "true",
          limit: 100,
        });
        setProductTypes(data.data);
      } catch {
        toast.error("Failed to load product types");
      } finally {
        setProductTypesLoading(false);
      }
    })();
  }, []);

  const fetchMeasurements = async () => {
    try {
      setLoading(true);
      const data = await measurementService.getAllMeasurements(customerId);
      setMeasurements(data);
    } catch {
      toast.error("Failed to fetch measurements");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (mode !== "manage" || !customerId) return;
    (async () => {
      await fetchMeasurements();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, customerId]);

  const items = mode === "create" ? drafts : measurements;

  const grouped = useMemo(() => {
    const map = new Map();
    for (const item of items) {
      const key = item.garmentType;
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(item);
    }
    return Array.from(map.entries());
  }, [items]);

  const closeForm = () => setFormState(null);

  const handleSave = async (draft) => {
    if (mode === "create") {
      if (formState.action === "edit") {
        onDraftsChange(
          drafts.map((d) =>
            d._localKey === formState.source._localKey
              ? { ...draft, _localKey: d._localKey }
              : d,
          ),
        );
      } else {
        onDraftsChange([...drafts, { ...draft, _localKey: nextDraftKey() }]);
      }
      closeForm();
      return;
    }

    setSaving(true);
    try {
      if (formState.action === "edit") {
        await measurementService.updateMeasurement(formState.source._id, draft);
        toast.success("Measurement updated successfully.");
      } else {
        await measurementService.createMeasurement({ ...draft, customerId });
        toast.success(
          formState.action === "newVersion"
            ? "New version saved successfully."
            : "Measurement saved successfully.",
        );
      }
      await fetchMeasurements();
      closeForm();
    } catch (error) {
      toast.error(error?.response?.data?.error || "Failed to save measurement");
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveDraft = (localKey) => {
    onDraftsChange(drafts.filter((d) => d._localKey !== localKey));
  };

  const toggleGroup = (garmentType) =>
    setExpandedGroups((prev) => ({
      ...prev,
      [garmentType]: !prev[garmentType],
    }));

  const renderActions = (item, isLatest) => (
    <div className="flex items-center gap-1">
      <button
        onClick={() => setViewing(item)}
        className="p-1.5 text-stone-400 hover:text-primary hover:bg-stone-50 rounded-lg transition-colors"
        title="View"
      >
        <Eye className="w-3.5 h-3.5" />
      </button>
      {mode === "create" ? (
        <>
          <button
            onClick={() => setFormState({ action: "edit", source: item })}
            className="p-1.5 text-stone-400 hover:text-primary hover:bg-stone-50 rounded-lg transition-colors"
            title="Edit"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleRemoveDraft(item._localKey)}
            className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Remove"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </>
      ) : (
        <>
          {isLatest && !item.lockedForOrder && (
            <button
              onClick={() => setFormState({ action: "edit", source: item })}
              className="p-1.5 text-stone-400 hover:text-primary hover:bg-stone-50 rounded-lg transition-colors"
              title="Edit"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            onClick={() => setFormState({ action: "duplicate", source: item })}
            className="p-1.5 text-stone-400 hover:text-primary hover:bg-stone-50 rounded-lg transition-colors"
            title="Duplicate"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
          {isLatest && item.lockedForOrder && (
            <button
              onClick={() =>
                setFormState({ action: "newVersion", source: item })
              }
              className="p-1.5 text-stone-400 hover:text-primary hover:bg-stone-50 rounded-lg transition-colors"
              title="Create New Version"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          )}
        </>
      )}
    </div>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
          Garment Measurements
        </p>
        <button
          type="button"
          onClick={() => setFormState({ action: "add" })}
          className="flex items-center gap-1 text-xs font-bold text-primary hover:underline"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Garment
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="w-6 h-6 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
        </div>
      ) : grouped.length === 0 ? (
        <div className="empty-state py-8!">
          <Ruler className="w-6 h-6 text-stone-300" />
          <p className="text-sm text-on-surface-variant">
            No measurements added yet.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {grouped.map(([garmentType, group]) => {
            const [latest, ...older] = group;
            const expanded = expandedGroups[garmentType];
            return (
              <div key={garmentType} className="p-3 bg-stone-50 rounded-xl">
                <div className="flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-on-surface truncate">
                      {garmentType}
                    </p>
                    <p className="text-xs text-on-surface-variant">
                      Rs. {latest.price?.toLocaleString()}
                      {mode === "manage" && latest.lockedForOrder && (
                        <span className="ml-2">
                          <StatusBadge status="locked" />
                        </span>
                      )}
                    </p>
                  </div>
                  {renderActions(latest, true)}
                </div>

                {older.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-stone-200">
                    <button
                      type="button"
                      onClick={() => toggleGroup(garmentType)}
                      className="flex items-center gap-1 text-xs font-bold text-on-surface-variant hover:text-primary"
                    >
                      <History className="w-3 h-3" />
                      {expanded ? "Hide" : "Show"} {older.length} earlier
                      version
                      {older.length === 1 ? "" : "s"}
                    </button>
                    {expanded && (
                      <div className="mt-2 space-y-1.5">
                        {older.map((item) => (
                          <div
                            key={item._id || item._localKey}
                            className="flex items-center justify-between px-2.5 py-1.5 bg-white rounded-lg"
                          >
                            <span className="text-xs text-on-surface-variant">
                              {item.createdAt
                                ? new Date(item.createdAt).toLocaleDateString()
                                : "—"}{" "}
                              · Rs. {item.price?.toLocaleString()}
                            </span>
                            {renderActions(item, false)}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {formState && (
        <Modal
          title={
            formState.action === "edit"
              ? "Edit Measurement"
              : formState.action === "duplicate"
                ? "Duplicate Measurement"
                : formState.action === "newVersion"
                  ? "Create New Version"
                  : "Add Garment Measurement"
          }
          onClose={closeForm}
        >
          <MeasurementForm
            productTypes={productTypes}
            productTypesLoading={productTypesLoading}
            initialData={formState.source}
            lockGarmentSelection={
              formState.action === "edit" || formState.action === "newVersion"
            }
            submitLabel={formState.action === "edit" ? "Save Changes" : "Save"}
            saving={saving}
            onSave={handleSave}
            onCancel={closeForm}
          />
        </Modal>
      )}

      {viewing && (
        <Modal title={viewing.garmentType} onClose={() => setViewing(null)}>
          <ReadOnlyMeasurement measurement={viewing} />
        </Modal>
      )}
    </div>
  );
};

export default MeasurementsTab;
