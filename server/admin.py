from django.contrib import admin

from .models import Team, TeamMembers


class TeamMemberInline(admin.TabularInline):
    model = TeamMembers
    extra = 0
    fields = ("name", "instrument", "gender", "phone", "email")


@admin.register(Team)
class TeamAdmin(admin.ModelAdmin):
    list_display = ("name", "city", "leader_name", "leader_email", "member_total")
    search_fields = ("name", "city", "leader_name", "leader_email")
    ordering = ("name",)
    inlines = (TeamMemberInline,)
    fieldsets = (
        ("Team details", {"fields": ("name", "city", "performance_link")}),
        (
            "Team leader",
            {"fields": ("leader_name", "leader_phone", "leader_email", "leader_gender")},
        ),
        (
            "Instrument counts",
            {
                "fields": (
                    "drummer_count",
                    "guitarist_count",
                    "bassist_count",
                    "vocalist_count",
                )
            },
        ),
    )

    @admin.display(description="Members")
    def member_total(self, obj):
        return obj.members.count()


@admin.register(TeamMembers)
class TeamMembersAdmin(admin.ModelAdmin):
    list_display = ("name", "team", "instrument", "gender", "phone", "email")
    list_filter = ("instrument", "gender")
    search_fields = ("name", "phone", "email", "team__name")
    autocomplete_fields = ("team",)
    list_select_related = ("team",)
