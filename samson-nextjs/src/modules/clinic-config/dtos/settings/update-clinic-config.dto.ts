import { z } from "zod";
import { clinicConfigAppSchema } from "./get-clinic-config.dto";

export const updateClinicConfigSchema = clinicConfigAppSchema.partial();

export type UpdateClinicConfigDto = z.infer<typeof updateClinicConfigSchema>;
