from django.db import models
from django.core.validators import RegexValidator, MinValueValidator,EmailValidator
from django.utils import timezone
# Create your models here.
#Nitin's Code
GENDER_CHOICES = [
  ('M' , 'Male'),
  ('F' , 'Female'),
  ('O' , 'Other')
]

ROLE_CHOICES = [
    ('Drummer', 'Drummer'),
    ('Guitarist', 'Guitarist'),
    ('Bassist', 'Bassist'),
    ('Vocalist', 'Vocalist'),
    ('Other', 'Other'),
]
phone_validator = RegexValidator(
    regex=r'^[6-9]\d{9}$',
    message='Enter a valid 10-digit mobile number.',
)
email_validator = EmailValidator(
    message='Enter a valid email address.',
)
class Team(models.Model):
  name = models.CharField(max_length=120)
  city = models.CharField(max_length=80)
  performance_link = models.URLField(blank=True, null=True)

  leader_name = models.CharField(max_length=100)
  leader_phone = models.CharField(
    max_length=10,
    validators=[phone_validator],
    )
  leader_email = models.EmailField(validators=[email_validator])
  leader_gender = models.CharField(max_length=1, choices=GENDER_CHOICES)

  # Counts selected on page one
  drummer_count = models.PositiveSmallIntegerField(default=0)
  guitarist_count = models.PositiveSmallIntegerField(default=0)
  bassist_count = models.PositiveSmallIntegerField(default=0)
  vocalist_count = models.PositiveSmallIntegerField(default=0)

  
  def __str__(self):
    return self.name



class TeamMembers(models.Model):
    class Instrument(models.TextChoices):
      DRUMMER = "drummer", "Drummer"
      GUITARIST = "guitarist", "Guitarist"
      BASSIST = "bassist", "Bassist"
      VOCALIST = "vocalist", "Vocalist"
    class Gender(models.TextChoices):
      MALE = "male", "Male"
      FEMALE = "female", "Female"
      OTHER = "other", "Other"

    team = models.ForeignKey(
      Team,
      on_delete = models.CASCADE,
      related_name = "members",
    )
    name = models.CharField(max_length=100)
    phone = models.CharField(max_length=10, validators=[phone_validator])
    email = models.EmailField(validators=[email_validator])
    gender = models.CharField(max_length=20, choices=Gender.choices)
    instrument = models.CharField(max_length=10, choices=Instrument.choices)

    def __str__(self):
        return f"{self.name} — {self.get_instrument_display()}"

   
