const { z } = require('zod');

const createBusinessTripSchema = z.object({
  destination: z.string({
    error: "Destination is required."
  }).min(2, "Destination must be at least 2 characters long.")
    .max(100, "Destination is too long. Max 100 characters.")
    .trim(),

  purpose: z.string({
    error: "Purpose is required."
  }).min(2, "Purpose must be at least 2 characters long.")
    .max(255, "Purpose is too long. Max 255 characters.")
    .trim(),

  startDate: z.string({
    error: "Start date is required."
  }).regex(/^\d{4}-\d{2}-\d{2}$/, "Start date must be in YYYY-MM-DD format."),

  endDate: z.string({
    error: "End date is required."
  }).regex(/^\d{4}-\d{2}-\d{2}$/, "End date must be in YYYY-MM-DD format."),

  employeeIds: z.array(
    z.number({
      error: "Employee ID must be a number."
    }).positive("Employee ID must be a positive number.")
  ).min(1, "At least one employee must be registered in the team.")
});

const updateBusinessTripSchema = z.object({
  destination: z.string().min(2, "Destination must be at least 2 characters long.").max(100, "Destination is too long. Max 100 characters.").trim().optional(),
  purpose: z.string().min(2, "Purpose must be at least 2 characters long.").max(255, "Purpose is too long. Max 255 characters.").trim().optional(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Start date must be in YYYY-MM-DD format.").optional(),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "End date must be in YYYY-MM-DD format.").optional(),
  employeeIds: z.array(z.number().positive()).min(1).optional()
});

const approveBusinessTripSchema = z.object({
  approvedBy: z.number({
    error: "Approved by (employee ID) must be a number."
  }).positive("Approved by ID must be a positive number."),
  status: z.enum(['Approved', 'Rejected'], {
    error: "Status must be either 'Approved' or 'Rejected'."
  }),
  notes: z.string().max(255, "Notes must not exceed 255 characters.").optional()
});

const processBusinessTripSchema = z.object({
  processedBy: z.number({
    error: "Processed by (employee ID) must be a number."
  }).positive("Processed by ID must be a positive number."),
  status: z.enum(['Processed', 'Rejected'], {
    error: "Status must be either 'Processed' or 'Rejected'."
  })
});

const uploadEvidenceSchema = z.object({
  filePath: z.string({
    error: "File path is required."
  }).min(2, "File path is too short.")
    .max(255, "File path is too long.")
});

module.exports = {
  createBusinessTripSchema,
  updateBusinessTripSchema,
  approveBusinessTripSchema,
  processBusinessTripSchema,
  uploadEvidenceSchema
};
