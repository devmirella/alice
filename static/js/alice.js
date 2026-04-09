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
    }
})

const escuridao = document.getElementById("escuridao");

// Mousemove, desktop
document.addEventListener("mousemove", function(evento) {

    if (estado !== "acordada") return;

    const x = evento.clientX;  // distância da esquerda em pixels
    const y = evento.clientY; // distância do topo em pixels

    escuridao.style.background = `radial-gradient(
        circle 200px at ${x}px ${y}px,
        rgba(255, 200, 80, 0.15) 0%,
        rgba(255, 200, 80, 0.05) 45%,
        rgba(0,0,0,0.95) 100%
    )`;
});

// touchmove, mobile (raio menor, tela menor)
document.addEventListener("touchmove", function(evento) {

    if(estado !== "acordada") return;

    // touchmove pode ter vários dedos — pegamos só o primeiro
    const toque = evento.touches[0];

    const x = toque.clientX;
    const y = toque.clientY;

    escuridao.style.background = `radial-gradient(
        circle 150px at ${x}px ${y}px,
        rgba(255, 200, 80, 0.15) 0%,
        rgba(255, 200, 80, 0.05) 45%,
        rgba(0,0,0,0.95) 100%
        )`;
});


const RAIO_LUZ = 70; 
const objetos = document.querySelectorAll(".objeto-ambiente");

// Move a luz e revela os objetos 
function moverLuz(x, y) {

    escuridao.style.background=`radial-gradient(
        circle 65px at ${x}px ${y}px,
        rgba(255, 200, 80, 0.20) 0%,
        rgba(255, 200, 80, 0.08) 55%,
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

// Interatividade da experiência Alice — por enquanto só um teste
document.addEventListener( "DOMContentLoaded", () => {

    console.log("Alice acordou!");

});