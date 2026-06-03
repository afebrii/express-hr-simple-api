const countryRepository = require("../repositories/countryRepository");
const regionRepository = require("../repositories/regionRepository");

class CountryService {
  async getAllCountries() {
    return await countryRepository.findAll();
  }

  async getCountryById(id) {
    if (!id || typeof id !== "string") {
      const error = new Error("ID country tidak valid.");
      error.statusCode = 400;
      throw error;
    }
    const cleanId = id.trim().toUpperCase();
    const country = await countryRepository.findById(cleanId);
    if (!country) {
      const error = new Error(`Country dengan ID ${cleanId} tidak ditemukan.`);
      error.statusCode = 404;
      throw error;
    }
    return country;
  }

  async createCountry(data) {
    const { countryId, countryName, regionId } = data;

    // Validation countryId
    if (!countryId || typeof countryId !== "string" || countryId.trim() === "") {
      const error = new Error("ID country wajib diisi");
      error.statusCode = 400;
      throw error;
    }
    const cleanCountryId = countryId.trim().toUpperCase();
    if (cleanCountryId.length !== 2) {
      const error = new Error("Country ID harus berupa 2 karakter.");
      error.statusCode = 400;
      throw error;
    }

    // Validation countryName
    if (!countryName || typeof countryName !== "string" || countryName.trim() === "") {
      const error = new Error("Nama country wajib diisi");
      error.statusCode = 400;
      throw error;
    }
    const cleanCountryName = countryName.trim();
    if (cleanCountryName.length > 40) {
      const error = new Error("Country name too long! Max 40 characters.");
      error.statusCode = 400;
      throw error;
    }

    // Validation regionId
    if (regionId === undefined || regionId === null || isNaN(Number(regionId))) {
      const error = new Error("ID region wajib diisi dan berupa angka");
      error.statusCode = 400;
      throw error;
    }
    // Verify region exists
    const region = await regionRepository.findById(Number(regionId));
    if (!region) {
      const error = new Error(`Region dengan ID ${regionId} tidak ditemukan.`);
      error.statusCode = 400;
      throw error;
    }

    // Check if duplicate country ID
    const existingCountry = await countryRepository.findById(cleanCountryId);
    if (existingCountry) {
      const error = new Error(`Country dengan ID ${cleanCountryId} sudah terdaftar.`);
      error.statusCode = 409;
      throw error;
    }

    return await countryRepository.create(cleanCountryId, cleanCountryName, Number(regionId));
  }

  async updateCountry(id, data) {
    if (!id || typeof id !== "string") {
      const error = new Error("ID country tidak valid.");
      error.statusCode = 400;
      throw error;
    }
    const cleanId = id.trim().toUpperCase();

    // Check if country exists
    const country = await countryRepository.findById(cleanId);
    if (!country) {
      const error = new Error(`Country dengan ID ${cleanId} tidak ditemukan.`);
      error.statusCode = 404;
      throw error;
    }

    const { countryName, regionId } = data;

    // Validation countryName
    if (!countryName || typeof countryName !== "string" || countryName.trim() === "") {
      const error = new Error("Nama country tidak boleh kosong!");
      error.statusCode = 400;
      throw error;
    }
    const cleanCountryName = countryName.trim();
    if (cleanCountryName.length > 40) {
      const error = new Error("Country name too long! Max 40 characters.");
      error.statusCode = 400;
      throw error;
    }

    // Validation regionId
    if (regionId === undefined || regionId === null || isNaN(Number(regionId))) {
      const error = new Error("ID region tidak boleh kosong dan harus berupa angka!");
      error.statusCode = 400;
      throw error;
    }
    // Verify region exists
    const region = await regionRepository.findById(Number(regionId));
    if (!region) {
      const error = new Error(`Region dengan ID ${regionId} tidak ditemukan.`);
      error.statusCode = 400;
      throw error;
    }

    const updatedCountry = await countryRepository.update(cleanId, cleanCountryName, Number(regionId));
    if (!updatedCountry) {
      const error = new Error(`Country dengan ID ${cleanId} tidak ditemukan`);
      error.statusCode = 404;
      throw error;
    }
    return updatedCountry;
  }

  async deleteCountry(id) {
    if (!id || typeof id !== "string") {
      const error = new Error("ID country tidak valid.");
      error.statusCode = 400;
      throw error;
    }
    const cleanId = id.trim().toUpperCase();
    const isDeleted = await countryRepository.delete(cleanId);
    if (!isDeleted) {
      const error = new Error(`Country dengan ID ${cleanId} tidak ditemukan`);
      error.statusCode = 404;
      throw error;
    }
    return true;
  }
}

module.exports = new CountryService();
