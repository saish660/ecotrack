function getCsrfToken() {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, 'csrftoken'.length + 1) === ('csrftoken=')) {
                cookieValue = decodeURIComponent(cookie.substring('csrftoken'.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

// API Service Class
class EcoTrackAPI {
    async getDashboardData() {
        let userdata;

        await fetch("get_user_data", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCsrfToken(),
            },
            body: {}
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Network response was not ok (${response.status})`);
                }
                return response.json();
            })
            .then(data => {
                userdata = data
            })
            .catch(error => {
                console.error('Error:', error);
                alert('An error occurred while submitting the form. Please try again.');
            });
        return {
            sustainability_score: userdata['data']['sustainability_score'],
            carbon_footprint: userdata['data']['carbon_footprint'],
            habits_completed_today: 0, // TODO: Replace with real calculation if needed
            streak_count: userdata['data']['streak'],
            habits: userdata['data']['habits'],
            achievements: [
                {
                    achievement_type: "first_checkin",
                    achievement_title: "First Check-in",
                    unlocked: true,
                },
                {
                    achievement_type: "streak_4",
                    achievement_title: "4-Day Streak",
                    unlocked: true,
                },
                {
                    achievement_type: "streak_7",
                    achievement_title: "7-Day Streak",
                    unlocked: false,
                },
                {
                    achievement_type: "streak_30",
                    achievement_title: "30-Day Streak",
                    unlocked: false,
                },
                {
                    achievement_type: "streak_50",
                    achievement_title: "50-Day Streak",
                    unlocked: false,
                },
                {
                    achievement_type: "streak_100",
                    achievement_title: "100-Day Streak",
                    unlocked: false,
                },
                {
                    achievement_type: "habits_5",
                    achievement_title: "5 Habits Master",
                    unlocked: false,
                },
                {
                    achievement_type: "score_80",
                    achievement_title: "Eco Champion",
                    unlocked: false,
                },
                {
                    achievement_type: "set_footprint",
                    achievement_title: "Shoes without footprint",
                    unlocked: false,
                },
            ],
        };
    }

    async submitQuestionnaire(data) {
        console.log(data)

        return {
            success: true,
            message: "Questionnaire submitted successfully",
        };
    }

}
