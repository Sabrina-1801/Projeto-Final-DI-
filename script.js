document.addEventListener("DOMContentLoaded", function () {

    // =========================================================
    // 1. MODO CLARO / ESCURO (FUNCIONA EM TODAS AS PÁGINAS)
    // =========================================================
    const btnTema = document.getElementById("btn-tema");
    if (btnTema) {
        if (localStorage.getItem("tema") === "claro") {
            document.body.classList.add("modo-claro");
            btnTema.textContent = "Modo Escuro";
        } else {
            btnTema.textContent = "Modo Claro";
        }

        btnTema.addEventListener("click", function () {
            document.body.classList.toggle("modo-claro");
            const ehClaro = document.body.classList.contains("modo-claro");
            btnTema.textContent = ehClaro ? "Modo Escuro" : "Modo Claro";
            localStorage.setItem("tema", ehClaro ? "claro" : "escuro");
        });
    }

    // =========================================================
    // 2. LUPA DE PESQUISA EXPANSÍVEL
    // =========================================================
    const btnLupa = document.getElementById("btn-abrir-pesquisa");
    const boxPesquisa = document.getElementById("box-pesquisa-nav");
    const campoPesquisa = document.getElementById("campo-pesquisa");

    function filtrarCards(termo) {
        const texto = termo.toLowerCase().trim();
        document.querySelectorAll(".card-sabor").forEach(card => {
            const tituloEl = card.querySelector("h3");
            if (!tituloEl) return;
            const coluna = card.closest("[class*='col-']");
            if (coluna) {
                coluna.style.display = tituloEl.textContent.toLowerCase().includes(texto) ? "" : "none";
            }
        });
    }

    if (btnLupa && boxPesquisa && campoPesquisa) {
        btnLupa.addEventListener("click", function () {
            if (boxPesquisa.style.display === "none" || boxPesquisa.style.display === "") {
                boxPesquisa.style.display = "block";
                campoPesquisa.focus();
            } else {
                boxPesquisa.style.display = "none";
                campoPesquisa.value = "";
                filtrarCards("");
            }
        });

        campoPesquisa.addEventListener("input", function () {
            filtrarCards(campoPesquisa.value);
        });

        campoPesquisa.addEventListener("keydown", function (e) {
            if (e.key === "Enter") {
                e.preventDefault();
                const termo = campoPesquisa.value.trim();
                if (!window.location.pathname.toLowerCase().includes("pedidos.html") && termo !== "") {
                    window.location.href = `Pedidos.html?busca=${encodeURIComponent(termo)}`;
                }
            }
        });

        const params = new URLSearchParams(window.location.search);
        const buscaUrl = params.get("busca");
        if (buscaUrl) {
            boxPesquisa.style.display = "block";
            campoPesquisa.value = buscaUrl;
            filtrarCards(buscaUrl);
        }
    }

    // =========================================================
    // 3. SACOLA COMPARTILHADA + CAIXA DE PRESENTES + BARRAS
    // =========================================================
    let limiteTrufas = 6;
    const botoesTamanho = document.querySelectorAll(".btn-tamanho");
    const limiteAtualEl = document.getElementById("limite-atual");
    const qtdAtualEl = document.getElementById("qtd-atual");
    const valorTotalEl = document.getElementById("valor-total");
    const btnFinalizarCaixa = document.getElementById("btn-finalizar");
    const contadorSacolaEl = document.getElementById("contador-sacola");
    const listaSacolaEl = document.getElementById("lista-sacola");
    const btnConcluirPedido = document.getElementById("btn-concluir-pedido");

    let sacola = [];
    try {
        sacola = JSON.parse(localStorage.getItem("sacolaLatte")) || [];
    } catch (e) {
        sacola = [];
    }

    const cardsTrufas = Array.from(document.querySelectorAll(".card-sabor")).filter(
        c => !c.classList.contains("card-barra") && !c.classList.contains("card-promo-item") && c.dataset.preco
    );

    function obterSelecaoAtual() {
        const itens = [];
        let totalQtd = 0;
        let totalPreco = 0;

        cardsTrufas.forEach(card => {
            const qtdEl = card.querySelector(".qtd-item");
            if (!qtdEl) return;
            const qtd = parseInt(qtdEl.textContent, 10) || 0;
            const preco = parseFloat(card.dataset.preco) || 0;
            if (qtd > 0) {
                itens.push({ nome: card.dataset.nome, qtd: qtd, subtotal: qtd * preco });
                totalQtd += qtd;
                totalPreco += qtd * preco;
            }
        });

        document.querySelectorAll(".card-barra").forEach(card => {
            const qtdEl = card.querySelector(".qtd-barra");
            if (!qtdEl) return;
            const qtd = parseInt(qtdEl.textContent, 10) || 0;
            const preco = parseFloat(card.dataset.preco) || 0;
            if (qtd > 0) {
                itens.push({ nome: card.dataset.nome, qtd: qtd, subtotal: qtd * preco });
                totalQtd += qtd;
                totalPreco += qtd * preco;
            }
        });

        return { itens, totalQtd, totalPreco };
    }

    botoesTamanho.forEach(btn => {
        btn.addEventListener("click", function () {
            botoesTamanho.forEach(b => b.classList.remove("ativo"));
            this.classList.add("ativo");
            limiteTrufas = parseInt(this.dataset.limite, 10) || 6;
            if (limiteAtualEl) limiteAtualEl.textContent = limiteTrufas;
            atualizarCaixaTrufas();
        });
    });

    function atualizarCaixaTrufas() {
        let totalTrufas = 0;
        let precoTrufas = 0;

        cardsTrufas.forEach(card => {
            const qtdEl = card.querySelector(".qtd-item");
            if (!qtdEl) return;
            const qtd = parseInt(qtdEl.textContent, 10) || 0;
            const preco = parseFloat(card.dataset.preco) || 0;
            totalTrufas += qtd;
            precoTrufas += qtd * preco;
        });

        if (qtdAtualEl) qtdAtualEl.textContent = totalTrufas;
        if (valorTotalEl) {
            valorTotalEl.textContent = precoTrufas.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
        }

        if (btnFinalizarCaixa) {
            if (totalTrufas === limiteTrufas) {
                btnFinalizarCaixa.disabled = false;
                btnFinalizarCaixa.textContent = `Adicionar Caixa (${limiteTrufas} trufas) à Sacola`;
            } else {
                btnFinalizarCaixa.disabled = true;
                const faltam = Math.max(0, limiteTrufas - totalTrufas);
                btnFinalizarCaixa.textContent = totalTrufas > limiteTrufas
                    ? `Remova ${totalTrufas - limiteTrufas} bombom(ns)`
                    : `Escolha mais ${faltam} bombom(ns) para fechar a caixa`;
            }
        }

        atualizarContadorTopo();
    }

    function atualizarContadorTopo() {
        if (!contadorSacolaEl) return;
        const { totalQtd } = obterSelecaoAtual();
        contadorSacolaEl.textContent = sacola.length + totalQtd;
    }

    function renderizarSacola() {
        if (!listaSacolaEl) return;
        const { itens: itensAtuais, totalPreco: precoAtual } = obterSelecaoAtual();

        if (sacola.length === 0 && itensAtuais.length === 0) {
            listaSacolaEl.innerHTML = "<p>Sua sacola está vazia. Escolha seus chocolates para começar!</p>";
            return;
        }

        let html = "";
        let totalGeral = 0;

        if (sacola.length > 0) {
            html += `<h5 style="color: #DFB88B; text-transform: uppercase; font-size: 12px;">Itens Confirmados na Sacola</h5>`;
            html += `<ul class="list-unstyled">`;
            sacola.forEach((item, index) => {
                totalGeral += item.preco;
                html += `
                    <li style="padding: 10px 0; border-bottom: 1px solid var(--borda-sutil); display: flex; justify-content: space-between; align-items: center; gap: 10px;">
                        <div>
                            <strong>${item.titulo}</strong><br>
                            <small style="color: var(--texto-suave);">${item.detalhes}</small>
                        </div>
                        <div style="text-align: right;">
                            <strong>${item.preco.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</strong><br>
                            <button type="button" class="btn btn-xs btn-sacola remover-item-sacola" data-index="${index}" style="margin-top: 4px;">Remover</button>
                        </div>
                    </li>`;
            });
            html += `</ul>`;
        }

        if (itensAtuais.length > 0) {
            totalGeral += precoAtual;
            html += `<h5 style="color: #DFB88B; text-transform: uppercase; font-size: 12px; margin-top: 12px;">Selecionados nesta página</h5>`;
            html += `<ul class="list-unstyled">`;
            itensAtuais.forEach(it => {
                html += `
                    <li style="padding: 6px 0; border-bottom: 1px dashed var(--borda-sutil); display: flex; justify-content: space-between;">
                        <span>${it.qtd}x ${it.nome}</span>
                        <span>${it.subtotal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
                    </li>`;
            });
            html += `</ul>`;
        }

        html += `<p class="text-right" style="margin-top: 16px; font-size: 18px;">Total: <strong>${totalGeral.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</strong></p>`;
        listaSacolaEl.innerHTML = html;

        document.querySelectorAll(".remover-item-sacola").forEach(btn => {
            btn.addEventListener("click", function () {
                const idx = parseInt(this.dataset.index, 10);
                sacola.splice(idx, 1);
                localStorage.setItem("sacolaLatte", JSON.stringify(sacola));
                atualizarContadorTopo();
                renderizarSacola();
            });
        });
    }

    cardsTrufas.forEach(card => {
        const btnMais = card.querySelector(".mais");
        const btnMenos = card.querySelector(".menos");
        const spanQtd = card.querySelector(".qtd-item");

        if (btnMais && spanQtd) {
            btnMais.addEventListener("click", () => {
                const totalTrufas = parseInt(qtdAtualEl ? qtdAtualEl.textContent : "0", 10) || 0;
                if (totalTrufas < limiteTrufas) {
                    spanQtd.textContent = (parseInt(spanQtd.textContent, 10) || 0) + 1;
                    atualizarCaixaTrufas();
                }
            });
        }
        if (btnMenos && spanQtd) {
            btnMenos.addEventListener("click", () => {
                const atual = parseInt(spanQtd.textContent, 10) || 0;
                if (atual > 0) {
                    spanQtd.textContent = atual - 1;
                    atualizarCaixaTrufas();
                }
            });
        }
    });

    document.querySelectorAll(".card-barra").forEach(card => {
        const btnMais = card.querySelector(".mais-barra");
        const btnMenos = card.querySelector(".menos-barra");
        const spanQtd = card.querySelector(".qtd-barra");

        if (btnMais && spanQtd) {
            btnMais.addEventListener("click", () => {
                spanQtd.textContent = (parseInt(spanQtd.textContent, 10) || 0) + 1;
                atualizarContadorTopo();
            });
        }
        if (btnMenos && spanQtd) {
            btnMenos.addEventListener("click", () => {
                const atual = parseInt(spanQtd.textContent, 10) || 0;
                if (atual > 0) {
                    spanQtd.textContent = atual - 1;
                    atualizarContadorTopo();
                }
            });
        }
    });

    if (window.jQuery) {
        window.jQuery("#modal-sacola").on("show.bs.modal", function () {
            renderizarSacola();
        });
    }

    if (btnFinalizarCaixa) {
        btnFinalizarCaixa.addEventListener("click", () => {
            const sabores = [];
            let precoCaixa = 0;

            cardsTrufas.forEach(card => {
                const qtd = parseInt(card.querySelector(".qtd-item").textContent, 10) || 0;
                if (qtd > 0) {
                    sabores.push(`${qtd}x ${card.dataset.nome}`);
                    precoCaixa += qtd * (parseFloat(card.dataset.preco) || 0);
                    card.querySelector(".qtd-item").textContent = "0";
                }
            });

            sacola.push({
                titulo: `Caixa de Presente (${limiteTrufas} Trufas)`,
                detalhes: sabores.join(", "),
                preco: precoCaixa
            });

            localStorage.setItem("sacolaLatte", JSON.stringify(sacola));
            atualizarCaixaTrufas();
            renderizarSacola();

            if (window.jQuery) {
                window.jQuery("#modal-sacola").modal("show");
            }
        });
    }

    if (btnConcluirPedido) {
        btnConcluirPedido.addEventListener("click", () => {
            const { itens } = obterSelecaoAtual();
            if (sacola.length === 0 && itens.length === 0) {
                alert("Sua sacola está vazia!");
                return;
            }
            window.location.href = "Pedidos.html";
        });
    }

    // =========================================================
    // 4. PROMOÇÃO CHOCOLATRAS (2 BARRAS CLÁSSICAS POR R$ 25,00)
    // =========================================================
    const cardsPromo = document.querySelectorAll(".card-promo-item");
    const qtdPromoEl = document.getElementById("qtd-promo");
    const btnPromo = document.getElementById("btn-finalizar-promo");

    function atualizarPromo() {
        if (!cardsPromo.length || !qtdPromoEl || !btnPromo) return;
        let total = 0;
        cardsPromo.forEach(card => {
            total += parseInt(card.querySelector(".qtd-item-promo").textContent, 10) || 0;
        });

        qtdPromoEl.textContent = total;
        if (total === 2) {
            btnPromo.disabled = false;
            btnPromo.textContent = "Adicionar Combo Promoção à Sacola — R$ 25,00";
        } else {
            btnPromo.disabled = true;
            btnPromo.textContent = `Escolha mais ${2 - total} barra(s) clássica(s) para fechar o combo`;
        }
    }

    cardsPromo.forEach(card => {
        const btnMais = card.querySelector(".mais-promo");
        const btnMenos = card.querySelector(".menos-promo");
        const spanQtd = card.querySelector(".qtd-item-promo");

        if (btnMais && spanQtd) {
            btnMais.addEventListener("click", () => {
                const totalAtual = parseInt(qtdPromoEl.textContent, 10) || 0;
                if (totalAtual < 2) {
                    spanQtd.textContent = (parseInt(spanQtd.textContent, 10) || 0) + 1;
                    atualizarPromo();
                }
            });
        }
        if (btnMenos && spanQtd) {
            btnMenos.addEventListener("click", () => {
                const atual = parseInt(spanQtd.textContent, 10) || 0;
                if (atual > 0) {
                    spanQtd.textContent = atual - 1;
                    atualizarPromo();
                }
            });
        }
    });

    if (btnPromo) {
        btnPromo.addEventListener("click", () => {
            const escolhidas = [];
            cardsPromo.forEach(card => {
                const qtd = parseInt(card.querySelector(".qtd-item-promo").textContent, 10) || 0;
                if (qtd > 0) {
                    escolhidas.push(`${qtd}x ${card.dataset.nome.replace(" (Promo)", "")}`);
                    card.querySelector(".qtd-item-promo").textContent = "0";
                }
            });

            sacola.push({
                titulo: "Combo Promoção Chocolatras (2 Barras)",
                detalhes: escolhidas.join(" e "),
                preco: 25.00
            });

            localStorage.setItem("sacolaLatte", JSON.stringify(sacola));
            atualizarPromo();
            atualizarContadorTopo();
            renderizarSacola();

            if (window.jQuery) {
                window.jQuery("#modal-sacola").modal("show");
            }
        });
    }

    // =========================================================
    // 5. FORMULÁRIO DE ENTREGA (PEDIDOS.HTML)
    // =========================================================
    const formPedido = document.getElementById("form-pedido");
    if (formPedido) {
        formPedido.addEventListener("submit", function (e) {
            e.preventDefault();
            const nome = document.getElementById("nome-cliente").value.trim();
            alert(`Obrigado, ${nome}! Seu pedido na Latte & Chocolatte foi confirmado.`);
            localStorage.removeItem("sacolaLatte");
            sacola = [];
            atualizarContadorTopo();
            formPedido.reset();
            if (window.jQuery) {
                window.jQuery("#modal-entrega").modal("hide");
            }
        });
    }

    atualizarContadorTopo();
});

// =========================================================
    // 6.1 ACESSIBILIDADE: AUMENTAR E DIMINUIR TAMANHO DO TEXTO
    // =========================================================
    const btnAumentar = document.getElementById("btn-aumentar-fonte");
    const btnDiminuir = document.getElementById("btn-diminuir-fonte");
    let escalaFonte = parseFloat(localStorage.getItem("escalaFonteLatte")) || 1;

    function aplicarEscalaFonte() {
        document.body.style.zoom = escalaFonte;
        localStorage.setItem("escalaFonteLatte", escalaFonte);
    }

    aplicarEscalaFonte();

    if (btnAumentar) {
        btnAumentar.addEventListener("click", function () {
            if (escalaFonte < 1.3) {
                escalaFonte = Math.round((escalaFonte + 0.1) * 10) / 10;
                aplicarEscalaFonte();
            }
        });
    }

    if (btnDiminuir) {
        btnDiminuir.addEventListener("click", function () {
            if (escalaFonte > 0.8) {
                escalaFonte = Math.round((escalaFonte - 0.1) * 10) / 10;
                aplicarEscalaFonte();
            }
        });
    }

    // =========================================================
    // 6.2 SISTEMA DE CRIAR CONTA E ENTRAR (LOGIN)
    // =========================================================
    const btnAbrirConta = document.getElementById("btn-abrir-conta");
    const formLogin = document.getElementById("form-login");
    const formCadastro = document.getElementById("form-cadastro");
    const painelLogado = document.getElementById("painel-usuario-logado");
    const nomeUsuarioEl = document.getElementById("nome-usuario-logado");
    const btnSairConta = document.getElementById("btn-sair-conta");

    function atualizarEstadoConta() {
        const usuarioAtual = JSON.parse(localStorage.getItem("usuarioLogadoLatte"));
        const abasNav = document.querySelector("#modal-conta .nav-tabs");
        const abasConteudo = document.querySelector("#modal-conta .tab-content");

        if (usuarioAtual && usuarioAtual.nome) {
            const primeiroNome = usuarioAtual.nome.split(" ")[0];
            if (btnAbrirConta) btnAbrirConta.textContent = `Olá, ${primeiroNome}`;
            if (nomeUsuarioEl) nomeUsuarioEl.textContent = usuarioAtual.nome;
            if (painelLogado) painelLogado.style.display = "block";
            if (abasNav) abasNav.style.display = "none";
            if (abasConteudo) abasConteudo.style.display = "none";

            // Preenche automaticamente o nome no formulário de entrega (Pedidos.html)
            const campoNomeEntrega = document.getElementById("nome-cliente");
            if (campoNomeEntrega && !campoNomeEntrega.value) {
                campoNomeEntrega.value = usuarioAtual.nome;
            }
        } else {
            if (btnAbrirConta) btnAbrirConta.textContent = "Entrar";
            if (painelLogado) painelLogado.style.display = "none";
            if (abasNav) abasNav.style.display = "flex";
            if (abasConteudo) abasConteudo.style.display = "block";
        }
    }

    if (formCadastro) {
        formCadastro.addEventListener("submit", function (e) {
            e.preventDefault();
            const nome = document.getElementById("cad-nome").value.trim();
            const email = document.getElementById("cad-email").value.trim().toLowerCase();
            const senha = document.getElementById("cad-senha").value;

            const contas = JSON.parse(localStorage.getItem("contasLatte")) || [];
            if (contas.some(c => c.email === email)) {
                alert("Este e-mail já está cadastrado. Faça login na aba Entrar.");
                return;
            }

            const novoUsuario = { nome, email, senha };
            contas.push(novoUsuario);
            localStorage.setItem("contasLatte", JSON.stringify(contas));
            localStorage.setItem("usuarioLogadoLatte", JSON.stringify(novoUsuario));

            formCadastro.reset();
            atualizarEstadoConta();
            alert(`Conta criada com sucesso! Bem-vindo(a), ${nome}!`);
            if (window.jQuery) window.jQuery("#modal-conta").modal("hide");
        });
    }

    if (formLogin) {
        formLogin.addEventListener("submit", function (e) {
            e.preventDefault();
            const email = document.getElementById("login-email").value.trim().toLowerCase();
            const senha = document.getElementById("login-senha").value;

            const contas = JSON.parse(localStorage.getItem("contasLatte")) || [];
            const encontrado = contas.find(c => c.email === email && c.senha === senha);

            if (!encontrado) {
                alert("E-mail ou senha incorretos. Se ainda não tem cadastro, clique na aba 'Criar Conta'.");
                return;
            }

            localStorage.setItem("usuarioLogadoLatte", JSON.stringify(encontrado));
            formLogin.reset();
            atualizarEstadoConta();
            alert(`Bem-vindo(a) de volta, ${encontrado.nome}!`);
            if (window.jQuery) window.jQuery("#modal-conta").modal("hide");
        });
    }

    if (btnSairConta) {
        btnSairConta.addEventListener("click", function () {
            localStorage.removeItem("usuarioLogadoLatte");
            atualizarEstadoConta();
            alert("Você saiu da sua conta.");
        });
    }

    atualizarEstadoConta();