from django.db import connection
from django.test import SimpleTestCase, TestCase

from .forms import TeamLeaderForm, TeamMemberForm
from .models import Team


class InternationalPhoneNumberFormTests(SimpleTestCase):
    def test_country_selector_includes_countries_beyond_the_region_examples(self):
        country_choices = dict(
            TeamLeaderForm().fields["leader_phone"].prefix_field().choices
        )

        self.assertIn("US", country_choices)
        self.assertIn("BT", country_choices)

    def test_leader_form_accepts_a_number_from_another_country(self):
        form = TeamLeaderForm(
            data={
                "leader_name": "Test Leader",
                "leader_phone_0": "US",
                "leader_phone_1": "6502530000",
                "leader_email": "leader@example.com",
                "leader_gender": "M",
            }
        )

        self.assertTrue(form.is_valid(), form.errors)
        self.assertEqual(form.cleaned_data["leader_phone"].as_e164, "+16502530000")

    def test_leader_form_accepts_indian_nepali_and_bhutanese_numbers(self):
        examples = [
            ("IN", "8123456789", "+918123456789"),
            ("NP", "9841234567", "+9779841234567"),
            ("BT", "17123456", "+97517123456"),
        ]

        for country, local_number, expected_e164 in examples:
            with self.subTest(country=country):
                form = TeamLeaderForm(
                    data={
                        "leader_name": "Test Leader",
                        "leader_phone_0": country,
                        "leader_phone_1": local_number,
                        "leader_email": "leader@example.com",
                        "leader_gender": "M",
                    }
                )

                self.assertTrue(form.is_valid(), form.errors)
                self.assertEqual(
                    form.cleaned_data["leader_phone"].as_e164, expected_e164
                )

    def test_member_form_rejects_invalid_phone_number(self):
        form = TeamMemberForm(
            data={
                "name": "Test Member",
                "phone_0": "NP",
                "phone_1": "123",
                "email": "member@example.com",
                "gender": "male",
                "instrument": "drummer",
            }
        )

        self.assertFalse(form.is_valid())
        self.assertIn("phone", form.errors)


class PhoneNumberStorageTests(TestCase):
    def test_phone_number_is_stored_in_e164_format(self):
        team = Team.objects.create(
            name="Test Band",
            city="Test City",
            leader_name="Test Leader",
            leader_phone="+9779841234567",
            leader_email="leader@example.com",
            leader_gender="M",
        )
        table_name = connection.ops.quote_name(Team._meta.db_table)

        with connection.cursor() as cursor:
            cursor.execute(
                f"SELECT leader_phone FROM {table_name} WHERE id = %s",
                [team.pk],
            )
            stored_phone = cursor.fetchone()[0]

        self.assertEqual(stored_phone, "+9779841234567")
