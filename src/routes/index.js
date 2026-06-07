var express = require('express');
var router = express.Router();


const departmentRoutes = require('./departmentRoute');
const regionRoutes = require('./regionRoute');
const countryRoutes = require('./countryRoute');

//register kan semua fitur route ke sub path endpoint
// bisa register kan semua route disini
router.use('/departments', departmentRoutes);
router.use('/regions', regionRoutes);
router.use('/countries', countryRoutes);

module.exports = router;


/* GET home page. ga dipake */
/* router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
}); */