from fastapi import FastAPI
from pydantic import BaseModel
import joblib
import re

binary_model = joblib.load("binary_model.pkl") #loaded models
binary_vectorizer = joblib.load("binary_vectorizer.pkl")

category_model = joblib.load("category_model.pkl")
category_vectorizer = joblib.load("category_vectorizer.pkl")

app = FastAPI()

class PredictionRequest(BaseModel):
    text: str

def clean_text(text): #text cleaning step

    text = str(text).lower()

    text = re.sub(
        r"http\S+|www\S+",
        "",
        text
    )
    text = re.sub(
        r"@\w+",
        "",
        text
    )
    text = re.sub(
        r"#(\w+)",
        r"\1",
        text
    )
    text = re.sub(
        r"\s+",
        " ",
        text
    )
    return text.strip()

@app.get("/")
def home():

    return {
        "message": "Unsaid ML API is running"
    }

@app.post("/api/predict") #predictions
def predict(request: PredictionRequest):
    cleaned = clean_text(
        request.text
    )
    
    binary_features = ( #binary
        binary_vectorizer.transform(
            [cleaned]
        )
    )

    binary_probabilities = (
        binary_model.predict_proba(
            binary_features
        )[0]
    )

    bullying_probability = float(
        binary_probabilities[1]
    )
    is_bullying = (
        bullying_probability >= 0.75
    )
    
    if not is_bullying: #for not bully

        return {

            "is_bullying": False,

            "bullying_probability":
                round(
                    bullying_probability,
                    4
                ),

            "category":
                "not_cyberbullying",

        }

    category_features = ( #category model
        category_vectorizer.transform(
            [cleaned]
        )
    )

    category_probabilities = (
        category_model.predict_proba(
            category_features
        )[0]
    )

    category_index = (
        category_probabilities.argmax()
    )

    category = (
        category_model.classes_[
            category_index
        ]
    )

    category_confidence = float(
        category_probabilities[
            category_index
        ]
    )
    return { #results

        "is_bullying":
            True,

        "bullying_probability":
            round(
                bullying_probability,
                4
            ),

        "category":
            category,

        "category_confidence":
            round(
                category_confidence,
                4
            ),
    }