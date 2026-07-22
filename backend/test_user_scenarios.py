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

    def create_verified_student(self, email):
        signup = self.client.post(
            "/api/auth/signup",
            json={
                "name": "Test Student",
                "email": email,
                "password": "panther123",
            },
        )
        self.assertEqual(signup.status_code, 201)

        verification = self.client.post(
            "/api/auth/verify",
            json={"token": signup.get_json()["verificationToken"]},
        )
        self.assertEqual(verification.status_code, 200)
        return verification.get_json()["token"]

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

    # Scenario 2:
    # A student creates an account with a university email, verifies the
    # account, and logs in with the same credentials.
    def test_student_signs_up_verifies_and_logs_in(self):
        token = self.create_verified_student("login.student@gsu.edu")
        self.assertTrue(token)

        login = self.client.post(
            "/api/auth/login",
            json={
                "email": "login.student@gsu.edu",
                "password": "panther123",
            },
        )

        self.assertEqual(login.status_code, 200)
        self.assertEqual(
            login.get_json()["user"]["email"],
            "login.student@gsu.edu",
        )
        self.assertTrue(login.get_json()["user"]["isVerified"])

    # Scenario 3:
    # A logged-in student selects a property, saves it as a favorite,
    # and views it in the saved-property list.
    def test_student_saves_and_views_a_favorite_property(self):
        token = self.create_verified_student("favorite.student@gsu.edu")
        headers = {"Authorization": f"Bearer {token}"}

        saved = self.client.post("/api/favorites/1", headers=headers)
        favorites = self.client.get("/api/favorites", headers=headers)

        self.assertEqual(saved.status_code, 201)
        self.assertEqual(favorites.status_code, 200)
        self.assertEqual(len(favorites.get_json()), 1)
        self.assertEqual(favorites.get_json()[0]["id"], 1)

    # Scenario 4:
    # A verified student opens a property and submits a detailed review
    # with overall, safety, and maintenance ratings.
    def test_verified_student_submits_a_property_review(self):
        token = self.create_verified_student("review.student@gsu.edu")
        headers = {"Authorization": f"Bearer {token}"}

        response = self.client.post(
            "/api/reviews",
            headers=headers,
            json={
                "listingId": 1,
                "title": "Convenient place near campus",
                "reviewText": (
                    "The apartment was close to my classes, and maintenance "
                    "responded quickly whenever I submitted a request."
                ),
                "rating": 4,
                "safetyRating": 4,
                "maintenanceRating": 5,
                "moveInDate": "2025-08-01",
            },
        )

        self.assertEqual(response.status_code, 201)
        review = response.get_json()["review"]
        self.assertEqual(review["title"], "Convenient place near campus")
        self.assertEqual(review["status"], "pending")
        self.assertEqual(review["rating"], 4)


if __name__ == "__main__":
    unittest.main()
