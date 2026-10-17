from django.db import transaction
from django.forms import formset_factory
from django.shortcuts import redirect, render

from .forms import TeamDetailsForm, TeamLeaderForm, TeamMemberForm
from .models import Team, TeamMembers


TeamMemberFormSet = formset_factory(
    TeamMemberForm,
    extra=0,
    can_delete=True,
    max_num=100,
    validate_max=True,
)

COUNT_FIELDS = {
    "drummer": "drummer_count",
    "guitarist": "guitarist_count",
    "bassist": "bassist_count",
    "vocalist": "vocalist_count",
}


def register_team(request):
    if request.method == "POST":
        form = TeamDetailsForm(request.POST)
        if form.is_valid():
            request.session["team_registration"] = form.cleaned_data
            return redirect("member_details")
    else:
        form = TeamDetailsForm()

    return render(request, "server/register_team.html", {"form": form})


def member_details(request):
    team_data = request.session.get("team_registration")
    if not team_data:
        return redirect("register_team")

    initial_members = [
        {"instrument": instrument}
        for instrument, count_field in COUNT_FIELDS.items()
        for _ in range(int(team_data.get(count_field, 0)))
    ]

    if request.method == "POST":
        leader_form = TeamLeaderForm(request.POST)
        member_formset = TeamMemberFormSet(request.POST, prefix="members")
        if leader_form.is_valid() and member_formset.is_valid():
            active_members = [
                form.cleaned_data
                for form in member_formset
                if form.cleaned_data and not form.cleaned_data.get("DELETE", False)
            ]

            with transaction.atomic():
                team = Team(**team_data, **leader_form.cleaned_data)
                for instrument, count_field in COUNT_FIELDS.items():
                    setattr(
                        team,
                        count_field,
                        sum(member["instrument"] == instrument for member in active_members),
                    )
                team.save()

                TeamMembers.objects.bulk_create(
                    [
                        TeamMembers(
                            team=team,
                            **{
                                key: value
                                for key, value in member.items()
                                if key != "DELETE"
                            },
                        )
                        for member in active_members
                    ]
                )

            request.session.pop("team_registration", None)
            return render(request, "server/registration_success.html", {"team": team})
    else:
        leader_form = TeamLeaderForm()
        member_formset = TeamMemberFormSet(
            prefix="members",
            initial=initial_members,
        )

    return render(
        request,
        "server/member_details.html",
        {
            "leader_form": leader_form,
            "member_formset": member_formset,
        },
    )
