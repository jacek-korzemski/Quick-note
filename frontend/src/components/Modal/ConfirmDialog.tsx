import Modal from "./Modal";
import { Button } from "@/components/Button/Button";
import { StyledButton } from "./styles";
import { ConfirmDialogProps } from "./types";

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onConfirm,
  onCancel,
  title = 'Confirm',
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'info',
  loading = false,
}) => {
  const buttonVariant = variant === 'danger' ? 'danger' : 'primary';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      title={title}
      variant="fit-content"
      width="400px"
      loading={loading}
      footer={
        <>
          <StyledButton type="button" $variant="secondary" onClick={onCancel} disabled={loading}>
            {cancelText}
          </StyledButton>
          <Button variant={buttonVariant} onClick={onConfirm} loading={loading}>
            {confirmText}
          </Button>
        </>
      }
    >
      {message}
    </Modal>
  );
};

export default ConfirmDialog;