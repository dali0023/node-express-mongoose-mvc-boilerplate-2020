const path = require("path");
const Employee = require("../models/employeesModel");

const home = (req, res, next) => {
  Employee.find()
    .then((employees) => {
      res.render("index", { allEmployee: employees });
    })
    .catch((error) => console.log(error));
};
const addEmployee = (req, res, next) => {
  res.render("addEmployee", {
    pageTitle: "Add New Employee",
    msg: null,
  });
};

// add employee
const saveEmployee = (req, res, next) => {
  let newEmployee = {
    title: req.body.title,
    designation: req.body.designation,
    salary: req.body.salary,
  };
  Employee.create(newEmployee)
    .then((employee) => {
      req.flash("success_msg", "Employee added successfully.");

      res.redirect("/");
    })
    .catch((error) => {
      console.log(error);
    });
};

//search Employee

const searchEmployee = (req, res, next) => {
  res.render("search", { results: "" });
};
const searchEmployeeResult = (req, res, next) => {
  let searchQuery = req.query.searchName;
  Employee.findOne({ title: searchQuery })
    .then((results) => {
      res.render("search", { results: results });
    })
    .catch((err) => console.log(err));
};

const editEmployee = (req, res, next) => {
  let eId = req.params.id;
  Employee.findOne({ _id: eId })
    .then((employeeData) => {
      res.render("edit", { employee: employeeData });
    })
    .catch((err) => console.log(err));
};
const updateEmployee = (req, res, next) => {
  let searchQuery = { _id: req.params.id };

  Employee.updateOne(searchQuery, {
    $set: {
      title: req.body.title,
      designation: req.body.designation,
      salary: req.body.salary,
    },
  })
    .then((employee) => {
      req.flash("success_msg", "Employee updated successfully.");

      res.redirect("/");
    })
    .catch((err) => console.log(err));
};
const deleteEmployee = (req, res, next) => {
  let searchQuery = { _id: req.params.id };
  Employee.deleteOne(searchQuery)
    .then(() => {
      req.flash("success_msg", "Employee deleted successfully.");
      res.redirect("/");
    })
    .catch((err) => {
      req.flash("error_msg", "Error:" + err);
      res.redirect("/");
    });
};
module.exports = {
  home,
  addEmployee,
  saveEmployee,
  searchEmployee,
  searchEmployeeResult,
  editEmployee,
  updateEmployee,
  deleteEmployee,
};
