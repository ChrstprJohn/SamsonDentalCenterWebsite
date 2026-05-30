import { z } from "zod";
import { CreateServiceSchema } from "./create-service.dto";

export const UpdateServiceSchema = CreateServiceSchema.partial().extend({
  id: z.string().uuid("Invalid service ID"),
});

export type UpdateServiceDto = z.infer<typeof UpdateServiceSchema>;
