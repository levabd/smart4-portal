from django import forms

from .models import Feedback


class FeedbackForm(forms.ModelForm):
    question = forms.CharField(
        widget=forms.Textarea(attrs={'class': 'form-control', 'rows': 4}))

    class Meta:
        model = Feedback
        fields = ['question']

