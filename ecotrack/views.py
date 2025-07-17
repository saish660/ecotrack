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
from .utils import *
from uuid import uuid4
import requests
from google import genai


@login_required
def index(request):
    if not request.user.survey_answered:
        return HttpResponseRedirect(reverse('survey'))
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


@login_required
def survey(request):
    if request.method == 'POST':
        user = request.user
        data = json.loads(request.body)
        user.user_data = data
        user.survey_answered = True
        user.carbon_footprint = calculate_personal_carbon_footprint(data)['summary']['personal_monthly_co2e_kg']
        user.sustainability_score = calculate_initial_sustainability_score(user.user_data)['initial_sustainability_score']
        user.save()
        return JsonResponse({'status': 'success', 'message': 'Survey submitted successfully'}, status=200)

    if request.user.survey_answered:
        return HttpResponseRedirect(reverse('index'))
    return render(request, "survey_form.html")


@login_required
def get_user_data(request):
    return JsonResponse({'status': 'success', 'data': {
        "username": request.user.username,
        "streak": request.user.streak,
        "carbon_footprint": request.user.carbon_footprint,
        "sustainability_score": request.user.sustainability_score,
        "habits": request.user.habits,
    }})


@login_required
def get_achievements(request):
    return JsonResponse({'status': 'success', 'data': {
        "achievements": request.user.achievements,
    }})


@login_required
def save_habit(request):
    data = json.loads(request.body)
    habit_id = uuid4()
    request.user.habits[str(habit_id.int)[:5]] = data.get('habit_text')
    request.user.save()
    return JsonResponse({'status': 'success', 'message': 'Habit saved successfully'})


@login_required
def update_habit(request):
    data = json.loads(request.body)
    habit_id = data.get('habit_id')
    habit_text = data.get('habit_text')
    request.user.habits[habit_id] = habit_text
    request.user.save()
    return JsonResponse({'status': 'success', 'message': 'Habit updated successfully'})


@login_required
def delete_habit(request):
    data = json.loads(request.body)
    habit_id = str(data.get('habit_id'))
    del request.user.habits[habit_id]
    request.user.save()
    return JsonResponse({'status': 'success', 'message': 'Habit deleted successfully'})

@login_required
def submit_questionnaire(request):
    pass



@login_required
def get_suggestions(request):
    client = genai.Client()

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents="Give me a few suggestions of habit to perform to reduce carbon footprint. Give the output in json format:{habit_title:title, description:description, expected_carbon_footprint_reduction: value}",
    )
    print(response.text)
    return JsonResponse({'status': 'success', 'data': response.text})