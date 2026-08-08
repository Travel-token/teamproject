from flask import Flask, request, jsonify

app = Flask(__name__)


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

    # TODO:
    # 추천 시스템 사용자 등록
    #
    # recommendation_service.create_user(user_id)

    return jsonify({
        "success": True,
        "userId": user_id
    }), 200


if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=5050,
        debug=True
    )