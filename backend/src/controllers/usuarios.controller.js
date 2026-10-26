const userService = require('../services/user.services');

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
  } catch (err) {next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const user = await userService.update(req.params.id, req.body);
    res.json(user);
  } catch (err) {next(err); }
}

exports.delete = async (req, res, next) => {
  try {
    await userService.delete(req.params.id);
    res.status(204).end();
  } catch (err) {next(err); }
}