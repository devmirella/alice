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

// Escuta o movimento de mouse em toda a tela
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

// Escuta o toque na tela "equivalente ao mousemove para celular"
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

// Interatividade da experiência Alice — por enquanto só um teste
document.addEventListener( "DOMContentLoaded", () => {

    console.log("Alice acordou!");

});