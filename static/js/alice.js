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

// Interatividade da experiência Alice — por enquanto só um teste
document.addEventListener( "DOMContentLoaded", () => {

    console.log("Alice acordou!");

});