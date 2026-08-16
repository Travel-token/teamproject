import json
import math
import os
from datetime import datetime, timezone

from db import get_connection


# ============================================================
# 추천 점수 가중치
#
# score = 인기도 * W_POPULARITY
#       + 관심 카테고리 매칭 * W_CATEGORY
#       + 관심 해시태그 매칭 * W_HASHTAG
#       + 지역 선호도(거리) * W_REGION
#       + 최신성 * W_RECENCY
# ============================================================
WEIGHT_POPULARITY = 0.35
WEIGHT_CATEGORY = 0.25
WEIGHT_HASHTAG = 0.15
WEIGHT_REGION = 0.15
WEIGHT_RECENCY = 0.10

RECOMMEND_LIMIT = 10
RECENCY_HALFLIFE_DAYS = 14


def _haversine_km(lat1, lng1, lat2, lng2):

    radius_km = 6371

    d_lat = math.radians(lat2 - lat1)
    d_lng = math.radians(lng2 - lng1)

    a = (
        math.sin(d_lat / 2) ** 2
        + math.cos(math.radians(lat1))
        * math.cos(math.radians(lat2))
        * math.sin(d_lng / 2) ** 2
    )

    return radius_km * 2 * math.asin(math.sqrt(a))


def _normalize(values):

    max_value = max(values) if values else 0

    if max_value <= 0:
        return [0.0 for _ in values]

    return [value / max_value for value in values]


class RecommendationService:

    USER_FILE = "data/recommendation_users.json"

    def __init__(self):

        os.makedirs("data", exist_ok=True)

        if not os.path.exists(self.USER_FILE):

            with open(
                self.USER_FILE,
                "w",
                encoding="utf-8"
            ) as file:

                json.dump(
                    {},
                    file,
                    ensure_ascii=False,
                    indent=2
                )

    # ========================================================
    # 로그인 사용자 등록
    # ========================================================

    def register_user(self, user_id):

        users = self._load_users()

        user_id = str(user_id)

        if user_id not in users:

            users[user_id] = {
                "userId": user_id
            }

            self._save_users(users)

            print(
                f"[USER CREATED] userId={user_id}"
            )

        else:

            print(
                f"[USER EXISTS] userId={user_id}"
            )

    # ========================================================
    # 행동 이벤트 처리
    # ========================================================

    def process_event(self, event):

        user_id = event.get("userId")
        event_type = event.get("event")

        if user_id is None:
            return

        print(
            f"[EVENT] "
            f"userId={user_id}, "
            f"event={event_type}"
        )

        if event_type == "FEED_VIEW":

            self.process_feed_view(event)

        elif event_type == "FEED_LIKE":

            self.process_feed_like(event)

        elif event_type == "FEED_CLICK":

            self.process_feed_click(event)

        elif event_type == "FEED_CREATE":

            self.process_feed_create(event)

        elif event_type == "FEED_UPDATE":

            self.process_feed_update(event)

        else:

            print(
                f"[UNKNOWN EVENT] "
                f"userId={user_id}, "
                f"event={event_type}"
            )

    # ========================================================
    # 피드 조회
    # ========================================================

    def process_feed_view(self, event):

        user_id = event.get("userId")
        feed_id = event.get("feedId")

        print(
            f"[FEED VIEW] "
            f"userId={user_id}, "
            f"feedId={feed_id}"
        )

        # TODO
        # 사용자 행동 데이터 저장
        # 추천 Feature 업데이트

    # ========================================================
    # 피드 좋아요
    # ========================================================

    def process_feed_like(self, event):

        user_id = event.get("userId")
        feed_id = event.get("feedId")

        print(
            f"[FEED LIKE] "
            f"userId={user_id}, "
            f"feedId={feed_id}"
        )

        # TODO
        # 좋아요 기반 Feature 업데이트

    # ========================================================
    # 피드 클릭
    # ========================================================

    def process_feed_click(self, event):

        user_id = event.get("userId")
        feed_id = event.get("feedId")

        print(
            f"[FEED CLICK] "
            f"userId={user_id}, "
            f"feedId={feed_id}"
        )

        # TODO
        # 클릭 기반 Feature 업데이트

    # ========================================================
    # 피드 생성
    # ========================================================

    def process_feed_create(self, event):

        user_id = event.get("userId")
        feed_id = event.get("feedId")

        print(
            f"[FEED CREATE] "
            f"userId={user_id}, "
            f"feedId={feed_id}"
        )

        # TODO
        # 사용자가 어떤 유형의 피드를 생성했는지
        # 추천 Feature에 반영

    # ========================================================
    # 피드 수정
    # ========================================================

    def process_feed_update(self, event):

        user_id = event.get("userId")
        feed_id = event.get("feedId")

        print(
            f"[FEED UPDATE] "
            f"userId={user_id}, "
            f"feedId={feed_id}"
        )

        # TODO
        # 피드 수정 자체는 추천 행동 점수에
        # 직접적으로 반영하지 않을 수도 있음

    # ========================================================
    # 추천
    # ========================================================

    def recommend(self, user_id):

        connection = get_connection()

        try:
            with connection.cursor() as cursor:

                category_weights = self._fetch_category_weights(
                    cursor, user_id
                )

                hashtag_weights = self._fetch_hashtag_weights(
                    cursor, user_id
                )

                region = self._fetch_region_affinity(
                    cursor, user_id
                )

                feeds = self._fetch_candidate_feeds(cursor)

                feed_hashtags = self._fetch_feed_hashtags(
                    cursor, [feed["feed_id"] for feed in feeds]
                )

        finally:
            connection.close()

        if not feeds:
            return []

        return self._score_feeds(
            feeds,
            feed_hashtags,
            category_weights,
            hashtag_weights,
            region,
        )

    # ========================================================
    # 사용자 관심 카테고리 가중치 조회
    # ========================================================

    def _fetch_category_weights(self, cursor, user_id):

        cursor.execute(
            "SELECT category, weight FROM user_interest_category "
            "WHERE user_id = %s",
            (user_id,),
        )

        return {row["category"]: row["weight"] for row in cursor.fetchall()}

    # ========================================================
    # 사용자 관심 해시태그 가중치 조회
    # ========================================================

    def _fetch_hashtag_weights(self, cursor, user_id):

        cursor.execute(
            "SELECT hashtag, weight FROM user_interest_hashtag "
            "WHERE user_id = %s",
            (user_id,),
        )

        return {row["hashtag"]: row["weight"] for row in cursor.fetchall()}

    # ========================================================
    # 사용자 지역 선호도(위경도) 조회
    # ========================================================

    def _fetch_region_affinity(self, cursor, user_id):

        cursor.execute(
            "SELECT lat, lng, weight FROM user_region_affinity "
            "WHERE user_id = %s",
            (user_id,),
        )

        return cursor.fetchone()

    # ========================================================
    # 추천 후보 피드 + 장소 정보 조회
    # ========================================================

    def _fetch_candidate_feeds(self, cursor):

        cursor.execute(
            "SELECT fp.id AS feed_id, fp.popularity_score, "
            "fp.created_at, p.category, p.lat, p.lng "
            "FROM feed_post fp "
            "JOIN place p ON p.id = fp.place_id"
        )

        return cursor.fetchall()

    # ========================================================
    # 후보 피드들의 해시태그 조회
    # ========================================================

    def _fetch_feed_hashtags(self, cursor, feed_ids):

        if not feed_ids:
            return {}

        placeholders = ", ".join(["%s"] * len(feed_ids))

        cursor.execute(
            "SELECT fpht.feed_post_id, h.tag "
            "FROM feed_post_hashtag fpht "
            "JOIN hashtag h ON h.id = fpht.hashtag_id "
            f"WHERE fpht.feed_post_id IN ({placeholders})",
            tuple(feed_ids),
        )

        feed_hashtags = {}

        for row in cursor.fetchall():

            feed_hashtags.setdefault(row["feed_post_id"], []).append(
                row["tag"]
            )

        return feed_hashtags

    # ========================================================
    # 피드별 최종 추천 점수 계산
    # ========================================================

    def _score_feeds(
        self,
        feeds,
        feed_hashtags,
        category_weights,
        hashtag_weights,
        region,
    ):

        max_category_weight = max(
            category_weights.values(), default=0
        )

        max_hashtag_weight = max(
            hashtag_weights.values(), default=0
        )

        popularity_scores = _normalize(
            [feed["popularity_score"] for feed in feeds]
        )

        now = datetime.now(timezone.utc)

        results = []

        for feed, popularity_score in zip(feeds, popularity_scores):

            category_score = 0.0

            if max_category_weight > 0 and feed["category"] in category_weights:
                category_score = (
                    category_weights[feed["category"]] / max_category_weight
                )

            tags = feed_hashtags.get(feed["feed_id"], [])

            hashtag_score = 0.0

            if max_hashtag_weight > 0 and tags:
                hashtag_score = max(
                    hashtag_weights.get(tag, 0) / max_hashtag_weight
                    for tag in tags
                )

            region_score = 0.0

            if region and feed["lat"] is not None and feed["lng"] is not None:

                distance_km = _haversine_km(
                    region["lat"], region["lng"], feed["lat"], feed["lng"]
                )

                region_score = (1 / (1 + distance_km / 10)) * region["weight"]

            created_at = feed["created_at"]

            if created_at.tzinfo is None:
                created_at = created_at.replace(tzinfo=timezone.utc)

            days_since_created = max(
                (now - created_at).total_seconds() / 86400, 0
            )

            recency_score = math.exp(
                -days_since_created / RECENCY_HALFLIFE_DAYS
            )

            score = (
                popularity_score * WEIGHT_POPULARITY
                + category_score * WEIGHT_CATEGORY
                + hashtag_score * WEIGHT_HASHTAG
                + region_score * WEIGHT_REGION
                + recency_score * WEIGHT_RECENCY
            )

            results.append(
                {"feedId": feed["feed_id"], "score": round(score, 4)}
            )

        results.sort(key=lambda item: item["score"], reverse=True)

        return results[:RECOMMEND_LIMIT]

    # ========================================================
    # 사용자 데이터 읽기
    # ========================================================

    def _load_users(self):

        with open(
            self.USER_FILE,
            "r",
            encoding="utf-8"
        ) as file:

            return json.load(file)

    # ========================================================
    # 사용자 데이터 저장
    # ========================================================

    def _save_users(self, users):

        with open(
            self.USER_FILE,
            "w",
            encoding="utf-8"
        ) as file:

            json.dump(
                users,
                file,
                ensure_ascii=False,
                indent=2
            )