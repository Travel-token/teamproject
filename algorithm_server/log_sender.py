import json
import os
import requests


LOG_DIRECTORY = "../user_back/logs"

PYTHON_SERVER_URL = "http://localhost:5050"


print(os.path.abspath(LOG_DIRECTORY))


def send_log_file(file_path):

    print(f"[LOG SEND] {file_path}")

    logs = []

    with open(
        file_path,
        "r",
        encoding="utf-8"
    ) as file:

        for line in file:

            line = line.strip()

            if not line:
                continue

            try:
                event = json.loads(line)
                logs.append(event)

            except json.JSONDecodeError:
                print(f"[INVALID LOG] {line}")

    if not logs:
        print("[LOG SEND] No logs")
        return

    response = requests.post(
        f"{PYTHON_SERVER_URL}/recommend/logs",
        json={
            "logs": logs
        },
        timeout=10
    )

    response.raise_for_status()

    print(
        f"[LOG SEND COMPLETE] "
        f"count={len(logs)}"
    )


def send_all_logs():

    if not os.path.exists(LOG_DIRECTORY):

        print(
            f"[ERROR] Log directory not found: "
            f"{os.path.abspath(LOG_DIRECTORY)}"
        )

        return

    files = sorted(
        os.listdir(LOG_DIRECTORY)
    )

    for file_name in files:

        if not file_name.endswith(".log"):
            continue

        file_path = os.path.join(
            LOG_DIRECTORY,
            file_name
        )

        send_log_file(file_path)


if __name__ == "__main__":
    send_all_logs()