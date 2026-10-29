import ollama
import pyttsx3
import speech_recognition as sr

# Initialize Text-to-Speech
tts = pyttsx3.init()


def speak(text):
    print(f"\nAI Hologram: {text}\n")
    tts.say(text)
    tts.runAndWait()


def listen():
    recognizer = sr.Recognizer()

    # Settings to improve microphone sensitivity
    recognizer.energy_threshold = 300  # Lower threshold to detect lower voices
    recognizer.dynamic_energy_threshold = True
    recognizer.pause_threshold = 1.2  # Pause buffer before processing speech

    with sr.Microphone() as source:
        print("\nListening... Speak into your microphone now.")
        recognizer.adjust_for_ambient_noise(source, duration=0.5)
        try:
            # Listen with a timeout so it keeps re-checking for speech
            audio = recognizer.listen(source, timeout=5, phrase_time_limit=10)
        except sr.WaitTimeoutError:
            return None

    try:
        text = recognizer.recognize_google(audio)
        print(f"You said: {text}")
        return text
    except sr.UnknownValueError:
        print("Sound detected, but couldn't understand the words. Try speaking clearer.")
        return None
    except sr.RequestError as e:
        print(f"Speech Recognition error: {e}")
        return None


def ask_ollama(prompt):
    response = ollama.chat(
        model="gemma2:2b",
        messages=[
            {
                "role": "system",
                "content": "You are a holographic AI assistant. Keep responses brief.",
            },
            {"role": "user", "content": prompt},
        ],
    )
    return response["message"]["content"]


if __name__ == "__main__":
    speak("Hologram AI online. Speak whenever you are ready.")

    while True:
        user_speech = listen()

        if user_speech:
            if "exit" in user_speech.lower() or "quit" in user_speech.lower():
                speak("Goodbye!")
                break

            reply = ask_ollama(user_speech)
            speak(reply)
            
S