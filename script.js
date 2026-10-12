console.log("app.js v15.3 - Versão Final Consolidada e Otimizada");

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
  updateCartUI();
  // Carregar tema preferido ao iniciar
  const temaSalvo = localStorage.getItem("cr_theme");
  if (temaSalvo === "light") {
    document.body.classList.add("light-theme");
  }
});

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

    // Caminho exato apontando para assets/img/fotoX.jpg (conforme a sua pasta)
    const numeroFoto = (index % 30) + 1; // Garante que repita ou ajuste para as 30 fotos disponíveis
    const imagemSrc =
      bolo.imagem || bolo.img || `assets/img/foto${numeroFoto}.jpg`;

    // HTML da Imagem Real com fallback de segurança caso alguma foto falhe
    const imagemHTML = `
      <div style="width: 100%; height: 180px; overflow: hidden; border-radius: 8px; background: #0f172a;">
        <img src="${imagemSrc}" alt="${fullName}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.onerror=null; this.src='assets/img/foto1.jpg';">
      </div>
    `;

    const card = document.createElement("div");
    card.className = "cake-card";
    card.style =
      "background: #1e293b; border: 1px solid #334155; padding: 1.5rem; border-radius: 12px; text-align: left; display: flex; flex-direction: column; justify-content: space-between; position: relative; margin-bottom: 15px; color: white;";

    let htmlInterno = "";
    htmlInterno += "<div style='position: relative;'>";
    htmlInterno +=
      "  <span style='position: absolute; top: 10px; left: 10px; background: #e11d48; color: white; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: bold; z-index: 2;'>Premium</span>";
    htmlInterno += "  " + imagemHTML;
    htmlInterno +=
      "  <div class='cake-title' style='margin-top: 15px; font-weight: bold; color: #f8fafc; font-size: 1.2rem;'>" +
      fullName +
      "</div>";
    htmlInterno +=
      "  <div class='cake-desc' style='font-size: 13px; color: #94a3b8; margin: 8px 0; line-height: 1.4;'>" +
      detalheBolo +
      "</div>";
    htmlInterno += "</div>";
    htmlInterno +=
      "<div class='cake-footer' style='display: flex; justify-content: space-between; align-items: center; margin-top: 15px; border-top: 1px solid #334155; padding-top: 15px;'>";
    htmlInterno +=
      "  <span class='cake-price' style='font-weight: bold; color: #f43f5e; font-size: 1.3rem;'>R$ " +
      price +
      "</span>";
    htmlInterno +=
      "  <button class='btn-buy' data-name='" +
      fullName +
      "' data-price='" +
      price +
      "' style='background: #e11d48; color: white; border-radius: 6px; padding: 8px 16px; border: none; cursor: pointer; font-weight: bold;'>Adicionar</button>";
    htmlInterno += "</div>";

    card.innerHTML = htmlInterno;
    cakeContainer.appendChild(card);
  });
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
// 4. GERADOR DE VITRINE DINÂMICO
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
      "background: #1e293b; border: 1px solid #334155; padding: 1.5rem; border-radius: 12px; text-align: left; display: flex; flex-direction: column; justify-content: space-between; position: relative; margin-bottom: 15px; color: white;";

    let htmlInterno = "";
    htmlInterno += "<div style='position: relative;'>";
    htmlInterno +=
      "  <span style='position: absolute; top: 10px; left: 10px; background: #e11d48; color: white; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: bold; z-index: 2;'>Premium</span>";
    htmlInterno += "  " + imagemHTML;
    htmlInterno +=
      "  <div class='cake-title' style='margin-top: 15px; font-weight: bold; color: #f8fafc; font-size: 1.2rem;'>" +
      fullName +
      "</div>";
    htmlInterno +=
      "  <div class='cake-desc' style='font-size: 13px; color: #94a3b8; margin: 8px 0; line-height: 1.4;'>" +
      detalheBolo +
      "</div>";
    htmlInterno += "</div>";
    htmlInterno +=
      "<div class='cake-footer' style='display: flex; justify-content: space-between; align-items: center; margin-top: 15px; border-top: 1px solid #334155; padding-top: 15px;'>";
    htmlInterno +=
      "  <span class='cake-price' style='font-weight: bold; color: #f43f5e; font-size: 1.3rem;'>R$ " +
      price +
      "</span>";
    htmlInterno +=
      "  <button class='btn-buy' data-name='" +
      fullName +
      "' data-price='" +
      price +
      "' style='background: #e11d48; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-weight: bold;'>Adicionar</button>";
    htmlInterno += "</div>";

    card.innerHTML = htmlInterno;
    cakeContainer.appendChild(card);
  });
}

// =========================================================================
// 5. SISTEMA E REGRAS DO CARRINHO DE COMPRAS
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
  if (cartCount) {
    cartCount.textContent = totalItems;
  }
  renderizarCarrinhoVisual();
}

function alterarQuantidadeItem(nomeProduto, acao) {
  const item = cart.find((i) => i.name === nomeProduto);
  if (!item) return;

  if (acao === "aumentar") {
    item.qty++;
  } else if (acao === "diminuir") {
    item.qty--;
    if (item.qty <= 0) {
      cart = cart.filter((i) => i.name !== nomeProduto);
    }
  } else if (acao === "remover") {
    cart = cart.filter((i) => i.name !== nomeProduto);
  }

  updateCartUI();
}

function renderizarCarrinhoVisual() {
  const containerItens = document.getElementById("cartItemsContainer");
  const elementoTotal = document.getElementById("cartTotalValue");

  if (!containerItens) return;

  if (cart.length === 0) {
    containerItens.innerHTML =
      '<p class="empty-cart-text" style="color: #94a3b8; text-align: center; padding: 20px;">Seu carrinho está vazio.</p>';
    if (elementoTotal) elementoTotal.textContent = "R$ 0,00";
    return;
  }

  let htmlCarrinho = "";
  let valorTotalGeral = 0;

  cart.forEach((item) => {
    const subtotal = item.price * item.qty;
    valorTotalGeral += subtotal;

    htmlCarrinho += `
      <div class="cart-item-card" style="display: flex; justify-content: space-between; align-items: center; background: #1e293b; border: 1px solid #334155; padding: 10px; border-radius: 8px; margin-bottom: 10px; color: #f8fafc;">
        <div style="flex: 1; min-width: 0; padding-right: 5px;">
          <div style="font-weight: bold; font-size: 13px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${item.name}">${item.name}</div>
          <div style="font-size: 11px; color: #94a3b8;">R$ ${item.price.toFixed(2)} un</div>
        </div>
        <div style="display: flex; align-items: center; gap: 5px;">
          <button class="btn-cart-minus" data-name="${item.name}" style="background: #334155; color: white; border: none; width: 22px; height: 22px; border-radius: 4px; cursor: pointer; font-weight: bold; font-size: 12px;">-</button>
          <span style="font-weight: bold; font-size: 13px; min-width: 15px; text-align: center;">${item.qty}</span>
          <button class="btn-cart-plus" data-name="${item.name}" style="background: #334155; color: white; border: none; width: 22px; height: 22px; border-radius: 4px; cursor: pointer; font-weight: bold; font-size: 12px;">+</button>
          <button class="btn-cart-remove" data-name="${item.name}" style="background: #ef4444; color: white; border: none; width: 22px; height: 22px; border-radius: 4px; cursor: pointer; font-weight: bold; font-size: 11px;" title="Remover item">🗑️</button>
        </div>
        <div style="font-weight: bold; color: #22c55e; font-size: 12px; margin-left: 8px; white-space: nowrap;">
          R$ ${subtotal.toFixed(2)}
        </div>
      </div>
    `;
  });

  containerItens.innerHTML = htmlCarrinho;
  if (elementoTotal) {
    elementoTotal.textContent = `R$ ${valorTotalGeral.toFixed(2)}`;
  }
}

// =========================================================================
// 6. FINALIZAR COMPRA: MULTI-ITENS E ENVIO PARA O WHATSAPP
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

    await fetch("/api/pedidos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dadosParaOBanco),
    });

    renderizarHistoricoPedidos();

    const numeroLojaOficial = "5581992185775";
    const mensagemFormatada = encodeURIComponent(message);
    window.open(
      "https://wa.me/" + numeroLojaOficial + "?text=" + mensagemFormatada,
      "_blank",
    );

    cart = [];
    updateCartUI();

    // Fecha o gavetão após finalizar
    const drawer = document.getElementById("cartDrawer");
    if (drawer) drawer.classList.remove("open");

    mostrarToast("Pedido concluído com sucesso!", "sucesso");
  } catch (e) {
    console.error(e);
    mostrarToast("Erro ao processar o checkout no servidor.", "erro");
  }
}

// =========================================================================
// 7. EVENTOS DE AUTENTICAÇÃO (LOGIN E CADASTRO REAL)
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
        } else {
          localStorage.removeItem("remembered_user");
          localStorage.removeItem("remembered_pass");
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
// 8. HISTÓRICO DE PEDIDOS E EXCLUSÃO
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
    let htmlPedidos = "";

    pedidosDoBanco.forEach((pedido, indice) => {
      const textoItens = pedido.descricao_itens || "1x Bolo Selecionado";
      const idPedidoAtual = pedido.id_pedido || "#000000";

      htmlPedidos += `
        <div class="order-card" style="border: 1px solid #334155; padding: 15px; margin-bottom: 10px; border-radius: 8px; background: #1e293b; color: #f8fafc; text-align: left; position: relative;">
          <h4 style="margin: 0 0 5px 0; color: #f8fafc;">Pedido ${idPedidoAtual} (${total - indice} de ${total})</h4>
          <p style="font-size: 12px; color: #94a3b8; margin: 0 0 8px 0;">${pedido.data_hora || ""}</p>
          <p style="margin: 0 0 5px 0;"><strong>Itens:</strong> ${textoItens}</p>
          <p style="margin: 0 0 5px 0;"><strong>Status:</strong> <span style="background:#334155; color:#f43f5e; padding:2px 8px; border-radius:4px; font-size:12px;">${pedido.status_pedido || "Aguardando"}</span></p>
          <p style="margin: 5px 0 0 0; font-weight:bold; color:#22c55e;">Total: R$ ${parseFloat(pedido.valor_total || 0).toFixed(2)}</p>
          
          <!-- Botão de Excluir Pedido -->
          <button onclick="excluirPedido('${idPedidoAtual}')" style="position: absolute; top: 15px; right: 15px; background: #ef4444; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; font-size: 12px; font-weight: bold;">Excluir</button>
        </div>
      `;
    });

    container.innerHTML = htmlPedidos;
  } catch (erro) {
    container.innerHTML = "Erro ao carregar o histórico de compras.";
  }
}

async function excluirPedido(idPedido) {
  if (!confirm(`Deseja realmente excluir o pedido ${idPedido}?`)) return;

  try {
    const resposta = await fetch(`/api/pedidos/${idPedido}`, {
      method: "DELETE",
    });

    const resultado = await resposta.json();

    if (resposta.ok && resultado.sucesso !== false) {
      mostrarToast("Pedido excluído com sucesso!", "sucesso");
      renderizarHistoricoPedidos();
    } else {
      mostrarToast(
        resultado.erro || "Não foi possível excluir o pedido.",
        "erro",
      );
    }
  } catch (erro) {
    console.error("Erro ao excluir pedido:", erro);
    mostrarToast("Erro de conexão ao tentar excluir o pedido.", "erro");
  }
}

// =========================================================================
// 9. CENTRAL DE CLIQUES GLOBAL (ESCUTADOR DE BOTÕES)
// =========================================================================
document.addEventListener("click", (e) => {
  // 1. Botão Mais (+) do Carrinho
  const btnPlus = e.target.closest(".btn-cart-plus");
  if (btnPlus) {
    const nome = btnPlus.getAttribute("data-name");
    if (nome) alterarQuantidadeItem(nome, "aumentar");
    return;
  }

  // ☀️ Alternar Tema Claro / Escuro
  const btnTema = e.target.closest("#themeToggleBtn");
  if (btnTema) {
    document.body.classList.toggle("light-theme");
    const novoTema = document.body.classList.contains("light-theme")
      ? "light"
      : "dark";
    localStorage.setItem("cr_theme", novoTema);
    mostrarToast(
      `Tema alterado para ${novoTema === "light" ? "Claro" : "Escuro"}!`,
      "sucesso",
    );
    return;
  }

  // 2. Botão Menos (-) do Carrinho
  const btnMinus = e.target.closest(".btn-cart-minus");
  if (btnMinus) {
    const nome = btnMinus.getAttribute("data-name");
    if (nome) alterarQuantidadeItem(nome, "diminuir");
    return;
  }

  // 3. Botão Remover / Lixeira do Carrinho
  const btnRemove = e.target.closest(".btn-cart-remove");
  if (btnRemove) {
    const nome = btnRemove.getAttribute("data-name");
    if (nome) alterarQuantidadeItem(nome, "remover");
    return;
  }

  // 4. Botão Adicionar da Vitrine
  const btnBuy = e.target.closest(".btn-buy");
  if (btnBuy) {
    const nome = btnBuy.getAttribute("data-name");
    const preco = btnBuy.getAttribute("data-price");
    if (nome && preco) addToCart(nome, preco);
    return;
  }

  // 5. Botão de Finalizar no WhatsApp
  const btnWhatsapp =
    e.target.closest("#checkoutWhatsAppBtn") ||
    (e.target.textContent && e.target.textContent.includes("WhatsApp"));
  if (btnWhatsapp) {
    finalizarPedidoCompleto();
    return;
  }

  // 6. Abrir gaveta do carrinho
  const toggleBtn = e.target.closest("#cartToggleBtn");
  if (toggleBtn) {
    const drawer = document.getElementById("cartDrawer");
    if (drawer) drawer.classList.add("open");
    renderizarCarrinhoVisual();
    return;
  }

  // 7. Fechar gaveta do carrinho
  const closeBtn =
    e.target.closest("#closeCartBtn") || e.target.closest(".close-cart-btn");
  if (closeBtn) {
    const drawer = document.getElementById("cartDrawer");
    if (drawer) drawer.classList.remove("open");
    return;
  }

  // 8. Navegação do Painel (Abas)
  const navBtn = e.target.closest(".nav-btn");
  if (navBtn) {
    const targetPanelId = navBtn.getAttribute("data-target");
    if (!targetPanelId) return;
    document
      .querySelectorAll(".nav-btn")
      .forEach((b) => b.classList.remove("active"));
    document
      .querySelectorAll(".dashboard-panel")
      .forEach((p) => p.classList.remove("active"));
    navBtn.classList.add("active");
    const targetPanel = document.getElementById(targetPanelId);
    if (targetPanel) targetPanel.classList.add("active");
    return;
  }

  // 9. Alternar telas de Registo / Login / Logout
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
    "position:fixed; bottom:20px; right:20px; padding:12px 20px; border-radius:8px; color:#fff; font-weight:bold; z-index:9999; box-shadow:0 4px 12px rgba(0,0,0,0.25); font-size:14px;";
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
