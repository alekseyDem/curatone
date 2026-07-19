# ТЗ: Генератор наградного сертификата — Curatone.art

Сертификат генерируется в браузере из данных награды и сохраняется в PDF (A4 landscape) стандартной печатью браузера — без серверного рендеринга.
Эталон: `certificate.html` (в этой папке, самодостаточный vanilla HTML/CSS/JS). Исходник дизайна: `../../Certificate Generator.dc.html`. Ассет подписи: `uploads/sign_akimova.png`.

---

## 1. Формат и печать

- Лист: **A4 landscape (297×210 мм)**, поле листа 10 мм → рабочая область рамки 277×190 мм.
- `@page { size: A4 landscape; margin: 0 }` — нулевые поля убирают служебные колонтитулы браузера (дата/URL).
- Тема светлая, фон листа **чистый белый** `#FFFFFF`; на экране лист лежит на подложке `#EDEFF1` с тенью, при печати — без тени и подложки (`.no-print`, `@media print`).
- Обязательно `print-color-adjust: exact` (+ `-webkit-`) — иначе фоновый узор, плашка уровня награды и бордовая линия не попадут в PDF.
- Кнопка «Save as PDF» = `window.print()`.

## 2. Токены

Ink `#24272A` · Teal `#0B5C6E` · Oxblood `#870000` · Text muted `#5B6066` · Mono muted `#6A6F75` · Hairline `#D7DADE` / `#E2E4E8`.
Шрифты (Google Fonts): Aboreto; Open Sans 400/600 (+italic); IBM Plex Mono 400/500; Source Serif 4 italic 400.

## 3. Композиция (сверху вниз, по центру)

1. **Рамка**: внешняя 1px `#24272A`, зазор 6px, внутренняя 1px `#D7DADE`. Внутренний padding 44px 64px 40px.
2. **Шапка**: CURATONE (Aboreto 19px, tracking 0.32em) → mono-строка `BERLIN · INTERNATIONAL CURATORIAL PLATFORM` (10px, 0.24em) → бордовая линия 56×1px (margin-top 26px).
3. **Центр** (flex:1, width:100%, центрирование по вертикали):
   - `CERTIFICATE OF ACHIEVEMENT` — mono 11px, tracking 0.26em;
   - **Название награды** — Aboreto 52px, `{Tier} Award`;
   - **Плашка уровня** 150×3px, градиент по уровню: Gold `#C9A54E→#EAD9AC→#C9A54E`, Platinum `#C9C8C2→#F1F0EC→#C9C8C2`, Silver `#AEB3B8→#E4E7E9→#AEB3B8`;
   - `awarded to` — 15px muted;
   - **Имя художника** — Source Serif 4 *italic* 400, 38px;
   - Строки работы: `for the work {Work} · {Category}` и `{Competition}, {Year}` — 15px muted, название работы italic ink.
4. **Нижний ряд** (space-between, align-items:flex-end):
   - **Слева — подпись**: `uploads/sign_akimova.png` (PNG с прозрачностью, высота 52px, **opacity 0.55**), под ней линия 180×1px ink, затем mono-строки `ELIZAVETA AKIMOVA` (ink) и `FOUNDER & EDITOR-IN-CHIEF` (muted), 9.5px, tracking 0.18em.
   - **Центр — печать**: два концентрических круга 96 и 78px, бордер 1px `#870000`; внутри `CURATONE` (Aboreto 9px, tracking 0.14em) и **годом отдельной строкой ниже** (IBM Plex Mono 8.5px, margin-top 4px), всё цветом oxblood.
   - **Справа — верификация**: QR-код 72×72px (рамка 1px `#E2E4E8`, padding 5px, белый фон, `image-rendering: pixelated`) слева от текстового блока; справа mono-строки `NO. {CertNo}` и `VERIFIED AT CURATONE.ART` (9.5px, tracking 0.18em, выравнивание вправо).

## 4. Фоновый узор

- **Обязательно inline SVG, не CSS-градиент**: браузерный print-движок растрирует `repeating-radial-gradient` в низком DPI — кольца в PDF получаются мыльными. Вектор печатается чётко при любом разрешении.
- Концентрические кольца: `<svg width="1400" height="1400" viewBox="0 0 1400 1400">` с `<circle cx="700" cy="700">`, радиусы **от 16 до 672 с шагом 16** (42 круга), `stroke: #0B5C6E`, `stroke-width: 1`, `fill: none`.
- Затухание к краям — не маской, а убыванием `stroke-opacity` по радиусу: `opacity(r) = 0.1 × (1 − r/680)` (0.098 у центра → ~0.001 на краю).
- Позиционирование SVG: `position:absolute; left:50%; top:36%; transform:translate(-50%,-50%)` внутри decor-контейнера с `overflow:hidden`.
- Угловые метки: четыре уголка 26×26px, 1px teal, opacity 0.55, отступ 14px от внутренней рамки.
- Весь декор — `position:absolute; z-index:-1` внутри контейнера с `isolation:isolate`, `aria-hidden="true"`.

## 5. Данные и генерация

Модель данных сертификата:

```
tier: 'Platinum' | 'Gold' | 'Silver'
artist, work, category, competition, year, certNo
```

- В эталоне значения берутся из объекта-конфига с переопределением через URL query params (`?artist=…&tier=…&certNo=…`) — в продакшене подставлять из БД наград.
- Заголовок награды = `{tier} Award`; плашка выбирается по tier; год дублируется в печать.
- **QR-код**: генерируется в браузере (библиотека `qrcode-generator`, CDN), содержимое — `https://curatone.art/verify/{certNo}`, уровень коррекции M, вывод в data-URL. Перегенерировать при смене certNo.

## 6. Доступность и качество

- QR имеет `alt="Verification QR code"`, подпись — `alt="Signature of Elizaveta Akimova"`.
- Декор скрыт от скринридеров.
- Проверить печать в Chrome: один лист, рамка доходит до низа страницы (высота рамки = 190mm жёстко, не 100%), узор и плашка присутствуют в PDF.
- Кегли не уменьшать: mono-подписи 9.5px — минимум.
