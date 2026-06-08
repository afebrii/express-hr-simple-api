const CreateUser = (req, res, next) => {
  res.success('User created successfully (mock)', req.body, 201);
};

module.exports = CreateUser;
