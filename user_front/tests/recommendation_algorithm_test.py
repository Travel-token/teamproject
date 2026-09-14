import tempfile
import unittest
from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).resolve().parents[2] / "algorithm_server"))
from recommendation_service import RecommendationService


class RecommendationAlgorithmTest(unittest.TestCase):
    def test_region_and_category_events_change_ranking(self):
        with tempfile.TemporaryDirectory() as directory:
            service = RecommendationService(directory)
            for _ in range(2):
                self.assertTrue(service.process_event({
                    "userId": 7, "event": "FEED_LIKE", "feedId": 10,
                    "category": "heritage", "region": "서울특별시 종로구",
                }))
            ranked = service.recommend(7, [
                {"feedId": 20, "popularity": 0, "category": "food", "region": "부산광역시 해운대구"},
                {"feedId": 21, "popularity": 0, "category": "heritage", "region": "서울특별시 종로구"},
            ])
            self.assertEqual(21, ranked[0]["feedId"])
            self.assertGreater(ranked[0]["score"], ranked[1]["score"])

    def test_current_administrative_region_is_applied_without_coordinates(self):
        with tempfile.TemporaryDirectory() as directory:
            service = RecommendationService(directory)
            ranked = service.recommend(8, [
                {"feedId": 30, "popularity": 0, "category": "food", "region": "부산광역시 해운대구"},
                {"feedId": 31, "popularity": 0, "category": "food", "region": "서울특별시 종로구"},
            ], current_region="서울특별시 종로구")
            self.assertEqual(31, ranked[0]["feedId"])


if __name__ == "__main__":
    unittest.main()
