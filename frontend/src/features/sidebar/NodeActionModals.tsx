import React, { useState } from 'react';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

interface RenameModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTitle: string;
  onConfirm: (newTitle: string) => void;
}

export function RenameModal({ isOpen, onClose, initialTitle, onConfirm }: RenameModalProps) {
  const [title, setTitle] = useState(initialTitle);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Rename Node">
      <div className="py-4">
        <Input 
          value={title} 
          onChange={(e) => setTitle(e.target.value)} 
          autoFocus 
          onKeyDown={(e) => {
            if (e.key === 'Enter' && title.trim()) {
              onConfirm(title);
              onClose();
            }
          }}
        />
      </div>
      <div className="flex justify-end space-x-2 mt-4">
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button onClick={() => { onConfirm(title); onClose(); }} disabled={!title.trim()}>Rename</Button>
      </div>
    </Modal>
  );
}

interface CreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  onConfirm: (newTitle: string) => void;
}

export function CreateModal({ isOpen, onClose, title, onConfirm }: CreateModalProps) {
  const [inputValue, setInputValue] = useState('');

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="py-4">
        <Input 
          value={inputValue} 
          onChange={(e) => setInputValue(e.target.value)} 
          placeholder="Node title..."
          autoFocus 
          onKeyDown={(e) => {
            if (e.key === 'Enter' && inputValue.trim()) {
              onConfirm(inputValue);
              onClose();
            }
          }}
        />
      </div>
      <div className="flex justify-end space-x-2 mt-4">
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button onClick={() => { onConfirm(inputValue); onClose(); }} disabled={!inputValue.trim()}>Create</Button>
      </div>
    </Modal>
  );
}

interface MoveModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  onConfirm: (newParentId: string | null) => void;
}

export function MoveModal({ isOpen, onClose, title, onConfirm }: MoveModalProps) {
  const [parentId, setParentId] = useState('');

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="py-4">
        <Input 
          value={parentId} 
          onChange={(e) => setParentId(e.target.value)} 
          placeholder="Paste New Parent UUID (Leave empty for root)"
          autoFocus 
        />
        <p className="text-xs text-gray-500 mt-2">
          In a future update, this will be a searchable dropdown.
        </p>
      </div>
      <div className="flex justify-end space-x-2 mt-4">
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button onClick={() => { onConfirm(parentId.trim() || null); onClose(); }}>Move</Button>
      </div>
    </Modal>
  );
}
