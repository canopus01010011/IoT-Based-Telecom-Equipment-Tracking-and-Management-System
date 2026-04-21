import cv2

BLUR_BLURRY, BLUR_SLIGHT = 200, 400
BRIGHTNESS_DARK, BRIGHTNESS_BRIGHT = 50, 180
CONTRAST_LOW = 20

def classify_blur(s):
    return "Blurry" if s < BLUR_BLURRY else "Slightly Blurry" if s < BLUR_SLIGHT else "Sharp"

def result_color(r):
    return (0, 255, 0) if r in ("Sharp", "Good") else (0, 100, 255)

image = cv2.imread("C:/pyproject/4.jpg")
if image is None:
    print("Error: Image not found")
    exit()

h, w = image.shape[:2]
scale = min(800 / w, 600 / h)
resized = cv2.resize(image, (int(w * scale), int(h * scale)))

gray = cv2.cvtColor(cv2.resize(image, (int(w * scale), int(h * scale))), cv2.COLOR_BGR2GRAY)
laplacian_var = cv2.Laplacian(gray, cv2.CV_64F).var()

blur_r = classify_blur(laplacian_var)


print(f"Blur:       {laplacian_var:.2f} → {blur_r}")
