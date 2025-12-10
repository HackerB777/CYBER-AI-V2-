import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Plus, Trash2, Play, Square, Clock, Key, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useSessions, PentestSession } from '@/hooks/useSessions';
import { useTargets } from '@/hooks/useTargets';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export const SessionDashboardPanel = () => {
  const { sessions, isLoading, addSession, updateSession, deleteSession, endSession } = useSessions();
  const { targets } = useTargets();
  const { user } = useAuth();
  const [isAdding, setIsAdding] = useState(false);
  const [showCredentials, setShowCredentials] = useState<string | null>(null);
  const [newCredential, setNewCredential] = useState({ username: '', password: '', service: '' });
  const [formData, setFormData] = useState({
    name: '',
    target_id: null as string | null,
    notes: '',
    status: 'active',
    ended_at: null as string | null,
    credentials: [] as any[]
  });

  const handleAdd = async () => {
    if (!formData.name) {
      toast.error('Session name is required');
      return;
    }

    const result = await addSession(formData);
    if (result) {
      toast.success('Session started');
      setFormData({ name: '', target_id: null, notes: '', status: 'active', ended_at: null, credentials: [] });
      setIsAdding(false);
    }
  };

  const handleEndSession = async (session: PentestSession) => {
    await endSession(session.id);
    toast.success('Session ended');
  };

  const handleAddCredential = async (sessionId: string, session: PentestSession) => {
    if (!newCredential.username) return;
    
    const currentCreds = Array.isArray(session.credentials) ? session.credentials : [];
    const updatedCreds = [...currentCreds, newCredential];
    await updateSession(sessionId, { credentials: updatedCreds });
    setNewCredential({ username: '', password: '', service: '' });
    toast.success('Credential added');
  };

  const formatDuration = (start: string, end: string | null) => {
    const startDate = new Date(start);
    const endDate = end ? new Date(end) : new Date();
    const diff = endDate.getTime() - startDate.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const activeSessions = sessions.filter(s => s.status === 'active');
  const completedSessions = sessions.filter(s => s.status === 'completed');

  if (!user) {
    return (
      <section className="py-8 px-4">
        <div className="container mx-auto text-center text-muted-foreground">
          Please log in to view sessions
        </div>
      </section>
    );
  }

  return (
    <section className="py-8 px-4">
      <div className="container mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Activity className="w-6 h-6 text-accent" />
            <h2 className="text-xl font-mono text-accent">SESSION DASHBOARD</h2>
          </div>
          <Button variant="outline" size="sm" onClick={() => setIsAdding(true)} className="gap-2">
            <Plus className="w-4 h-4" /> New Session
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
                  placeholder="Session Name *"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-background"
                />
                <select
                  value={formData.target_id || ''}
                  onChange={(e) => setFormData({ ...formData, target_id: e.target.value || null })}
                  className="px-3 py-2 rounded-md border border-border bg-background text-foreground"
                >
                  <option value="">Select Target (optional)</option>
                  {targets.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
              <Input
                placeholder="Notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="bg-background mb-3"
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={handleAdd} className="gap-2">
                  <Play className="w-4 h-4" /> Start Session
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setIsAdding(false)}>
                  <X className="w-4 h-4" /> Cancel
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Active Sessions */}
        {activeSessions.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-mono text-primary mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              ACTIVE SESSIONS ({activeSessions.length})
            </h3>
            <div className="grid gap-3">
              {activeSessions.map((session) => (
                <motion.div
                  key={session.id}
                  layout
                  className="p-4 border border-primary/50 rounded-lg bg-primary/5"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Play className="w-5 h-5 text-primary" />
                      <span className="font-mono font-semibold text-foreground">{session.name}</span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDuration(session.started_at, null)}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => setShowCredentials(showCredentials === session.id ? null : session.id)}>
                        <Key className="w-4 h-4 mr-1" /> Credentials ({Array.isArray(session.credentials) ? session.credentials.length : 0})
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleEndSession(session)}>
                        <Square className="w-4 h-4 mr-1" /> End
                      </Button>
                    </div>
                  </div>
                  
                  <AnimatePresence>
                    {showCredentials === session.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-3 p-3 bg-background/50 rounded border border-border"
                      >
                        <div className="space-y-2 mb-3">
                          {Array.isArray(session.credentials) && session.credentials.map((cred: any, idx: number) => (
                            <div key={idx} className="flex items-center gap-3 text-sm font-mono">
                              <span className="text-accent">{cred.service || 'Unknown'}</span>
                              <span className="text-foreground">{cred.username}</span>
                              <span className="text-muted-foreground">••••••••</span>
                            </div>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <Input
                            placeholder="Service"
                            value={newCredential.service}
                            onChange={(e) => setNewCredential({ ...newCredential, service: e.target.value })}
                            className="bg-background text-sm"
                          />
                          <Input
                            placeholder="Username"
                            value={newCredential.username}
                            onChange={(e) => setNewCredential({ ...newCredential, username: e.target.value })}
                            className="bg-background text-sm"
                          />
                          <Input
                            placeholder="Password"
                            type="password"
                            value={newCredential.password}
                            onChange={(e) => setNewCredential({ ...newCredential, password: e.target.value })}
                            className="bg-background text-sm"
                          />
                          <Button size="sm" onClick={() => handleAddCredential(session.id, session)}>
                            <Check className="w-4 h-4" />
                          </Button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  
                  {session.notes && (
                    <p className="text-sm text-muted-foreground mt-2">{session.notes}</p>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Completed Sessions */}
        <div>
          <h3 className="text-sm font-mono text-muted-foreground mb-3">
            COMPLETED SESSIONS ({completedSessions.length})
          </h3>
          <div className="grid gap-2">
            {isLoading ? (
              <div className="text-center text-muted-foreground py-4">Loading sessions...</div>
            ) : completedSessions.length === 0 ? (
              <div className="text-center text-muted-foreground py-4">No completed sessions</div>
            ) : (
              completedSessions.map((session) => (
                <motion.div
                  key={session.id}
                  layout
                  className="p-3 border border-border rounded-lg bg-card/30 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <Square className="w-4 h-4 text-muted-foreground" />
                    <span className="font-mono text-foreground">{session.name}</span>
                    <span className="text-xs text-muted-foreground">
                      Duration: {formatDuration(session.started_at, session.ended_at)}
                    </span>
                    <span className="text-xs text-accent">
                      {Array.isArray(session.credentials) ? session.credentials.length : 0} credentials
                    </span>
                  </div>
                  <Button size="icon" variant="ghost" onClick={() => deleteSession(session.id)}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
