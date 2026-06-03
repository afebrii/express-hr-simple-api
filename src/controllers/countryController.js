const countryService = require("../services/countryService");

class CountryController {
  findAll = async (req, res, next) => {
    try {
      const data = await countryService.getAllCountries();
      return res.success("Fetch all data countries", data);
    } catch (error) {
      next(error);
    }
  };

  findById = async (req, res, next) => {
    try {
      const { id } = req.params;
      const data = await countryService.getCountryById(id);
      return res.success("Country retrieved successfully", data);
    } catch (error) {
      next(error);
    }
  };

  create = async (req, res, next) => {
    try {
      const data = await countryService.createCountry(req.body);
      return res.success("Country created successfully", data);
    } catch (error) {
      next(error);
    }
  };

  update = async (req, res, next) => {
    try {
      const { id } = req.params;
      const data = await countryService.updateCountry(id, req.body);
      return res.success("Country updated successfully", data);
    } catch (error) {
      next(error);
    }
  };

  remove = async (req, res, next) => {
    try {
      const { id } = req.params;
      await countryService.deleteCountry(id);
      return res.success("Country deleted successfully", null);
    } catch (error) {
      next(error);
    }
  };
}

module.exports = new CountryController();
