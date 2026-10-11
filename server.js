// 1. CARREGAMENTO DE MÓDULOS E CONFIGURAÇÃO
require("dotenv").config(); // Carrega as variáveis do arquivo .env primeiro
const express = require("express");
const pool = require("./database"); // Importa a conexão com o banco
const cors = require("cors");

const app = express();

// 2. MIDDLEWARES (Configurações obrigatórias antes das rotas)
app.use(cors()); // Permite que o front-end acesse o back-end
app.use(express.json()); // Permite que o servidor entenda requisições em formato JSON

// 🔐 ROTA DE CADASTRO (REGISTRAR NOVO USUÁRIO)
app.post("/api/registrar", async (req, res) => {
  try {
    const { nome, email, senha } = req.body;

    if (!nome || !email || !senha) {
      return res
        .status(400)
        .json({ erro: "Por favor, preencha todos os campos." });
    }

    // 🌟 CORREÇÃO AQUI: Verifica se retornou alguma linha de verdade usando .length
    const usuarioExiste = await pool.query(
      "SELECT * FROM usuarios WHERE email = $1",
      [email],
    );
    if (usuarioExiste.rows.length > 0) {
      return res.status(400).json({ erro: "Este e-mail já está em uso." });
    }

    // Insere o novo usuário se ele não existir
    const queryCadastro =
      "INSERT INTO usuarios (nome, email, senha) VALUES ($1, $2, $3) RETURNING id, nome, email";
    const resultado = await pool.query(queryCadastro, [nome, email, senha]);

    res.status(201).json({ sucesso: true, usuario: resultado.rows[0] });
  } catch (erro) {
    console.error("Erro no cadastro:", erro);
    res.status(500).json({ erro: "Erro interno ao cadastrar usuário." });
  }
});

// 🔑 ROTA DE LOGIN (AUTENTICAR USUÁRIO EXISTENTE)
app.post("/api/login", async (req, res) => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ erro: "Preencha o e-mail e a senha." });
    }

    // Busca o usuário pelo e-mail informado
    const resultado = await pool.query(
      "SELECT * FROM usuarios WHERE email = $1",
      [email],
    );

    // Se não encontrou nenhuma linha, o e-mail não existe
    if (resultado.rows.length === 0) {
      return res.status(401).json({ erro: "E-mail ou senha incorretos." });
    }

    // 🌟 Pega a primeira linha retornada do banco
    const usuarioEncontrado = resultado.rows[0];

    // Compara a senha digitada com a senha salva no banco
    if (usuarioEncontrado.senha !== senha) {
      return res.status(401).json({ erro: "E-mail ou senha incorretos." });
    }

    // 🌟 Certifique-se de que pegou a primeira linha: const usuarioEncontrado = resultado.rows;

    // Retorna o sucesso estruturado exatamente com letras minúsculas
    res.json({
      sucesso: true,
      mensagem: "Login efetuado com sucesso!",
      usuario: {
        nome: usuarioEncontrado.nome, // 🌟 n minúsculo!
        email: usuarioEncontrado.email, // 🌟 e minúsculo!
      },
    });
  } catch (erro) {
    console.error("Erro no login:", erro);
    res.status(500).json({ erro: "Erro interno ao tentar fazer login." });
  }
});

// 3. ROTAS DA API

// Rota de teste: Busca todos os pedidos cadastrados no banco de dados real
app.get("/api/pedidos", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM historico_pedidos ORDER BY id DESC",
    );
    res.json(result.rows);
  } catch (erro) {
    console.error("Erro ao buscar no banco:", erro);
    res.status(500).json({ erro: "Erro ao acessar o banco de dados." });
  }
});

// Rota para receber, validar e salvar os pedidos enviados pela sua vitrine
app.post("/api/pedidos", async (req, res) => {
  try {
    const {
      id_pedido,
      data_hora,
      descricao_itens,
      status_pedido,
      valor_total,
    } = req.body;

    // Validação básica para garantir que nenhum dado importante venha vazio
    if (!id_pedido || !descricao_itens || !valor_total) {
      return res
        .status(400)
        .json({ erro: "Por favor, envie todas as informações do pedido." });
    }

    // Query SQL para inserir na tabela historico_pedidos de forma segura
    const queryTexto = `
      INSERT INTO historico_pedidos (id_pedido, data_hora, descricao_itens, status_pedido, valor_total) 
      VALUES ($1, $2, $3, $4, $5) 
      RETURNING *`;

    const valores = [
      id_pedido,
      data_hora,
      descricao_itens,
      status_pedido,
      valor_total,
    ];
    const resultado = await pool.query(queryTexto, valores);

    // Retorna o pedido salvo de volta para o Front-end confirmar na tela
    res.status(201).json({
      sucesso: true,
      pedido: resultado.rows[0],
    });
  } catch (erro) {
    console.error("Erro ao salvar no banco:", erro);
    res
      .status(500)
      .json({ erro: "Erro ao salvar o pedido no banco de dados." });
  }
});

// Rota para deletar um pedido específico do banco de dados pelo ID (CORRIGIDA: FORA DA POST)
app.delete("/api/pedidos/:id", async (req, res) => {
  try {
    const { id } = req.params; // Pega o ID que veio na URL

    // Executa o comando de deletar na tabela do banco
    const resultado = await pool.query(
      "DELETE FROM historico_pedidos WHERE id = \$1",
      [id],
    );

    // Verifica se algum registro foi realmente deletado
    if (resultado.rowCount === 0) {
      return res
        .status(404)
        .json({ erro: "Pedido não encontrado no banco de dados." });
    }

    res.json({ sucesso: true, mensagem: "Pedido excluído com sucesso!" });
  } catch (erro) {
    console.error("Erro ao deletar no banco:", erro);
    res
      .status(500)
      .json({ erro: "Erro ao tentar excluir o pedido do banco de dados." });
  }
});

// 🔄 ROTA PARA ATUALIZAR O STATUS DO PEDIDO (Mecanismo do Confeiteiro)
app.put("/api/pedidos/:id/status", async (req, res) => {
  try {
    const { id } = req.params; // Pega o ID único do pedido que veio na URL
    const { status_pedido } = req.body; // Pega o novo status enviado pela tela

    if (!status_pedido) {
      return res
        .status(400)
        .json({ erro: "Por favor, informe o novo status do pedido." });
    }

    // Executa o comando de atualização na tabela do banco
    const queryTexto =
      "UPDATE historico_pedidos SET status_pedido = $1 WHERE id = $2 RETURNING *";
    const resultado = await pool.query(queryTexto, [status_pedido, id]);

    // Verifica se o pedido realmente existia
    if (resultado.rowCount === 0) {
      return res
        .status(404)
        .json({ erro: "Pedido não encontrado no banco de dados." });
    }

    res.json({
      sucesso: true,
      mensagem: "Status do pedido atualizado com sucesso!",
      pedido: resultado.rows[0],
    });
  } catch (erro) {
    console.error("Erro ao atualizar status no banco:", erro);
    res
      .status(500)
      .json({ erro: "Erro ao tentar atualizar o status do pedido." });
  }
});

/// 👥 ROTA DE CADASTRO REAL
app.post("/api/usuarios/cadastro", async (req, res) => {
  try {
    // 👇 ADICIONE ESTA LINHA EXATAMENTE AQUI PARA RASTREAR NO TERMINAL:
    console.log("📦 DADOS QUE CHEGARAM DO FORMULÁRIO:", req.body);

    const { username, email, senha, telefone } = req.body;

    // Garante que nenhuma string chegue vazia ou cheia de espaços
    const usuarioLimpo = username ? username.trim() : "";
    const emailLimpo = email ? email.trim() : "";
    const senhaLimpa = senha ? senha.trim() : "";

    // Validação rígida no servidor
    if (!usuarioLimpo || !emailLimpo || !senhaLimpa) {
      return res.status(400).json({
        erro: "Campos obrigatórios estão vazios ou ausentes na requisição.",
      });
    }

    const queryTexto = `
      INSERT INTO usuarios (username, email, senha, telefone, eh_admin) 
      VALUES ($1, $2, $3, $4, $5) 
      RETURNING id, username, email, eh_admin`;

    const valores = [
      usuarioLimpo,
      emailLimpo,
      senhaLimpa,
      telefone || "",
      false,
    ];
    const resultado = await pool.query(queryTexto, valores);

    res.status(201).json({ sucesso: true, usuario: resultado.rows[0] });
  } catch (erro) {
    console.error("Erro ao cadastrar:", erro);
    if (erro.code === "23505") {
      // Registro duplicado (UNIQUE)
      if (erro.detail.includes("username")) {
        return res
          .status(400)
          .json({ erro: "Este nome de usuário já está sendo usado." });
      }
      if (erro.detail.includes("email")) {
        return res
          .status(400)
          .json({ erro: "Este e-mail já está cadastrado no sistema." });
      }
    }
    res.status(500).json({ erro: "Erro interno ao cadastrar usuário." });
  }
});

// 🔑 ROTA DE LOGIN INTELIGENTE (Aceita Nome de Usuário OU E-mail)
app.post("/api/usuarios/login", async (req, res) => {
  try {
    const { loginIdentificador, senha } = req.body; // loginIdentificador recebe o Usuário OU o E-mail digitado

    if (!loginIdentificador || !senha) {
      return res
        .status(400)
        .json({ erro: "Preencha o campo de login e a senha." });
    }

    // Faz a busca inteligente verificando as duas colunas
    const queryTexto =
      "SELECT * FROM usuarios WHERE username = \$1 OR email = \$2";
    const resultado = await pool.query(queryTexto, [
      loginIdentificador,
      loginIdentificador,
    ]);

    if (resultado.rows.length === 0) {
      return res
        .status(401)
        .json({ erro: "Usuário/E-mail ou senha incorretos." });
    }

    const usuario = resultado.rows[0];

    // Valida a senha limpa
    if (usuario.senha !== senha) {
      return res
        .status(401)
        .json({ erro: "Usuário/E-mail ou senha incorretos." });
    }

    res.json({
      sucesso: true,
      usuario: {
        id: usuario.id,
        username: usuario.username,
        email: usuario.email,
        eh_admin: usuario.eh_admin,
      },
    });
  } catch (erro) {
    console.error("Erro no login:", erro);
    res.status(500).json({ erro: "Erro interno ao processar o login." });
  }
});

/// ==========================================
// 3. CONFIGURAÇÃO DE ARQUIVOS ESTÁTICOS E ROTAS VISUAIS
// ==========================================
const path = require("path");

// Faz o servidor Express olhar uma pasta para trás (..) para achar os arquivos HTML, CSS e JS soltos na raiz
app.use(express.static(path.join(__dirname, "..")));

// Entrega o seu arquivo index.html principal quando alguém acessa o link puro do site
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "index.html"));
});

// ==========================================
// 4. INICIALIZAÇÃO DO SERVIDOR (Porta dinâmica necessária para o Render)
// ==========================================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor ativo e rodando na porta ${PORT}`);
});
