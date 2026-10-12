-- 1. Tabela de Usuários (Clientes e Administradores)
CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    telefone VARCHAR(20),
    eh_admin BOOLEAN DEFAULT FALSE, -- Para você gerenciar a confeitaria
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabela de Categorias (ex: Bolos Festivos, Docinhos, Tortas, Cupcakes)
CREATE TABLE IF NOT EXISTS categorias (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(50) NOT NULL UNIQUE
);

-- 3. Tabela de Produtos (Doces e Bolos)
CREATE TABLE IF NOT EXISTS produtos (
    id SERIAL PRIMARY KEY,
    categoria_id INT REFERENCES categorias(id) ON DELETE SET NULL,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    preco DECIMAL(10, 2) NOT NULL,
    imagem_url VARCHAR(255), -- Link da foto do doce
    disponivel BOOLEAN DEFAULT TRUE, -- Para quando um doce acabar no dia
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Tabela de Pedidos (Estrutura avançada)
CREATE TABLE IF NOT EXISTS pedidos (
    id SERIAL PRIMARY KEY,
    usuario_id INT REFERENCES usuarios(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'Pendente', -- Pendente, Preparando, Pronto, Entregue
    total DECIMAL(10, 2) NOT NULL,
    endereco_entrega TEXT,
    data_pedido TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Tabela de Itens do Pedido (Relação de quais doces foram comprados)
CREATE TABLE IF NOT EXISTS itens_pedido (
    id SERIAL PRIMARY KEY,
    pedido_id INT REFERENCES pedidos(id) ON DELETE CASCADE,
    produto_id INT REFERENCES produtos(id) ON DELETE CASCADE,
    quantidade INT NOT NULL CHECK (quantidade > 0),
    preco_unitario DECIMAL(10, 2) NOT NULL
);

-- 6. Tabela do seu Front-end Atual (Para salvar o histórico atual da sua tela)
CREATE TABLE IF NOT EXISTS historico_pedidos (
    id SERIAL PRIMARY KEY,
    id_pedido VARCHAR(50) NOT NULL,
    data_hora VARCHAR(100) NOT NULL,
    descricao_itens TEXT NOT NULL,
    status_pedido VARCHAR(50) DEFAULT 'Aguardando Confirmação',
    valor_total NUMERIC(10, 2) NOT NULL
);

UPDATE usuarios SET eh_admin = true WHERE username = 'luciano allan';
