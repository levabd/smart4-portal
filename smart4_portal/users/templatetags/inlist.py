# -*- coding: utf-8 -*-
from django import template

register = template.Library()

@register.filter
def InList(value, list_):
  return value in list_.split(',')
