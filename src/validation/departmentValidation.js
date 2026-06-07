const { z } = require('zod');


// di OOP kayak java/.net
// departmentDTO
const createDepartmentSchema = z.object({
    // departmentId biasanya auto-increment/sequence di Oracle
    // jd kita ga pake, ini contoh aja, tuk validasi. 
    /* departmentId: z.number({
        invalid_type_error: "Department ID must be a number."
    }).positive("Department ID must be a positive number.").optional(), */ 

    departmentName: z.string({
        // kustomisasi error pesan lama (Zod v3)
        // required_error: "Department name is required.",
        // invalid_type_error: "Department name must be a string."
        error: (issue) => 
            issue.input === undefined 
                ? "Department name is required." 
                : "Department name must be a string."
    })
    .min(2, "Department name must be at least 2 characters long.")
    .max(30, "Department name is too long. Max 30 characters.")
    .trim(), // otomatis hapus spasi kosong di awal atau di akhir kalimat

    
    locationId: z.number({
        // kustomisasi error pesan lama (Zod v3)
        // invalid_type_error: "Location ID must be a number."
        error: "Location ID must be a number."
    })
    .positive("Location ID must be a positive number.")
    .nullable()
    .optional()
});

module.exports = {
    createDepartmentSchema
};