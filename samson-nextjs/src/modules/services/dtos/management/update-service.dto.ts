import { z } from "zod";
import { createServiceSchema } from "./create-service.dto";

export const updateServiceSchema = createServiceSchema.partial().extend({
  id: z.string().uuid("Invalid service ID"),
});

export type UpdateServiceDto = z.infer<typeof updateServiceSchema>;
