
let estado = "caindo";
let avanco = 0;
let progresso = 0;


const PASSO = 0.05; // 5% do caminho por tecla

// Escala da porta: começa pequeno
const ESCALA_PORTA_LONGE = 0.35;
const ESCALA_PORTA_PERTO = 0.75;

// Posição vertical da porta: mais alta em telas curtas (paisagem)
function getTopoPorta() {
    return window.innerHeight <= 500
        ? { inicio: 5, fim: 9 }     // paisagem: porta bem mais pra cima
        : { inicio: 15, fim: 22 };  // padrão (retrato/desktop)
}
function curvaAproximacao(x) {
    return 1 - Math.pow(1 - x, 3);
}

// Quando o estado muda, essa função é chamada para atualizar a página 
function mudarEstado(novoEstado) {
    estado = novoEstado;

    // Remove todas as classes do body primeiro (limpa o estado anterior)
    document.body.classList.remove("estado-caindo", "estado-desmaiada", "estado-acordada",  "estado-porta", "estado-fechadura");

    document.body.classList.add("estado-" + novoEstado);

    console.log("Estado mudou para:", novoEstado); // Ajuda a depurar no console

}
          
// _____CENA 1: A QUEDA 

// Pega o elemento da Alice no HTML
const alice = document.getElementById("alice");

// Efeito de "digitando" a mensagem de despertar
function digitarTexto(elemento, texto, velocidade = 60) {
    elemento.textContent = "";
    let i = 0;
    function proximaLetra() {
        if (i < texto.length) {
            elemento.textContent += texto.charAt(i);
            i++;
            setTimeout(proximaLetra, velocidade);
        }
    }
    proximaLetra();
}

// Envolve cada letra num <span> pra animar o efeito de "derreter" individualmente
function envolverLetras(elemento) {
    if (elemento.dataset.envolvido) return; // evita rodar duas vezes
    const texto = elemento.textContent;
    elemento.innerHTML = "";
    [...texto].forEach((letra, i) => {
        const span = document.createElement("span");
        span.textContent = letra === " " ? "\u00A0" : letra;
        span.style.animationDelay = `${i * 0.08}s`;
        elemento.appendChild(span);
    });
    elemento.dataset.envolvido = "true";
}

alice.addEventListener("animationend", function(evento) {

    // Verifica se foi especificamente a animação de queda que terminou
    if (evento.animationName === "cairTunel") {
        // Alice sumiu, muda o estado para desmaiada
        mudarEstado("desmaiada");
        digitarTexto(document.getElementById("texto-despertar"), "Alice, você está atrasada.", 60);
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
mensagemDespertar.addEventListener("keydown", function(e) {
    if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        mensagemDespertar.click();
    }
});

// ____CENA 3: LANTERNA_____

const escuridao      = document.getElementById("escuridao");
const objetos        = document.querySelectorAll(".objeto-ambiente:not(#porta)");
const aliceLanterna  = document.getElementById("alice-lanterna");
const porta          = document.getElementById("porta");   
const portaImg       = porta.querySelector("img");

const RAIO_LUZ   = 115; // raio do círculo de luz em pixels

// ____Move a luz e revela os objetos próximos______
function moverLuz(x, y) {
    escuridao.style.setProperty('--x', `${x}px`);
    escuridao.style.setProperty('--y', `${y}px`);

    let objetoMaisProximo = null;
    let menorDistancia = Infinity;

    const MARGEM_EXTRA = 60; // pixels extras de tolerância pra não apagar ao ler a fala

    objetos.forEach(function(obj) {
        if (progresso > 0.5) {
            const rect = obj.getBoundingClientRect();
            const centroTelaX = window.innerWidth / 2;
            const larguraCorredor = window.innerWidth * 0.15; // 15% da largura da tela, proporcional
            const distDoCentro = Math.abs((rect.left + rect.width/2) - centroTelaX);
            if (distDoCentro < larguraCorredor) return;
        }

        const rect = obj.getBoundingClientRect();
        const centroX = rect.left + rect.width / 2;
        const centroY = rect.top + rect.height / 2;

        const dx = x - centroX;
        const dy = y - centroY;
        const distancia = Math.sqrt(dx * dx + dy * dy);

        // Usa o raio de detecção próprio do objeto (metade da diagonal + margem)
        const raioObjeto = Math.sqrt(rect.width**2 + rect.height**2) / 2 + MARGEM_EXTRA;

        if (distancia < raioObjeto && distancia < menorDistancia) {
            menorDistancia = distancia;
            objetoMaisProximo = obj;
        }
    });

    objetos.forEach(function(obj) {
        if (obj === objetoMaisProximo) {
            obj.classList.add("iluminado");
        } else {
            obj.classList.remove("iluminado");
        }
    });

    const alturaTela = window.innerHeight;
    const limiarAparecer = alturaTela * 0.65;
    const zonaAlice = alturaTela - limiarAparecer;

    if (y > limiarAparecer) {
        const opacidade = (y - limiarAparecer) / zonaAlice;
        aliceLanterna.style.opacity = opacidade.toFixed(2);
    } else {
        aliceLanterna.style.opacity = 0;
    }
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
    const OFFSET_DEDO = 80; // desloca a luz pra cima do dedo, pra não tampar
    moverLuz(toque.clientX, toque.clientY - OFFSET_DEDO);
}, { passive: false});

document.addEventListener("touchstart", function(e) {
    if (estado !== "acordada") return;
    const toque = e.touches[0];
    const OFFSET_DEDO = 80;
    moverLuz(toque.clientX, toque.clientY - OFFSET_DEDO);
}, { passive: true });


// ___CAMINHADA DE ALICE______

function atualizarCaminhada() {

    // Porta cresce conforme Alice avança
    const escalaPorta = ESCALA_PORTA_LONGE - (ESCALA_PORTA_LONGE - ESCALA_PORTA_PERTO) * progresso;

    // Porta desce levemente na tela conforme Alice se aproxima
    const { inicio, fim } = getTopoPorta();
    const topPorta = inicio + (fim - inicio) * progresso;

    porta.style.setProperty('--scale-atual', escalaPorta.toFixed(3));
    porta.style.top = topPorta + "%";
 
    // Desfoque some conforme Alice se aproxima
    const desfoque = 20 * (1 - progresso); 
    portaImg.style.filter = `blur(${desfoque.toFixed(2)}px)`;

    
    porta.style.setProperty('--engolir', (1 - progresso).toFixed(2));

    if (progresso > 0.6) {
        const sumico = 1 - ((progresso - 0.6) / 0.4);
        aliceLanterna.style.opacity = sumico.toFixed(2);    
        aliceLanterna.style.filter = `blur(${(progresso - 0.6) * 10}px)`;
    }
    // Quando Alice está 90% do caminho, habilita a maçaneta
    if (progresso >= 0.9 && !porta.classList.contains("chegou")) {
        porta.classList.add("chegou");
        console.log("Alice chegou perto da porta!");

    }
}

// Avança Alice um passo em direção à porta (a porta cresce, Alice não se move)
function darPasso() {
    if (estado !== "acordada") return;
    if (avanco >= 1) return;

    avanco = Math.min(avanco + PASSO, 1);
    progresso = curvaAproximacao(avanco);
    atualizarCaminhada();

    const dica = document.getElementById("dica-avancar");
    if (dica) dica.classList.add("escondida");
}

// Desktop: seta para cima aproxima a porta
document.addEventListener("keydown", function(e) {
    if (e.key == "ArrowUp") {
        e.preventDefault();
        darPasso();
    }
});

// Mobile: swipe para cima aproxima a porta
let swipeStartY = null;
let swipeStartX = null;
let swipeStartTime = null;

document.addEventListener("touchstart", function(e) {
    if (estado !== "acordada") return;
    swipeStartY = e.touches[0].clientY;
    swipeStartX = e.touches[0].clientX;
    swipeStartTime = Date.now();
}, { passive: true });

document.addEventListener("touchend", function(e) {
    if (estado !== "acordada") return;
    if (swipeStartY === null) return;

    const swipeEndY = e.changedTouches[0].clientY;
    const swipeEndX = e.changedTouches[0].clientX;
    const deltaY = swipeStartY - swipeEndY;
    const deltaX = Math.abs(swipeStartX - swipeEndX);
    const deltaTime = Date.now() - swipeStartTime;

    // Só conta como swipe se: for rápido, mais vertical que horizontal, e passar de 50px
    const foiRapido = deltaTime < 400;
    const foiVertical = deltaY > deltaX * 1.5;
    const passouLimite = deltaY > 50;

    if (foiRapido && foiVertical && passouLimite) {
        darPasso();
    }

    swipeStartY = null;
    swipeStartX = null;
    swipeStartTime = null;
}, { passive: true });

// _____CENA 3 -> 4: MAÇANETA_____

const machaneta = document.getElementById("porta-machaneta");

machaneta.addEventListener("click", function() {
    if (estado !== "acordada") return; 
    if (progresso < 0.9) return; // Só funciona quando Alice está perto

    aliceLanterna.style.opacity = "0";
    aliceLanterna.style.transition = "opacity 0.1s ease"; // Some muito rápido

    const dicaClicar = document.getElementById("dica-clicar");
    if (dicaClicar) dicaClicar.classList.add("escondida");

    // Alice some instantaneamente
    mudarEstado("porta");

    setTimeout(() => {
        mudarEstado("fechadura");

        // Espera a cena da fechadura terminar de aparecer, depois sussurra
        setTimeout(() => {
            const dicaMachaneta = document.getElementById("dica-machaneta");
            if (dicaMachaneta) {
                envolverLetras(dicaMachaneta);
                dicaMachaneta.classList.add("visivel");
            }
        }, 1200);
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

    // Move o interior na direção oposta ao mouse, máximo 12px
    const mx = -dx * 12;
    const my = -dy * 12;

    fechaduraInterior.style.transform = `translate(${mx}px, ${my}px)`;

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

    fechaduraInterior.style.transform = `translate(${mx}px, ${my}px)`;
}, {passive: true});


// ____SONS_________

let audioCtx = null;
let mutado = false;
let volumeGeral = null;
let reverbNode = null;

// A) INICIA TUDO
function iniciarSons() {
   audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const convolver = audioCtx.createConvolver();
    const rate = audioCtx.sampleRate;
    const length = rate * 1.5;
    const impulse = audioCtx.createBuffer(2, length, rate);
    for(let ch=0; ch<2; ch++){
        const data = impulse.getChannelData(ch);
        for(let i=0; i<length; i++){
            data[i] = (Math.random()*2-1) * Math.pow(1 - i/length, 2);
        }
    }
    convolver.buffer = impulse;
    reverbNode = convolver;
    volumeGeral = audioCtx.createGain();
    volumeGeral.gain.value = 1;
    volumeGeral.connect(audioCtx.destination);
    convolver.connect(volumeGeral);

    tocarGotasEsgoto();
    tocarArrasto();

    // VOZES REAIS
    setTimeout(() => tocarVozReal("voz-acorda", 0.4), 1000);
    setTimeout(() => iniciarVozesAleatorias(), 15000);
}

// B) GOTA DE ESGOTO
function tocarGotasEsgoto() {
    function agendar() {
        const intervalo = 600 + Math.random() * 2500;
        setTimeout(() => {
            if (estado === "acordada" &&!mutado) criarPingoEsgoto();
            agendar();
        }, intervalo);
    }
    agendar();
}
function criarPingoEsgoto() {
    const osc = audioCtx.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(250 + Math.random()*80, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(120, audioCtx.currentTime + 0.15);
    const filtro = audioCtx.createBiquadFilter();
    filtro.type = "bandpass";
    filtro.frequency.value = 600;
    const ganho = audioCtx.createGain();
    ganho.gain.setValueAtTime(0.4, audioCtx.currentTime);
    ganho.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.8);
    osc.connect(filtro);
    filtro.connect(ganho);
    ganho.connect(reverbNode);
    ganho.connect(volumeGeral);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.8);
}

// C) ARRASTO
function tocarArrasto() {
    function ciclo() {
        const tempoAteProximo = 8000 + Math.random() * 15000;
        setTimeout(() => {
            if (estado!== "acordada") { ciclo(); return; }
            if (!mutado) criarArrasto();
            ciclo();
        }, tempoAteProximo);
    }
    ciclo();
}
function criarArrasto() {
    const bufferSize = audioCtx.sampleRate * (1.2 + Math.random()*0.8);
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for(let i=0; i<bufferSize; i++) {
        data[i] = (Math.random()*2-1) * 0.6;
        if(i>0) data[i] = (data[i] + data[i-1]) * 0.5;
    }
    const src = audioCtx.createBufferSource();
    src.buffer = buffer;
    const filtro = audioCtx.createBiquadFilter();
    filtro.type = "lowpass";
    filtro.frequency.value = 90 + Math.random()*40;
    const ganho = audioCtx.createGain();
    ganho.gain.setValueAtTime(0, audioCtx.currentTime);
    ganho.gain.linearRampToValueAtTime(0.25, audioCtx.currentTime + 0.5);
    ganho.gain.linearRampToValueAtTime(0, audioCtx.currentTime + bufferSize/audioCtx.sampleRate);
    src.connect(filtro);
    filtro.connect(ganho);
    ganho.connect(volumeGeral);
    src.start();
}

// D) VOZES REAIS
function tocarVozReal(id, volume = 0.3) {
    const audio = document.getElementById(id);
    if(!audio || mutado) return;
    audio.volume = volume;
    audio.playbackRate = 0.9 + Math.random()*0.1;
    audio.currentTime = 0;
    audio.play().catch(()=>{});
}
function iniciarVozesAleatorias() {
    function agendar() {
        const tempo = 20000 + Math.random() * 25000;
        setTimeout(() => {
            if(estado!== "acordada") { agendar(); return; }
            const vozes = ["voz-atrasada", "voz-tictac"];
            const escolhida = vozes[Math.floor(Math.random()*vozes.length)];
            tocarVozReal(escolhida, 0.2);
            agendar();
        }, tempo);
    }
    agendar();
}

// E) BOTÃO MUTE - FICA NO FINAL
const btnMute = document.getElementById("btn-mute");
const vozesAudio = ["voz-acorda", "voz-atrasada", "voz-tictac"];

btnMute.addEventListener("click", function() {
    mutado = !mutado;
    if (volumeGeral) {
        volumeGeral.gain.linearRampToValueAtTime(mutado ? 0 : 1, audioCtx.currentTime + 0.3);
    }

    // Silencia (ou não) as vozes reais que possam estar tocando agora
    vozesAudio.forEach(id => {
        const audio = document.getElementById(id);
        if (audio) audio.muted = mutado;
    });

    btnMute.textContent = mutado ? "🔇" : "🔉";
});

// Inicialização: posiciona a porta ao carregar a página
document.addEventListener( "DOMContentLoaded", () => {
    atualizarCaminhada();
    console.log("Alice acordou!");

});

