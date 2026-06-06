const regionRepository = require("../repositories/regionRepository");
const countryRepository = require("../repositories/countryRepository");
const { BadRequestError, NotFoundError } = require("../utils/customError");
const { getConnection } = require("../utils/db");

class RegionService {
  async getAllRegions() {
    return await regionRepository.findAll();
  }

  async getRegionById(id) {
    const region = await regionRepository.findById(id);
    if (!region) {
      throw new NotFoundError(`Region with ID ${id} not found.`);
    }
    return region;
  }

  async createRegion(regionName) {
    if (!regionName || regionName.trim() === '') {
      throw new BadRequestError('Nama region wajib diisi');
    }
    if (regionName.length > 25) {
      throw new BadRequestError('Region name too long! Max 25 characters.');
    }
    return await regionRepository.create(regionName);
  }

  async updateRegion(id, data) {
    if (!data.regionName || data.regionName.trim() === '') {
      throw new BadRequestError('Nama region tidak boleh kosong!');
    }
    if (data.regionName.length > 25) {
      throw new BadRequestError('Region name too long! Max 25 characters.');
    }
    const updatedRegion = await regionRepository.update(id, data.regionName);
    if (!updatedRegion) {
      throw new NotFoundError(`Region dengan ID ${id} tidak ditemukan`);
    }
    return updatedRegion;
  }

  async deleteRegion(id) {
    const isDeleted = await regionRepository.delete(id);
    if (!isDeleted) {
      throw new NotFoundError(`Region dengan ID ${id} tidak ditemukan`);
    }
    return true;
  }

  async getAllRegionsWithCountries() {
    const regions = await regionRepository.findAllWithCountries();

    // Validasi: Jika data kosong atau tidak ada region sama sekali
    if (!regions || regions.length === 0) {
      throw new NotFoundError('No regions or countries found in the database.');
    }

    return regions;
  }


  async addCountriesToRegion(regionId, countries) {
    // 1. Validasi Input Awal
    if (!regionId) {
      throw new BadRequestError('Region ID is required.');
    }
    if (!countries || !Array.isArray(countries) || countries.length === 0) {
      throw new BadRequestError('Countries must be a non-empty array.');
    }

    let conn;
    try {
      // 2. Create connection 
      conn = await getConnection();


      // 3. Call repository untuk melakukan proses looping insert
      await countryRepository.insertBulk(conn, regionId, countries);

      // 4. Jika seluruh looping sukses tanpa error, COMMIT data ke Oracle DB
      await conn.commit();

      // return data respons API
      return { regionId, totalInserted: countries.length, countries };

    } catch (error) {
      // 5. Jika ada error (misal ID duplikat), rollback semuanya!
      if (conn) {
        console.error('Transaction failed. Rolling back changes...');
        await conn.rollback();
      }

      // Jika ada error constraint dari oracle, kita bungkus dengna BadRequestError 
      if (error.message.includes('ORA-00001')) {
        throw new BadRequestError('One of the Country IDs already exists (Duplicate Primary Key).');
      }

      throw error; // lempar ke global handler
    } finally {
      // 6. Pastikan koneksi selalu di clsoe
      if (conn) await conn.close();
    }
  }
}

module.exports = new RegionService();
