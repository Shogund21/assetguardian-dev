
import { supabase } from "@/integrations/supabase/client";

export const getCurrentCompanyId = async (): Promise<string | null> => {
  console.log("[companyService] fetching current company id via RPC get_user_company");
  const { data, error } = await supabase.rpc("get_user_company");
  if (error) {
    console.error("[companyService] get_user_company error:", error);
    return null;
  }

  // The RPC returns a row with a 'company' JSON object; cast to access its fields safely
  const rows = (data as unknown) as Array<{ company?: { id?: string; name?: string } }>;
  const id = rows?.[0]?.company?.id ?? null;

  console.log("[companyService] current company id:", id);
  return id;
};
