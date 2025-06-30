
import * as z from "zod";

export const EquipmentFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  model: z.string().optional(),
  serialNumber: z.string().optional(),
  location: z.string().min(2, "Location is required"),
  status: z.string().optional(),
  lastMaintenance: z.string().nullable().optional(),
  nextMaintenance: z.string().nullable().optional(),
  type: z.string().min(1, "Type is required"),
});

export type EquipmentFormValues = z.infer<typeof EquipmentFormSchema>;
