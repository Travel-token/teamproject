from flask import Flask, request, jsonify

from recommendation_service import RecommendationService

app = Flask(__name__)

recommendation_service = RecommendationService()


@app.route("/recommendation/user/login", methods=["POST"])
def user_login():

    data = request.get_json()

    user_id = data.get("userId")

    if user_id is None:
        return jsonify({
            "success": False,
            "message": "userId is required"
        }), 400

    print(f"[LOGIN] userId={user_id}")

    recommendation_service.register_user(user_id)

    return jsonify({
        "success": True,
        "userId": user_id
    }), 200


@app.route("/recommend/logs", methods=["POST"])
def receive_logs():

    data = request.get_json()

    logs = data.get("logs", [])

    if not logs:
        return jsonify({
            "success": False,
            "message": "logs is required"
        }), 400

    print(f"[LOG RECEIVE] count={len(logs)}")

    for event in logs:
        recommendation_service.process_event(event)

    return jsonify({
        "success": True,
        "count": len(logs)
    }), 200


if __name__ == "__main__":

    app.run(
        host="0.0.0.0",
        port=5050,
        debug=True
    )