const { z } = require('zod');

//schema mirip dto yg punya validasi
const createRegionCountriesSchema = z.object({
    regionId: z.number({
        // kustomisasi error pesan lama (Zod v3)
        // required_error: "Region ID is required.",
        // invalid_type_error: "Region ID must be a number."
        error: (issue) =>
            issue.input === undefined
                ? "Region ID is required."
                : "Region ID must be a number."
    })
        .positive("Region ID must be a positive number."),

    countries: z.array(
        z.object({
            countryId: z.string()
                .length(2, "Country ID must be exactly 2 characters (e.g., 'ID', 'US').")
                .toUpperCase(), // data akan diubah kapital
            countryName: z.string()
                .min(1, "Country name cannot be empty.")
                .max(50, "Country name is too long. Max 50 characters.")
        })
    ).min(1, "At least one country must be provided in the array.")
});

module.exports = {
    createRegionCountriesSchema
};