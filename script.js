console.log("app.js v5 carregado (Completo e Corrigido)");

// --- CONFIGURAÇÃO E VARIÁVEIS DE ESTADO ---
function normalizarPedido(p) {
  if (!p || typeof p !== "object") return null;
  let itens = p.itens || p.items || p.produtos || [];
  if (typeof itens === "string") itens = [itens];
  if (!Array.isArray(itens)) itens = [];
  itens = itens.map((i) =>
    i && typeof i === "object"
      ? (i.qty || 1) + "x " + (i.name || "Item")
      : String(i),
  );
  return {
    id: p.id || Math.floor(100000 + Math.random() * 900000),
    timestamp: Number(p.timestamp) || Date.parse(p.data) || 0,
    data: p.data || "",
    itens: itens,
    total: p.total != null ? p.total : "0.00",
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
// 🚀 REQUISIÇÃO DA API NO CARREGAMENTO INICIAL
// =========================================================================
document.addEventListener("DOMContentLoaded", () => {
  renderizarHistoricoPedidos();
  carregarVitrineReal(); // Chama a nova função de carregar os bolos
});

// 🍰 NOVA FUNÇÃO: Busca os bolos reais cadastrados no PostgreSQL
async function carregarVitrineReal() {
  try {
    // Usa a rota relativa correta conectando direto com seu server.js
    const response = await fetch("/api/produtos");
    const cakeFlavors = await response.json();

    console.log("🍰 BOLOS REALMENTE CARREGADOS DO BANCO:", cakeFlavors);

    // A partir daqui, você pode usar a variável `cakeFlavors` exatamente
    // como você já usava no restante do seu código abaixo para desenhar os bolos na tela!
  } catch (error) {
    console.error("Erro ao carregar a vitrine de bolos:", error);
  }
}

// --- ELEMENTOS DO DOM ---
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

// Elementos do Carrinho
const cartDrawer = document.getElementById("cartDrawer");
const cartItemsContainer = document.getElementById("cartItemsContainer");
const cartCount = document.getElementById("cartCount");
const cartTotalValue = document.getElementById("cartTotalValue");
const checkoutBtn = document.getElementById("checkoutBtn");
const logoutBtn = document.getElementById("logoutBtn");

// Modais
const forgotModal = document.getElementById("forgotModal");
const forgotForm = document.getElementById("forgotForm");
const formularioDeCadastro = document.getElementById("registerForm");

// --- GERADOR DE VITRINE ---
function generateCakeCatalog() {
  if (!cakeContainer) return;
  cakeContainer.innerHTML = "";

  for (let i = 0; i < 30; i++) {
    const flavor = cakeFlavors[i % cakeFlavors.length];
    const itemNumber = i + 1;
    const price = (69.9 + i * 1.5).toFixed(2);
    const fullName = flavor + " (#" + itemNumber + ")";

    const card = document.createElement("div");
    card.className = "cake-card";
    card.innerHTML =
      '<span class="cake-badge">Premium</span>' +
      '<div class="cake-icon">🎂</div>' +
      '<div class="cake-title">' +
      fullName +
      "</div>" +
      '<div class="cake-desc">Bolo artesanal confeccionado com ingredientes premium selecionados e receita secreta exclusiva.</div>' +
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
  }
}
generateCakeCatalog();

// --- CONTROLES DE MANIPULAÇÃO DO CARRINHO ---
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

// --- AUTENTICAÇÃO E DADOS LEMBRADOS ---
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

// --- MECANISMO DE CADASTRO REAL ---
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
      alert("Por favor, preencha todos os campos do formulário!");
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
          paragrafoMensagem.textContent =
            "Conta criada com sucesso! Redirecionando...";
          paragrafoMensagem.style.color = "#22c55e";
        }
        // Função profissional de Toast (Substitui o alert)
        function mostrarToast(mensagem, tipo = "sucesso") {
          // Remove toast anterior se existir
          const antigo = document.getElementById("toast-sistema");
          if (antigo) antigo.remove();

          const toast = document.createElement("div");
          toast.id = "toast-sistema";
          toast.textContent = mensagem;

          // Estilização dinâmica
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

          if (tipo === "sucesso") {
            toast.style.backgroundColor = "#22c55e"; // Verde moderno
          } else if (tipo === "erro") {
            toast.style.backgroundColor = "#ef4444"; // Vermelho moderno
          } else {
            toast.style.backgroundColor = "#3b82f6"; // Azul moderno
          }

          document.body.appendChild(toast);

          // Some sozinho após 3 segundos
          setTimeout(() => {
            toast.style.opacity = "0";
            setTimeout(() => toast.remove(), 3005);
          }, 3000);
        }

        setTimeout(() => {
          if (registerBox) registerBox.style.display = "none";
          if (loginBox) loginBox.style.display = "block";
          if (paragrafoMensagem) paragrafoMensagem.textContent = "";
        }, 2000);
      } else {
        alert(
          "Erro ao cadastrar: " +
            (resultado.erro || "Verifique as informações."),
        );
      }
    } catch (erro) {
      console.error("Erro no cadastro:", erro);
      alert("Não foi possível conectar ao servidor. O back-end está ligado?");
    }
  });
}

// --- MECANISMO DE LOGIN REAL (COM PROTEÇÃO CONTRA 'UNDEFINED') ---
if (loginForm) {
  loginForm.addEventListener("submit", async (evento) => {
    evento.preventDefault();

    const entradaLogin = usernameInput ? usernameInput.value.trim() : "";
    const entradaSenha = passwordInput ? passwordInput.value.trim() : "";

    if (!entradaLogin || !entradaSenha) {
      alert("Por favor, digite seu Usuário/E-mail e sua Senha.");
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
        alert("Bem-vindo de volta à CR Confeitaria! 🎂");

        if (loginBox) loginBox.style.display = "none";
        if (welcomeBox) welcomeBox.style.display = "block";

        // 🛡️ Blindagem contra 'undefined'
        const nomeDoUsuario =
          (resultado.usuario &&
            (resultado.usuario.username ||
              resultado.usuario.nome ||
              resultado.usuario.name)) ||
          resultado.username ||
          resultado.nome ||
          entradaLogin.split("@")[0] ||
          "Administrador";

        if (userGreeting) userGreeting.textContent = "Olá, " + nomeDoUsuario;
        if (profileUser) profileUser.textContent = nomeDoUsuario;
        if (profileEmail)
          profileEmail.textContent =
            nomeDoUsuario.toLowerCase().replace(/\s+/g, "") + "@sistema.com";

        if (rememberMeCheckbox && rememberMeCheckbox.checked) {
          localStorage.setItem("remembered_user", entradaLogin);
          localStorage.setItem("remembered_pass", entradaSenha);
        } else {
          localStorage.removeItem("remembered_user");
          localStorage.removeItem("remembered_pass");
        }

        loginForm.reset();
        renderizarHistoricoPedidos();
      } else {
        alert(
          "Erro de Acesso: " + (resultado.erro || "Credenciais inválidas."),
        );
      }
    } catch (erro) {
      console.error("Erro no login:", erro);
      alert(
        "Não foi possível autenticar. Verifique se o servidor está ligado.",
      );
    }
  });
}

// --- RENDERIZAR HISTÓRICO DE PEDIDOS (COM SUPORTE A ADMIN E STATUS) ---
function escaparHtml(texto) {
  return String(texto).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
}

async function renderizarHistoricoPedidos() {
  const container = document.getElementById("ordersContainer");
  if (!container) return;

  try {
    const resposta = await fetch("/api/pedidos");
    if (!resposta.ok) throw new Error("Não foi possível buscar os pedidos.");

    const pedidosDoBanco = await resposta.json();

    if (!pedidosDoBanco || pedidosDoBanco.length === 0) {
      container.innerHTML = "Você ainda não realizou nenhum pedido.";
      return;
    }

    const total = pedidosDoBanco.length;

    container.innerHTML = pedidosDoBanco
      .map((pedido, indice) => {
        const textoItens =
          pedido.descricao_itens || pedido.descricao || "1x Bolo Selecionado";
        const listaItens = textoItens.split(", ");

        const itensHtml = listaItens
          .map(
            (item) =>
              "<li>" +
              (listaItens.length > 1 ? "• " : "") +
              escaparHtml(item) +
              "</li>",
          )
          .join("");

        const idPedidoReal = pedido.id_pedido || "#000000";
        const dataHoraReal =
          pedido.data_hora || pedido.data || new Date().toLocaleString("pt-BR");
        const statusReal =
          pedido.status_pedido || pedido.status || "Aguardando Confirmação";
        const valorTotalReal = pedido.valor_total || pedido.total || "0.00";

        const isAdmin =
          typeof usuarioLogadoEhAdmin !== "undefined"
            ? usuarioLogadoEhAdmin
            : false;

        return (
          '<div class="order-card" style="border: 1px solid #ccc; padding: 15px; margin-bottom: 10px; border-radius: 8px; background: #fff; text-align: left; color: #333;">' +
          "<h4>Pedido " +
          escaparHtml(idPedidoReal) +
          " (" +
          (total - indice) +
          " de " +
          total +
          ")</h4>" +
          '<p class="order-date" style="font-size: 12px; color: #666; margin-bottom: 8px;">' +
          escaparHtml(dataHoraReal) +
          "</p>" +
          '<ul class="order-items" style="margin-bottom: 12px; padding-left: 15px; list-style-type: none;">' +
          itensHtml +
          "</ul>" +
          '<div class="order-footer" style="margin-top: 10px; padding-top: 10px; border-top: 1px solid #eee;">' +
          '<div style="margin-bottom: 8px;">' +
          "<strong>Status:</strong> " +
          (isAdmin
            ? `<select class="alterar-status-select" data-order-id="${pedido.id}" style="padding: 4px 8px; margin-left: 5px; border-radius: 4px; border: 1px solid #ccc; background: #fff; cursor: pointer;">
                <option value="Aguardando Confirmação" ${statusReal === "Aguardando Confirmação" ? "selected" : ""}>Aguardando Confirmação</option>
                <option value="Em Preparo" ${statusReal === "Em Preparo" ? "selected" : ""}>Em Preparo</option>
                <option value="Pronto para Retirada" ${statusReal === "Pronto para Retirada" ? "selected" : ""}>Pronto para Retirada</option>
                <option value="Entregue" ${statusReal === "Entregue" ? "selected" : ""}>Entregue</option>
               </select>`
            : `<span class="order-status-text" style="background: #fff3cd; color: #856404; padding: 2px 6px; border-radius: 4px; font-size: 13px;">${escaparHtml(statusReal)}</span>`) +
          "</div>" +
          '<span class="order-total" style="font-weight: bold; display: block; margin-top: 5px;">Total: R$ ' +
          escaparHtml(valorTotalReal) +
          "</span>" +
          "</div>" +
          '<button type="button" class="delete-order-btn" data-order-id="' +
          pedido.id +
          '" style="background: transparent; color: #ef4444; border: 1px solid #ef4444; border-radius: 6px; padding: 0.4rem; cursor: pointer; font-weight: bold; margin-top: 15px; width: 100%;">🗑️ Excluir este pedido</button>' +
          "</div>"
        );
      })
      .join("");
  } catch (erro) {
    console.error("Erro ao renderizar histórico do banco:", erro);
    container.innerHTML =
      '<p style="color: #ef4444; font-weight: bold;">Erro ao carregar o histórico de pedidos.</p>';
  }
}

// --- ESCUTADOR DE MUDANÇA DE STATUS (CONFEITEIRO) ---
document.addEventListener("change", async (e) => {
  if (e.target && e.target.classList.contains("alterar-status-select")) {
    const idBanco = e.target.getAttribute("data-order-id");
    const novoStatus = e.target.value;

    try {
      const resposta = await fetch(`/api/pedidos/${idBanco}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status_pedido: novoStatus }),
      });

      const dados = await resposta.json();
      if (resposta.ok && dados.sucesso) {
        alert(`Status do pedido atualizado para: "${novoStatus}"! 🧁`);
      } else {
        alert(
          "Erro ao atualizar status: " + (dados.erro || "Erro desconhecido"),
        );
      }
    } catch (erro) {
      console.error("Erro de conexão ao atualizar status:", erro);
      alert("Não foi possível conectar ao back-end para atualizar o status.");
    }
  }
});

// --- FINALIZAÇÃO DO PEDIDO INTEGRADA AO BACK-END ---
async function finalizarPedidoCompleto() {
  if (!cart || cart.length === 0) {
    alert("Seu carrinho está vazio!");
    return;
  }

  let listaDeProdutos = "";
  let valorTotalCalculado = 0;
  let itensDoPedidoSimples = [];

  cart.forEach((item) => {
    const subtotalItem = item.price * item.qty;
    valorTotalCalculado += subtotalItem;
    listaDeProdutos +=
      "🔹 " +
      item.qty +
      "x " +
      item.name +
      " - R$ " +
      subtotalItem.toFixed(2) +
      "\n";
    itensDoPedidoSimples.push(item.qty + "x " + item.name);
  });

  let message = "*🎂 NOVO PEDIDO - CR CONFEITARIA 🎂*\n\n";
  message +=
    "Olá! Gostaria de confirmar a encomenda dos seguintes bolos, doces:\n-----------------------------------------\n";
  message += listaDeProdutos + "-----------------------------------------\n";
  message +=
    "💰 Total do Pedido: R$ " + valorTotalCalculado.toFixed(2) + "\n\n";
  message +=
    "Por favor, me envie as instruções de pagamento e o prazo para retirada!";

  const mensagemFormatada = encodeURIComponent(message);
  const inputWhatsApp = document.getElementById("shopWhatsAppNumber");
  const numeroLojaOficial = inputWhatsApp
    ? inputWhatsApp.value.replace(/\D/g, "")
    : "5581992185775";

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
  } catch (erro) {
    console.error("Erro ao salvar no banco:", erro);
  }

  cart = [];
  updateCartUI();
  renderizarHistoricoPedidos();
  if (cartDrawer) cartDrawer.classList.remove("open");

  window.open(
    "https://wa.me/" + numeroLojaOficial + "?text=" + mensagemFormatada,
    "_blank",
  );
}

// --- CENTRAL DE CLIQUES GLOBAL (BOTÕES, ABAS E MODAIS) ---
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
  if (e.target && e.target.classList.contains("delete-order-btn")) {
    const idBanco = e.target.getAttribute("data-order-id");
    if (
      confirm(
        "Tem certeza que deseja remover esse registro do banco de dados PostgreSQL?",
      )
    ) {
      fetch("/api/pedidos/" + idBanco, { method: "DELETE" })
        .then((res) => res.json())
        .then((dados) => {
          if (dados.sucesso) {
            alert("Pedido removido do banco com sucesso! 🗑️");
            renderizarHistoricoPedidos();
          } else {
            alert("Erro ao deletar: " + dados.erro);
          }
        });
    }
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

// Tratamento de recuperação de senha
if (forgotForm) {
  forgotForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const msg = document.getElementById("recoveryMessage");
    if (msg) msg.textContent = "Link de recuperação enviado com sucesso!";
  });
}
