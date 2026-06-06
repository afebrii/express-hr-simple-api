const regionService = require("../services/regionService");

class RegionController {
  findAll = async (req, res, next) => {
    try {
      const data = await regionService.getAllRegions();
      return res.success("Fetch all data regions", data);
    } catch (error) {
      next(error);
    }
  };

  findById = async (req, res, next) => {
    try {
      const { id } = req.params;
      const data = await regionService.getRegionById(id);
      return res.success("Region retrieved successfully", data);
    } catch (error) {
      next(error);
    }
  };

  create = async (req, res, next) => {
    try {
      const { regionName } = req.body;
      const data = await regionService.createRegion(regionName);
      return res.success("Region created successfully", data);
    } catch (error) {
      next(error);
    }
  };

  update = async (req, res, next) => {
    try {
      const { id } = req.params;
      const data = await regionService.updateRegion(id, req.body);
      return res.success("Region updated successfully", data);
    } catch (error) {
      next(error);
    }
  };

  remove = async (req, res, next) => {
    try {
      const { id } = req.params;
      await regionService.deleteRegion(id);
      return res.success("Region deleted successfully", null);
    } catch (error) {
      next(error);
    }
  };

  // kita gunakan arrow function untuk hindari reference 'this'
  getRegionsWithCountries = async (req, res, next) => {
    try {
      const data = await regionService.getAllRegionsWithCountries();

      //di sini response di inject dan override message nya    
      return res.success('Regions with countries retrieved successfully.', data, 200);
    } catch (error) {
      // jika error akan di forward ke globalErrorHandler
      next(error);
    }
  };

  createCountries = async (req, res, next) => {
    try {

      const { regionId, countries } = req.body;

      const data = await regionService.addCountriesToRegion(regionId, countries);

      return res.success('Countries successfully added to the region.', data, 201);
    } catch (error) {
      next(error);
    }
  };
}

module.exports = new RegionController();
