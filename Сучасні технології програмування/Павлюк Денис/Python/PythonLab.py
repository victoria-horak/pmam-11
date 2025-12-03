import sys
from PIL import Image  

ASCII_CHARS = ["@", "%", "#", "*", "+", "=", "-", ":", ".", " "]

class AsciiArtConverter:
    """
    Клас для конвертації зображень у текстовий ASCII-арт.
    """
    def __init__(self, image_path, width=100):
        self.image_path = image_path
        self.width = width

    def load_image(self):
        try:
            img = Image.open(self.image_path)
            return img
        except Exception as e:
            print(f" Помилка: Не вдалося відкрити файл '{self.image_path}'. {e}")
            return None

    def resize_image(self, image):
        """Зміна розміру зі збереженням пропорцій."""
        orig_width, orig_height = image.size
        # Коефіцієнт 0.55 компенсує те, що символи витягнуті вертикально
        ratio = (orig_height / orig_width) * 0.55
        new_height = int(self.width * ratio)
        return image.resize((self.width, new_height))

    def generate_text(self):
        image = self.load_image()
        if not image:
            return None

        image = self.resize_image(image)
        grayscale_image = image.convert("L") # Перетворення в відтінки сірого
        
        pixels = list(grayscale_image.getdata())
        
        # Мапінг яскравості (0-255) на індекс символу
        divisor = 255 // (len(ASCII_CHARS) - 1)
        
        ascii_str = ""
        for i, pixel in enumerate(pixels):
            # Якщо кінець рядка картинки - додаємо перенос рядка
            if i % self.width == 0 and i != 0:
                ascii_str += "\n"
            
            # Вибирання символу на основі яскравості пікселя
            ascii_str += ASCII_CHARS[pixel // divisor]
            
        return ascii_str

def main():
    print("=== Генератор ASCII-арту ===")
    
    path = input("Введіть назву файлу з картинкою (наприклад, dog.jpg): ").strip()
    
    path = path.replace('"', '').replace("'", "")

    if not path:
        print("Ви не ввели назву файлу.")
        return

    converter = AsciiArtConverter(image_path=path, width=100)
    
    art = converter.generate_text()

    if art:
        print("\n" + "="*20 + " РЕЗУЛЬТАТ " + "="*20 + "\n")
        print(art)
        print("\n" + "="*50 + "\n")

        output_filename = "ascii_result.txt"
        with open(output_filename, "w", encoding="utf-8") as f:
            f.write(art)
        print(f"Результат збережено у файл: {output_filename}")

if __name__ == "__main__":
    main()