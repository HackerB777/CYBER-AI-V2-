import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Plus, Trash2, Edit2, Globe, Server, Clock, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTargets, Target as TargetType } from '@/hooks/useTargets';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export const TargetManagementPanel = () => {
  const { targets, isLoading, addTarget, updateTarget, deleteTarget } = useTargets();
  const { user } = useAuth();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    ip_address: '',
    hostname: '',
    os_type: '',
    notes: '',
    status: 'pending'
  });

  const handleAdd = async () => {
    if (!formData.name) {
      toast.error('Target name is required');
      return;
    }
    
    const result = await addTarget(formData);
    if (result) {
      toast.success('Target added');
      setFormData({ name: '', ip_address: '', hostname: '', os_type: '', notes: '', status: 'pending' });
      setIsAdding(false);
    } else {
      toast.error('Failed to add target');
    }
  };

  const handleUpdate = async (id: string) => {
    const result = await updateTarget(id, formData);
    if (result) {
      toast.success('Target updated');
      setEditingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    const result = await deleteTarget(id);
    if (result) {
      toast.success('Target deleted');
    }
  };

  const startEdit = (target: TargetType) => {
    setEditingId(target.id);
    setFormData({
      name: target.name,
      ip_address: target.ip_address || '',
      hostname: target.hostname || '',
      os_type: target.os_type || '',
      notes: target.notes || '',
      status: target.status
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-primary';
      case 'completed': return 'text-muted-foreground';
      case 'compromised': return 'text-destructive';
      default: return 'text-accent';
    }
  };

  if (!user) {
    return (
      <section className="py-8 px-4">
        <div className="container mx-auto text-center text-muted-foreground">
          Please log in to manage targets
        </div>
      </section>
    );
  }

  return (
    <section className="py-8 px-4">
      <div className="container mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Target className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-mono text-primary">TARGET MANAGEMENT</h2>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAdding(true)}
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Target
          </Button>
        </div>

        <AnimatePresence>
          {isAdding && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4 p-4 border border-border rounded-lg bg-card"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                <Input
                  placeholder="Target Name *"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-background"
                />
                <Input
                  placeholder="IP Address"
                  value={formData.ip_address}
                  onChange={(e) => setFormData({ ...formData, ip_address: e.target.value })}
                  className="bg-background"
                />
                <Input
                  placeholder="Hostname"
                  value={formData.hostname}
                  onChange={(e) => setFormData({ ...formData, hostname: e.target.value })}
                  className="bg-background"
                />
                <Input
                  placeholder="OS Type"
                  value={formData.os_type}
                  onChange={(e) => setFormData({ ...formData, os_type: e.target.value })}
                  className="bg-background"
                />
              </div>
              <Input
                placeholder="Notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="bg-background mb-3"
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={handleAdd} className="gap-2">
                  <Check className="w-4 h-4" /> Save
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setIsAdding(false)}>
                  <X className="w-4 h-4" /> Cancel
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-2">
          {isLoading ? (
            <div className="text-center text-muted-foreground py-8">Loading targets...</div>
          ) : targets.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">No targets added yet</div>
          ) : (
            targets.map((target) => (
              <motion.div
                key={target.id}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-4 border border-border rounded-lg bg-card/50 hover:bg-card transition-colors"
              >
                {editingId === target.id ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <Input
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="bg-background"
                      />
                      <Input
                        value={formData.ip_address}
                        onChange={(e) => setFormData({ ...formData, ip_address: e.target.value })}
                        className="bg-background"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => handleUpdate(target.id)}>
                        <Check className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Server className="w-5 h-5 text-primary" />
                      <div>
                        <div className="font-mono font-semibold text-foreground">{target.name}</div>
                        <div className="text-sm text-muted-foreground flex items-center gap-3">
                          {target.ip_address && (
                            <span className="flex items-center gap-1">
                              <Globe className="w-3 h-3" /> {target.ip_address}
                            </span>
                          )}
                          {target.hostname && <span>{target.hostname}</span>}
                          {target.os_type && <span className="text-accent">{target.os_type}</span>}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs font-mono uppercase ${getStatusColor(target.status)}`}>
                        {target.status}
                      </span>
                      {target.last_scanned_at && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(target.last_scanned_at).toLocaleDateString()}
                        </span>
                      )}
                      <Button size="icon" variant="ghost" onClick={() => startEdit(target)}>
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => handleDelete(target.id)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                )}
              </motion.div>
            ))
          )}
        </div>
      </div>
    </section>
  );
};
