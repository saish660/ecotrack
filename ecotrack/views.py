from django.contrib.auth.decorators import login_required
from django.shortcuts import render
from django.http import JsonResponse, HttpResponseRedirect
from django.views.decorators.csrf import csrf_protect
from django.views.decorators.http import require_http_methods
import json
from .models import User
from django.db import IntegrityError
from django.contrib.auth import login, authenticate, logout
from django.urls import reverse

# Create your views here.
@login_required
def index(request):
    return render(request, "index.html")


def accounts(request):
    return render(request, "accounts.html")


@csrf_protect
@require_http_methods(["POST"])
def signup(request):
    try:
        data = json.loads(request.body)
        email = data.get('email')
        password = data.get('password')

        if not email or not password:
            return JsonResponse({
                'status': 'error',
                'message': 'Email and password are required'
            }, status=400)

        username = email.split('@')[0]

        try:
            user = User.objects.create_user(
                username=username,
                email=email,
                password=password
            )

            user.sustainability_score = 0
            user.carbon_footprint = 0
            user.streak = 0
            user.survey_answered = False
            user.save()

            login(request, user)

            # The view now returns a simple success status.
            # The redirect logic is handled entirely by the frontend.
            return JsonResponse({
                'status': 'success',
                'message': 'User created successfully'
            })

        except IntegrityError:
            return JsonResponse({
                'status': 'error',
                'message': 'A user with this email already exists'
            }, status=400)

    except json.JSONDecodeError:
        return JsonResponse({
            'status': 'error',
            'message': 'Invalid JSON data'
        }, status=400)
    except Exception as e:
        return JsonResponse({
            'status': 'error',
            'message': str(e)
        }, status=500)


@csrf_protect
@require_http_methods(["POST"])
def login_view(request):
    try:
        data = json.loads(request.body)
        email = data.get('email')
        password = data.get('password')

        if not email or not password:
            return JsonResponse({'status': 'error', 'message': 'Email and password are required'}, status=400)

        # Since you use email to log in, we first find the user by their email
        # to get their username, which is what Django's authenticate function uses.
        try:
            user_obj = User.objects.get(email=email)
            user = authenticate(request, username=user_obj.username, password=password)
        except User.DoesNotExist:
            user = None

        if user is not None:
            login(request, user)
            return JsonResponse({
                'status': 'success',
                'message': 'Logged in successfully',
                'redirect_url': reverse('index')  # Redirect to the main page on success
            })
        else:
            return JsonResponse({'status': 'error', 'message': 'Invalid email or password'}, status=401)

    except json.JSONDecodeError:
        return JsonResponse({'status': 'error', 'message': 'Invalid JSON data'}, status=400)
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)}, status=500)


@login_required
def logout_view(request):
    logout(request)
    return JsonResponse({
        'status': 'success',
        'message': 'You have been logged out.',
        'redirect_url': reverse('accounts')  # Redirect to the login page after logout
    })


def survey(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        content = data.get('body')
        print(content)

    if request.user.survey_answered:
        return HttpResponseRedirect(reverse('index'))
    return render(request, "survey_form.html")