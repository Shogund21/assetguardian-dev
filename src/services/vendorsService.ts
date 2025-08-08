
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Vendor = Database["public"]["Tables"]["vendors"]["Row"];
type VendorInsert = Database["public"]["Tables"]["vendors"]["Insert"];
type VendorUpdate = Database["public"]["Tables"]["vendors"]["Update"];

export const fetchVendorsByCompany = async (companyId: string) => {
  console.log("[vendorsService] fetchVendorsByCompany", companyId);
  const { data, error } = await supabase
    .from("vendors")
    .select("*")
    .eq("company_id", companyId)
    .order("is_preferred", { ascending: false })
    .order("name", { ascending: true });

  if (error) throw error;
  return data as Vendor[];
};

export const createVendor = async (payload: VendorInsert) => {
  console.log("[vendorsService] createVendor", payload);
  const { data, error } = await supabase.from("vendors").insert(payload).select("*").single();
  if (error) throw error;
  return data as Vendor;
};

export const updateVendor = async (id: string, payload: VendorUpdate) => {
  console.log("[vendorsService] updateVendor", id, payload);
  const { data, error } = await supabase.from("vendors").update(payload).eq("id", id).select("*").single();
  if (error) throw error;
  return data as Vendor;
};

export const deleteVendor = async (id: string) => {
  console.log("[vendorsService] deleteVendor", id);
  const { error } = await supabase.from("vendors").delete().eq("id", id);
  if (error) throw error;
  return true;
};
