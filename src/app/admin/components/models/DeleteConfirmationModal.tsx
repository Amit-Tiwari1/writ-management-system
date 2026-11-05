"use client";

import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@nextui-org/react";

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onOpenChange: () => void;
  itemName: string;
  isLoading: boolean;
  onConfirm: () => void;
}

export default function DeleteConfirmationModal({
  isOpen,
  onOpenChange,
  itemName,
  isLoading,
  onConfirm,
}: DeleteConfirmationModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      placement="center"
      size="sm"
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span className="material-symbols-rounded text-rose-600">
                warning
              </span>
              Confirm Deletion
            </ModalHeader>

            <ModalBody className="text-xs text-slate-600">
              Are you sure you want to remove <b>{itemName}</b>? Related
              records might be affected. The record will only be deleted if
              backend integrity checks allow it.
            </ModalBody>

            <ModalFooter>
              <Button
                size="sm"
                variant="bordered"
                radius="sm"
                onPress={onClose}
                isDisabled={isLoading}
              >
                Cancel
              </Button>

              <Button
                size="sm"
                radius="sm"
                className="bg-rose-600 font-semibold text-white hover:bg-rose-700"
                isLoading={isLoading}
                onPress={onConfirm}
              >
                Delete
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}