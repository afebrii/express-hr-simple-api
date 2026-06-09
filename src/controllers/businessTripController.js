const businessTripService = require("../services/businessTripService");

class BusinessTripController {
  findAll = async (req, res, next) => {
    try {
      const { employeeId, startDate, endDate } = req.query;
      const data = await businessTripService.getAllTrips({ employeeId, startDate, endDate });
      return res.success("Business Trips retrieved successfully", data);
    } catch (error) {
      next(error);
    }
  };

  findById = async (req, res, next) => {
    try {
      const { id } = req.params;
      const data = await businessTripService.getTripById(id);
      return res.success("Business Trip retrieved successfully", data);
    } catch (error) {
      next(error);
    }
  };

  create = async (req, res, next) => {
    try {
      const data = await businessTripService.requestTrip(req.body);
      return res.success("Business Trip request submitted successfully", data, 201);
    } catch (error) {
      next(error);
    }
  };

  update = async (req, res, next) => {
    try {
      const { id } = req.params;
      const data = await businessTripService.updateTrip(id, req.body);
      return res.success("Business Trip request updated successfully", data);
    } catch (error) {
      next(error);
    }
  };

  approve = async (req, res, next) => {
    try {
      const { id } = req.params;
      const { approvedBy } = req.body;
      const data = await businessTripService.approveTrip(id, approvedBy);
      return res.success("Business Trip approved successfully", data);
    } catch (error) {
      next(error);
    }
  };

  process = async (req, res, next) => {
    try {
      const { id } = req.params;
      const { processedBy } = req.body;
      const data = await businessTripService.processTrip(id, processedBy);
      return res.success("Business Trip processed successfully", data);
    } catch (error) {
      next(error);
    }
  };

  uploadEvidence = async (req, res, next) => {
    try {
      const { id } = req.params;
      const { filePath } = req.body;
      const data = await businessTripService.uploadEvidence(id, filePath);
      return res.success("Evidence uploaded successfully", data);
    } catch (error) {
      next(error);
    }
  };

  remove = async (req, res, next) => {
    try {
      const { id } = req.params;
      await businessTripService.deleteTrip(id);
      return res.success("Business Trip request deleted successfully", null);
    } catch (error) {
      next(error);
    }
  };
}

module.exports = new BusinessTripController();
