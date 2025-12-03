<?php
$memeImage = null;
$error = null;

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        // Перевірка завантаження файлу
        if (!isset($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
            throw new Exception("Будь ласка, завантажте зображення.");
        }

        // Отримання тексту
        $topText = mb_strtoupper($_POST['top_text'] ?? '');
        $bottomText = mb_strtoupper($_POST['bottom_text'] ?? '');

        // Створення зображення з файлу (GD Library)
        $imagePath = $_FILES['image']['tmp_name'];
        $imageData = file_get_contents($imagePath);
        $im = imagecreatefromstring($imageData);

        if (!$im) {
            throw new Exception("Непідтримуваний формат зображення.");
        }

        $width = imagesx($im);
        $height = imagesy($im);

        // Налаштування шрифту і кольорів
        $white = imagecolorallocate($im, 255, 255, 255);
        $black = imagecolorallocate($im, 0, 0, 0);

        // Шлях до шрифту. 

        $fontPath = __DIR__ . '/impact.ttf'; 
        $useTTF = file_exists($fontPath);

        // Функція для малювання тексту з обводкою 
        function drawMemeText($im, $text, $x, $y, $size, $color, $strokeColor, $font, $useTTF, $alignBottom = false) {
            if ($useTTF) {
                
                $bbox = imagettfbbox($size, 0, $font, $text);
                $textWidth = $bbox[2] - $bbox[0];
                $textHeight = $bbox[1] - $bbox[7];
                
                $centerX = (imagesx($im) / 2) - ($textWidth / 2);
                
                $centerY = $alignBottom ? $y - 10 : $y + $textHeight + 10;

                // Малювання обводки 
                for($dx = -2; $dx <= 2; $dx++) {
                    for($dy = -2; $dy <= 2; $dy++) {
                        imagettftext($im, $size, 0, $centerX + $dx, $centerY + $dy, $strokeColor, $font, $text);
                    }
                }
                // Малювання основного білого тексту
                imagettftext($im, $size, 0, $centerX, $centerY, $color, $font, $text);
            } else {
                // Резервний варіант 
                $font = 5; 
                $textWidth = imagefontwidth($font) * strlen($text);
                $textHeight = imagefontheight($font);
                
                $centerX = (imagesx($im) / 2) - ($textWidth / 2);
                $centerY = $alignBottom ? $y - $textHeight - 10 : $y + 10;

                // Проста тінь замість обводки для вбудованого шрифту
                imagestring($im, $font, $centerX + 1, $centerY + 1, $text, $strokeColor);
                imagestring($im, $font, $centerX, $centerY, $text, $color);
            }
        }

        // Розмір шрифту відносно ширини картинки
        $fontSize = $width * 0.05; 
        if ($fontSize < 12) $fontSize = 12;

        // Нанесення тексту
        if ($topText) {
            drawMemeText($im, $topText, 0, 0, $fontSize, $white, $black, $fontPath, $useTTF, false);
        }
        if ($bottomText) {
            drawMemeText($im, $bottomText, 0, $height, $fontSize, $white, $black, $fontPath, $useTTF, true);
        }

        // Зберігання результату у буфер 
        ob_start(); 
        imagejpeg($im); 
        $imageData = ob_get_clean(); 
        
        // Кодування в base64 для відображення в <img>
        $memeImage = 'data:image/jpeg;base64,' . base64_encode($imageData);

        imagedestroy($im);

    } catch (Exception $e) {
        $error = $e->getMessage();
    }
}
?>

<!DOCTYPE html>
<html lang="uk">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PHP Meme Generator 🐘</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #1a1a2e;
            color: #fff;
            margin: 0;
            padding: 20px;
            display: flex;
            flex-direction: column;
            align-items: center;
            min-height: 100vh;
        }
        .container {
            background-color: #16213e;
            padding: 2rem;
            border-radius: 15px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.5);
            max-width: 600px;
            width: 100%;
        }
        h1 { text-align: center; color: #e94560; margin-top: 0; }
        .form-group { margin-bottom: 15px; }
        label { display: block; margin-bottom: 5px; font-weight: bold; }
        input[type="text"], input[type="file"] {
            width: 100%;
            padding: 10px;
            border-radius: 5px;
            border: 1px solid #0f3460;
            background: #0f3460;
            color: white;
            box-sizing: border-box;
        }
        button {
            width: 100%;
            padding: 12px;
            background-color: #e94560;
            color: white;
            border: none;
            border-radius: 5px;
            font-size: 1.1rem;
            cursor: pointer;
            transition: background 0.3s;
        }
        button:hover { background-color: #c0354e; }
        .preview {
            margin-top: 20px;
            text-align: center;
            border-top: 2px solid #0f3460;
            padding-top: 20px;
        }
        .preview img {
            max-width: 100%;
            border-radius: 8px;
            box-shadow: 0 0 20px rgba(0,0,0,0.5);
        }
        .error {
            background: #ff4757;
            padding: 10px;
            border-radius: 5px;
            margin-bottom: 15px;
            text-align: center;
        }
        .download-btn {
            display: inline-block;
            margin-top: 15px;
            background-color: #4CAF50;
            color: white;
            padding: 10px 20px;
            text-decoration: none;
            border-radius: 5px;
        }
        .note {
            font-size: 0.8rem;
            color: #888;
            margin-top: 5px;
            text-align: center;
        }
    </style>
</head>
<body>

<div class="container">
    <h1>Генератор Мемів на PHP</h1>
    
    <?php if ($error): ?>
        <div class="error"><?= htmlspecialchars($error) ?></div>
    <?php endif; ?>

    <form method="POST" enctype="multipart/form-data">
        <div class="form-group">
            <label for="image">1. Оберіть картинку:</label>
            <input type="file" name="image" id="image" accept="image/*" required>
        </div>
        
        <div class="form-group">
            <label for="top_text">2. Текст зверху:</label>
            <input type="text" name="top_text" id="top_text" placeholder="КОЛИ ТИ ПИШЕШ КОД...">
        </div>

        <div class="form-group">
            <label for="bottom_text">3. Текст знизу:</label>
            <input type="text" name="bottom_text" id="bottom_text" placeholder="...І ВІН ЗАПРАЦЮВАВ З ПЕРШОГО РАЗУ">
        </div>

        <button type="submit">Згенерувати Мем 🔥</button>
    </form>

    <?php if ($memeImage): ?>
        <div class="preview">
            <h3>Твій шедевр:</h3>
            <img src="<?= $memeImage ?>" alt="Generated Meme">
            <br>
            <a href="<?= $memeImage ?>" download="meme.jpg" class="download-btn">Завантажити (.jpg)</a>
        </div>
    <?php endif; ?>
</div>

</body>
</html>