from flask import Flask, render_template

app = Flask(__name__)

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/cartelera")
def cartelera():
    return render_template("cartelera.html")

@app.route("/confiteria")
def confiteria():
    return render_template("confiteria.html")

@app.route("/contacto")
def contacto():
    return render_template("contacto.html")

@app.route("/promociones")
def promociones():
    return render_template("promociones.html")

@app.route("/reservas")
def reservas():
    return render_template("reservas.html")

@app.route("/socios")
def socios():
    return render_template("socios.html")

@app.route("/login")
def login():
    return render_template("login.html")

import os

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)