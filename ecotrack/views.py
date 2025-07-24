from datetime import datetime, timedelta
from django.contrib.auth.decorators import login_required
from django.shortcuts import render
from django.http import JsonResponse, HttpResponseRedirect
from django.views.decorators.csrf import csrf_protect
from django.views.decorators.http import require_http_methods
from .models import User
from django.db import IntegrityError
from django.contrib.auth import login, authenticate, logout
from django.urls import reverse
from .utils import *
from uuid import uuid4
from google import genai



def update_latest_values(user, new_value):
    if not user.last_8_footprint_measurements:
        return [new_value] * 8
    global_data_list = user.last_8_footprint_measurements
    if len(global_data_list) >= 8:
        global_data_list.pop(0) # Removes the element at index 0

    global_data_list.append(new_value)

    return global_data_list

@login_required
def index(request):
    if not request.user.survey_answered or request.user.days_since_last_survey > 7:
        if request.user.days_since_last_survey > 7:
            request.user.days_since_last_survey = 0
            request.user.save()
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
    return HttpResponseRedirect(reverse('accounts'))


@login_required
def survey(request):
    if request.method == 'POST':
        user = request.user
        data = json.loads(request.body)
        user.user_data = data
        user.survey_answered = True
        user.carbon_footprint = calculate_personal_carbon_footprint(data)['summary']['personal_monthly_co2e_kg']
        user.sustainability_score = calculate_initial_sustainability_score(user.user_data)[
            'initial_sustainability_score']
        user.last_8_footprint_measurements = update_latest_values(user, calculate_personal_carbon_footprint(data)['summary']['personal_monthly_co2e_kg'])
        user.save()
        return JsonResponse({'status': 'success', 'message': 'Survey submitted successfully'}, status=200)

    if request.user.survey_answered:
        return HttpResponseRedirect(reverse('index'))
    return render(request, "survey_form.html")


@login_required
def get_user_data(request):
    if request.user.last_checkin < datetime.now().date():
        request.user.habits_today = 0
        request.user.save()

    return JsonResponse({'status': 'success', 'data': {
        "username": request.user.username,
        "streak": request.user.streak,
        "carbon_footprint": request.user.carbon_footprint,
        "sustainability_score": request.user.sustainability_score,
        "habits": request.user.habits,
        "last_checkin_date": request.user.last_checkin,
        "habits_today": request.user.habits_today,
        "achievements": request.user.achievements,
        "last_8_footprints": request.user.last_8_footprint_measurements,
    }})


@login_required
def save_habit(request):
    data = json.loads(request.body)
    habit_id = uuid4()
    habit = {
        "id": str(habit_id.int)[:5],
        "text": data.get('habit_text')
    }
    request.user.habits.append(habit)
    request.user.save()
    return JsonResponse({'status': 'success', 'message': 'Habit saved successfully'})


@login_required
def update_habit(request):
    data = json.loads(request.body)
    habit_id_to_update = str(data.get('habit_id'))  # This is the 'id' within the habit dictionary
    new_habit_text = data.get('habit_text')

    # Find the habit by its 'id' in the list
    found = False
    for habit in request.user.habits:
        if habit.get('id') == habit_id_to_update:
            habit['text'] = new_habit_text
            found = True
            break  # Exit loop once the habit is found and updated

    if found:
        request.user.save()  # Save the user object to persist changes to the habits list
        return JsonResponse({'status': 'success', 'message': 'Habit updated successfully'})
    else:
        return JsonResponse({'status': 'error', 'message': 'Habit not found'}, status=500)


@login_required
def delete_habit(request):
    data = json.loads(request.body)
    habit_id_to_delete = str(data.get('habit_id'))  # Ensure it's a string for comparison

    # Create a new list excluding the habit to be deleted
    # This is a common and safe way to remove items from a list while iterating
    initial_habits_count = len(request.user.habits)
    request.user.habits = [
        habit for habit in request.user.habits
        if habit.get('id') != habit_id_to_delete
    ]

    if len(request.user.habits) < initial_habits_count:
        request.user.save()  # Save changes if a habit was actually removed
        return JsonResponse({'status': 'success', 'message': 'Habit deleted successfully'})
    else:
        return JsonResponse({'status': 'error', 'message': 'Habit not found'}, status=404)


@login_required
def get_questions(request):
    if request.method != "POST":
        return HttpResponseRedirect(reverse('index'))

    sample_questions = [
        {
            "id": "q1",
            "question": "How did you commute today?",
            "options": [
                {"text": "🚶 Walk/Cycle", "value": "Walk/Cycle"},
                {"text": "🚌 Public Transport", "value": "Public Transport"},
                {"text": "🚗 Car (single)", "value": "Car (single)"},
                {"text": "👥 Car (carpool)", "value": "Car (carpool)"},
            ],
        },
        {
            "id": "q2",
            "question": "Did you consume meat today?",
            "options": [
                {"text": "🥩 Yes", "value": "Yes"},
                {"text": "🥬 No (or Plant-based)", "value": "No"},
            ],
        },
        {
            "id": "q3",
            "question": "Did you unplug unused electronics?",
            "options": [
                {"text": "✅ Yes, all", "value": "Yes, all"},
                {"text": "⚡ Some", "value": "Some"},
                {"text": "❌ No", "value": "No"},
            ],
        },
    ]

    client = genai.Client()

    prompt = f"""
    Give me a few questions based on user's habits to access their habits which they created to reduce carbon footprint.
     **Do not include any explanations, formatting, double quotes or backticks and make sure there is atleast one question related to each habit.
      Only provide a raw RFC8259 compliant JSON array.
     ** Here is an output example: {sample_questions}
     ** Here is the list of user's habits: {request.user.habits}
    """

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt,
    )

    return JsonResponse({'status': 'success', 'data': json.loads(response.text)})

@login_required
def submit_questionnaire(request):
    if request.method != "POST":
        return HttpResponseRedirect(reverse('index'))

    data = json.loads(request.body)
    client = genai.Client()

    sample_output = {
        "score": 5
    }

    prompt = f"""
    Given data of survey conducted on a user's habits to access their habits which they created to reduce carbon footprint.
    Give each response to question a score of 1 if the response helps their goal(reduce carbon footprint) and 0 if it does not.
    Return the total score of the survey in JSON format
     **Do not include any explanations, formatting, or backticks and make sure there is atleast one question related to each habit.
      Only provide a raw RFC8259 compliant JSON array.
      ** Here is the data: {data}
     ** Here is an output example: {sample_output}
    """

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt,
    )

    score = int(json.loads(response.text)['score'])

    if score:
        request.user.sustainability_score += score
    else:
        request.user.sustainability_score += 1

    if request.user.last_checkin < (datetime.now() - timedelta(days=1)).date():
        request.user.streak = 1
    else:
        request.user.streak += 1

    request.user.last_checkin = datetime.now()
    request.user.days_since_last_survey += 1
    request.user.habits_today = score
    request.user.achievements += check_achievements(request.user)
    request.user.achievements = list(set(request.user.achievements))
    request.user.save()

    return JsonResponse({'status': 'success', 'message': 'Questionnaire submitted successfully'})


@login_required
def get_suggestions(request):
    sample_suggestions = [
        {
            "title": "Reduce Meat Consumption",
            "reason":
                "Producing meat requires significant resources. Opting for plant-based meals reduces your environmental impact.",
            "carbonReduction": "5-10 kg CO2e/month",
        },
        {
            "title": "Switch to LED Light Bulbs",
            "reason":
                "LEDs consume up to 85% less electricity than incandescent bulbs, lowering your carbon emissions and energy bills.",
            "carbonReduction": "3-5 kg CO2e/month",
        },
        {
            "title": "Compost Food Waste",
            "reason":
                "Composting diverts food from landfills, where it produces methane, a potent greenhouse gas.",
            "carbonReduction": "2-4 kg CO2e/month",
        },
    ]

    # return JsonResponse({'status': 'success', 'data': "Hello, world"})
    client = genai.Client()

    prompt = f"""
    Give me a few suggestions of habits to perform to reduce carbon footprint.
     **Do not include any explanations, formatting, or backticks. Only provide a raw RFC8259 compliant JSON array.
     ** Here is an output example: {sample_suggestions}
    """

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt,
    )

    return JsonResponse({'status': 'success', 'data': json.loads(response.text)})
