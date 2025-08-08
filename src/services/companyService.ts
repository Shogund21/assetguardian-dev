
import { supabase } from "@/integrations/supabase/client";

export const getCurrentCompanyId = async (): Promise<string | null> => {
  console.log("[companyService] fetching current company id via RPC get_user_company");
  const { data, error } = await supabase.rpc("get_user_company");
  if (error) {
    console.error("[companyService] get_user_company error:", error);
    return null;
  }
  const id = data?.[0]?.company?.id ?? null;
  console.log("[companyService] current company id:", id);
  return id;
};
