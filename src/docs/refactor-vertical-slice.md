📁 bin/
📁 public/
📁 src/
   📁 features/
      📁 country/
         📄 GetCountries.js          <-- (Pecahan dari countryController, Service, Repo)
         📄 GetCountryById.js
         📄 CreateCountry.js
         📄 UpdateCountry.js
         📄 DeleteCountry.js
         📄 country.routes.js        <-- (Dari routes/countryRoute.js)
      
      📁 department/
         📄 GetDepartments.js        <-- (Pecahan dari departmentController, Service, Repo)
         📄 GetDepartmentById.js
         📄 CreateDepartment.js
         📄 UpdateDepartment.js
         📄 DeleteDepartment.js
         📄 department.routes.js     <-- (Dari routes/departmentRoute.js)
         📄 department.test.js       <-- (Pindahan dari tests/department.test.js)
      
      📁 region/
         📄 GetRegions.js            <-- (Pecahan dari regionController, Service, Repo)
         📄 GetRegionById.js
         📄 CreateRegion.js
         📄 UpdateRegion.js
         📄 DeleteRegion.js
         📄 region.routes.js         <-- (Dari routes/regionRoute.js)
      
      📁 employee/
         📄 GetEmployees.js          <-- (Karena kamu punya employeeRepository.js)
         📄 CreateEmployee.js
         📄 employee.routes.js
      
      📁 users/
         📄 GetUsers.js              <-- (Karena kamu punya routes/users.js)
         📄 CreateUser.js
         📄 users.routes.js

   📁 infra/                         <-- (Pusat utilitas dan konfigurasi global)
      📁 config/                     <-- (Bisa tetap di folder atau file langsung)
         📄 appConfig.js             <-- (Dari config/appConfig.js)
         📄 dbConfig.js              <-- (Dari config/dbConfig.js)
      📁 validation/                 <-- (Dari folder validation/)
      📄 AppError.js                 <-- (Ubah nama dari utils/customError.js)
      📄 db.js                       <-- (Dari utils/db.js)
      📄 response.js                 <-- (Dari utils/response.js)
      📄 errorHandler.js             <-- (Dari middlewares/errorHandler.js)
      📄 validateMiddleware.js       <-- (Dari middlewares/validateMiddleware.js)

   📄 app.js                         <-- (Pindahan dari luar, untuk setup Express)
📄 .env
📄 .gitignore
📄 index.js                          <-- (Pusat jalannya server & connect DB)
📄 package-lock.json
📄 package.json