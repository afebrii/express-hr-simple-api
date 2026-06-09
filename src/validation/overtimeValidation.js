const { z } = require('zod');

const createOvertimeSchema = z.object({
  employeeId: z.number({
    error: "Employee ID must be a number."
  }).positive("Employee ID must be a positive number."),
  
  overtimeDate: z.string({
    error: "Overtime date is required."
  }).regex(/^\d{4}-\d{2}-\d{2}$/, "Overtime date must be in YYYY-MM-DD format."),

  projectName: z.string({
    error: "Project name is required."
  }).min(2, "Project name must be at least 2 characters long.")
    .max(100, "Project name is too long. Max 100 characters.")
    .trim(),

  startTime: z.string({
    error: "Start time is required."
  }).regex(/^[0-9]{2}:[0-9]{2}$/, "Start time must be in HH:MM format (e.g., 07:00)."),

  endTime: z.string({
    error: "End time is required."
  }).regex(/^[0-9]{2}:[0-9]{2}$/, "End time must be in HH:MM format (e.g., 09:00)."),

  totalHours: z.number({
    error: "Total hours must be a number."
  }).positive("Total hours must be a positive number.")
});

const updateOvertimeSchema = z.object({
  projectName: z.string().min(2, "Project name must be at least 2 characters long.").max(100, "Project name is too long. Max 100 characters.").trim().optional(),
  startTime: z.string().regex(/^[0-9]{2}:[0-9]{2}$/, "Start time must be in HH:MM format (e.g., 07:00).").optional(),
  endTime: z.string().regex(/^[0-9]{2}:[0-9]{2}$/, "End time must be in HH:MM format (e.g., 09:00).").optional(),
  totalHours: z.number().positive("Total hours must be a positive number.").optional()
});

const approveOvertimeSchema = z.object({
  approvedBy: z.number({
    error: "Approved by (employee ID) must be a number."
  }).positive("Approved by ID must be a positive number."),
  
  status: z.enum(['Approved', 'Rejected'], {
    error: "Status must be either 'Approved' or 'Rejected'."
  }),
  
  notes: z.string().max(255, "Notes must not exceed 255 characters.").optional()
});

module.exports = {
  createOvertimeSchema,
  updateOvertimeSchema,
  approveOvertimeSchema
};
