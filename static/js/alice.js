// Controla o que esta acontecendo na tela 
let estado = "caindo";

// Quando o estado muda, essa função é chamada para atualizar a página 
function mudarEstado(novoEstado) {
    estado = novoEstado;

    // Remove todas as classes do body primeiro (limpa o estado anterior)
    document.body.classList.remove("estado-caindo", "estado-desmaiada", "estado-acordada");

    document.body.classList.add("estado-" + novoEstado);

    console.log("Estado mudou para:", novoEstado); // Ajuda a deburgar no console

}

// Pega o elemento da Alice no HTML
const alice = document.getElementById("alice");

alice.addEventListener("animationend", function(evento) {

    // Verifica se foi especificamente a animação de queda que terminou
    if (evento.animationName === "cairTunel") {
        // Alice sumiu, muda o estado para desmaiada
        mudarEstado("desmaiada");
    }
})

// Pega a mensagem de despertar
const mensagemDespertar = document.getElementById("mensagem-despertar");

mensagemDespertar.addEventListener("click", function() {

    // Só reage se Alice estiver realmente desmaiada
    if (estado === "desmaiada") {
        mudarEstado("acordada");
        iniciarSons(); 
    }
})


const escuridao = document.getElementById("escuridao");

const objetos = document.querySelectorAll(".objeto-ambiente");

const RAIO_LUZ = 120; 

// Move a luz e revela os objetos 
function moverLuz(x, y) {

    escuridao.style.background=`radial-gradient(
        circle 120px at ${x}px ${y}px,
        rgba(255, 200, 80, 0.20) 0%,
        rgba(255, 200, 80, 0.08) 40%,
        rgba(0, 0, 0, 0.98) 75%
        )`;

        objetos.forEach(obj => {
            const rect = obj.getBoundingClientRect();

            // Centro do objeto
            const ox = rect.left + rect.width / 2;
            const oy = rect.top  + rect.height / 2;

            // Distância entre cursor e o objeto
            const dist = Math.sqrt((x - ox) ** 2 + (y - oy) ** 2);

            // Quanto mais perto, mais visível
            obj.style.opacity = dist < RAIO_LUZ
                ? (1 - dist / RAIO_LUZ).toFixed(2)
                : 0;
        });
}

// Desktop
document.addEventListener("mousemove", function(e) {
    if (estado !== "acordada") return;
    moverLuz(e.clientX, e.clientY);
});

// Mobile 
document.addEventListener("touchmove", function(e) {
    if (estado !== "acordada") return;
    const toque = e.touches[0];
    moverLuz(toque.clientX, toque.clientY);
});

// SONS

let audioCtx = null;
let mutado = false;
let volumeGeral = null;

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

// Camada 1: Gotas
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

// Camada 2: Barulho misterioso
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

// Botão de mute 
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

    console.log("Alice acordou!");

});

