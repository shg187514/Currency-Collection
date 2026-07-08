import React from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { Trash2, AlertTriangle, CornerUpLeft } from 'lucide-react';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (deleteDescendants: boolean) => void;
  nodeTitle: string;
}

export function DeleteConfirmationModal({ isOpen, onClose, onConfirm, nodeTitle }: DeleteConfirmationModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Delete Node">
      <div className="p-6">
        <div className="flex items-center gap-3 text-red-600 dark:text-red-500 mb-4 bg-red-50 dark:bg-red-500/10 p-3 rounded-lg border border-red-100 dark:border-red-500/20">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <p className="text-sm font-medium">
            You are about to delete <strong>{nodeTitle || 'Untitled Node'}</strong>.
          </p>
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          This node has children. How would you like to handle them?
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => {
              onConfirm(false);
              onClose();
            }}
            className="flex items-start gap-3 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all text-left"
          >
            <div className="p-2 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-md shrink-0">
              <CornerUpLeft className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-gray-100">Delete only this node</h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Keep children and move them up to the parent.</p>
            </div>
          </button>

          <button
            onClick={() => {
              onConfirm(true);
              onClose();
            }}
            className="flex items-start gap-3 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all text-left"
          >
            <div className="p-2 bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400 rounded-md shrink-0">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-gray-100">Delete subtree</h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Move this node and all of its descendants to Trash.</p>
            </div>
          </button>
        </div>

        <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </Modal>
  );
}
