const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// Registro de usuário
router.post('/register', async (req, res) => {
  const { email, password, role } = req.body;

  console.log('Dados recebidos no registro:', { email, password, role });

  if (!email || !password || !role) {
    console.error('Erro: Campos obrigatórios ausentes');
    return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    console.error('Erro: E-mail inválido');
    return res.status(400).json({ error: 'E-mail inválido.' });
  }

  if (!['admin', 'cliente'].includes(role)) {
    console.error('Erro: Role inválida');
    return res.status(400).json({ error: 'Role inválida! Use "admin" ou "cliente".' });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.error('Erro: E-mail já registrado');
      return res.status(400).json({ error: 'E-mail já registrado.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('Senha criptografada:', hashedPassword);

    const newUser = new User({
      email,
      password: hashedPassword,
      role,
    });
    await newUser.save();
    console.log('Usuário criado:', newUser);

    res.status(201).json({ message: 'Usuário registrado com sucesso!' });
  } catch (err) {
    console.error('Erro interno no servidor:', err.message);
    res.status(500).json({ error: 'Erro interno no servidor.', details: err.message });
  }
});

// Login de usuário (sem criação de Totem)
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  console.log('Tentativa de login:', { email });

  try {
    const user = await User.findOne({ email });
    if (!user) {
      console.error('Erro: Usuário não encontrado');
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      console.error('Erro: Senha inválida');
      return res.status(401).json({ error: 'Senha inválida.' });
    }

    if (!process.env.JWT_SECRET) {
      console.error('Erro: JWT_SECRET não definido');
      return res.status(500).json({ error: 'Configuração do servidor incompleta.' });
    }

    const tokenPayload = {
      userId: user._id,
      email: user.email,
      role: user.role,
    };

    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, { expiresIn: '1h' });

    console.log('Login bem-sucedido:', { userId: user._id, email: user.email, role: user.role });

    res.json({
      message: 'Login bem-sucedido.',
      token,
      role: user.role,
    });
  } catch (err) {
    console.error('Erro interno no servidor:', err.message);
    res.status(500).json({ error: 'Erro ao autenticar o usuário.', details: err.message });
  }
});

module.exports = router;
