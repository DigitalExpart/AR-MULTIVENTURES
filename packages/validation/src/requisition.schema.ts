import { z } from 'zod';

export const requisitionStep1QuarrySchema = z.object({
  quarryId: z.string().min(1, 'Please select a quarry source'),
});

export const requisitionStep2MaterialSchema = z.object({
  materialId: z.string().min(1, 'Please select a material type'),
});

export const requisitionStep3QuantitySchema = z.object({
  quantity: z.number().min(10, 'Minimum order quantity is 10 tonnes'),
});

export const requisitionStep4TransportSchema = z.object({
  transportationType: z.enum(['company', 'self', 'third_party']),
});

export const requisitionStep6DestinationSchema = z.object({
  destination: z.string().min(3, 'Destination name is required'),
  destinationAddress: z.string().min(5, 'Full site address is required'),
});

export const requisitionStep7DateSchema = z.object({
  deliveryDate: z.string().min(1, 'Please select a preferred delivery date'),
  notes: z.string().optional(),
});
