const overtimeService = require("../services/overtimeService");

class OvertimeController {
  findAll = async (req, res, next) => {
    try {
      const { employeeId, month, year } = req.query;
      const data = await overtimeService.getAllOvertimes({ employeeId, month, year });
      return res.success("Overtimes retrieved successfully", data);
    } catch (error) {
      next(error);
    }
  };

  findById = async (req, res, next) => {
    try {
      const { id } = req.params;
      const data = await overtimeService.getOvertimeById(id);
      return res.success("Overtime retrieved successfully", data);
    } catch (error) {
      next(error);
    }
  };

  create = async (req, res, next) => {
    try {
      const data = await overtimeService.requestOvertime(req.body);
      return res.success("Overtime request submitted successfully", data, 201);
    } catch (error) {
      next(error);
    }
  };

  update = async (req, res, next) => {
    try {
      const { id } = req.params;
      const data = await overtimeService.updateOvertime(id, req.body);
      return res.success("Overtime request updated successfully", data);
    } catch (error) {
      next(error);
    }
  };

  approve = async (req, res, next) => {
    try {
      const { id } = req.params;
      const data = await overtimeService.approveOvertime(id, req.body);
      return res.success("Overtime request approval status updated successfully", data);
    } catch (error) {
      next(error);
    }
  };

  remove = async (req, res, next) => {
    try {
      const { id } = req.params;
      await overtimeService.deleteOvertime(id);
      return res.success("Overtime request deleted successfully", null);
    } catch (error) {
      next(error);
    }
  };
}

module.exports = new OvertimeController();
