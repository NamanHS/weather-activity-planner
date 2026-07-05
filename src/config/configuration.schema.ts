import { z } from 'zod';

export const configurationSchema = z.object({
  app: z.object({
    port: z.number(),
  }),

  logging: z.object({
    levels: z.array(
      z.enum(['debug', 'log', 'warn', 'error', 'fatal']),
    ),
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

  clients: z.object({
    openMeteo: z.object({
      baseUrl: z.url(),
      forecastDays: z.number().int().positive(),
      timeoutMs: z.number().positive(),
      retryCount: z.number().int().nonnegative(),
      retryDelayMs: z.number().nonnegative(),
    }),
  }),

  scheduler: z.object({
    cityWeatherRefresh: z.object({
      enabled: z.boolean(),
      batchSize: z.number().int().positive(),
      activeCityWindowDays: z.number().int().positive(),
    })
  }),
});

export type Configuration = z.infer<typeof configurationSchema>;