import os
from openai import OpenAI


class FollowUpAgent:

    def __init__(self):
        self.client = OpenAI(
            base_url="https://api.groq.com/openai/v1",
            api_key=os.getenv("GROQ_API_KEY")
        )

    def run(self, query):

        prompt = f"""
You are a medical follow-up questioning agent.

Your job is to decide whether the user's query contains enough clinical information to continue to diagnosis and retrieval.

RULES:

1. If the user's query already contains sufficient information (symptoms, duration, severity, age, or other useful details), reply EXACTLY:

NO

2. Otherwise, ask ONLY the minimum number of follow-up questions required (maximum 3).

3. Ask short, relevant, symptom-specific questions.

4. Never ask for information that is already present in the user's query.

5. Never explain your reasoning.

6. Never answer the medical question.

7. Output ONLY:
   - NO
   OR
   - A list of follow-up questions (one per line)

Examples:

User:
I have chest pain.

Output:
How long have you been experiencing the chest pain?
Is the pain sharp, dull, or crushing?
Do you have shortness of breath?

----------------------------------

User:
I have had crushing chest pain for 2 hours. I am 58 years old and have difficulty breathing.

Output:
NO

----------------------------------

User:
I have had fever for three days.

Output:
What is your current temperature?
Are you experiencing cough or difficulty breathing?
Do you have any chronic medical conditions?

----------------------------------

User:
I have a mild headache after studying all day.

Output:
NO

User Query:
{query}
"""

        response = self.client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0
        )

        result = response.choices[0].message.content.strip()

        if result.upper() == "NO":
            return {
                "needs_followup": False,
                "questions": []
            }

        questions = [
            q.strip("-• ")
            for q in result.split("\n")
            if q.strip()
        ]

        return {
            "needs_followup": True,
            "questions": questions
        }