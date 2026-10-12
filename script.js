console.log("app.js v7 Final - Conectado ao Banco e Totalmente Corrigido");

// =========================================================================
// 1. CONFIGURAÇÃO E VARIÁVEIS DE ESTADO
// =========================================================================
function normalizarPedido(p) {
  if (!p || typeof p !== "object") return null;
  let itens = p.descricao_itens || p.descricao || p.itens || [];
  if (typeof itens === "string") itens = [itens];
  if (!Array.isArray(itens)) itens = [];
  itens = itens.map((i) =>
    i && typeof i === "object"
      ? (i.qty || 1) + "x " + (i.name || "Item")
      : String(i),
  );
  return {
    id: p.id || Math.floor(100000 + Math.random() * 900000),
    timestamp: Number(p.timestamp) || Date.parse(p.data_hora) || 0,
    data: p.data_hora || "",
    itens: itens,
    total: p.valor_total != null ? p.valor_total : "0.00",
  };
}

function carregarHistorico() {
  try {
    const bruto = JSON.parse(localStorage.getItem("order_history"));
    return Array.isArray(bruto)
      ? bruto.map(normalizarPedido).filter(Boolean)
      : [];
  } catch (erro) {
    return [];
  }
}

let orderHistory = carregarHistorico();
let cart = [];

// =========================================================================
// 2. REQUISIÇÃO DA API NO CARREGAMENTO INICIAL
// =========================================================================
document.addEventListener("DOMContentLoaded", () => {
  renderizarHistoricoPedidos();
  carregarVitrineReal();
  carregarDadosLembrados();
});

async function carregarVitrineReal() {
  try {
    const response = await fetch("/api/produtos");
    const bolosDoBanco = await response.json();
    console.log("Core: Bolos carregados", bolosDoBanco);
    generateCakeCatalog(bolosDoBanco);
  } catch (error) {
    console.error("Erro ao carregar a vitrine de bolos:", error);
  }
}

// =========================================================================
// 3. ELEMENTOS DO DOM
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

const cartDrawer = document.getElementById("cartDrawer");
const cartItemsContainer = document.getElementById("cartItemsContainer");
const cartCount = document.getElementById("cartCount");
const cartTotalValue = document.getElementById("cartTotalValue");
const checkoutBtn = document.getElementById("checkoutBtn");
const logoutBtn = document.getElementById("logoutBtn");

const forgotModal = document.getElementById("forgotModal");
const forgotForm = document.getElementById("forgotForm");
const formularioDeCadastro = document.getElementById("registerForm");

// =========================================================================
// 4. GERADOR DE VITRINE DINÂMICO
// =========================================================================
function generateCakeCatalog(cakeFlavors) {
  if (!cakeContainer) return;
  cakeContainer.innerHTML = "";

  if (!cakeFlavors || cakeFlavors.length === 0) {
    cakeContainer.innerHTML =
      '<p class="empty-cart-text">Nenhum bolo disponível no momento.</p>';
    return;
  }

  cakeFlavors.forEach((bolo, index) => {
    const itemNumber = index + 1;
    const price = parseFloat(bolo.preco).toFixed(2);
    const fullName = bolo.nome + " (#" + itemNumber + ")";

    const imagemHTML = bolo.imagem_url
      ? `<img src="${bolo.imagem_url}" alt="${bolo.nome}" class="cake-image-card" style="width: 100%; height: 160px; object-fit: cover; border-radius: 8px;">`
      : `<div class="cake-icon" style="font-size: 3rem; text-align: center; padding: 10px;">🎂</div>`;

    const card = document.createElement("div");
    card.className = "cake-card";
    card.innerHTML =
      '<span class="cake-badge">Premium</span>' +
      imagemHTML +
      '<div class="cake-title" style="margin-top: 10px;">' +
      fullName +
      "</div>" +
      '<div class="cake-desc">' +
      (bolo.descricao ||
        "Bolo artesanal confeccionado com ingredientes premium.") +
      "</div>" +
      '<div class="cake-footer">' +
      '<span class="cake-price">R$ ' +
      price +
      "</span>" +
      '<button class="btn-buy" data-name="' +
      fullName +
      '" data-price="' +
      price +
      '">Adicionar</button>' +
      "</div>";
    cakeContainer.appendChild(card);
  });
}

// =========================================================================
// 5. CONTROLES DE MANIPULAÇÃO DO CARRINHO
// =========================================================================
function addToCart(name, price) {
  const existingItem = cart.find((item) => item.name === name);
  if (existingItem) {
    existingItem.qty++;
  } else {
    cart.push({ name: name, price: price, qty: 1 });
  }
  updateCartUI();
}

function changeQty(name, amount) {
  const item = cart.find((item) => item.name === name);
  if (!item) return;
  item.qty += amount;
  if (item.qty <= 0) {
    removeFromCart(name);
  } else {
    updateCartUI();
  }
}

function removeFromCart(name) {
  cart = cart.filter((item) => item.name !== name);
  updateCartUI();
}

function updateCartUI() {
  if (!cartItemsContainer) return;
  cartItemsContainer.innerHTML = "";
  let totalItems = 0;
  let totalPrice = 0;

  if (cart.length === 0) {
    cartItemsContainer.innerHTML =
      '<p class="empty-cart-text">Seu carrinho está vazio.</p>';
  } else {
    cart.forEach((item) => {
      totalItems += item.qty;
      totalPrice += item.price * item.qty;
      const itemRow = document.createElement("div");
      itemRow.className = "cart-item";
      itemRow.innerHTML =
        '<div class="cart-item-info"><h5>' +
        item.name +
        "</h5><span>R$ " +
        (item.price * item.qty).toFixed(2) +
        "</span></div>" +
        '<div class="cart-item-actions">' +
        '<button class="qty-btn" data-name="' +
        item.name +
        '" data-amount="-1">-</button>' +
        '<span class="cart-item-qty">' +
        item.qty +
        "</span>" +
        '<button class="qty-btn" data-name="' +
        item.name +
        '" data-amount="1">+</button>' +
        '<button class="delete-btn" data-name="' +
        item.name +
        '" style="background: transparent; border: none; color: #ef4444; font-size: 1.1rem; cursor: pointer; margin-left: 5px; width: auto; padding: 0;">🗑️</button>' +
        "</div>";
      cartItemsContainer.appendChild(itemRow);
    });
  }
  if (cartCount) cartCount.textContent = totalItems;
  if (cartTotalValue)
    cartTotalValue.textContent = "R$ " + totalPrice.toFixed(2);
  if (checkoutBtn) checkoutBtn.disabled = cart.length === 0;
}

// =========================================================================
// 6. TOAST E AUTENTICAÇÃO
// =========================================================================
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

if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    if (welcomeBox) welcomeBox.style.display = "none";
    if (loginBox) loginBox.style.display = "block";
  });
}

function mostrarToast(mensagem, tipo = "sucesso") {
  const antigo = document.getElementById("toast-sistema");
  if (antigo) antigo.remove();
  const toast = document.createElement("div");
  toast.id = "toast-sistema";
  toast.textContent = mensagem;
  toast.style.position = "fixed";
  toast.style.bottom = "20px";
  toast.style.right = "20px";
  toast.style.padding = "12px 20px";
  toast.style.borderRadius = "8px";
  toast.style.color = "#fff";
  toast.style.fontWeight = "bold";
  toast.style.fontSize = "14px";
  toast.style.zIndex = "9999";
  toast.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
  toast.style.transition = "opacity 0.3s ease";
  if (tipo === "sucesso") toast.style.backgroundColor = "#22c55e";
  else if (tipo === "erro") toast.style.backgroundColor = "#ef4444";
  else toast.style.backgroundColor = "#3b82f6";
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = "0";
    setTimeout(() => toast.remove(), 305);
  }, 3000);
}

if (formularioDeCadastro) {
  formularioDeCadastro.addEventListener("submit", async (evento) => {
    evento.preventDefault();
    const inputUser = document.getElementById("regUsername");
    const inputEmail = document.getElementById("regEmail");
    const inputPass = document.getElementById("regPassword");
    const paragrafoMensagem = document.getElementById("registerMessage");
    if (!inputUser || !inputEmail || !inputPass) return;

    const dadosDoCadastro = {
      username: inputUser.value.trim(),
      email: inputEmail.value.trim(),
      senha: inputPass.value.trim(),
      telefone: "",
    };

    if (
      !dadosDoCadastro.username ||
      !dadosDoCadastro.email ||
      !dadosDoCadastro.senha
    ) {
      mostrarToast("Por favor, preencha todos os campos!", "erro");
      return;
    }

    try {
      const resposta = await fetch("/api/usuarios/cadastro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dadosDoCadastro),
      });
      const resultado = await resposta.json();
      if (resposta.ok && resultado.sucesso) {
        if (paragrafoMensagem) {
          paragrafoMensagem.textContent = "Conta criada com sucesso!";
          paragrafoMensagem.style.color = "#22c55e";
        }
        mostrarToast("Conta criada com sucesso!", "sucesso");
        setTimeout(() => {
          if (registerBox) registerBox.style.display = "none";
          if (loginBox) loginBox.style.display = "block";
        }, 2000);
      } else {
        mostrarToast("Erro: " + (resultado.erro || "Falha"), "erro");
      }
    } catch (erro) {
      mostrarToast("Erro de conexão", "erro");
    }
  });
}
if (loginForm) {
  loginForm.addEventListener("submit", async (evento) => {
    evento.preventDefault();
    const entradaLogin = usernameInput ? usernameInput.value.trim() : "";
    const entradaSenha = passwordInput ? passwordInput.value.trim() : "";
    if (!entradaLogin || !entradaSenha) {
      mostrarToast("Preencha os campos!", "erro");
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
        if (welcomeBox) welcomeBox.style.display = "block";
        const user = resultado.usuario || {};
        if (userGreeting)
          userGreeting.textContent = "Olá, " + (user.username || "Usuário");
        if (profileUser) profileUser.textContent = user.username || "Usuário";
        if (profileEmail) profileEmail.textContent = user.email || "";
        loginForm.reset();
        renderizarHistoricoPedidos();
      } else {
        mostrarToast("Credenciais inválidas.", "erro");
      }
    } catch (erro) {
      mostrarToast("Erro no servidor.", "erro");
    }
  });
}

// =========================================================================
// 8. HISTÓRICO DE PEDIDOS E INTEGRAÇÃO POSTGRESQL
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
            style="border: 1px solid #ccc; padding: 15px; margin-bottom: 10px; border-radius: 8px; background: #fff;"
          >
            {" "}
            <h4>
              Pedido ${pedido.id_pedido || "#000000"} (${total - indice} de $
              {total})
            </h4>{" "}
            <p>${pedido.data_hora || ""}</p>{" "}
            <p>
              <strong>Itens:</strong> ${textoItens}
            </p>{" "}
            <p>
              <strong>Status:</strong> ${pedido.status_pedido || "Aguardando"}
            </p>{" "}
            <p>
              <strong>Total:</strong> R$ $
              {parseFloat(pedido.valor_total || 0).toFixed(2)}
            </p>{" "}
          </div>
        );
      })
      .join("");
  } catch (erro) {
    container.innerHTML = "Erro ao carregar o histórico.";
  }
}
async function finalizarPedidoCompleto() {
  if (!cart || cart.length === 0) return;
  let itensDoPedidoSimples = [];
  let valorTotalCalculado = 0;
  cart.forEach((item) => {
    valorTotalCalculado += item.price * item.qty;
    itensDoPedidoSimples.push(item.qty + "x " + item.name);
  });
  const dadosParaOBanco = {
    id_pedido: "#" + Math.floor(100000 + Math.random() * 900000),
    data_hora: new Date().toLocaleString("pt-BR"),
    descricao_itens: itensDoPedidoSimples.join(", "),
    status_pedido: "Aguardando Confirmação",
    valor_total: parseFloat(valorTotalCalculado.toFixed(2)),
  };
  try {
    await fetch("/api/pedidos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dadosParaOBanco),
    });
    cart = [];
    updateCartUI();
    renderizarHistoricoPedidos();
    if (cartDrawer) cartDrawer.classList.remove("open");
    mostrarToast("Pedido enviado com sucesso!", "sucesso");
  } catch (e) {
    console.error(e);
  }
}

// =========================================================================
// 9. CENTRAL DE CLIQUES GLOBAL
// =========================================================================
document.addEventListener("click", (e) => {
  if (e.target && e.target.id === "cartToggleBtn") {
    if (cartDrawer) cartDrawer.classList.add("open");
    return;
  }
  if (e.target && e.target.id === "closeCartBtn") {
    if (cartDrawer) cartDrawer.classList.remove("open");
    return;
  }
  if (e.target && e.target.classList.contains("btn-buy")) {
    addToCart(
      e.target.getAttribute("data-name"),
      parseFloat(e.target.getAttribute("data-price")),
    );
    return;
  }
  if (e.target && e.target.classList.contains("qty-btn")) {
    changeQty(
      e.target.getAttribute("data-name"),
      parseInt(e.target.getAttribute("data-amount"), 10),
    );
    return;
  }
  if (e.target && e.target.classList.contains("delete-btn")) {
    removeFromCart(e.target.getAttribute("data-name"));
    return;
  }
  if (e.target && e.target.closest("#checkoutBtn")) {
    e.preventDefault();
    finalizarPedidoCompleto();
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
    if (targetPanelId === "panel-orders") renderizarHistoricoPedidos();
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
  if (e.target && e.target.id === "openForgotModal") {
    e.preventDefault();
    if (forgotModal) forgotModal.style.display = "flex";
    return;
  }
  if (e.target && e.target.id === "closeForgotModal") {
    if (forgotModal) forgotModal.style.display = "none";
    return;
  }
});
if (forgotForm) {
  forgotForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const msg = document.getElementById("recoveryMessage");
    if (msg) {
      msg.textContent =
        "Recuperação desativada localmente. Use uma conta de teste!";
      msg.style.color = "#ef4444";
    }
  });
}
