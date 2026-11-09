

let tabuleiro = ["", "", "", "", "", "", "", "", ""];

let jogador = "X";
let ia = "O";

let simboloEscolhido = "X";

let dificuldade = "medio";

let jogoAtivo = false;
let pensando = false;

let pontosJogador = 0;
let pontosIA = 0;
let pontosEmpate = 0;


/* ELEMENTOS HTML */

const menu = document.getElementById("menu");
const jogo = document.getElementById("jogo");

const mensagem = document.getElementById("mensagem");

const celulas = document.querySelectorAll(".celula");

const placarJogador = document.getElementById("pontosJogador");
const placarIA = document.getElementById("pontosIA");
const placarEmpate = document.getElementById("pontosEmpate");


/* COMBINAÇÕES VENCEDORAS */

const combinacoes = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],

    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],

    [0, 4, 8],
    [2, 4, 6]
];



/* ESCOLHER SÍMBOLO */

function selecionarSimbolo(simbolo) {

    simboloEscolhido = simbolo;

    document.getElementById("btnX")
        .classList.remove("selecionado");

    document.getElementById("btnO")
        .classList.remove("selecionado");

    if (simbolo === "X") {

        document.getElementById("btnX")
            .classList.add("selecionado");

    } else {

        document.getElementById("btnO")
            .classList.add("selecionado");

    }

}


/* INICIAR JOGO */


/* INICIAR JOGO */

function iniciarJogo(nivel) {

    dificuldade = nivel;

    // Definir símbolo do jogador
    jogador = simboloEscolhido;

    // Definir símbolo da IA
    ia = jogador === "X" ? "O" : "X";

    // Reiniciar placar
    pontosJogador = 0;
    pontosIA = 0;
    pontosEmpate = 0;

    atualizarPlacar();

    // Trocar de tela
    menu.classList.add("escondido");
    jogo.classList.remove("escondido");

    // Iniciar partida
    reiniciarPartida();

}


/* REINICIAR PARTIDA */


/* REINICIAR PARTIDA */

function reiniciarPartida() {

    tabuleiro = ["", "", "", "", "", "", "", "", ""];

    jogoAtivo = true;
    pensando = false;

    mensagem.textContent = "Sua vez! Você é " + jogador + ".";

    celulas.forEach(function (celula) {

        celula.textContent = "";

        celula.classList.remove("x", "o");

        celula.disabled = false;

    });

    // Se o jogador escolheu O,
    // a IA começa com X.
    if (jogador === "O") {

        pensando = true;

        mensagem.textContent = "A IA começa!";

        celulas.forEach(function (celula) {

            celula.disabled = true;

        });

        setTimeout(function () {

            jogadaIA();

        }, 600);

    }

}



/* CLIQUE DO JOGADOR */

celulas.forEach(function (celula) {

    celula.addEventListener("click", function () {

        const indice = Number(celula.dataset.index);

        // Verificar se a jogada é válida
        if (!jogoAtivo || pensando || tabuleiro[indice] !== "") {
            return;
        }

        // Jogada do jogador
        fazerJogada(indice, jogador);

        // Verificar vitória do jogador
        if (verificarVencedor(tabuleiro, jogador)) {

            finalizarJogo("jogador");

            return;

        }

        // Verificar empate
        if (verificarEmpate()) {

            finalizarJogo("empate");

            return;

        }

        // Iniciar jogada da IA
        pensando = true;

        mensagem.textContent = "A IA está pensando...";

        celulas.forEach(function (c) {
            c.disabled = true;
        });

        setTimeout(function () {

            jogadaIA();

        }, 600);

    });

});


/* FAZER JOGADA */

function fazerJogada(indice, simbolo) {

    tabuleiro[indice] = simbolo;

    celulas[indice].textContent = simbolo;

    celulas[indice].classList.add(
        simbolo === "X" ? "x" : "o"
    );

}


/* JOGADA DA IA */

function jogadaIA() {

    if (!jogoAtivo) {
        return;
    }

    let indice;

    if (dificuldade === "medio") {

        indice = jogadaMedia();

    } else {

        indice = melhorJogada();

    }

    fazerJogada(indice, ia);

    pensando = false;

    // Verificar vitória da IA
    if (verificarVencedor(tabuleiro, ia)) {

        finalizarJogo("ia");

        return;

    }

    // Verificar empate
    if (verificarEmpate()) {

        finalizarJogo("empate");

        return;

    }

   mensagem.textContent = "Sua vez! Você é " + jogador + ".";

    celulas.forEach(function (celula, indice) {

        celula.disabled = tabuleiro[indice] !== "";

    });

}


/* DIFICULDADE MÉDIA */

function jogadaMedia() {

    const disponiveis = obterJogadas(tabuleiro);

    // A IA pode cometer erros de propósito
    if (Math.random() < 0.30) {

        return disponiveis[
            Math.floor(Math.random() * disponiveis.length)
        ];

    }

    // Tentar vencer
    for (let indice of disponiveis) {

        let copia = [...tabuleiro];

        copia[indice] = ia;

        if (verificarVencedor(copia, ia)) {
            return indice;
        }

    }

    // Bloquear vitória do jogador
    for (let indice of disponiveis) {

        let copia = [...tabuleiro];

        copia[indice] = jogador;

        if (verificarVencedor(copia, jogador)) {
            return indice;
        }

    }

    // Preferir centro
    if (tabuleiro[4] === "") {
        return 4;
    }

    // Preferir cantos
    const cantos = [0, 2, 6, 8].filter(
        indice => tabuleiro[indice] === ""
    );

    if (cantos.length > 0) {

        return cantos[
            Math.floor(Math.random() * cantos.length)
        ];

    }

    // Jogada aleatória
    return disponiveis[
        Math.floor(Math.random() * disponiveis.length)
    ];

}


/* DIFICULDADE DIFÍCIL - MINIMAX */

function melhorJogada() {

    let melhorPontuacao = -Infinity;

    let melhorIndice = -1;

    const disponiveis = obterJogadas(tabuleiro);

    for (let indice of disponiveis) {

        let copia = [...tabuleiro];

        copia[indice] = ia;

        let pontuacao = minimax(copia, false, 0);

        if (pontuacao > melhorPontuacao) {

            melhorPontuacao = pontuacao;

            melhorIndice = indice;

        }

    }

    return melhorIndice;

}


/* ALGORITMO MINIMAX */

function minimax(tabuleiroAtual, vezIA, profundidade) {

    // IA venceu
    if (verificarVencedor(tabuleiroAtual, ia)) {

        return 10 - profundidade;

    }

    // Jogador venceu
    if (verificarVencedor(tabuleiroAtual, jogador)) {

        return profundidade - 10;

    }

    // Empate
    if (verificarEmpateTabuleiro(tabuleiroAtual)) {

        return 0;

    }

    const disponiveis = obterJogadas(tabuleiroAtual);

    // Maximizar pontuação da IA
    if (vezIA) {

        let melhorPontuacao = -Infinity;

        for (let indice of disponiveis) {

            let copia = [...tabuleiroAtual];

            copia[indice] = ia;

            let pontuacao = minimax(
                copia,
                false,
                profundidade + 1
            );

            melhorPontuacao = Math.max(
                melhorPontuacao,
                pontuacao
            );

        }

        return melhorPontuacao;

    }

    // Minimizar pontuação do jogador
    else {

        let melhorPontuacao = Infinity;

        for (let indice of disponiveis) {

            let copia = [...tabuleiroAtual];

            copia[indice] = jogador;

            let pontuacao = minimax(
                copia,
                true,
                profundidade + 1
            );

            melhorPontuacao = Math.min(
                melhorPontuacao,
                pontuacao
            );

        }

        return melhorPontuacao;

    }

}


/* OBTER JOGADAS DISPONÍVEIS */

function obterJogadas(tabuleiroAtual) {

    let disponiveis = [];

    for (let i = 0; i < tabuleiroAtual.length; i++) {

        if (tabuleiroAtual[i] === "") {

            disponiveis.push(i);

        }

    }

    return disponiveis;

}


/* VERIFICAR VENCEDOR */

function verificarVencedor(tabuleiroAtual, simbolo) {

    return combinacoes.some(function (combinacao) {

        return combinacao.every(function (indice) {

            return tabuleiroAtual[indice] === simbolo;

        });

    });

}


/* VERIFICAR EMPATE */

function verificarEmpate() {

    return verificarEmpateTabuleiro(tabuleiro);

}

function verificarEmpateTabuleiro(tabuleiroAtual) {

    return tabuleiroAtual.every(function (celula) {

        return celula !== "";

    });

}


/* FINALIZAR JOGO */

function finalizarJogo(resultado) {

    jogoAtivo = false;
    pensando = false;

    celulas.forEach(function (celula) {

        celula.disabled = true;

    });

    if (resultado === "jogador") {

        mensagem.textContent = "🎉 Parabéns! Você venceu!";

        pontosJogador++;

    }

    else if (resultado === "ia") {

        mensagem.textContent = "🤖 A Inteligência Artificial venceu!";

        pontosIA++;

    }

    else {

        mensagem.textContent = "🤝 Empate!";

        pontosEmpate++;

    }

    atualizarPlacar();

}


/* ATUALIZAR PLACAR */

function atualizarPlacar() {

    placarJogador.textContent = pontosJogador;

    placarIA.textContent = pontosIA;

    placarEmpate.textContent = pontosEmpate;

}


/* VOLTAR AO MENU */

function voltarMenu() {

    jogoAtivo = false;
    pensando = false;

    menu.classList.remove("escondido");

    jogo.classList.add("escondido");

}
