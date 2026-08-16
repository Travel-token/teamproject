import json
import os


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

        # ====================================================
        # TODO
        # 여기에서 실제 추천 알고리즘 실행
        #
        # result = recommendation_algorithm(user_id)
        # ====================================================

        return [
            {
                "feedId": 381,
                "score": 0.95
            },
            {
                "feedId": 102,
                "score": 0.91
            },
            {
                "feedId": 205,
                "score": 0.87
            }
        ]

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