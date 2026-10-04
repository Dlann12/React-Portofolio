from rembg import remove
from PIL import Image

input_path = 'public/assets/profile.webp'
output_path = 'public/assets/profile-nobg.webp'

input_img = Image.open(input_path)
output_img = remove(input_img)
output_img.save(output_path, 'WEBP')
print("Done")
