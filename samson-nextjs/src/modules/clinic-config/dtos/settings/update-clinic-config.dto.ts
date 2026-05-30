import { z } from "zod";
import { ClinicConfigResponseSchema } from "./get-clinic-config.dto";

export const UpdateClinicConfigSchema = ClinicConfigResponseSchema.partial();

export type UpdateClinicConfigDto = z.infer<typeof UpdateClinicConfigSchema>;
