import json
import os

# 넘어온 로그 데이터 json으로 파싱 -> 추천에 전달
from recommendation_service import RecommendationService


# ============================================================
# Spring Boot에서 생성되는 행동 로그 디렉터리
#
# 개발 환경에서는 Spring 프로젝트의 로그 폴더를
# Python 서버가 직접 읽는 방식으로 사용할 수 있음.
#
# ../spring_server/logs/behavior/
#
# ├── behavior.log
# ├── behavior.2026-08-09.0.log
# ├── behavior.2026-08-09.1.log
# └── ...
# ============================================================

LOG_DIRECTORY = "../spring_server/logs/behavior"


# 추천 데이터 처리 객체 생성
recommendation_service = RecommendationService()


# ============================================================
# 로그 파일 하나를 읽어서 처리
# ============================================================

def process_log_file(file_path):

    # 현재 어떤 로그 파일을 처리하고 있는지 출력
    print(f"[LOG PROCESS] {file_path}")


    # 로그 파일을 UTF-8로 읽기 모드로 열기
    with open(
        file_path,
        "r",
        encoding="utf-8"
    ) as file:


        # 로그 파일을 한 줄씩 읽음
        #
        # 로그가 100MB라고 해서
        # 파일 전체를 메모리에 올리지 않고
        # 한 줄씩 처리할 수 있음.
        #
        for line in file:

            # 줄바꿈 제거
            line = line.strip()


            # 빈 줄이면 처리하지 않음
            if not line:
                continue


            try:

                # Spring에서 JSON 형태로 기록한 로그를
                # Python Dictionary로 변환
                #
                # 예:
                #
                # {"userId":15,
                #  "event":"FEED_VIEW",
                #  "feedId":381}
                #
                # ↓
                #
                # {
                #     "userId": 15,
                #     "event": "FEED_VIEW",
                #     "feedId": 381
                # }
                event = json.loads(line)


                # 파싱된 행동 데이터를
                # 추천 서비스에 전달
                recommendation_service.process_event(
                    event
                )


            except json.JSONDecodeError:

                # JSON 형식이 깨진 로그가 있으면
                # 해당 로그만 건너뜀
                #
                # 전체 로그 처리를 중단하지 않는 것이 중요함.
                print(
                    f"[INVALID LOG] {line}"
                )


# ============================================================
# 로그 디렉터리 안의 모든 로그 파일 처리
# ============================================================

def process_all_logs():

    # 로그 디렉터리가 존재하는지 확인
    if not os.path.exists(LOG_DIRECTORY):

        print(
            f"[ERROR] Log directory not found: "
            f"{LOG_DIRECTORY}"
        )

        return


    # 로그 디렉터리 안의 파일 목록 가져오기
    files = sorted(
        os.listdir(LOG_DIRECTORY)
    )


    # 파일을 하나씩 확인
    for file_name in files:

        # .log 파일만 처리
        #
        # 현재는:
        # behavior.log
        #
        # 만 처리하고,
        #
        # behavior.txt
        # behavior.tmp
        #
        # 같은 파일은 무시함.
        if not file_name.endswith(".log"):
            continue


        # 디렉터리 경로 + 파일 이름 결합
        #
        # 예:
        #
        # ../spring_server/logs/behavior
        #
        # +
        #
        # behavior.log
        #
        # ↓
        #
        # ../spring_server/logs/behavior/behavior.log
        file_path = os.path.join(
            LOG_DIRECTORY,
            file_name
        )


        # 로그 파일 하나 처리
        process_log_file(file_path)


# ============================================================
# Python 파일을 직접 실행했을 때만 실행
# ============================================================

if __name__ == "__main__":

    # 전체 로그 처리 시작
    process_all_logs()