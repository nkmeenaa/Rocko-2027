from django.test import TestCase
from django.urls import reverse

from .models import Team


class MemberDetailsViewTests(TestCase):
    def test_deleted_incomplete_member_is_not_saved(self):
        session = self.client.session
        session["team_registration"] = {
            "name": "Test Band",
            "city": "Test City",
            "performance_link": "",
            "drummer_count": 2,
            "guitarist_count": 0,
            "bassist_count": 0,
            "vocalist_count": 0,
        }
        session.save()

        response = self.client.post(
            reverse("member_details"),
            {
                "leader_name": "Test Leader",
                "leader_phone": "9876543210",
                "leader_email": "leader@example.com",
                "leader_gender": "M",
                "members-TOTAL_FORMS": "2",
                "members-INITIAL_FORMS": "0",
                "members-MIN_NUM_FORMS": "0",
                "members-MAX_NUM_FORMS": "100",
                "members-0-name": "Active Member",
                "members-0-phone": "9876543211",
                "members-0-email": "member@example.com",
                "members-0-gender": "male",
                "members-0-instrument": "drummer",
                "members-1-DELETE": "on",
            },
        )

        self.assertTemplateUsed(response, "server/registration_success.html")
        self.assertEqual(Team.objects.count(), 1)
        team = Team.objects.get()
        self.assertEqual(team.drummer_count, 1)
        self.assertEqual(team.members.count(), 1)
        self.assertEqual(team.members.get().name, "Active Member")
