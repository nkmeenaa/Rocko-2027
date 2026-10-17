from django import forms
from .models import Team, TeamMembers


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

    class Meta:
        model = Team
        fields = ["leader_name", "leader_phone", "leader_email", "leader_gender"]
        widgets = {
            "leader_name": forms.TextInput(attrs={"placeholder": "Leader Name"}),
            "leader_phone": forms.TelInput(attrs={"placeholder": "Phone Number"}),
            "leader_email": forms.EmailInput(attrs={"placeholder": "Email"}),
            "leader_gender": forms.Select(attrs={"placeholder": "Select Gender"}),
        }


class TeamMemberForm(forms.ModelForm):
    """Details for one band member; the view supplies the team relationship."""

    class Meta:
        model = TeamMembers
        fields = ["name", "phone", "email", "gender", "instrument"]
        widgets = {
            "name": forms.TextInput(attrs={"placeholder": "Name"}),
            "phone": forms.TelInput(attrs={"placeholder": "Phone Number"}),
            "email": forms.EmailInput(attrs={"placeholder": "Email"}),
            "gender": forms.Select(attrs={"placeholder": "Select Gender"}),
            "instrument": forms.Select(),
        }
