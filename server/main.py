from flask import Flask, request, jsonify
from playerRepo import PlayerRepo

app = Flask(__name__)
repo = PlayerRepo()


@app.route('/newplayers', methods=['POST'])
def insert_player():
    data = request.get_json()

    username = data.get("username")
    password = data.get("password")
    email = data.get("email")

    if not username or not password or not email:
        return jsonify({"error": "username, password, and email are required"}), 400

    try:
        repo.insert_player(username, password, email)
        return jsonify({"message": "Player created"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/players/<int:userid>', methods=['DELETE'])
def delete_player(userid):
    try:
        repo.delete_player(userid)
        return jsonify({"message": "Player deleted"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/players', methods=['GET'])
def get_players():
    try:
        players = repo.get_players()
        return jsonify(players), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()

    username = data.get("username")
    password = data.get("password")

    if not username or not password:
        return jsonify({"error": "username and password are required"}), 400

    try:
        result = repo.check_login(username, password)

        if result["status"] == "Successful":
            return jsonify({
                "message": "Login successful",
                "user_id": result["user_id"]
            }), 200
        else:
            return jsonify({"message": "Invalid credentials"}), 401
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True)