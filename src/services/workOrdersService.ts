
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type WorkOrder = Database["public"]["Tables"]["automated_work_orders"]["Row"];
type WorkOrderVendor = Database["public"]["Tables"]["work_order_vendors"]["Row"];
type WorkOrderVendorInsert = Database["public"]["Tables"]["work_order_vendors"]["Insert"];
type WorkOrderVendorUpdate = Database["public"]["Tables"]["work_order_vendors"]["Update"];

export const fetchWorkOrders = async (companyId?: string | null) => {
  console.log("[workOrdersService] fetchWorkOrders companyId:", companyId);
  let query = supabase.from("automated_work_orders").select("*").order("created_at", { ascending: false });
  if (companyId) {
    query = query.eq("company_id", companyId);
  }
  const { data, error } = await query;
  if (error) throw error;
  return data as WorkOrder[];
};

export const fetchWorkOrderVendors = async (workOrderId: string) => {
  console.log("[workOrdersService] fetchWorkOrderVendors", workOrderId);
  const { data, error } = await supabase
    .from("work_order_vendors")
    .select("*, vendors:vendor_id(name, is_preferred)")
    .eq("work_order_id", workOrderId)
    .order("assigned_at", { ascending: false });

  if (error) throw error;
  return data as (WorkOrderVendor & { vendors?: { name: string; is_preferred: boolean } })[];
};

export const assignVendorToWorkOrder = async (payload: WorkOrderVendorInsert) => {
  console.log("[workOrdersService] assignVendorToWorkOrder", payload);
  const { data, error } = await supabase
    .from("work_order_vendors")
    .insert(payload)
    .select("*")
    .single();
  if (error) throw error;
  return data as WorkOrderVendor;
};

export const updateWorkOrderVendor = async (id: string, payload: WorkOrderVendorUpdate) => {
  console.log("[workOrdersService] updateWorkOrderVendor", id, payload);
  const { data, error } = await supabase
    .from("work_order_vendors")
    .update(payload)
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return data as WorkOrderVendor;
};

export const removeWorkOrderVendor = async (id: string) => {
  console.log("[workOrdersService] removeWorkOrderVendor", id);
  const { error } = await supabase.from("work_order_vendors").delete().eq("id", id);
  if (error) throw error;
  return true;
};
