from django import forms
from phonenumber_field.formfields import SplitPhoneNumberField

from .models import Team, TeamMembers


class InternationalPhoneNumberField(SplitPhoneNumberField):
    def prefix_field(self):
        prefix_field = super().prefix_field()
        prefix_field.widget.attrs["aria-label"] = "Country code"
        return prefix_field

    def number_field(self):
        number_field = super().number_field()
        number_field.widget.attrs.update(
            {"aria-label": "Phone number", "placeholder": "Phone number"}
        )
        return number_field


class TeamDetailsForm(forms.ModelForm):
    """Page one: team information and the number of players per instrument."""

    class Meta:
        model = Team
        fields = [
            "name",
            "city",
            "performance_link",
            "drummer_count",
            "guitarist_count",
            "bassist_count",
            "vocalist_count",
        ]
        widgets = {
            "name": forms.TextInput(attrs={"placeholder": "Team Name"}),
            "city": forms.TextInput(attrs={"placeholder": "City"}),
            "performance_link": forms.URLInput(
                attrs={"placeholder": "Submission Link"}
            ),
            "drummer_count": forms.NumberInput(attrs={"min": 0}),
            "guitarist_count": forms.NumberInput(attrs={"min": 0}),
            "bassist_count": forms.NumberInput(attrs={"min": 0}),
            "vocalist_count": forms.NumberInput(attrs={"min": 0}),
        }


class TeamLeaderForm(forms.ModelForm):
    """Leader contact details shown on page two."""

    leader_phone = InternationalPhoneNumberField(region="IN")

    class Meta:
        model = Team
        fields = ["leader_name", "leader_phone", "leader_email", "leader_gender"]
        widgets = {
            "leader_name": forms.TextInput(attrs={"placeholder": "Leader Name"}),
            "leader_email": forms.EmailInput(attrs={"placeholder": "Email"}),
            "leader_gender": forms.Select(attrs={"placeholder": "Select Gender"}),
        }


class TeamMemberForm(forms.ModelForm):
    """Details for one band member; the view supplies the team relationship."""

    phone = InternationalPhoneNumberField(region="IN")

    class Meta:
        model = TeamMembers
        fields = ["name", "phone", "email", "gender", "instrument"]
        widgets = {
            "name": forms.TextInput(attrs={"placeholder": "Name"}),
            "email": forms.EmailInput(attrs={"placeholder": "Email"}),
            "gender": forms.Select(attrs={"placeholder": "Select Gender"}),
            "instrument": forms.Select(),
        }
