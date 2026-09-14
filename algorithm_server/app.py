import hmac
import os
from flask import Flask, jsonify, request
from recommendation_service import RecommendationService

app=Flask(__name__)
service=RecommendationService()
api_key=os.getenv("RECOMMENDATION_API_KEY","")

@app.before_request
def authenticate():
    if request.path == "/health" or not api_key: return None
    supplied=request.headers.get("X-Recommendation-Key","")
    if not hmac.compare_digest(api_key,supplied): return jsonify({"message":"unauthorized"}),401

@app.get("/health")
def health(): return jsonify({"ok":True})

@app.post("/recommendation/user/login")
def login():
    data=request.get_json(silent=True) or {}
    if data.get("userId") is None: return jsonify({"message":"userId is required"}),400
    service.register_user(data["userId"]); return jsonify({"success":True})

@app.post("/recommend/logs")
def logs():
    data=request.get_json(silent=True) or {}; values=data.get("logs",[])
    if not isinstance(values,list) or not values: return jsonify({"message":"logs is required"}),400
    return jsonify({"success":True,"count":sum(service.process_event(x) for x in values if isinstance(x,dict))})

@app.post("/recommend")
def recommend():
    data=request.get_json(silent=True) or {}
    if data.get("userId") is None or not isinstance(data.get("candidates"),list): return jsonify({"message":"userId and candidates are required"}),400
    return jsonify({"items":service.recommend(data["userId"],data["candidates"],data.get("limit",10),data.get("currentRegion"))})

@app.post("/caption")
def caption():
    data=request.get_json(silent=True) or {}
    return jsonify({"caption":service.caption(data.get("tripName"),data.get("region"),data.get("places",[]))})

if __name__=="__main__": app.run(host=os.getenv("RECOMMENDATION_HOST","127.0.0.1"),port=int(os.getenv("RECOMMENDATION_PORT","5050")),debug=False)
