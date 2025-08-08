
import React, { useEffect, useMemo, useState } from "react";
import { getCurrentCompanyId } from "@/services/companyService";
import { fetchVendorsByCompany, createVendor, updateVendor, deleteVendor } from "@/services/vendorsService";

type VendorForm = {
  name: string;
  service_categories: string;
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
  address?: string;
  status: "active" | "inactive";
  is_preferred: boolean;
  rating?: number | "";
  notes?: string;
  insurance_expires_at?: string;
};

const emptyForm: VendorForm = {
  name: "",
  service_categories: "",
  contact_name: "",
  contact_email: "",
  contact_phone: "",
  address: "",
  status: "active",
  is_preferred: false,
  rating: "",
  notes: "",
  insurance_expires_at: "",
};

const VendorsPage: React.FC = () => {
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [vendors, setVendors] = useState<any[]>([]);
  const [form, setForm] = useState<VendorForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const preferredVendors = useMemo(() => vendors.filter(v => v.is_preferred), [vendors]);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      setError(null);
      try {
        const cid = await getCurrentCompanyId();
        setCompanyId(cid);
        if (cid) {
          const list = await fetchVendorsByCompany(cid);
          setVendors(list);
        } else {
          setError("No company context. You must belong to a company to manage vendors.");
        }
      } catch (e: any) {
        console.error("Vendors init error:", e);
        setError(e.message ?? "Failed to load vendors");
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyId) {
      setError("No company selected.");
      return;
    }
    setError(null);
    try {
      const payload = {
        company_id: companyId,
        name: form.name.trim(),
        service_categories: form.service_categories
          ? form.service_categories.split(",").map(s => s.trim()).filter(Boolean)
          : [],
        contact_name: form.contact_name || null,
        contact_email: form.contact_email || null,
        contact_phone: form.contact_phone || null,
        address: form.address || null,
        status: form.status,
        is_preferred: form.is_preferred,
        rating: form.rating === "" ? null : Number(form.rating),
        notes: form.notes || null,
        insurance_expires_at: form.insurance_expires_at || null,
      };

      if (editingId) {
        const updated = await updateVendor(editingId, payload);
        setVendors(vendors.map(v => (v.id === editingId ? updated : v)));
      } else {
        const created = await createVendor(payload);
        setVendors([created, ...vendors]);
      }
      resetForm();
    } catch (e: any) {
      console.error("Vendor save error:", e);
      setError(e.message ?? "Failed to save vendor");
    }
  };

  const handleEdit = (v: any) => {
    setEditingId(v.id);
    setForm({
      name: v.name ?? "",
      service_categories: (v.service_categories ?? []).join(", "),
      contact_name: v.contact_name ?? "",
      contact_email: v.contact_email ?? "",
      contact_phone: v.contact_phone ?? "",
      address: v.address ?? "",
      status: (v.status as "active" | "inactive") ?? "active",
      is_preferred: !!v.is_preferred,
      rating: v.rating ?? "",
      notes: v.notes ?? "",
      insurance_expires_at: v.insurance_expires_at ?? "",
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this vendor?")) return;
    try {
      await deleteVendor(id);
      setVendors(vendors.filter(v => v.id !== id));
      if (editingId === id) resetForm();
    } catch (e: any) {
      console.error("Vendor delete error:", e);
      setError(e.message ?? "Failed to delete vendor");
    }
  };

  return (
    <div className="mx-auto max-w-6xl p-4 md:p-6">
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <h1 className="text-2xl font-semibold">Vendors</h1>
        <div className="flex gap-2">
          <a href="/work-orders" className="text-sm text-primary underline">Go to Work Orders</a>
        </div>
      </div>

      {loading && <div className="text-muted-foreground">Loading...</div>}
      {error && <div className="mb-4 rounded border border-destructive/30 bg-destructive/10 px-3 py-2 text-destructive">{error}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <form onSubmit={handleSubmit} className="rounded-lg border bg-card p-4 shadow-sm">
          <h2 className="mb-3 font-medium">{editingId ? "Edit Vendor" : "Add Vendor"}</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-sm mb-1">Name</label>
              <input className="w-full rounded border bg-background px-3 py-2" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
            </div>
            <div>
              <label className="block text-sm mb-1">Service Categories (comma-separated)</label>
              <input className="w-full rounded border bg-background px-3 py-2" value={form.service_categories} onChange={e => setForm(f => ({ ...f, service_categories: e.target.value }))} placeholder="HVAC, Electrical, Plumbing" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm mb-1">Contact Name</label>
                <input className="w-full rounded border bg-background px-3 py-2" value={form.contact_name} onChange={e => setForm(f => ({ ...f, contact_name: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm mb-1">Contact Email</label>
                <input type="email" className="w-full rounded border bg-background px-3 py-2" value={form.contact_email} onChange={e => setForm(f => ({ ...f, contact_email: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm mb-1">Contact Phone</label>
                <input className="w-full rounded border bg-background px-3 py-2" value={form.contact_phone} onChange={e => setForm(f => ({ ...f, contact_phone: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm mb-1">Address</label>
                <input className="w-full rounded border bg-background px-3 py-2" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm mb-1">Status</label>
                <select className="w-full rounded border bg-background px-3 py-2" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as "active" | "inactive" }))}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div className="flex items-center gap-2 mt-2 md:mt-6">
                <input id="preferred" type="checkbox" checked={form.is_preferred} onChange={e => setForm(f => ({ ...f, is_preferred: e.target.checked }))} />
                <label htmlFor="preferred" className="text-sm">Preferred Vendor</label>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-sm mb-1">Rating</label>
                <input type="number" step="0.1" min="0" max="5" className="w-full rounded border bg-background px-3 py-2" value={form.rating} onChange={e => setForm(f => ({ ...f, rating: e.target.value }))} />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm mb-1">Insurance Expires At</label>
                <input type="datetime-local" className="w-full rounded border bg-background px-3 py-2" value={form.insurance_expires_at} onChange={e => setForm(f => ({ ...f, insurance_expires_at: e.target.value }))} />
              </div>
            </div>
            <div>
              <label className="block text-sm mb-1">Notes</label>
              <textarea className="w-full rounded border bg-background px-3 py-2" rows={3} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <button type="submit" className="rounded bg-primary px-4 py-2 text-primary-foreground">{editingId ? "Save Changes" : "Add Vendor"}</button>
            {editingId && (
              <button type="button" onClick={resetForm} className="rounded border px-4 py-2">Cancel</button>
            )}
          </div>
        </form>

        <div className="lg:col-span-2">
          <div className="rounded-lg border bg-card p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-medium">Vendor List</h2>
              <div className="text-xs text-muted-foreground">{preferredVendors.length} preferred</div>
            </div>
            <div className="divide-y">
              {vendors.map((v) => (
                <div key={v.id} className="flex flex-col md:flex-row md:items-center justify-between gap-3 py-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{v.name}</span>
                      {v.is_preferred && <span className="rounded bg-emerald-600/15 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 text-xs">Preferred</span>}
                      <span className="rounded bg-muted px-2 py-0.5 text-xs">{v.status}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {(v.service_categories || []).join(", ")}
                    </div>
                    {(v.contact_email || v.contact_phone) && (
                      <div className="text-sm text-muted-foreground">
                        {v.contact_email && <span>{v.contact_email}</span>}
                        {v.contact_email && v.contact_phone && <span className="px-2">•</span>}
                        {v.contact_phone && <span>{v.contact_phone}</span>}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleEdit(v)} className="rounded border px-3 py-1.5 text-sm">Edit</button>
                    <button onClick={() => handleDelete(v.id)} className="rounded border border-destructive text-destructive px-3 py-1.5 text-sm">Delete</button>
                  </div>
                </div>
              ))}
              {vendors.length === 0 && !loading && (
                <div className="py-6 text-sm text-muted-foreground">No vendors yet. Add your first vendor using the form.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorsPage;
