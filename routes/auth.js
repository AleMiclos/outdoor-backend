const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

// Rota de registro
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, totemId } = req.body;

    // Validações básicas
    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
    }

    if (role === 'cliente' && !totemId) {
      return res.status(400).json({ error: 'Clientes devem ter um totemId.' });
    }

    // Verifica se o email já está registrado
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Este email já está em uso.' });
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // Criação do novo usuário
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role,
      totemId: role === 'cliente' ? totemId : null, // Apenas clientes têm totemId
    });

    await newUser.save();
    res.status(201).json({ message: 'Usuário registrado com sucesso!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro interno no servidor.' });
  }
});


// Login de usuário (sem criação de Totem)
// Login de usuário (sem criação de Totem)
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  console.log('Tentativa de login:', { email });

  try {
    // Verifica se o email e a senha foram fornecidos
    if (!email || !password) {
      console.error('Erro: Email e senha são obrigatórios.');
      return res.status(400).json({ error: 'Email e senha são obrigatórios.' });
    }

    // Busca o usuário pelo email
    const user = await User.findOne({ email });
    if (!user) {
      console.error('Erro: Usuário não encontrado.');
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }

    // Verifica se a senha fornecida está correta
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      console.error('Erro: Senha inválida.');
      return res.status(401).json({ error: 'Senha inválida.' });
    }

    // Verifica se a chave JWT_SECRET está configurada
    if (!process.env.JWT_SECRET) {
      console.error('Erro: JWT_SECRET não definido no ambiente.');
      return res.status(500).json({ error: 'Configuração do servidor incompleta.' });
    }

    // Cria o payload do token JWT
    const tokenPayload = {
      userId: user._id,
      name: user.name, // Incluindo o nome do usuário no payload
      email: user.email,
      role: user.role,
      totemId: user.totemId || null, // Inclui o totemId se existir
    };

    // Gera o token JWT
    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, { expiresIn: '1h' });

    console.log('Login bem-sucedido:', {
      userId: user._id,
      email: user.email,
      role: user.role,
    });

    // Retorna a resposta de sucesso com o token
    res.status(200).json({
      message: 'Login bem-sucedido.',
      token,
      user: {
        userId: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        totemId: user.totemId || null,
      },
    });
  } catch (err) {
    // Lida com erros internos do servidor
    console.error('Erro interno no servidor:', err.message);
    res.status(500).json({
      error: 'Erro ao autenticar o usuário.',
      details: err.message,
    });
  }
});

module.exports = router;
