
let estado = "caindo";
let progresso = 0;


const PASSO = 0.05; // 5% do caminho por tecla

// Escala da porta: começa grande (3x) e vai para 1x conforme Alice avança
const ESCALA_PORTA_LONGE = 4;
const ESCALA_PORTA_PERTO = 0.8;

let swipeStartY = null; // Swipe: guarda o Y do início do toque

// Quando o estado muda, essa função é chamada para atualizar a página 
function mudarEstado(novoEstado) {
    estado = novoEstado;

    // Remove todas as classes do body primeiro (limpa o estado anterior)
    document.body.classList.remove("estado-caindo", "estado-desmaiada", "estado-acordada",  "estado-porta", "estado-fechadura");

    document.body.classList.add("estado-" + novoEstado);

    console.log("Estado mudou para:", novoEstado); // Ajuda a deburgar no console

}
          
// _____CENA 1: A QUEDA 

// Pega o elemento da Alice no HTML
const alice = document.getElementById("alice");

alice.addEventListener("animationend", function(evento) {

    // Verifica se foi especificamente a animação de queda que terminou
    if (evento.animationName === "cairTunel") {
        // Alice sumiu, muda o estado para desmaiada
        mudarEstado("desmaiada");
    }
})

// _____CENA 2: ACORDAR_____

// Pega a mensagem de despertar
const mensagemDespertar = document.getElementById("mensagem-despertar");

mensagemDespertar.addEventListener("click", function() {

    // Só reage se Alice estiver realmente desmaiada
    if (estado === "desmaiada") {
        mudarEstado("acordada");
        iniciarSons(); 
    }
});


// ____CENA 3: LANTERNA_____

const escuridao      = document.getElementById("escuridao");
const objetos        = document.querySelectorAll(".objeto-ambiente");
const aliceLanterna  = document.getElementById("alice-lanterna");
const porta          = document.getElementById("porta");

const RAIO_LUZ   = 120;  // raio do círculo de luz em pixels

// ____Move a luz e revela os objetos próximos______
function moverLuz(x, y) {

    escuridao.style.background=`radial-gradient(
        circle 120px at ${x}px ${y}px,
        rgba(255, 200, 80, 0.20) 0%,
        rgba(255, 200, 80, 0.08) 40%,
        rgba(0, 0, 0, 0.98) 75%
        )`;

        objetos.forEach(obj => {

            const rect = obj.getBoundingClientRect();

            const ox = rect.left + rect.width / 2;    // centro horizontal do objeto
            const oy = rect.top  + rect.height / 2;  // centro vertical do objeto

            const dist = Math.sqrt((x - ox) ** 2 + (y - oy) ** 2); // distância até a luz

            // Quanto mais perto, mais visível
            obj.style.opacity = dist < RAIO_LUZ
                ? (1 - dist / RAIO_LUZ).toFixed(2)
                : 0;
        });

        // ALICE é relevada separadamente, não é .objeto-ambiente
        const rectAlice = aliceLanterna.getBoundingClientRect();
        const ax        = rectAlice.left + rectAlice.width / 2;
        const ay        = rectAlice.top + rectAlice.height / 2;
        const distAlice = Math.sqrt((x - ax) ** 2 + (y - ay) ** 2);

        aliceLanterna.style.opacity = distAlice < RAIO_LUZ
        ? (1 - distAlice / RAIO_LUZ).toFixed(2)
        : 0;
}

// ________Desktop_________

document.addEventListener("mousemove", function(e) {
    if (estado !== "acordada") return;
    moverLuz(e.clientX, e.clientY);
});

// _______Mobile_________

document.addEventListener("touchmove", function(e) {
    if (estado !== "acordada") return;
    e.preventDefault();
    const toque = e.touches[0];
    moverLuz(toque.clientX, toque.clientY);
}, { passive: false});


// ___CAMINHADA DE ALICE______

function atualizarCaminhada() {

    // Porta encolhe conforme Alice avança (magia do País das Maravilhas)
    const escalaPorta = ESCALA_PORTA_LONGE - (ESCALA_PORTA_LONGE - ESCALA_PORTA_PERTO) * progresso;

    // Porta desce levemente na tela conforme Alice se aproxima
    const topPorta = 20 + (45 - 20) * progresso; // de 20% até 45% do topo

    // Aplica só translateX porque o top é controlado separadamente
    porta.style.transform = `translateX(-50%) scale(${escalaPorta.toFixed(3)})`;
    porta.style.top = topPorta + "%";

    const topAlice = 90 - (90 - 55) * progresso;
    aliceLanterna.style.top = topAlice + "%";

    // Quando Alice está 90% do caminho, habilita a maçaneta
    if (progresso >= 0.9 && !porta.classList.contains("chegou")) {
        porta.classList.add("chegou");
        console.log("Alice chegou perto da porta!");
    }
}

// Avança Alice um passo em direção à porta
function darPasso() {
    if (estado !== "acordada") return;
    if (progresso >= 1) return; 

    progresso = Math.min(progresso + PASSO, 1);
    aliceLanterna.classList.add("andando"); // Animação de caminhada nas pernas

    clearTimeout(aliceLanterna._andandoTimeout);
    aliceLanterna._andandoTimeout = setTimeout(() => {
        aliceLanterna.classList.remove("andando");
    }, 400);
    atualizarCaminhada();
}       
// Desktop
document.addEventListener("keydown", function(e) {
    if (e.key == "ArrowUp") {
        e.preventDefault();
        darPasso();
    }
});

// Mobile: swipe para cima faz Alice andar
document.addEventListener("touchstart", function(e) {
    if (estado !== "acordada") return;
    swipeStartY = e.touches[0].clientY; // Guarda onde o toque começou
}, {passive: true});

document.addEventListener("touchend", function(e) {
    if (estado !== "acordada") return;
    if (swipeStartY === null) return;

    const swipeEndY = e.changedTouches[0].clientY;
    const deltaY = swipeStartY - swipeEndY;

    if (deltaY > 30) {
        darPasso();
    }
    swipeStartY = null 

}, { passive: true });


// _____CENA 3 -> 4: MAÇANETA_____

const machaneta = document.getElementById("porta-machaneta");

machaneta.addEventListener("click", function() {
    if (estado !== "acordada") return; 
    if (progresso < 0.9) return; // Só funciona quando Alice está perto

    aliceLanterna.style.opacity = "0";
    aliceLanterna.style.transition = "opacity 0.1s ease"; // Some muito rápido

    // Alice some instantaneamente
    mudarEstado("porta");

    setTimeout(() => {
        mudarEstado("fechadura");
    }, 800); // Alice sumiu na porta
});


//_______CENA 4: EFEITO ESPREITAR____

const fechaduraInterior = document.getElementById("fechadura-interior");

// Mouse se move, interior da fechadura desliza na direção oposta
document.addEventListener("mousemove", function(e) {
    if (estado !== "fechadura") return;

    // Centro da tela 
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;

    // Distância do mouse até o centro (normalizada: -1 a 1)
    const dx = (e.clientX - cx) / cx;
    const dy = (e.clientY - cy) / cy;

    // Move o interior na direção oposta ao mouse, máximo 40px
    const mx = -dx * 12;
    const my = -dy * 12;

    fechaduraInterior.style.transform = `translate(${mx}px, ${my}py)`;

});

// Mobile: toque move o interior da fechadura
document.addEventListener("touchmove", function(e) {
    if (estado !== "fechadura") return;

    const toque = e.touches[0];
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;

    const dx = (toque.clientX - cx) / cx;
    const dy = (toque.clientY - cy) / cy;

    const mx = -dx * 12;
    const my = -dy * 12;

    fechaduraInterior.style.transform = `translate(${mx}px, ${my}py)`;
}, {passive: true});


// ____SONS_________

let audioCtx = null;
let mutado = false;
let volumeGeral = null;

// Inicializa o contexto de áudio após interação do usuário 
function iniciarSons() {
   audioCtx = new (window.AudioContext || window.webkitAudioContext)();

    volumeGeral = audioCtx.createGain();
    volumeGeral.gain.value = 1;
    volumeGeral.connect(audioCtx.destination) 

    tocarGotas();
    setTimeout(() => {
        tocarBarulhoMisterioso();
    }, 10000);
}

// ____________Camada 1: Gotas_______

function tocarGotas() {

    function agendarPingo() {
        const intervalo = 800 + Math.random() * 1700;

        setTimeout(() => {
            if (estado === "acordada" && !mutado) {
                criarPingo();
            }
            agendarPingo();
        }, intervalo);
    }
    agendarPingo();
}

// Cria um único som de gota: oscilando
function criarPingo() {

    const osc = audioCtx.createOscillator();
    osc.type = "sine";

    osc.frequency.value = 400 + Math.random() * 400;

    // Volume: aparece e some em 0.3s
    const ganho = audioCtx.createGain();
    ganho.gain.setValueAtTime(0.15, audioCtx.currentTime);
    ganho.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);

    // Conecta: oscilador -> ganho -> volume geral -> saida
    osc.connect(ganho);
    ganho.connect(volumeGeral);

    osc.start(audioCtx.currentTime);
    osc.stop(audioCtx.currentTime + 0.3);

}

// _____Camada 2: Barulho misterioso___

function tocarBarulhoMisterioso() {

    let intensidade = 0.03;

    function ciclo() {
        if (estado !== "acordada") {
            setTimeout(ciclo, 3000); // Pausa e tenta novamente
            return;
        }

        if (!mutado) {
            criarBarulho(intensidade);
        }

        // Crescer ate 0.35
        intensidade  = Math.min(intensidade + 0.015, 0.35);

        const proximoIntervalo = Math.max(3000, 8000 - intensidade * 10000);
        setTimeout(ciclo, proximoIntervalo);
    }
    ciclo();
}

// Cria um única aparição do barulho
function criarBarulho(volume) {

    const bufferSize = audioCtx.sampleRate * 1.5;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const dados = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
        dados[i] = Math.random() * 2 - 1;  // Valores entre -1 e 1
    }

    // Cria a fonte de áudio e aplica um filtro passa-baixa para suavizar o som (remove frequências altas)
    const fonte = audioCtx.createBufferSource(); // Cria o “player”
    fonte.buffer = buffer; // Coloca o áudio no player

    const filtro = audioCtx.createBiquadFilter();
    filtro.type = "lowpass";
    filtro.frequency.value = 120; // Corta tudo acima de 120Hz

    // Envelope suave: aparece, sustenta, some, sem cliques bruscos no áudio
    const ganho = audioCtx.createGain();  // cria o “botão de volume”
    ganho.gain.setValueAtTime(0, audioCtx.currentTime) // Começa mudo
    ganho.gain.linearRampToValueAtTime(volume, audioCtx.currentTime + 0.4);
    ganho.gain.linearRampToValueAtTime(volume, audioCtx.currentTime + 1.0);
    ganho.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 1.5);

    // Conecta: fonte → filtro → ganho → volume geral → saída
    fonte.connect(filtro);
    filtro.connect(ganho);
    ganho.connect(volumeGeral);

    fonte.start(audioCtx.currentTime);
    fonte.stop(audioCtx.currentTime + 1.5);
}

// _____Botão de mute____________

const btnMute = document.getElementById("btn-mute");
btnMute.addEventListener("click", function() {
    mutado = !mutado;

    volumeGeral.gain.linearRampToValueAtTime(
        mutado ? 0 : 1,
        audioCtx.currentTime + 0.3
    );

    btnMute.textContent = mutado ? "🔇" : "🔉";
});


// Interatividade da experiência Alice — por enquanto só um teste
document.addEventListener( "DOMContentLoaded", () => {
    atualizarCaminhada();
    console.log("Alice acordou!");

});

