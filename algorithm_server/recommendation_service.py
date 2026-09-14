import json
import math
import os
import threading
from collections import defaultdict
from datetime import datetime, timezone

class RecommendationService:
    def __init__(self, data_dir=None):
        self.data_dir = data_dir or os.getenv("RECOMMENDATION_DATA_DIR", "data")
        self.user_file = os.path.join(self.data_dir, "recommendation_users.json")
        self.event_file = os.path.join(self.data_dir, "recommendation_events.jsonl")
        self.lock = threading.RLock()
        os.makedirs(self.data_dir, exist_ok=True)
        if not os.path.exists(self.user_file): self._save_users({})

    def register_user(self, user_id):
        with self.lock:
            users=self._load_users(); key=str(user_id)
            users.setdefault(key,{"userId":key,"feedWeights":{},"categoryWeights":{},"regionWeights":{}})
            self._save_users(users)

    def process_event(self, event):
        user_id=event.get("userId"); kind=event.get("event")
        if user_id is None or kind not in {"FEED_VIEW","FEED_CLICK","FEED_LIKE","FEED_CREATE","FEED_UPDATE"}: return False
        weight={"FEED_VIEW":1,"FEED_CLICK":2,"FEED_LIKE":4,"FEED_CREATE":3,"FEED_UPDATE":1}[kind]
        clean={"timestamp":event.get("timestamp") or datetime.now(timezone.utc).isoformat(),"userId":str(user_id),"event":kind,
               "feedId":event.get("feedId"),"category":event.get("category"),"region":event.get("region")}
        with self.lock:
            self.register_user(user_id); users=self._load_users(); profile=users[str(user_id)]
            self._add(profile["feedWeights"],clean["feedId"],weight)
            self._add(profile["categoryWeights"],clean["category"],weight)
            self._add(profile["regionWeights"],clean["region"],weight)
            self._save_users(users)
            with open(self.event_file,"a",encoding="utf-8") as f: f.write(json.dumps(clean,ensure_ascii=False)+"\n")
        return True

    def recommend(self,user_id,candidates,limit=10,current_region=None):
        with self.lock: profile=self._load_users().get(str(user_id),{})
        feed=profile.get("feedWeights",{}); categories=profile.get("categoryWeights",{}); regions=profile.get("regionWeights",{})
        scored=[]
        for item in candidates:
            fid=str(item.get("feedId","")); popularity=max(0,float(item.get("popularity",0) or 0))
            score=math.log1p(popularity)*0.15 + float(feed.get(fid,0))*0.1
            score+=float(categories.get(str(item.get("category","")),0))*0.35
            score+=float(regions.get(str(item.get("region","")),0))*0.25
            if current_region and str(item.get("region","")).strip() == str(current_region).strip(): score+=0.30
            scored.append({"feedId":item.get("feedId"),"score":round(score,6)})
        return sorted(scored,key=lambda x:(-x["score"],str(x["feedId"])))[:max(1,min(int(limit),50))]

    def caption(self,trip_name,region,places):
        names=[str(p).strip() for p in (places or []) if str(p).strip()][:3]
        title=(trip_name or region or "우리 여행").strip(); text=f"{title} 정산까지 완료!"
        if names: text+=f" {', '.join(names)}에서 함께한 순간을 기록해요."
        tags=[(region or "우리").replace(" ","")+"여행"]+([names[0].replace(" ","")] if names else [])+["트래블토큰"]
        return text+" "+" ".join("#"+tag for tag in tags)

    def _add(self,bucket,key,weight):
        if key is not None and str(key): bucket[str(key)]=float(bucket.get(str(key),0))+weight
    def _load_users(self):
        try:
            with open(self.user_file,"r",encoding="utf-8") as f: return json.load(f)
        except (OSError,json.JSONDecodeError): return {}
    def _save_users(self,users):
        tmp=self.user_file+".tmp"
        with open(tmp,"w",encoding="utf-8") as f: json.dump(users,f,ensure_ascii=False,indent=2)
        os.replace(tmp,self.user_file)
