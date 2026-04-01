import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import { useSaveStatusStore } from '@/stores/saveStatusStore';

export function useEntityDetail({
  entityId,
  entityType,
  fetchEntity,
  updateEntity,
  deleteEntity,
  entityFromStore,
  getUpdatePayload,
  onBack,
}) {
  const [formData, setFormData] = useState(null);
  const [isDirty, setIsDirty] = useState(false);
  const storeSnapshotRef = useRef(null);

  const entityKey = `${entityType}-${entityId}`;
  const markUnsaved = useSaveStatusStore((s) => s.markUnsaved);
  const markSaving = useSaveStatusStore((s) => s.markSaving);
  const markSaved = useSaveStatusStore((s) => s.markSaved);
  const markError = useSaveStatusStore((s) => s.markError);
  const removeEntity = useSaveStatusStore((s) => s.removeEntity);

  useEffect(() => {
    if (entityId) fetchEntity(entityId);
  }, [entityId, fetchEntity]);

  useEffect(() => {
    return () => {
      removeEntity(entityKey);
    };
  }, [entityKey, removeEntity]);

  useEffect(() => {
    if (!entityFromStore) return;

    const storeJson = JSON.stringify(entityFromStore);
    const isNewItem = !formData || entityFromStore.id !== formData.id;
    const storeActuallyChanged = storeJson !== storeSnapshotRef.current;

    if (isNewItem || (!isDirty && storeActuallyChanged)) {
      setFormData({ ...entityFromStore });
      storeSnapshotRef.current = storeJson;
      setIsDirty(false);
      markSaved(entityKey);
    }
  }, [entityFromStore, isDirty, formData?.id, entityKey, markSaved]);

  const handleCoreChange = useCallback(
    (field, value) => {
      setFormData((prev) => {
        const next = { ...prev, [field]: value };
        const dirty = JSON.stringify(next) !== storeSnapshotRef.current;
        setIsDirty(dirty);
        if (dirty) {
          markUnsaved(entityKey);
        } else {
          markSaved(entityKey);
        }
        return next;
      });
    },
    [entityKey, markUnsaved, markSaved],
  );

  const handleSave = useCallback(async () => {
    if (!isDirty || !formData) return;

    if (!formData.name?.trim()) {
      toast.error('Name is required');
      return;
    }

    markSaving(entityKey);
    try {
      const payload = getUpdatePayload(formData);
      await updateEntity(entityId, payload);
      storeSnapshotRef.current = JSON.stringify(formData);
      setIsDirty(false);
      markSaved(entityKey);
      toast.success(
        `${entityType.charAt(0).toUpperCase() + entityType.slice(1)} saved successfully`,
      );
    } catch (error) {
      markError(entityKey, error.message);
      toast.error(`Failed to save ${entityType}`);
      console.error(error);
    }
  }, [
    isDirty,
    formData,
    entityId,
    entityType,
    entityKey,
    updateEntity,
    getUpdatePayload,
    markSaving,
    markSaved,
    markError,
  ]);

  const handleDelete = useCallback(async () => {
    if (
      !confirm(
        `Are you sure you want to delete this ${entityType}? This action cannot be undone.`,
      )
    ) {
      return;
    }

    try {
      await deleteEntity(entityId);
      removeEntity(entityKey);
      toast.success(
        `${entityType.charAt(0).toUpperCase() + entityType.slice(1)} deleted successfully`,
      );
      onBack();
    } catch (error) {
      toast.error(`Failed to delete ${entityType}`);
      console.error(error);
    }
  }, [entityId, entityType, entityKey, deleteEntity, removeEntity, onBack]);

  return {
    formData,
    isDirty,
    handleCoreChange,
    handleSave,
    handleDelete,
  };
}
