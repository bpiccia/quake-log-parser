const { Contract, Job, Profile, sequelize } = require('../model')
const { Op, QueryTypes } = require("sequelize");
const AppError = require ('../utils/appError')
const catchAsync = require('../utils/catchAsync');

exports.getBestProfession = catchAsync(async (req, res, next) => {
  res.status(200).json ({
    status: "success",
    data: {
      highestEarningProfession
    }
  })
})