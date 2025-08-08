
import React, { useEffect, useMemo, useState } from "react";
import { getCurrentCompanyId } from "@/services/companyService";
import { fetchWorkOrders, fetchWorkOrderVendors, assignVendorToWorkOrder, updateWorkOrderVendor, removeWorkOrderVendor } from "@/services/workOrdersService";
import { fetchVendorsByCompany } from "@/services/vendorsService";

type WorkOrder = {
  id: string;
  asset_id: string;
  title: string;
  description: string;
  priority: "low" | "medium" | "high";
  status: "pending" | "assigned" | "in_progress" | "completed" | "cancelled";
  due_hours: number;
  created_at: string;
};

const WorkOrdersPage: React.FC = () => {
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<WorkOrder[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [assigning, setAssigning] = useState<Record<string, string>>({});
  const [wov, setWov] = useState<Record<string, any[]>>({});
  const [error, setError] = useState<string | null>(null);

  const openOrders = useMemo(() => orders.filter(o => o.status !== "completed" && o.status !== "cancelled"), [orders]);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      setError(null);
      try {
        const cid = await getCurrentCompanyId();
        setCompanyId(cid);
        const [woList, vList] = await Promise.all([
          fetchWorkOrders(cid),
          cid ? fetchVendorsByCompany(cid) : Promise.resolve([]),
        ]);
        setOrders(woList as any);
        setVendors(vList as any);
        // Load assignments for each work order
        const map: Record<string, any[]> = {};
        for (const wo of woList) {
          try {
            const items = await fetchWorkOrderVendors(wo.id);
            map[wo.id] = items;
          } catch (err) {
            console.warn("Failed to load vendors for work order", wo.id, err);
            map[wo.id] = [];
          }
        }
        setWov(map);
      } catch (e: any) {
        console.error("WorkOrders init error:", e);
        setError(e.message ?? "Failed to load work orders");
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const handleAssign = async (workOrderId: string) => {
    const vendorId = assigning[workOrderId];
    if (!vendorId) return;
    try {
      const created = await assignVendorToWorkOrder({
        work_order_id: workOrderId,
        vendor_id: vendorId,
        status: "assigned",
      });
      setWov(prev => ({
        ...prev,
        [workOrderId]: [created, ...(prev[workOrderId] || [])],
      }));
      setAssigning(prev => ({ ...prev, [workOrderId]: "" }));
    } catch (e: any) {
      console.error("Assign vendor error:", e);
      alert(e.message ?? "Failed to assign vendor");
    }
  };

  const handleUpdateStatus = async (id: string, status: string, workOrderId: string) => {
    try {
      const updated = await updateWorkOrderVendor(id, { status });
      setWov(prev => ({
        ...prev,
        [workOrderId]: (prev[workOrderId] || []).map(item => (item.id === id ? updated : item)),
      }));
    } catch (e: any) {
      console.error("Update assignment error:", e);
      alert(e.message ?? "Failed to update assignment");
    }
  };

  const handleRemove = async (id: string, workOrderId: string) => {
    if (!confirm("Remove this vendor from the work order?")) return;
    try {
      await removeWorkOrderVendor(id);
      setWov(prev => ({
        ...prev,
        [workOrderId]: (prev[workOrderId] || []).filter(item => item.id !== id),
      }));
    } catch (e: any) {
      console.error("Remove assignment error:", e);
      alert(e.message ?? "Failed to remove assignment");
    }
  };

  return (
    <div className="mx-auto max-w-6xl p-4 md:p-6">
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <h1 className="text-2xl font-semibold">Work Orders</h1>
        <div className="flex gap-2">
          <a href="/vendors" className="text-sm text-primary underline">Go to Vendors</a>
        </div>
      </div>

      {loading && <div className="text-muted-foreground">Loading...</div>}
      {error && <div className="mb-4 rounded border border-destructive/30 bg-destructive/10 px-3 py-2 text-destructive">{error}</div>}

      <div className="grid grid-cols-1 gap-4">
        {openOrders.map((o) => (
          <div key={o.id} className="rounded-lg border bg-card p-4 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-medium">{o.title}</h2>
                  <span className="rounded bg-muted px-2 py-0.5 text-xs">{o.priority}</span>
                  <span className="rounded bg-muted px-2 py-0.5 text-xs">{o.status}</span>
                </div>
                <div className="text-sm text-muted-foreground">{o.description}</div>
              </div>
              <div className="min-w-[240px]">
                <label className="block text-sm mb-1">Assign Vendor</label>
                <div className="flex items-center gap-2">
                  <select
                    className="w-full rounded border bg-background px-3 py-2"
                    value={assigning[o.id] || ""}
                    onChange={e => setAssigning(prev => ({ ...prev, [o.id]: e.target.value }))}
                  >
                    <option value="">Select vendor...</option>
                    {vendors.map(v => (
                      <option key={v.id} value={v.id}>
                        {v.name}{v.is_preferred ? " • Preferred" : ""}
                      </option>
                    ))}
                  </select>
                  <button onClick={() => handleAssign(o.id)} className="shrink-0 rounded bg-primary px-3 py-2 text-primary-foreground">Assign</button>
                </div>
                {(!vendors || vendors.length === 0) && (
                  <div className="mt-2 text-xs text-muted-foreground">
                    No vendors for your company yet. <a href="/vendors" className="underline">Create one</a>.
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4">
              <h3 className="text-sm font-medium mb-2">Assigned Vendors</h3>
              <div className="space-y-2">
                {(wov[o.id] || []).map((item: any) => (
                  <div key={item.id} className="flex flex-col md:flex-row md:items-center justify-between gap-2 rounded border px-3 py-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{item.vendors?.name || item.vendor_id}</span>
                      {item.vendors?.is_preferred && <span className="rounded bg-emerald-600/15 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 text-xs">Preferred</span>}
                      <span className="rounded bg-muted px-2 py-0.5 text-xs">{item.status}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <select
                        className="rounded border bg-background px-2 py-1 text-sm"
                        value={item.status}
                        onChange={e => handleUpdateStatus(item.id, e.target.value, o.id)}
                      >
                        <option value="assigned">assigned</option>
                        <option value="quoted">quoted</option>
                        <option value="in_progress">in_progress</option>
                        <option value="completed">completed</option>
                        <option value="cancelled">cancelled</option>
                      </select>
                      <button onClick={() => handleRemove(item.id, o.id)} className="rounded border border-destructive text-destructive px-2 py-1 text-sm">Remove</button>
                    </div>
                  </div>
                ))}
                {(wov[o.id] || []).length === 0 && (
                  <div className="text-sm text-muted-foreground">No vendors assigned yet.</div>
                )}
              </div>
            </div>
          </div>
        ))}
        {openOrders.length === 0 && !loading && (
          <div className="text-sm text-muted-foreground">No open work orders.</div>
        )}
      </div>
    </div>
  );
};

export default WorkOrdersPage;
