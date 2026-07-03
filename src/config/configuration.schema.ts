import { z } from 'zod';

export const configurationSchema = z.object({
  app: z.object({
    port: z.number(),
  }),

  database: z.object({
    host: z.string(),
    port: z.number(),
    username: z.string(),
    password: z.string(),
    database: z.string(),
    synchronize: z.boolean(),
    logging: z.boolean(),
  }),

  openMeteo: z.object({
    baseUrl: z.url(),
  }),

  scheduler: z.object({
    enabled: z.boolean(),
    batchSize: z.number(),
  }),
});

export type Configuration = z.infer<typeof configurationSchema>;