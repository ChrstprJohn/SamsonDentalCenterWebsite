import { z } from "zod";
import { clinicConfigResponseSchema } from "./get-clinic-config.dto";

export const updateClinicConfigSchema = clinicConfigResponseSchema.partial();

export type UpdateClinicConfigDto = z.infer<typeof updateClinicConfigSchema>;
