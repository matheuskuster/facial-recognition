from flask import Flask

app = Flask(__name__)

@app.route("/process")
def process():
    return "Hello World"
