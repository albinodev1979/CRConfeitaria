console.log("app.js v12 Final - Fluxo Completo do Carrinho Restaurado");

// =========================================================================
// 1. VARIÁVEIS DE ESTADO GLOBAL
// =========================================================================
let cart = []; // Array que armazena os bolos adicionados pelo cliente

// =========================================================================
// 2. DISPAROS AO CARREGAR A PÁGINA
// =========================================================================
document.addEventListener("DOMContentLoaded", () => {
  renderizarHistoricoPedidos();
  carregarVitrineReal();
  carregarDadosLembrados();
  configurarOlhinhoSenha();
  updateCartUI(); // Inicializa o contador do carrinho zerado
});

// 🍰 BUSCA REAL DOS BOLOS NO POSTGRESQL (RENDER)
async function carregarVitrineReal() {
  try {
    const response = await fetch("/api/produtos");
    if (!response.ok) throw new Error("Erro na resposta da API");

    const bolosDoBanco = await response.json();
    console.log("🍰 BOLOS CARREGADOS DO BANCO COM SUCESSO:", bolosDoBanco);
    generateCakeCatalog(bolosDoBanco);
  } catch (error) {
    console.error("❌ Erro ao carregar a vitrine de bolos:", error);
  }
}

// =========================================================================
// 3. MAPEAR ELEMENTOS DO DOM (HTML)
// =========================================================================
const loginBox = document.getElementById("loginBox");
const registerBox = document.getElementById("registerBox");
const welcomeBox = document.getElementById("welcomeBox");
const userGreeting = document.getElementById("userGreeting");
const cakeContainer = document.getElementById("cakeContainer");
const profileUser = document.getElementById("profileUser");
const profileEmail = document.getElementById("profileEmail");
const loginForm = document.getElementById("loginForm");
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const rememberMeCheckbox = document.getElementById("rememberMe");

const cartCount = document.getElementById("cartCount");
const formularioDeCadastro = document.getElementById("registerForm");
const forgotModal = document.getElementById("forgotModal");
const forgotForm = document.getElementById("forgotForm");
const logoutBtn = document.getElementById("logoutBtn");

// =========================================================================
// 4. GERADOR DE VITRINE DINÂMICO (COM AJUSTE VISUAL)
// =========================================================================
function generateCakeCatalog(cakeFlavors) {
  if (!cakeContainer) return;
  cakeContainer.innerHTML = "";

  if (!cakeFlavors || cakeFlavors.length === 0) {
    cakeContainer.innerHTML =
      '<p class="empty-cart-text" style="color: #94a3b8; text-align: center; width: 100%;">Nenhum bolo disponível no banco de dados.</p>';
    return;
  }

  cakeFlavors.forEach((bolo, index) => {
    const itemNumber = index + 1;

    const tituloBolo =
      bolo.nome || bolo.name || bolo.title || `Bolo Tradicional #${itemNumber}`;
    const valorBolo = bolo.preco || bolo.price || bolo.value || 0;
    const detalheBolo =
      bolo.descricao ||
      bolo.description ||
      bolo.desc ||
      "Delicioso bolo artesanal feito com receitas exclusivas.";

    const price = parseFloat(valorBolo).toFixed(2);
    const fullName = tituloBolo + " (#" + itemNumber + ")";

    const imagemHTML = `<div class="cake-icon" style="font-size: 3.5rem; text-align: center; padding: 25px 0; background: #1e293b; border-radius: 8px; user-select: none;">🎂</div>`;

    const card = document.createElement("div");
    card.className = "cake-card";
    card.style =
      "background: #1e293b; border: 1px solid #334155; padding: 1.5rem; border-radius: 12px; text-align: left; display: flex; flex-direction: column; justify-content: space-between; position: relative;";
    card.innerHTML = `
      <div style="position: relative;">
        <span class="cake-badge" style="position: absolute; top: 10px; left: 10px; background: #e11d48; color: white; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: bold; z-index: 2;">Premium</span>
        ${imagemHTML}
        <div class="cake-title" style="margin-top: 15px; font-weight: bold; color: #f8fafc; font-size: 1.2rem;">${fullName}</div>
        <div class="cake-desc" style="font-size: 13px; color: #94a3b8; margin: 8px 0; line-height: 1.4;">${detalheBolo}</div>
      </div>
      <div class="cake-footer" style="display: flex; justify-content: space-between; align-items: center; margin-top: 15px; border-top: 1px solid #334155; padding-top: 15px;">
        <span class="cake-price" style="font-weight: bold; color: #f43f5e; font-size: 1.3rem;">R$ ${price}</span>
        <button class="btn-buy" data-name="${fullName}" data-price="${price}" style="background: #e11d48; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-weight: bold; transition: 0.2s;">Adicionar</button>
      </div>
    `;
    cakeContainer.appendChild(card);
  });
}

// =========================================================================
// 5. SISTEMA E REGRAS DO CARRINHO DE COMPRAS (CORRIGIDO)
// =========================================================================
function addToCart(name, price) {
  const existingItem = cart.find((item) => item.name === name);
  if (existingItem) {
    existingItem.qty++;
  } else {
    cart.push({ name: name, price: parseFloat(price), qty: 1 });
  }
  updateCartUI();
  mostrarToast(`"${name}" adicionado ao carrinho! 🛒`, "sucesso");
}

function updateCartUI() {
  let totalItems = 0;
  cart.forEach((item) => {
    totalItems += item.qty;
  });

  // Atualiza o número de itens dentro do botão "🛒 Carrinho (X)" no menu superior
  if (cartCount) {
    cartCount.textContent = totalItems;
  }
}

// =========================================================================
// 6. FINALIZAR COMPRA: MULTI-ITENS E WHATSAPP DA SUA LOJA
// =========================================================================
async function finalizarPedidoCompleto() {
  if (cart.length === 0) {
    mostrarToast("Seu carrinho está vazio!", "erro");
    return;
  }

  let listaDeProdutos = "";
  let valorTotalCalculado = 0;
  let itensDoPedidoSimples = [];

  cart.forEach((item) => {
    const subtotalItem = item.price * item.qty;
    valorTotalCalculado += subtotalItem;
    listaDeProdutos += `🔹 ${item.qty}x ${item.name} - R$ ${subtotalItem.toFixed(2)}\n`;
    itensDoPedidoSimples.push(`${item.qty}x ${item.name}`);
  });

  // Monta a mensagem estruturada para o WhatsApp
  let message = "*🎂 CR CONFEITARIA - NOVO PEDIDO 🎂*\n\n";
  message +=
    "Olá! Gostaria de confirmar a encomenda dos seguintes itens:\n-----------------------------------------\n";
  message += listaDeProdutos;
  message += "-----------------------------------------\n";
  message += `💰 *Total do Pedido: R$ ${valorTotalCalculado.toFixed(2)}*\n\n`;
  message +=
    "Por favor, envie as instruções de pagamento e o prazo para retirada!";

  const dadosParaOBanco = {
    id_pedido: "#" + Math.floor(100000 + Math.random() * 900000),
    data_hora: new Date().toLocaleString("pt-BR"),
    descricao_itens: itensDoPedidoSimples.join(", "),
    status_pedido: "Aguardando Confirmação",
    valor_total: parseFloat(valorTotalCalculado.toFixed(2)),
  };

  try {
    mostrarToast("Salvando pedido no histórico...", "sucesso");

    // Grava o pedido completo na tabela do PostgreSQL
    await fetch("/api/pedidos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dadosParaOBanco),
    });

    renderizarHistoricoPedidos();

    // 🏆 COLOQUE O NÚMERO REAL DA SUA LOJA COM DDD AQUI (Substitua os números abaixo mantendo as aspas)
    // Exemplo: se for de São Paulo: "5511999999999", se for Recife: "5581988888888"
    const numeroLojaOficial = "5581992185775";

    const mensagemFormatada = encodeURIComponent(message);
    window.open(
      `https://wa.me{numeroLojaOficial}?text=${mensagemFormatada}`,
      "_blank",
    );

    // Limpa o carrinho após o sucesso da compra
    cart = [];
    updateCartUI();
    mostrarToast("Pedido concluído com sucesso!", "sucesso");
  } catch (e) {
    console.error(e);
    mostrarToast("Erro ao processar o checkout no servidor.", "erro");
  }
}

// =========================================================================
// 7. EVENTOS DE AUTENTICAÇÃO (LOGIN E CADASTRO REAIS)
// =========================================================================
if (loginForm) {
  loginForm.addEventListener("submit", async (evento) => {
    evento.preventDefault();

    const entradaLogin = usernameInput ? usernameInput.value.trim() : "";
    const entradaSenha = passwordInput ? passwordInput.value.trim() : "";

    if (!entradaLogin || !entradaSenha) {
      mostrarToast("Preencha todos os campos!", "erro");
      return;
    }

    try {
      const resposta = await fetch("/api/usuarios/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          loginIdentificador: entradaLogin,
          senha: entradaSenha,
        }),
      });

      const resultado = await resposta.json();

      if (resposta.ok && resultado.sucesso) {
        mostrarToast("Bem-vindo de volta! 🎂", "sucesso");
        if (loginBox) loginBox.style.display = "none";
        if (welcomeBox) welcomeBox.style.display = "flex";

        const user = resultado.usuario || {};
        const nomeFinal = user.username || user.nome || "Usuário";

        if (userGreeting) userGreeting.textContent = "Olá, " + nomeFinal;
        if (profileUser) profileUser.textContent = nomeFinal;
        if (profileEmail) profileEmail.textContent = user.email || entradaLogin;

        if (rememberMeCheckbox && rememberMeCheckbox.checked) {
          localStorage.setItem("remembered_user", entradaLogin);
          localStorage.setItem("remembered_pass", entradaSenha);
        }
        loginForm.reset();
        renderizarHistoricoPedidos();
        carregarVitrineReal();
      } else {
        mostrarToast(resultado.erro || "Usuário ou senha incorretos.", "erro");
      }
    } catch (erro) {
      console.error(erro);
      mostrarToast("Erro interno ao autenticar.", "erro");
    }
  });
}
if (formularioDeCadastro) {
  formularioDeCadastro.addEventListener("submit", async (evento) => {
    evento.preventDefault();
    const inputUser = document.getElementById("regUsername");
    const inputEmail = document.getElementById("regEmail");
    const inputPass = document.getElementById("regPassword");
    if (!inputUser || !inputEmail || !inputPass) return;
    const dadosDoCadastro = {
      username: inputUser.value.trim(),
      email: inputEmail.value.trim(),
      senha: inputPass.value.trim(),
      telefone: "",
    };
    try {
      const resposta = await fetch("/api/usuarios/cadastro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dadosDoCadastro),
      });
      const resultado = await resposta.json();
      if (resposta.ok && resultado.sucesso) {
        mostrarToast("Conta criada com sucesso!", "sucesso");
        formularioDeCadastro.reset();
        setTimeout(() => {
          if (registerBox) registerBox.style.display = "none";
          if (loginBox) loginBox.style.display = "block";
        }, 1500);
      } else {
        mostrarToast(resultado.erro || "Falha ao cadastrar", "erro");
      }
    } catch (erro) {
      mostrarToast("Erro de conexão com o servidor", "erro");
    }
  });
}
// =========================================================================
// 8. HISTÓRICO DE PEDIDOS (POSTGRESQL REVISADO)
// =========================================================================
async function renderizarHistoricoPedidos() {
  const container = document.getElementById("ordersContainer");
  if (!container) return;
  try {
    const resposta = await fetch("/api/pedidos");
    const pedidosDoBanco = await resposta.json();
    if (!pedidosDoBanco || pedidosDoBanco.length === 0) {
      container.innerHTML = "Você ainda não realizou nenhum pedido.";
      return;
    }
    const total = pedidosDoBanco.length;
    container.innerHTML = pedidosDoBanco
      .map((pedido, indice) => {
        const textoItens = pedido.descricao_itens || "1x Bolo Selecionado";
        return (
          <div
            class="order-card"
            style="border: 1px solid #334155; padding: 15px; margin-bottom: 10px; border-radius: 8px; background: #1e293b; color: #f8fafc; text-align: left;"
          >
            {" "}
            <h4 style="margin: 0 0 5px 0; color: #f8fafc;">
              Pedido ${pedido.id_pedido || "#000000"} (${total - indice} de $
              {total})
            </h4>{" "}
            <p style="font-size: 12px; color: #94a3b8; margin: 0 0 8px 0;">
              ${pedido.data_hora || ""}
            </p>{" "}
            <p style="margin: 0 0 5px 0;">
              <strong>Itens:</strong> ${textoItens}
            </p>{" "}
            <p style="margin: 0 0 5px 0;">
              <strong>Status:</strong>{" "}
              <span style="background:#fff3cd; color:#856404; padding:2px 6px; border-radius:4px; font-size:12px;">
                ${pedido.status_pedido || "Aguardando"}
              </span>
            </p>{" "}
            <p style="margin: 5px 0 0 0; font-weight:bold; color:#f43f5e;">
              Total: R$ ${parseFloat(pedido.valor_total || 0).toFixed(2)}
            </p>{" "}
          </div>
        );
      })
      .join("");
  } catch (erro) {
    container.innerHTML = "Erro ao carregar o histórico de compras.";
  }
}

// =========================================================================
// 9. CENTRAL DE CLIQUES GLOBAL (ESCUTADOR DE BOTÕES)
// =========================================================================
document.addEventListener("click", (e) => {
  // CLIQUE EM ADICIONAR AO CARRINHO (VITRINE)
  if (e.target && e.target.classList.contains("btn-buy")) {
    const nome = e.target.getAttribute("data-name");
    const preco = e.target.getAttribute("data-price");
    addToCart(nome, preco); // Envia o item para o carrinho local, em vez de abrir o zap na hora!
    return;
  }
  // CLIQUE NO BOTÃO DO CARRINHO DO MENU SUPERIOR OU FINALIZAR
  if (e.target && e.target.id === "cartToggleBtn") {
    finalizarPedidoCompleto(); // Dispara o fechamento do carrinho e o envio completo!
    return;
  }
  if (e.target && e.target.classList.contains("nav-btn")) {
    const targetPanelId = e.target.getAttribute("data-target");
    if (!targetPanelId) return;
    document
      .querySelectorAll(".nav-btn")
      .forEach((b) => b.classList.remove("active"));
    document
      .querySelectorAll(".dashboard-panel")
      .forEach((p) => p.classList.remove("active"));
    e.target.classList.add("active");
    const targetPanel = document.getElementById(targetPanelId);
    if (targetPanel) targetPanel.classList.add("active");
    return;
  }
  if (e.target && e.target.id === "openRegister") {
    e.preventDefault();
    if (loginBox) loginBox.style.display = "none";
    if (registerBox) registerBox.style.display = "block";
    return;
  }
  if (e.target && e.target.id === "openLogin") {
    e.preventDefault();
    if (registerBox) registerBox.style.display = "none";
    if (loginBox) loginBox.style.display = "block";
    return;
  }
  if (e.target && e.target.id === "logoutBtn") {
    if (welcomeBox) welcomeBox.style.display = "none";
    if (loginBox) loginBox.style.display = "block";
    return;
  }
});
// =========================================================================
// 10. ROTINAS AUXILIARES (TOASTS, OLHINHO E SESSÃO)
// =========================================================================
function mostrarToast(mensagem, tipo = "sucesso") {
  const antigo = document.getElementById("toast-sistema");
  if (antigo) antigo.remove();
  const toast = document.createElement("div");
  toast.id = "toast-sistema";
  toast.textContent = mensagem;
  toast.style =
    "position:fixed; bottom:20px; right:20px; padding:12px 20px; border-radius:8px; color:#fff; font-weight:bold; z-index:9999; box-shadow:0 4px 12px rgba(0,0,0,0.25);font-size:14px;";
  toast.style.backgroundColor = tipo === "sucesso" ? "#22c55e" : "#ef4444";
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.remove();
  }, 3000);
}
function carregarDadosLembrados() {
  const usuarioSalvo = localStorage.getItem("remembered_user");
  const senhaSalva = localStorage.getItem("remembered_pass");
  if (usuarioSalvo && usernameInput) usernameInput.value = usuarioSalvo;
  if (senhaSalva && passwordInput) {
    passwordInput.value = senhaSalva;
    passwordInput.type = "password";
  }
  if (usuarioSalvo && senhaSalva && rememberMeCheckbox)
    rememberMeCheckbox.checked = true;
}
function configurarOlhinhoSenha() {
  const toggleLoginPassword = document.getElementById("toggleLoginPassword");
  if (toggleLoginPassword && passwordInput) {
    toggleLoginPassword.onclick = () => {
      passwordInput.type =
        passwordInput.type === "password" ? "text" : "password";
    };
  }
}
