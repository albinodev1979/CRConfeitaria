// ==========================================
// 1. CARREGAMENTO DE MÓDULOS AND CONFIGURAÇÃO
// ==========================================
require("dotenv").config();
const express = require("express");
const pool = require("./database");
const cors = require("cors");
const path = require("path");

const app = express();

// ==========================================
// 2. MIDDLEWARES
// ==========================================
app.use(cors());
app.use(express.json());
// app.use(express.static('.'));

// Permite que o navegador acesse os arquivos da pasta assets publicamente
app.use('/assets', express.static(path.join(__dirname, '..', 'assets'))); // Ou, se preferir liberar a raiz inteira do projeto para arquivos estáticos:


// 🌟 MUDANÇA AQUI: Removeu o ".." porque os arquivos HTML estão na mesma pasta raiz do server.js no Git
const pastaPublica = path.resolve(__dirname);
app.use(express.static(pastaPublica));

// ==========================================
// 3. ROTAS VISUAIS (FRONT-END)
// ==========================================
app.get("/", (req, res) => {
  res.sendFile(path.join(pastaPublica, "index.html"));
});
// Rota para entregar os produtos do banco de dados à vitrine
app.get("/api/produtos", async (req, res) => {
  try {
    const resultado = await pool.query("SELECT * FROM produtos"); // Substitua 'produtos' pelo nome real da sua tabela se for diferente
    res.json(resultado.rows);
  } catch (erro) {
    console.error("Erro ao buscar produtos:", erro);
    res.status(500).json({ erro: "Erro ao carregar produtos" });
  }
});

// ==========================================
// 4. ROTAS DA API (BACK-END)
// ==========================================

// Rota de Cadastro de Usuário
app.post("/api/usuarios/cadastro", async (req, res) => {
  try {
    console.log("📦 DADOS QUE CHEGARAM DO FORMULÁRIO:", req.body);
    const { username, email, senha, telefone } = req.body;

    const usuarioLimpo = username ? username.trim() : "";
    const emailLimpo = email ? email.trim() : "";
    const senhaLimpa = senha ? senha.trim() : "";

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

// Rota de Login Inteligente
app.post("/api/usuarios/login", async (req, res) => {
  try {
    const { loginIdentificador, senha } = req.body;

    if (!loginIdentificador || !senha) {
      return res
        .status(400)
        .json({ erro: "Preencha o campo de login e a senha." });
    }

    const queryTexto =
      "SELECT * FROM usuarios WHERE username = $1 OR email = $2";
    const resultado = await pool.query(queryTexto, [
      loginIdentificador,
      loginIdentificador,
    ]);

    if (resultado.rows.length === 0) {
      return res
        .status(401)
        .json({ erro: "Usuário/E-mail ou senha incorretos." });
    }

    // 🏆 CORREÇÃO DEFINITIVA: Adicione o [0] no final para capturar a primeira linha da tabela
    const usuarioEncontrado = resultado.rows[0];

    // Compara a senha direto com o objeto da primeira linha
    if (usuarioEncontrado.senha !== senha) {
      return res
        .status(401)
        .json({ erro: "Usuário/E-mail ou senha incorretos." });
    }

    // Retorna os dados mapeados corretamente para o seu script.js ler
    res.json({
      sucesso: true,
      usuario: {
        id: usuarioEncontrado.id,
        username: usuarioEncontrado.username,
        email: usuarioEncontrado.email,
        eh_admin: usuarioEncontrado.eh_admin,
      },
    });
  } catch (erro) {
    console.error("Erro no login:", erro);
    res.status(500).json({ erro: "Erro interno ao processar o login." });
  }
});

// Buscar Pedidos
app.get("/api/pedidos", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM historico_pedidos ORDER BY id DESC",
    );
    // 🍰 ROTA PARA BUSCAR TODOS OS BOLOS DA VITRINE
    app.get("/api/produtos", async (req, res) => {
      try {
        const resultado = await pool.query(
          "SELECT * FROM produtos ORDER BY id ASC",
        );
        res.json(resultado.rows); // Envia a lista de bolos para o front-end
      } catch (erro) {
        console.error("Erro ao buscar produtos:", erro);
        res
          .status(500)
          .json({ erro: "Erro ao carregar os produtos da vitrine." });
      }
    });

    // =========================================================================
    // ROTA PARA EXCLUIR PEDIDO NO BANCO DE DADOS (POSTGRESQL)
    // =========================================================================
    app.delete("/api/pedidos/:id", async (req, res) => {
      const { id } = req.params;

      try {
        // Remove o '#' caso ele venha junto no ID (ex: #123456 -> 123456)
        // Se o seu ID no banco já armazena o '#', remova o .replace('#', '')
        const idLimpo = id.replace("#", "");

        // Exemplo usando pool do PostgreSQL
        const queryText =
          "DELETE FROM pedidos WHERE id_pedido = $1 OR id_pedido = $2";
        const resultado = await pool.query(queryText, [id, `#${idLimpo}`]);

        if (resultado.rowCount === 0) {
          return res.status(404).json({
            sucesso: false,
            erro: "Pedido não encontrado no banco de dados.",
          });
        }

        res.json({ sucesso: true, mensagem: "Pedido excluído com sucesso!" });
      } catch (erro) {
        console.error("Erro ao excluir pedido no servidor:", erro);
        res.status(500).json({
          sucesso: false,
          erro: "Erro interno ao tentar excluir o pedido.",
        });
      }
    });

    res.json(result.rows);
  } catch (erro) {
    console.error("Erro ao buscar no banco:", erro);
    res.status(500).json({ erro: "Erro ao acessar o banco de dados." });
  }
});

// Criar Pedido
app.post("/api/pedidos", async (req, res) => {
  try {
    const {
      id_pedido,
      data_hora,
      descricao_itens,
      status_pedido,
      valor_total,
    } = req.body;

    if (!id_pedido || !descricao_itens || !valor_total) {
      return res
        .status(400)
        .json({ erro: "Por favor, envie todas as informações do pedido." });
    }

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

    res.status(201).json({ sucesso: true, pedido: resultado.rows[0] });
  } catch (erro) {
    console.error("Erro ao salvar no banco:", erro);
    res
      .status(500)
      .json({ erro: "Erro ao salvar o pedido no banco de dados." });
  }
});

// Deletar Pedido
app.delete("/api/pedidos/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const resultado = await pool.query(
      "DELETE FROM historico_pedidos WHERE id = \$1",
      [id],
    );

    if (resultado.rowCount === 0) {
      return res
        .status(404)
        .json({ erro: "Pedido não encontrado no banco de dados." });
    }

    res.json({ sucesso: true, message: "Pedido excluído com sucesso!" });
  } catch (erro) {
    console.error("Erro ao deletar no banco:", erro);
    res
      .status(500)
      .json({ erro: "Erro ao tentar excluir o pedido do banco de dados." });
  }
});

// Atualizar Status do Pedido
app.put("/api/pedidos/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status_pedido } = req.body;

    if (!status_pedido) {
      return res
        .status(400)
        .json({ erro: "Por favor, informe o novo status do pedido." });
    }

    const queryTexto =
      "UPDATE historico_pedidos SET status_pedido = \$1 WHERE id = \$2 RETURNING *";
    const resultado = await pool.query(queryTexto, [status_pedido, id]);

    if (resultado.rowCount === 0) {
      return res
        .status(404)
        .json({ erro: "Pedido não encontrado no banco de dados." });
    }

    res.json({
      sucesso: true,
      mensagem: "Status do pedido updated com sucesso!",
      pedido: resultado.rows[0],
    });
  } catch (erro) {
    console.error("Erro ao atualizar status no banco:", erro);
    res
      .status(500)
      .json({ erro: "Erro ao tentar atualizar o status do pedido." });
  }
});

// ==========================================
// 5. INICIALIZAÇÃO DO SERVIDOR
// ==========================================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor ativo e rodando na porta ${PORT}`);
});
