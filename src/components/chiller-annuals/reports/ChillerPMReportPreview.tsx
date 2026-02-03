import React from "react";
import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { CompletePMData } from "@/hooks/useChillerPMReport";
import {
  formatDate,
  getRefrigerantSection,
  getOilSection,
  getTubeSection,
  getElectricalSection,
  getPerformanceSection,
} from "@/services/chillerPMReportService";
import { ReportSectionCard, FindingsSection, RiskScoreGauge } from "./ChillerPMReportSections";

interface ChillerPMReportPreviewProps {
  data: CompletePMData;
}

export function ChillerPMReportPreview({ data }: ChillerPMReportPreviewProps) {
  const { pm, refrigerant, oil, tubeEvaporator, tubeCondenser, electrical, performance, findings } = data;

  const sections = [
    getRefrigerantSection(refrigerant),
    getOilSection(oil),
    getTubeSection(tubeEvaporator, "evaporator"),
    getTubeSection(tubeCondenser, "condenser"),
    getElectricalSection(electrical),
    getPerformanceSection(performance),
  ].filter(Boolean);

  return (
    <div className="bg-background print:bg-white" id="chiller-pm-report">
      {/* Print Styles */}
      <style>
        {`
          @media print {
            body * { visibility: hidden; }
            #chiller-pm-report, #chiller-pm-report * { visibility: visible; }
            #chiller-pm-report { 
              position: absolute; 
              left: 0; 
              top: 0; 
              width: 100%;
              padding: 20px;
            }
            .no-print { display: none !important; }
            @page { margin: 0.5in; size: letter; }
          }
        `}
      </style>

      <Card className="print:shadow-none print:border-2 print:border-black">
        <CardContent className="p-6 print:p-4">
          {/* Header */}
          <div className="border-b-2 border-primary pb-4 mb-6 print:border-black">
            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
              <div>
                <h1 className="text-2xl font-bold print:text-black">
                  Annual Chiller PM Inspection Report
                </h1>
                <p className="text-muted-foreground mt-1 print:text-gray-600">
                  Comprehensive maintenance and risk assessment
                </p>
              </div>
              <div className="text-right text-sm print:text-black">
                <div className="font-semibold">Report Generated</div>
                <div>{format(new Date(), "MMM d, yyyy 'at' h:mm a")}</div>
              </div>
            </div>
          </div>

          {/* Equipment & Inspection Info */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-2">
              <h2 className="font-semibold text-lg border-b pb-1 print:text-black">
                Equipment Information
              </h2>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-muted-foreground print:text-gray-600">Name:</div>
                <div className="font-medium print:text-black">{pm.equipment?.name || "Unknown"}</div>
                <div className="text-muted-foreground print:text-gray-600">Location:</div>
                <div className="print:text-black">{pm.equipment?.location || "N/A"}</div>
                <div className="text-muted-foreground print:text-gray-600">Model:</div>
                <div className="print:text-black">{pm.chiller_model || "N/A"}</div>
                <div className="text-muted-foreground print:text-gray-600">Serial:</div>
                <div className="print:text-black">{pm.chiller_serial || "N/A"}</div>
                <div className="text-muted-foreground print:text-gray-600">Age:</div>
                <div className="print:text-black">
                  {pm.chiller_age_years ? `${pm.chiller_age_years} years` : "N/A"}
                </div>
                <div className="text-muted-foreground print:text-gray-600">Operating Hours:</div>
                <div className="print:text-black">
                  {pm.operating_hours_at_inspection?.toLocaleString() || "N/A"}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="font-semibold text-lg border-b pb-1 print:text-black">
                Inspection Details
              </h2>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-muted-foreground print:text-gray-600">Inspection Date:</div>
                <div className="font-medium print:text-black">{formatDate(pm.inspection_date)}</div>
                <div className="text-muted-foreground print:text-gray-600">Inspection Year:</div>
                <div className="print:text-black">{pm.inspection_year}</div>
                <div className="text-muted-foreground print:text-gray-600">Technician:</div>
                <div className="print:text-black">
                  {pm.technician ? `${pm.technician.firstName} ${pm.technician.lastName}` : "N/A"}
                </div>
                <div className="text-muted-foreground print:text-gray-600">Status:</div>
                <div className="print:text-black capitalize">{pm.status}</div>
                <div className="text-muted-foreground print:text-gray-600">Next Annual Due:</div>
                <div className="print:text-black">{formatDate(pm.next_annual_due)}</div>
              </div>
            </div>
          </div>

          {/* Risk Assessment */}
          <div className="bg-muted/30 rounded-lg p-4 mb-6 print:bg-gray-100 print:break-inside-avoid">
            <h2 className="font-semibold text-lg mb-4 print:text-black">Risk Assessment</h2>
            <div className="flex flex-col md:flex-row items-center gap-6">
              <RiskScoreGauge score={pm.overall_risk_score} level={pm.overall_risk_level} />
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground print:text-gray-600">
                    Requires Immediate Action:
                  </span>
                  <Badge variant={pm.requires_immediate_action ? "destructive" : "secondary"}>
                    {pm.requires_immediate_action ? "YES" : "No"}
                  </Badge>
                </div>
                {pm.notes && (
                  <div>
                    <span className="text-sm text-muted-foreground print:text-gray-600">Notes:</span>
                    <p className="text-sm mt-1 print:text-black">{pm.notes}</p>
                  </div>
                )}
                <div className="flex flex-wrap gap-2 text-sm">
                  <div className="px-3 py-1 bg-background rounded print:bg-white print:border">
                    <span className="text-muted-foreground print:text-gray-600">Labor: </span>
                    <span className="font-medium print:text-black">
                      {pm.labor_hours_total ? `${pm.labor_hours_total} hrs` : "N/A"}
                    </span>
                  </div>
                  <div className="px-3 py-1 bg-background rounded print:bg-white print:border">
                    <span className="text-muted-foreground print:text-gray-600">Parts Cost: </span>
                    <span className="font-medium print:text-black">
                      {pm.parts_cost_total ? `$${pm.parts_cost_total.toLocaleString()}` : "N/A"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Findings */}
          <div className="mb-6 print:break-before-page">
            <FindingsSection findings={findings} />
          </div>

          {/* Technical Sections */}
          <div className="space-y-4">
            <h2 className="font-semibold text-lg border-b pb-1 print:text-black print:break-before-page">
              Technical Inspection Details
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {sections.map((section, idx) => (
                <ReportSectionCard key={idx} section={section!} />
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-4 border-t text-center text-xs text-muted-foreground print:text-gray-600">
            <p>
              This report was generated from the Annual Chiller Maintenance & Risk Intelligence system.
            </p>
            <p>
              Report ID: {pm.id} | Generated: {format(new Date(), "yyyy-MM-dd HH:mm:ss")}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ChillerPMReportPreview;
