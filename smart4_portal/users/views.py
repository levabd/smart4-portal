# -*- coding: utf-8 -*-
from __future__ import absolute_import, unicode_literals

from django.shortcuts import redirect, render
from django.core.urlresolvers import reverse
from django.contrib import messages
from django.contrib.messages.views import SuccessMessageMixin
from django.views.generic import DetailView, ListView, RedirectView, \
    UpdateView, CreateView

from django.contrib.auth.mixins import LoginRequiredMixin

from .models import User
from .models import Feedback
from .forms import FeedbackForm


class UserFeedback(LoginRequiredMixin, SuccessMessageMixin, CreateView):
    #success_message = 'Thanks for contacting us, we will get back to you
    # shortly.'

    def feedback(request):
        if request.method == "POST":
            form = FeedbackForm(request.POST)
            if form.is_valid():
                feedback = form.save(commit=False)
                feedback.user = request.user
                feedback.save()

                messages.success(request, '')

            return reverse('comunity')
            #return reverse('users:detail',
            #                kwargs={'username': request.user.username})
            # 'email': request.user.email,

        else:
            form = FeedbackForm()#

        return render(request, 'users/user_feedback.html', {
            'user': request.user.name,
            'form': form
        })

class UserDetailView(LoginRequiredMixin, DetailView):
    model = User
    slug_field = 'username'
    slug_url_kwarg = 'username'


class UserRedirectView(LoginRequiredMixin, RedirectView):
    permanent = False

    def get_redirect_url(self):
        return reverse('users:detail',
                       kwargs={'username': self.request.user.username})


class UserUpdateView(LoginRequiredMixin, UpdateView):

    fields = ['name', ]

    model = User

    # send the user back to their own page after a successful update
    def get_success_url(self):
        return reverse('users:detail',
                       kwargs={'username': self.request.user.username})

    def get_object(self):
        # Only get the User record for the user making the request
        return User.objects.get(username=self.request.user.username)


class UserListView(LoginRequiredMixin, ListView):
    model = User

    slug_field = 'username'
    slug_url_kwarg = 'username'
