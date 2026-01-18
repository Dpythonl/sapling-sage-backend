import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(__file__)))



from fastapi import FastAPI, UploadFile, File
import shutil
import os

from pipeline.pit_detection import detect_pits
from pipeline.alignment import align_images
from pipeline.survival_check import survival_check

app = FastAPI()

os.makedirs("temp", exist_ok=True)

@app.post("/analyze")
async def analyze_image(file: UploadFile = File(...)):
    image_path = f"temp/{file.filename}"

    with open(image_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    pits = detect_pits(image_path)
    aligned = align_images(image_path, pits)
    result = survival_check(aligned)

    return result
