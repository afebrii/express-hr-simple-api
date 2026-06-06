const countryRepository = require("../repositories/countryRepository");
const regionRepository = require("../repositories/regionRepository");
const { BadRequestError, NotFoundError, ConflictError } = require("../utils/customError");

class CountryService {
  async getAllCountries() {
    return await countryRepository.findAll();
  }

  async getCountryById(id) {
    if (!id || typeof id !== "string") {
      throw new BadRequestError("ID country tidak valid.");
    }
    const cleanId = id.trim().toUpperCase();
    const country = await countryRepository.findById(cleanId);
    if (!country) {
      throw new NotFoundError(`Country dengan ID ${cleanId} tidak ditemukan.`);
    }
    return country;
  }

  async createCountry(data) {
    const { countryId, countryName, regionId } = data;

    // Validation countryId
    if (!countryId || typeof countryId !== "string" || countryId.trim() === "") {
      throw new BadRequestError("ID country wajib diisi");
    }
    const cleanCountryId = countryId.trim().toUpperCase();
    if (cleanCountryId.length !== 2) {
      throw new BadRequestError("Country ID harus berupa 2 karakter.");
    }

    // Validation countryName
    if (!countryName || typeof countryName !== "string" || countryName.trim() === "") {
      throw new BadRequestError("Nama country wajib diisi");
    }
    const cleanCountryName = countryName.trim();
    if (cleanCountryName.length > 40) {
      throw new BadRequestError("Country name too long! Max 40 characters.");
    }

    // Validation regionId
    if (regionId === undefined || regionId === null || isNaN(Number(regionId))) {
      throw new BadRequestError("ID region wajib diisi dan berupa angka");
    }
    // Verify region exists
    const region = await regionRepository.findById(Number(regionId));
    if (!region) {
      throw new BadRequestError(`Region dengan ID ${regionId} tidak ditemukan.`);
    }

    // Check if duplicate country ID
    const existingCountry = await countryRepository.findById(cleanCountryId);
    if (existingCountry) {
      throw new ConflictError(`Country dengan ID ${cleanCountryId} sudah terdaftar.`);
    }

    return await countryRepository.create(cleanCountryId, cleanCountryName, Number(regionId));
  }

  async updateCountry(id, data) {
    if (!id || typeof id !== "string") {
      throw new BadRequestError("ID country tidak valid.");
    }
    const cleanId = id.trim().toUpperCase();

    // Check if country exists
    const country = await countryRepository.findById(cleanId);
    if (!country) {
      throw new NotFoundError(`Country dengan ID ${cleanId} tidak ditemukan.`);
    }

    const { countryName, regionId } = data;

    // Validation countryName
    if (!countryName || typeof countryName !== "string" || countryName.trim() === "") {
      throw new BadRequestError("Nama country tidak boleh kosong!");
    }
    const cleanCountryName = countryName.trim();
    if (cleanCountryName.length > 40) {
      throw new BadRequestError("Country name too long! Max 40 characters.");
    }

    // Validation regionId
    if (regionId === undefined || regionId === null || isNaN(Number(regionId))) {
      throw new BadRequestError("ID region tidak boleh kosong dan harus berupa angka!");
    }
    // Verify region exists
    const region = await regionRepository.findById(Number(regionId));
    if (!region) {
      throw new BadRequestError(`Region dengan ID ${regionId} tidak ditemukan.`);
    }

    const updatedCountry = await countryRepository.update(cleanId, cleanCountryName, Number(regionId));
    if (!updatedCountry) {
      throw new NotFoundError(`Country dengan ID ${cleanId} tidak ditemukan`);
    }
    return updatedCountry;
  }

  async deleteCountry(id) {
    if (!id || typeof id !== "string") {
      throw new BadRequestError("ID country tidak valid.");
    }
    const cleanId = id.trim().toUpperCase();
    const isDeleted = await countryRepository.delete(cleanId);
    if (!isDeleted) {
      throw new NotFoundError(`Country dengan ID ${cleanId} tidak ditemukan`);
    }
    return true;
  }
}

module.exports = new CountryService();
