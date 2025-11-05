const User = require('../models/user.model');

exports.listUsers = async (req, res, next) => {
  try {
    const { q, limit = 50, offset = 0 } = req.query;
    let data = await User.findAll();
    if (q) data = data.filter(u => u.name.toLowerCase().includes(String(q).toLowerCase()));
    const start = Number(offset), end = start + Number(limit);
    return res.status(200).json({ total: data.length, data: data.slice(start, end) });
  } catch (e) {
    next(e);
  }
};

exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findById(Number(req.params.id));
    if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé' });
    return res.status(200).json(user);
  } catch (e) {
    next(e);
  }
};

exports.createUser = async (req, res, next) => {
  try {
    const { name, email } = req.body;
    if (name === undefined || email === undefined) {
      return res.status(400).json({ error: 'name (string) et email (string) sont requis' });
    }
    const created = await User.createOne({ name, email });
    return res.status(201).json(created);
  } catch (e) {
    next(e);
  }
};

exports.updateUser = async (req, res, next) => {
  try {
    const updated = await User.updateOne(Number(req.params.id), req.body);
    if (!updated) return res.status(404).json({ error: 'Utilisateur non trouvé' });
    return res.status(200).json(updated);
  } catch (e) {
    next(e);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    const ok = await User.deleteOne(Number(req.params.id));
    if (!ok) return res.status(404).json({ error: 'Utilisateur non trouvé' });
    return res.status(204).send();
  } catch (e) {
    next(e);
  }
};
