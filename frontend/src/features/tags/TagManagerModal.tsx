import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchTags, TagModel } from '../../lib/api';
import { useTagMutations } from '../../hooks/useTagMutations';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { TagBadge } from '../../components/ui/TagBadge';
import { Edit2, Trash2, Check, X, Tag as TagIcon } from 'lucide-react';

interface TagManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PRESET_COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#84cc16', '#22c55e', 
  '#06b6d4', '#3b82f6', '#6366f1', '#a855f7', '#ec4899', '#64748b'
];

export function TagManagerModal({ isOpen, onClose }: TagManagerModalProps) {
  const { data: tags = [], isLoading } = useQuery({ queryKey: ['tags'], queryFn: fetchTags });
  const { createMutation, updateMutation, deleteMutation } = useTagMutations();

  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState(PRESET_COLORS[6]); // Default blue
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState('');

  const handleCreate = () => {
    if (!newName.trim()) return;
    createMutation.mutate(
      { name: newName.trim(), color: newColor },
      {
        onSuccess: () => {
          setNewName('');
          setNewColor(PRESET_COLORS[6]);
        }
      }
    );
  };

  const startEdit = (tag: TagModel) => {
    setEditingId(tag.id);
    setEditName(tag.name);
    setEditColor(tag.color || PRESET_COLORS[6]);
  };

  const saveEdit = () => {
    if (!editingId || !editName.trim()) return;
    updateMutation.mutate(
      { id: editingId, data: { name: editName.trim(), color: editColor } },
      {
        onSuccess: () => {
          setEditingId(null);
        }
      }
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Manage Tags">
      <div className="space-y-6">
        {/* Create Tag */}
        <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg border border-gray-200 dark:border-gray-800 space-y-3">
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">Create New Tag</h3>
          <div className="flex gap-2">
            <Input 
              placeholder="Tag name..." 
              value={newName} 
              onChange={e => setNewName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleCreate()}
            />
            <Button onClick={handleCreate} disabled={!newName.trim() || createMutation.isPending}>
              Create
            </Button>
          </div>
          <div className="flex flex-wrap gap-1">
            {PRESET_COLORS.map(c => (
              <button
                key={c}
                className={`w-6 h-6 rounded-full border-2 ${newColor === c ? 'border-gray-900 dark:border-white' : 'border-transparent'}`}
                style={{ backgroundColor: c }}
                onClick={() => setNewColor(c)}
              />
            ))}
          </div>
        </div>

        {/* List Tags */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">Existing Tags</h3>
          {isLoading ? (
            <div className="space-y-3">
              {[1,2,3].map(i => (
                <div key={i} className="h-10 w-full bg-gray-100 dark:bg-gray-800 rounded animate-pulse"></div>
              ))}
            </div>
          ) : tags.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center text-gray-500">
              <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-3">
                <TagIcon className="w-5 h-5 text-gray-400" />
              </div>
              <p className="text-sm font-medium">No tags created yet</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
              {tags.map(tag => (
                <div key={tag.id} className="flex items-center justify-between p-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-900/50 border border-transparent hover:border-gray-100 dark:hover:border-gray-800 group transition-colors">
                  {editingId === tag.id ? (
                    <div className="flex-1 space-y-2">
                      <div className="flex gap-2">
                        <Input 
                          value={editName} 
                          onChange={e => setEditName(e.target.value)} 
                          className="h-8 text-sm"
                          onKeyDown={e => e.key === 'Enter' && saveEdit()}
                        />
                        <Button size="sm" variant="primary" onClick={saveEdit}>
                          <Check className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {PRESET_COLORS.map(c => (
                          <button
                            key={c}
                            className={`w-5 h-5 rounded-full border-2 ${editColor === c ? 'border-gray-900 dark:border-white' : 'border-transparent'}`}
                            style={{ backgroundColor: c }}
                            onClick={() => setEditColor(c)}
                          />
                        ))}
                      </div>
                    </div>
                  ) : (
                    <>
                      <TagBadge tag={tag} />
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => startEdit(tag)}>
                          <Edit2 className="w-4 h-4 text-gray-500" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30" 
                          onClick={() => {
                            if (window.confirm(`Are you sure you want to delete the tag "${tag.name}"?`)) {
                              deleteMutation.mutate(tag.id);
                            }
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
