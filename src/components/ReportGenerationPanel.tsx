import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Plus, Trash2, Download, Edit2, Save, X, Check, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useReports, Report } from '@/hooks/useReports';
import { useTargets } from '@/hooks/useTargets';
import { useSessions } from '@/hooks/useSessions';
import { useVulnerabilities } from '@/hooks/useVulnerabilities';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export const ReportGenerationPanel = () => {
  const { reports, isLoading, addReport, updateReport, deleteReport, exportReport } = useReports();
  const { targets } = useTargets();
  const { sessions } = useSessions();
  const { vulnerabilities } = useVulnerabilities();
  const { user } = useAuth();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    target_id: null as string | null,
    session_id: null as string | null,
    format: 'markdown',
    status: 'draft'
  });

  const generateReportContent = () => {
    const target = formData.target_id ? targets.find(t => t.id === formData.target_id) : null;
    const session = formData.session_id ? sessions.find(s => s.id === formData.session_id) : null;
    const targetVulns = formData.target_id 
      ? vulnerabilities.filter(v => v.target_id === formData.target_id)
      : vulnerabilities;

    const content = `# Penetration Test Report

## Executive Summary
- **Date**: ${new Date().toLocaleDateString()}
- **Target**: ${target?.name || 'All Targets'}
- **Session**: ${session?.name || 'N/A'}

## Scope
${target ? `- IP Address: ${target.ip_address || 'N/A'}
- Hostname: ${target.hostname || 'N/A'}
- OS: ${target.os_type || 'Unknown'}` : 'Full scope assessment'}

## Findings Summary
| Severity | Count |
|----------|-------|
| Critical | ${targetVulns.filter(v => v.severity === 'critical').length} |
| High | ${targetVulns.filter(v => v.severity === 'high').length} |
| Medium | ${targetVulns.filter(v => v.severity === 'medium').length} |
| Low | ${targetVulns.filter(v => v.severity === 'low').length} |

## Detailed Findings

${targetVulns.map((v, idx) => `### ${idx + 1}. ${v.name}
- **Severity**: ${v.severity.toUpperCase()}
- **CVE**: ${v.cve_id || 'N/A'}
- **Status**: ${v.status}
- **Description**: ${v.description || 'No description provided'}
- **Remediation**: ${v.solution || 'No solution provided'}
`).join('\n')}

## Recommendations
1. Address all critical and high severity vulnerabilities immediately
2. Implement regular vulnerability scanning
3. Establish patch management procedures

## Conclusion
This report summarizes the findings from the penetration testing engagement.
`;
    return content;
  };

  const handleAdd = async () => {
    if (!formData.title) {
      toast.error('Report title is required');
      return;
    }

    const content = formData.content || generateReportContent();
    const result = await addReport({ ...formData, content });
    if (result) {
      toast.success('Report created');
      setFormData({ title: '', content: '', target_id: null, session_id: null, format: 'markdown', status: 'draft' });
      setIsAdding(false);
    }
  };

  const handleUpdate = async (id: string) => {
    await updateReport(id, formData);
    toast.success('Report updated');
    setEditingId(null);
  };

  const handleAutoGenerate = () => {
    const content = generateReportContent();
    setFormData({ ...formData, content });
    toast.success('Report content generated');
  };

  if (!user) {
    return (
      <section className="py-8 px-4">
        <div className="container mx-auto text-center text-muted-foreground">
          Please log in to manage reports
        </div>
      </section>
    );
  }

  return (
    <section className="py-8 px-4">
      <div className="container mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-mono text-primary">REPORT GENERATION</h2>
          </div>
          <Button variant="outline" size="sm" onClick={() => setIsAdding(true)} className="gap-2">
            <Plus className="w-4 h-4" /> New Report
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                <Input
                  placeholder="Report Title *"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="bg-background"
                />
                <select
                  value={formData.target_id || ''}
                  onChange={(e) => setFormData({ ...formData, target_id: e.target.value || null })}
                  className="px-3 py-2 rounded-md border border-border bg-background text-foreground"
                >
                  <option value="">All Targets</option>
                  {targets.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
                <select
                  value={formData.session_id || ''}
                  onChange={(e) => setFormData({ ...formData, session_id: e.target.value || null })}
                  className="px-3 py-2 rounded-md border border-border bg-background text-foreground"
                >
                  <option value="">No Session</option>
                  {sessions.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2 mb-3">
                <Button size="sm" variant="outline" onClick={handleAutoGenerate}>
                  ⚡ Auto-Generate Content
                </Button>
              </div>
              <textarea
                placeholder="Report content (Markdown supported)"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="w-full h-48 px-3 py-2 rounded-md border border-border bg-background text-foreground font-mono text-sm resize-none mb-3"
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={handleAdd} className="gap-2">
                  <Check className="w-4 h-4" /> Create Report
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setIsAdding(false)}>
                  <X className="w-4 h-4" /> Cancel
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid gap-3">
          {isLoading ? (
            <div className="text-center text-muted-foreground py-8">Loading reports...</div>
          ) : reports.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">No reports created yet</div>
          ) : (
            reports.map((report) => (
              <motion.div
                key={report.id}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-4 border border-border rounded-lg bg-card/50"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-primary" />
                    <div>
                      <span className="font-mono font-semibold text-foreground">{report.title}</span>
                      <div className="text-xs text-muted-foreground flex items-center gap-3">
                        <span>{new Date(report.created_at).toLocaleDateString()}</span>
                        <span className={`uppercase ${report.status === 'final' ? 'text-primary' : 'text-accent'}`}>
                          {report.status}
                        </span>
                        <span>{report.format}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="ghost" onClick={() => setPreviewId(previewId === report.id ? null : report.id)}>
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => exportReport(report)}>
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => {
                      setEditingId(report.id);
                      setFormData({
                        title: report.title,
                        content: report.content || '',
                        target_id: report.target_id,
                        session_id: report.session_id,
                        format: report.format,
                        status: report.status
                      });
                    }}>
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => deleteReport(report.id)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>

                <AnimatePresence>
                  {previewId === report.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 p-4 bg-background rounded border border-border overflow-auto max-h-96"
                    >
                      <pre className="text-sm font-mono text-foreground whitespace-pre-wrap">
                        {report.content}
                      </pre>
                    </motion.div>
                  )}
                </AnimatePresence>

                <AnimatePresence>
                  {editingId === report.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 space-y-3"
                    >
                      <Input
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="bg-background"
                      />
                      <textarea
                        value={formData.content}
                        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                        className="w-full h-48 px-3 py-2 rounded-md border border-border bg-background text-foreground font-mono text-sm resize-none"
                      />
                      <div className="flex gap-2">
                        <select
                          value={formData.status}
                          onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                          className="px-3 py-2 rounded-md border border-border bg-background text-foreground"
                        >
                          <option value="draft">Draft</option>
                          <option value="final">Final</option>
                        </select>
                        <Button size="sm" onClick={() => handleUpdate(report.id)}>
                          <Save className="w-4 h-4 mr-1" /> Save
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                          Cancel
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </section>
  );
};
