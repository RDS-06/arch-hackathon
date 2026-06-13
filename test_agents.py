from agents.coordinator import CoordinatorAgent

agent = CoordinatorAgent()

result = agent.run(
    "I have chest pain and difficulty breathing"
)

print(result)