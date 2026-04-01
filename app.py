# app.py - Arquivo principal do projeto, inicializa o Flasj e define as rotas
# Importa a classe Flask e a função render_template
from flask import Flask, render_template

# Cria o servidor Flask
app = Flask(__name__)

# Rota principal - Quando alguém acessa o site, essa função é chamada
@app.route("/")
def alice():
    # Buca o arquivo alice.html dentro da pasta templates/ e retorna pro navegador
    return render_template("alice.html")

if __name__ == "__main__":
    app.run(debug=True)
