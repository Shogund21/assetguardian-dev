import { useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChillerWizardFormData, FindingData } from '@/types/chillerWizard';
import { Camera, ChevronDown, Plus, Trash2, AlertCircle, AlertTriangle, Info, Zap } from 'lucide-react';
import { PhotoCapture } from '../components/PhotoCapture';

interface Step8FindingsProps {
  formData: ChillerWizardFormData;
  addFinding: (finding: FindingData) => void;
  removeFinding: (findingId: string) => void;
  updateFinding: (findingId: string, updates: Partial<FindingData>) => void;
}

const ISSUE_CODES = [
  { code: 'REFRIG_LEAK', label: 'Refrigerant Leak Detected', category: 'refrigerant', description: 'Refrigerant leak detected during inspection' },
  { code: 'TUBE_PLUGS', label: 'Excessive Tube Plugging', category: 'tubes', description: 'Tube plugging exceeds manufacturer limit' },
  { code: 'OIL_ACID', label: 'High Oil Acid Level', category: 'oil', description: 'Oil acid number exceeds acceptable threshold' },
  { code: 'VOLTAGE_IMBAL', label: 'Voltage Imbalance > 2%', category: 'electrical', description: 'Motor voltage imbalance exceeds 2% threshold' },
  { code: 'LOW_INSUL', label: 'Low Insulation Resistance', category: 'electrical', description: 'Motor insulation resistance below 1 MΩ' },
  { code: 'BEARING_WEAR', label: 'Bearing Wear Detected', category: 'mechanical', description: 'Excessive vibration or bearing noise detected' },
  { code: 'CONTROL_FAULT', label: 'Controls Malfunction', category: 'controls', description: 'Control system fault or malfunction observed' },
  { code: 'LEGIONELLA', label: 'Legionella Detected', category: 'water', description: 'Legionella bacteria detected in water system' },
  { code: 'CORROSION', label: 'Corrosion Observed', category: 'mechanical', description: 'Significant corrosion observed on components' },
  { code: 'OTHER', label: 'Other (specify)', category: 'other', description: '' },
];

const CATEGORIES = [
  { value: 'refrigerant', label: 'Refrigerant' },
  { value: 'oil', label: 'Oil' },
  { value: 'tubes', label: 'Tubes' },
  { value: 'electrical', label: 'Electrical' },
  { value: 'controls', label: 'Controls' },
  { value: 'mechanical', label: 'Mechanical' },
  { value: 'water', label: 'Water' },
  { value: 'other', label: 'Other' },
];

const SEVERITIES = [
  { value: 'critical', label: 'Critical', color: 'bg-red-500', icon: AlertCircle },
  { value: 'high', label: 'High', color: 'bg-orange-500', icon: AlertTriangle },
  { value: 'medium', label: 'Medium', color: 'bg-amber-500', icon: Zap },
  { value: 'low', label: 'Low', color: 'bg-blue-500', icon: Info },
];

export function Step8Findings({ formData, addFinding, removeFinding, updateFinding }: Step8FindingsProps) {
  const findings = formData.findings;

  const handleAddFinding = useCallback(() => {
    const newFinding: FindingData = {
      id: crypto.randomUUID(),
      issue_code: null,
      category: null,
      description: '',
      severity: 'medium',
      recommended_action: null,
      photos: [],
      is_auto_generated: false,
    };
    addFinding(newFinding);
  }, [addFinding]);

  const handleIssueCodeChange = useCallback((findingId: string, code: string) => {
    const issueInfo = ISSUE_CODES.find(ic => ic.code === code);
    if (issueInfo) {
      updateFinding(findingId, {
        issue_code: code,
        category: issueInfo.category,
        description: issueInfo.description || '',
      });
    } else {
      updateFinding(findingId, { issue_code: code });
    }
  }, [updateFinding]);

  const getSeverityBadge = (severity: string) => {
    const severityInfo = SEVERITIES.find(s => s.value === severity);
    if (!severityInfo) return null;
    const Icon = severityInfo.icon;
    return (
      <Badge className={`${severityInfo.color} text-white gap-1`}>
        <Icon className="h-3 w-3" />
        {severityInfo.label}
      </Badge>
    );
  };

  return (
    <div className="space-y-4 pb-4">
      {/* Header */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Camera className="h-5 w-5 text-primary" />
            Findings & Photos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Document any issues discovered during the inspection. Attach photos to support findings.
          </p>
          <Button onClick={handleAddFinding} className="w-full min-h-[48px]">
            <Plus className="h-4 w-4 mr-2" />
            Add Finding
          </Button>
        </CardContent>
      </Card>

      {/* Auto-generated findings notice */}
      {findings.some(f => f.is_auto_generated) && (
        <Card className="border-amber-200 bg-amber-50/50">
          <CardContent className="pt-4">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
              <div>
                <p className="font-medium text-amber-800">Auto-detected Issues</p>
                <p className="text-sm text-amber-600">
                  Some findings were automatically generated based on inspection data thresholds.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Findings List */}
      {findings.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="pt-8 pb-8 text-center">
            <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
            <p className="text-muted-foreground">No findings documented yet</p>
            <p className="text-sm text-muted-foreground">Click "Add Finding" to document an issue</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {findings.map((finding, index) => (
            <Collapsible key={finding.id} defaultOpen={true}>
              <Card className={finding.is_auto_generated ? 'border-amber-300' : ''}>
                <CollapsibleTrigger asChild>
                  <CardHeader className="pb-3 cursor-pointer hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">Finding #{index + 1}</span>
                        {finding.is_auto_generated && (
                          <Badge variant="outline" className="text-amber-600 border-amber-300">
                            Auto-detected
                          </Badge>
                        )}
                        {getSeverityBadge(finding.severity)}
                      </div>
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    </div>
                    {finding.description && (
                      <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
                        {finding.description}
                      </p>
                    )}
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="space-y-4 border-t pt-4">
                    {/* Issue Code */}
                    <div className="space-y-2">
                      <Label>Issue Code</Label>
                      <Select
                        value={finding.issue_code || ''}
                        onValueChange={(v) => handleIssueCodeChange(finding.id, v)}
                      >
                        <SelectTrigger className="min-h-[48px]">
                          <SelectValue placeholder="Select issue type..." />
                        </SelectTrigger>
                        <SelectContent>
                          {ISSUE_CODES.map((ic) => (
                            <SelectItem key={ic.code} value={ic.code}>
                              {ic.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Category & Severity Row */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Category</Label>
                        <Select
                          value={finding.category || ''}
                          onValueChange={(v) => updateFinding(finding.id, { category: v })}
                        >
                          <SelectTrigger className="min-h-[48px]">
                            <SelectValue placeholder="Select..." />
                          </SelectTrigger>
                          <SelectContent>
                            {CATEGORIES.map((cat) => (
                              <SelectItem key={cat.value} value={cat.value}>
                                {cat.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Severity</Label>
                        <Select
                          value={finding.severity}
                          onValueChange={(v) => updateFinding(finding.id, { severity: v })}
                        >
                          <SelectTrigger className="min-h-[48px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {SEVERITIES.map((sev) => (
                              <SelectItem key={sev.value} value={sev.value}>
                                <div className="flex items-center gap-2">
                                  <div className={`h-3 w-3 rounded-full ${sev.color}`} />
                                  {sev.label}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Textarea
                        value={finding.description}
                        onChange={(e) => updateFinding(finding.id, { description: e.target.value })}
                        placeholder="Describe the issue in detail..."
                        className="min-h-[80px]"
                      />
                    </div>

                    {/* Recommended Action */}
                    <div className="space-y-2">
                      <Label>Recommended Action</Label>
                      <Textarea
                        value={finding.recommended_action || ''}
                        onChange={(e) => updateFinding(finding.id, { recommended_action: e.target.value || null })}
                        placeholder="Recommended corrective action..."
                        className="min-h-[60px]"
                      />
                    </div>

                    {/* Photos */}
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Camera className="h-4 w-4" />
                        Photos (max 5)
                      </Label>
                      <PhotoCapture
                        photos={finding.photos}
                        onChange={(photos) => updateFinding(finding.id, { photos })}
                        maxPhotos={5}
                      />
                    </div>

                    {/* Delete Button */}
                    <Button
                      variant="outline"
                      onClick={() => removeFinding(finding.id)}
                      className="w-full min-h-[48px] text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Finding
                    </Button>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          ))}
        </div>
      )}

      {/* Summary */}
      {findings.length > 0 && (
        <Card className="bg-muted/50">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Total Findings:</span>
              <span className="font-semibold">{findings.length}</span>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {SEVERITIES.map(sev => {
                const count = findings.filter(f => f.severity === sev.value).length;
                if (count === 0) return null;
                return (
                  <Badge key={sev.value} variant="outline" className="gap-1">
                    <div className={`h-2 w-2 rounded-full ${sev.color}`} />
                    {count} {sev.label}
                  </Badge>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
