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
    constructor() {
        this.currentUserId = localStorage.getItem("currentUserId") || 1; // Default to user 1 for demo
    }

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
            achievements: [],
        };
    }

    async submitQuestionnaire(data) {
        // Mock API call for questionnaire submission
        console.log("Submitting questionnaire:", data);

        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 500));

        return {
            success: true,
            message: "Questionnaire submitted successfully",
        };
    }

}
