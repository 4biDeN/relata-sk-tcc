const userService = require("../services/userService");

const createUser = async (req, res) => {
  try {
    const user = await userService.createUser(req.body);
    res.status(201).json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const pageSize = Math.min(
      Math.max(Number(req.query.pageSize) || 20, 1),
      100
    );
    const sortBy = req.query.sortBy || "user_username";
    const sortDir = req.query.sortDir || "asc";
    const field = req.query.field || null;
    const q = req.query.q || null;
    const includeInactive = String(req.query.includeInactive || '').toLowerCase() === 'true'

    const { total, rows } = await userService.getAllUsers({
      field,
      q,
      sortBy,
      sortDir,
      limit: pageSize,
      offset: (page - 1) * pageSize,
      includeInactive,
    });

    res.set("X-Total-Count", String(total));
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getUser = async (req, res) => {
  try {
    const user = await userService.getUserById(req.params.id);
    if (!user)
      return res.status(404).json({ message: "Usuário não encontrado" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const body = { ...req.body };
    delete body.user_documento;
    const updated = await userService.updateUser(req.params.id, body);
    if (!updated)
      return res.status(400).json({ message: "Nada para atualizar" });
    const fresh = await userService.getUserById(req.params.id);
    res.json(fresh);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await userService.getUserById(userId);
    if (!user)
      return res.status(404).json({ message: "Usuário não encontrado" });
    await userService.deleteUser(userId);
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  createUser,
  getAllUsers,
  getUser,
  updateUser,
  deleteUser,
};