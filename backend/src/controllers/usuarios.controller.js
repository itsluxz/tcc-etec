const userService = require('../services/user.service');

exports.list = async (req, res, next) => {
  try {
    const users = await userService.findAll();
    res.json(users);
  } catch (err) { next(err); }
};

exports.getById = async (req, res, next) => {
  try {
    const user = await userService.findById(req.params.id);
    res.json(user);
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const user = await userService.create(req.body);
    res.status(201).json(user);
  } catch (err) { next(err); }
};