<?php
header('Content-Type: application/json; charset=utf-8');

function writeIcoFile($png16Path, $png32Path, $outIcoPath) {
    $png16 = file_get_contents($png16Path);
    $png32 = file_get_contents($png32Path);
    if ($png16 === false || $png32 === false) return false;

    $header = pack('vvv', 0, 1, 2);
    $offset = 6 + (16 * 2);

    $entry16 = pack('CCCCvvVV', 16, 16, 0, 0, 1, 32, strlen($png16), $offset);
    $offset += strlen($png16);

    $entry32 = pack('CCCCvvVV', 32, 32, 0, 0, 1, 32, strlen($png32), $offset);

    $data = $header . $entry16 . $entry32 . $png16 . $png32;
    return file_put_contents($outIcoPath, $data) !== false;
}

function processAndGenerateIcons($sourcePath, $targetDir) {
    $info = @getimagesize($sourcePath);
    if (!$info) return false;

    $mime = $info['mime'];
    $srcImg = null;

    if ($mime === 'image/jpeg' || $mime === 'image/pjpeg') {
        $srcImg = @imagecreatefromjpeg($sourcePath);
    } elseif ($mime === 'image/png') {
        $srcImg = @imagecreatefrompng($sourcePath);
    } elseif ($mime === 'image/webp') {
        $srcImg = @imagecreatefromwebp($sourcePath);
    } elseif ($mime === 'image/gif') {
        $srcImg = @imagecreatefromgif($sourcePath);
    }

    if (!$srcImg) return false;

    $srcW = imagesx($srcImg);
    $srcH = imagesy($srcImg);

    $sizes = [
        'icon-512.png' => 512,
        'icon-192.png' => 192,
        'apple-touch-icon.png' => 180,
        'favicon-32x32.png' => 32,
        'favicon-16x16.png' => 16,
    ];

    foreach ($sizes as $fileName => $dim) {
        $dst = imagecreatetruecolor($dim, $dim);
        imagealphablending($dst, false);
        imagesavealpha($dst, true);
        $transparent = imagecolorallocatealpha($dst, 0, 0, 0, 127);
        imagefill($dst, 0, 0, $transparent);
        imagealphablending($dst, true);

        imagecopyresampled($dst, $srcImg, 0, 0, 0, 0, $dim, $dim, $srcW, $srcH);
        imagepng($dst, $targetDir . '/' . $fileName, 8);
        imagedestroy($dst);
    }

    $logoDim = min(512, max($srcW, $srcH));
    if ($logoDim < 256) $logoDim = 256;
    $logoDst = imagecreatetruecolor($logoDim, $logoDim);
    imagealphablending($logoDst, false);
    imagesavealpha($logoDst, true);
    $transparent = imagecolorallocatealpha($logoDst, 0, 0, 0, 127);
    imagefill($logoDst, 0, 0, $transparent);
    imagealphablending($logoDst, true);
    imagecopyresampled($logoDst, $srcImg, 0, 0, 0, 0, $logoDim, $logoDim, $srcW, $srcH);

    $logoPath = $targetDir . '/logo.png';
    imagepng($logoDst, $logoPath, 9);
    imagedestroy($logoDst);

    if (file_exists($logoPath) && filesize($logoPath) > 200 * 1024) {
        $smaller = imagecreatetruecolor(300, 300);
        imagealphablending($smaller, false);
        imagesavealpha($smaller, true);
        $transparent = imagecolorallocatealpha($smaller, 0, 0, 0, 127);
        imagefill($smaller, 0, 0, $transparent);
        imagealphablending($smaller, true);
        imagecopyresampled($smaller, $srcImg, 0, 0, 0, 0, 300, 300, $srcW, $srcH);
        imagepng($smaller, $logoPath, 9);
        imagedestroy($smaller);
    }

    writeIcoFile(
        $targetDir . '/favicon-16x16.png',
        $targetDir . '/favicon-32x32.png',
        $targetDir . '/favicon.ico'
    );

    imagedestroy($srcImg);
    return true;
}

function generateInitialBrandedSource($destPath) {
    $dim = 512;
    $im = imagecreatetruecolor($dim, $dim);
    imagealphablending($im, false);
    imagesavealpha($im, true);
    $trans = imagecolorallocatealpha($im, 0, 0, 0, 127);
    imagefill($im, 0, 0, $trans);
    imagealphablending($im, true);

    $emerald = imagecolorallocate($im, 5, 150, 105);
    $dark = imagecolorallocate($im, 15, 23, 42);
    $gold = imagecolorallocate($im, 245, 158, 11);
    $white = imagecolorallocate($im, 255, 255, 255);
    $goldLight = imagecolorallocate($im, 252, 211, 77);

    $cx = $dim / 2;
    $cy = $dim / 2;

    imagefilledellipse($im, $cx, $cy, 480, 480, $emerald);
    imagefilledellipse($im, $cx, $cy, 450, 450, $dark);

    $poly = [
        $cx, 80,
        420, 180,
        400, 370,
        $cx, 440,
        112, 370,
        92, 180
    ];
    imagefilledpolygon($im, $poly, $emerald);

    $polyInner = [
        $cx, 105,
        395, 195,
        378, 355,
        $cx, 418,
        134, 355,
        117, 195
    ];
    imagefilledpolygon($im, $polyInner, $dark);

    $roof = [
        $cx, 140,
        340, 240,
        172, 240
    ];
    imagefilledpolygon($im, $roof, $gold);

    imagefilledrectangle($im, 195, 250, 230, 360, $white);
    imagefilledrectangle($im, 243, 250, 269, 360, $white);
    imagefilledrectangle($im, 282, 250, 317, 360, $white);

    imagefilledrectangle($im, 170, 365, 342, 385, $goldLight);

    imagepng($im, $destPath, 9);
    imagedestroy($im);
}

$dir = __DIR__;

if (php_sapi_name() === 'cli') {
    $tempSrc = $dir . '/temp_source_logo.png';
    generateInitialBrandedSource($tempSrc);
    $res = processAndGenerateIcons($tempSrc, $dir);
    if (file_exists($tempSrc)) @unlink($tempSrc);
    echo $res ? "SUCCESS\n" : "FAILED\n";
    exit(0);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'صرف POST کی اجازت ہے']);
    exit;
}

if (!isset($_FILES['logo_file']) || $_FILES['logo_file']['error'] !== UPLOAD_ERR_OK) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'تصویر منتخب نہیں کی گئی یا اپلوڈ میں خرابی آئی']);
    exit;
}

$tmpPath = $_FILES['logo_file']['tmp_name'];
$fileSize = $_FILES['logo_file']['size'];

if ($fileSize > 10 * 1024 * 1024) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'فائل کا سائز 10MB سے کم ہونا چاہیے']);
    exit;
}

$success = processAndGenerateIcons($tmpPath, $dir);

if (!$success) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'تصویر پروسیسنگ میں خرابی، براہ کرم PNG یا JPG فائل استعمال کریں']);
    exit;
}

echo json_encode([
    'success' => true,
    'message' => 'لوگو اور تمام آئیکونز (PWA / Favicon) 200KB کے اندر خودکار ری سائز کر کے اپڈیٹ کر دیے گئے۔',
    'timestamp' => time(),
    'files' => [
        'logo.png',
        'favicon.ico',
        'favicon-16x16.png',
        'favicon-32x32.png',
        'apple-touch-icon.png',
        'icon-192.png',
        'icon-512.png'
    ]
]);
