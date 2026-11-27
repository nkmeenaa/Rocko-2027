from django.test import TestCase
from django.urls import reverse

from .models import Team, TeamMembers


class AddedTeamMemberSubmissionTests(TestCase):
    def test_added_member_can_select_and_submit_an_instrument(self):
        response = self.client.post(
            reverse("register_team"),
            {
                "name": "Test Band",
                "city": "Test City",
                "performance_link": "",
                "drummer_count": 0,
                "guitarist_count": 0,
                "bassist_count": 0,
                "vocalist_count": 0,
            },
        )
        self.assertRedirects(response, reverse("member_details"))

        response = self.client.get(reverse("member_details"))
        self.assertContains(response, 'name="members-__prefix__-instrument"')
        self.assertContains(response, "Select instrument")
        self.assertNotContains(response, "instrument-field")

        response = self.client.post(
            reverse("member_details"),
            {
                "leader_name": "Test Leader",
                "leader_phone_0": "IN",
                "leader_phone_1": "8123456789",
                "leader_email": "leader@example.com",
                "leader_gender": "M",
                "members-TOTAL_FORMS": "1",
                "members-INITIAL_FORMS": "0",
                "members-MIN_NUM_FORMS": "0",
                "members-MAX_NUM_FORMS": "100",
                "members-0-name": "New Artist",
                "members-0-phone_0": "IN",
                "members-0-phone_1": "8123456788",
                "members-0-email": "artist@example.com",
                "members-0-gender": "female",
                "members-0-instrument": "guitarist",
            },
        )

        self.assertContains(response, "Registration submitted")
        member = TeamMembers.objects.get(name="New Artist")
        self.assertEqual(member.instrument, TeamMembers.Instrument.GUITARIST)
        team = Team.objects.get(name="Test Band")
        self.assertEqual(team.guitarist_count, 1)
