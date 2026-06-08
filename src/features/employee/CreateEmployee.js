const { getConnection } = require("../../infra/db");
const { BadRequestError } = require("../../infra/AppError");

const CreateEmployee = async (req, res, next) => {
  let conn;
  try {
    const { firstName, lastName, email, phoneNumber, hireDate, jobId, salary, departmentId } = req.body;

    if (!lastName || !email || !hireDate || !jobId || !departmentId) {
      throw new BadRequestError('lastName, email, hireDate, jobId, and departmentId are required.');
    }

    conn = await getConnection();

    const query = `
      INSERT INTO employees (
        employee_id, 
        first_name, 
        last_name, 
        email, 
        phone_number, 
        hire_date, 
        job_id, 
        salary, 
        department_id
      ) 
      VALUES (
        employees_seq.NEXTVAL, 
        :firstName, 
        :lastName, 
        :email, 
        :phoneNumber, 
        TO_DATE(:hireDate, 'YYYY-MM-DD'), 
        :jobId, 
        :salary, 
        :departmentId
      )
      RETURNING employee_id INTO :out_id
    `;

    const result = await conn.execute(query, {
      firstName: firstName || null,
      lastName: lastName,
      email: email,
      phoneNumber: phoneNumber || null,
      hireDate: hireDate,
      jobId: jobId,
      salary: salary ? Number(salary) : null,
      departmentId: Number(departmentId),
      out_id: { type: require("oracledb").NUMBER, dir: require("oracledb").BIND_OUT }
    });

    await conn.commit();

    const data = {
      employeeId: result.outBinds.out_id[0],
      firstName,
      lastName,
      email,
      phoneNumber,
      hireDate,
      jobId,
      salary,
      departmentId
    };

    return res.success("Employee created successfully", data, 201);
  } catch (error) {
    if (conn) {
      await conn.rollback();
    }
    if (error.message.includes('ORA-00001')) {
      throw new BadRequestError('Employee Email already exists (Duplicate Email).');
    }
    next(error);
  } finally {
    if (conn) await conn.close();
  }
};

module.exports = CreateEmployee;
