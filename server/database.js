const { Pool } = require('pg');

// O Render fornece uma string de conexão completa (URL)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Obrigatório para conexões seguras no Render
  }
});

module.exports = pool;


// Função automática única para criar as tabelas e configurar o admin
const criarTabelasAutomaticas = async () => {
  try {
    // 1️⃣ Cria a tabela de Usuários
    const sqlUsuarios = `
      CREATE TABLE IF NOT EXISTS usuarios (
        id SERIAL PRIMARY KEY,
        username VARCHAR(100) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        senha VARCHAR(255) NOT NULL,
        telefone VARCHAR(20),
        eh_admin BOOLEAN DEFAULT FALSE,
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    await pool.query(sqlUsuarios);
    console.log("✅ Tabela 'usuarios' verificada/criada no Render!");

    const criarTabelaAutomatica = async () => {
      try {
        // Criando a tabela de usuários reais e a tabela de histórico de pedidos
        const sql = `
      CREATE TABLE IF NOT EXISTS usuarios (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        senha VARCHAR(255) NOT NULL,
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS historico_pedidos (
        id SERIAL PRIMARY KEY,
        id_pedido VARCHAR(50) NOT NULL,
        data_hora VARCHAR(100) NOT NULL,
        descricao_itens TEXT NOT NULL,
        status_pedido VARCHAR(50) DEFAULT 'Aguardando Confirmação',
        valor_total NUMERIC(10, 2) NOT NULL
      );
    `;
        await pool.query(sql);
        console.log(
          "✅ Tabelas 'usuarios' e 'historico_pedidos' verificadas no Render!",
        );
      } catch (erro) {
        console.error("❌ Erro ao criar tabelas automaticamente:", erro);
      }
    };

    // 2️⃣ Cria a tabela de Histórico de Pedidos
    const sqlPedidos = `
      CREATE TABLE IF NOT EXISTS historico_pedidos (
        id SERIAL PRIMARY KEY,
        id_pedido VARCHAR(50) NOT NULL,
        data_hora VARCHAR(100) NOT NULL,
        descricao_itens TEXT NOT NULL,
        status_pedido VARCHAR(50) DEFAULT 'Aguardando Confirmação',
        valor_total NUMERIC(10, 2) NOT NULL
      );
    `;
    await pool.query(sqlPedidos);
    console.log("✅ Tabela 'historico_pedidos' verificada/criada no Render!");

    // 🌟 3️⃣ COMANDO AUTOMÁTICO: Transforma seu usuário em Admin no banco real
    // Importante: usei 'luciano allen' com "E" conforme o seu cadastro anterior de sucesso
    await pool.query(
      "UPDATE usuarios SET eh_admin = true WHERE username = 'luciano allen'",
    );
    console.log("👨‍🍳 Permissão de Confeiteiro aplicada para 'luciano allan'!");
  } catch (erro) {
    console.error("❌ Erro ao criar tabelas automaticamente:", erro);
  }
};

// Executa a criação assim que o arquivo é carregado
criarTabelasAutomaticas();

module.exports = pool;
