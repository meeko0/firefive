import os
import tempfile
import unittest


class RequirementsLifecycleTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.database_path = tempfile.mktemp(prefix="pantherden-test-", suffix=".db")
        os.environ["DATABASE_URL"] = f"sqlite:///{cls.database_path}"
        from app import create_app
        cls.app = create_app()
        cls.app.testing = True
        cls.client = cls.app.test_client()

    @classmethod
    def tearDownClass(cls):
        if os.path.exists(cls.database_path):
            os.remove(cls.database_path)

    def test_complete_student_and_admin_lifecycle(self):
        signup = self.client.post("/api/auth/signup", json={"name": "Student User", "email": "student@gsu.edu", "password": "testing123"})
        self.assertEqual(signup.status_code, 201)
        verify = self.client.post("/api/auth/verify", json={"token": signup.get_json()["verificationToken"]})
        self.assertEqual(verify.status_code, 200)
        headers = {"Authorization": f"Bearer {verify.get_json()['token']}"}

        results = self.client.get("/api/listings?search=Lofts&amenity=Parking").get_json()
        self.assertEqual(len(results), 1)
        self.assertEqual(self.client.post("/api/favorites/1", headers=headers).status_code, 201)
        self.assertEqual(len(self.client.get("/api/favorites", headers=headers).get_json()), 1)

        review = self.client.post("/api/reviews", headers=headers, json={
            "listingId": 1, "title": "A helpful student review",
            "reviewText": "This is a detailed review with more than fifty characters about living here near campus.",
            "rating": 5, "safetyRating": 4, "maintenanceRating": 4, "moveInDate": "2025-08-01",
        })
        self.assertEqual(review.status_code, 201)

        from app.database import db
        from app.models.user import User
        from app.routes.auth import create_token
        with self.app.app_context():
            student = User.query.filter_by(email="student@gsu.edu").first()
            moderator = User(name="Moderator", email="moderator@gsu.edu", password_hash=student.password_hash, is_verified=True, is_moderator=True)
            db.session.add(moderator)
            db.session.commit()
            moderator_token = create_token(moderator)
        moderator_headers = {"Authorization": f"Bearer {moderator_token}"}
        dashboard = self.client.get("/api/admin/dashboard", headers=moderator_headers)
        self.assertEqual(dashboard.status_code, 200)
        self.assertTrue(any(user["role"] == "moderator" for user in dashboard.get_json()["users"]))
        review_id = dashboard.get_json()["pendingReviews"][0]["id"]
        self.assertEqual(self.client.patch(f"/api/admin/reviews/{review_id}", headers=moderator_headers, json={"status": "approved"}).status_code, 200)
        property_response = self.client.post("/api/admin/properties", headers=moderator_headers, json={"name": "Moderator Added Housing", "address": "1 GSU Plaza", "type": "apartment", "bedrooms": 2, "amenities": ["Parking"]})
        self.assertEqual(property_response.status_code, 201)
        property_id = property_response.get_json()["listing"]["id"]
        update_response = self.client.patch(f"/api/admin/properties/{property_id}", headers=moderator_headers, json={"bedrooms": 3, "rentMin": 975, "amenities": ["Parking", "Laundry"]})
        self.assertEqual(update_response.status_code, 200)
        self.assertEqual(update_response.get_json()["listing"]["bedrooms"], 3)
        self.assertEqual(len(self.client.get("/api/reviews?sort=highest").get_json()), 1)
        detail = self.client.get("/api/listings/1?sort=highest").get_json()
        self.assertEqual(len(detail["reviews"]), 1)
        self.assertEqual(detail["averageSafetyRating"], 4.0)
        self.assertEqual(self.client.get("/api/auth/profile", headers=headers).get_json()["reviews"][0]["status"], "approved")
        self.assertEqual(self.client.delete("/api/auth/profile", headers=headers).status_code, 204)


if __name__ == "__main__":
    unittest.main()
