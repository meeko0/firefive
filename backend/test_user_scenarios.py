import os
import tempfile
import unittest


class UserScenarioTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.database_path = tempfile.mktemp(
            prefix="pantherden-scenarios-",
            suffix=".db",
        )
        os.environ["DATABASE_URL"] = f"sqlite:///{cls.database_path}"

        from app import create_app

        cls.app = create_app()
        cls.app.testing = True
        cls.client = cls.app.test_client()

    @classmethod
    def tearDownClass(cls):
        if os.path.exists(cls.database_path):
            os.remove(cls.database_path)

    def setUp(self):
        from app.database import db
        from app.models.favorite import Favorite
        from app.models.review import Review
        from app.models.user import User

        with self.app.app_context():
            Favorite.query.delete()
            Review.query.delete()
            User.query.delete()
            db.session.commit()

    # Scenario 1:
    # A student searches for an apartment with at least two
    # bedrooms and parking.
    def test_student_searches_and_filters_properties(self):
        response = self.client.get(
            "/api/listings"
            "?search=Lofts"
            "&type=apartment"
            "&bedrooms=2"
            "&amenity=Parking"
        )

        self.assertEqual(response.status_code, 200)

        results = response.get_json()

        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]["name"], "The Lofts at GSU")
        self.assertGreaterEqual(results[0]["bedrooms"], 2)
        self.assertIn("Parking", results[0]["amenities"])


if __name__ == "__main__":
    unittest.main()
