# API de Gestão de Totens

Este projeto é uma API desenvolvida com Node.js e Express para gerenciar autenticação, usuários e totens publicitários. A API se conecta a um banco de dados MongoDB e permite operações CRUD através de rotas específicas.

## Tecnologias Utilizadas

- **Node.js**
- **Express.js**
- **MongoDB (Mongoose)**
- **dotenv** (para variáveis de ambiente)
- **CORS** (Cross-Origin Resource Sharing)
- **bcrypt** (para hash de senhas)
- **jsonwebtoken (JWT)** (para autenticação segura)

## Instalação

3. Instale as dependências:
   ```sh
   npm install
   ```

4. Crie um arquivo `.env` na raiz do projeto e adicione as variáveis de ambiente:
   ```env
   MONGO_URI=your_mongodb_connection_string
   PORT=5000
   JWT_SECRET=your_jwt_secret
   ```

## Uso

1. Inicie o servidor:
   ```sh
   npm start
   ```

2. O servidor estará rodando em: `http://localhost:5000`

## Rotas Disponíveis

### Autenticação

- **POST** `/auth/register` - Registra um novo usuário.
- **POST** `/auth/login` - Realiza login de um usuário.

### Totens

- **GET** `/totems` - Retorna a lista de todos os totens.
- **GET** `/totems?userId={id}` - Retorna os totens de um usuário específico.
- **GET** `/totems/:totemId` - Obtém informações de um totem por ID.
- **POST** `/totems` - Cria um novo totem.
- **PUT** `/totems/:totemId` - Atualiza um totem por ID.
- **DELETE** `/totems/:totemId` - Remove um totem por ID.
- **PUT** `/totems/:id/status` - Atualiza o status de um totem.

### Usuários

- **GET** `/users` - Retorna a lista de usuários.

## Configuração de CORS

A API permite solicitações das seguintes origens:
- `http://localhost:3000`
- `https://painel-outdoor.vercel.app`

## Estrutura de Pastas

```
.
├── routes
│   ├── auth.js
│   ├── totems.js
│   ├── users.js
├── models
│   ├── User.js
│   ├── Totem.js
├── middleware
│   ├── authenticateToken.js
├── node_modules
├── .env
├── package.json
├── server.js
└── README.md
```

## Contribuição

1. Faça um fork do projeto.
2. Crie uma branch para sua feature: `git checkout -b minha-feature`
3. Commit suas mudanças: `git commit -m 'Adicionar nova feature'`
4. Envie para o repositório: `git push origin minha-feature`
5. Abra um Pull Request.

## Licença

Este projeto está sob a licença MIT. Consulte o arquivo [LICENSE](LICENSE) para mais detalhes.

