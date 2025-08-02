import { PrintView } from "@/components/print/PrintView";

const PrintSettingsTab = () => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Print & Export</h3>
        <p className="text-sm text-muted-foreground">
          Print equipment lists, project reports, and export data as PDF.
        </p>
      </div>
      
      <div className="border rounded-lg p-4">
        <PrintView />
      </div>
    </div>
  );
};

export default PrintSettingsTab;