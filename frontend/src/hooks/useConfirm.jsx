import { useState } from 'react';

const useConfirm = () => {
  const [confirmState, setConfirmState] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    variant: 'danger',
    onConfirm: null,
  });

  const showConfirm = ({
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    variant = 'danger',
  }) => {
    return new Promise((resolve) => {
      setConfirmState({
        isOpen: true,
        title,
        message,
        confirmText,
        cancelText,
        variant,
        onConfirm: resolve,
      });
    });
  };

  const handleConfirm = () => {
    setConfirmState((prev) => ({ ...prev, isOpen: false }));
    if (confirmState.onConfirm) {
      confirmState.onConfirm(true);
    }
  };

  const handleCancel = () => {
    setConfirmState((prev) => ({ ...prev, isOpen: false }));
    if (confirmState.onConfirm) {
      confirmState.onConfirm(false);
    }
  };

  return {
    showConfirm,
    confirmState,
    handleConfirm,
    handleCancel,
  };
};

export default useConfirm;