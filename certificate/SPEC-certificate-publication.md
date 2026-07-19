# ТЗ: Certificate of Publication — Curatone Art & Research Journal

Сертификат публикации для авторов журнала. Генерируется в браузере, сохраняется в PDF (A4 landscape) печатью браузера. Дизайн-система идентична наградному сертификату (см. \`SPEC-certificate.md\` — токены, рамка, печать, подпись, узор); здесь описаны только отличия.
Эталон: \`certificate-publication.html\`. Исходник дизайна: \`../../Certificate of Publication.dc.html\`.

---

## 1. Отличия от наградного сертификата

- **Нет QR-кода** — справа внизу только текстовый блок дат.
- **Нет плашки уровня награды** и строки \`awarded to\`.
- Внутренний padding плотнее: \`38px 72px 36px\` (контента больше).
- Центр узора-колец: \`top: 38%\` (не 36%).

## 2. Шапка

- Wordmark: \`CURATONE ART & RESEARCH JOURNAL\` — Aboreto 19px, tracking 0.32em.
- Подстрока: \`ISSN 3054-6621 · REGISTERED IN THE GERMAN UNION CATALOGUE OF SERIALS (ZDB)\` — IBM Plex Mono 9.5px, tracking 0.2em, uppercase, muted.
- Бордовая линия 56×1px, margin-top 22px.

## 3. Центральный блок (сверху вниз)

| Элемент | Стиль |
|---|---|
| \`CERTIFICATE OF PUBLICATION\` | mono 11px, tracking 0.26em, muted |
| \`This is to certify that\` | 15px muted, margin-top 22px |
| **Имя автора** | Source Serif 4 italic 400, 36px |
| \`is the author of the scholarly article\` | 15px muted |
| **Название статьи в “кавычках”** | Aboreto 25px, line-height 1.45, max-width 860px |
| Абзац \`published in … Editorial Board and independent subject-matter experts.\` | 14px muted, line-height 1.75, max-width 760px |
| \`The article is permanently archived…\` | 14px muted |
| **DOI-ссылка** | IBM Plex Mono 13px, цвет teal \`#0B5C6E\` |
| \`Selected for the Curatone Annual Review…\` | 13.5px italic ink |

## 4. Нижний ряд

- **Слева — подпись** (как в наградном) + третья строка: \`CURATONE ART & RESEARCH JOURNAL\`.
- **Центр — печать** (идентична): круги 96/78px oxblood, \`CURATONE\` + год отдельной строкой.
- **Справа — даты**: \`PUBLISHED: {date}\`, \`CERTIFICATE ISSUED: {date}\`, \`CURATONE.ART\` — mono 9.5px, tracking 0.18em, muted, выравнивание вправо.

## 5. Фоновый узор — ВАЖНО (обновление для обоих сертификатов)

- **Кольца обязаны быть inline SVG, не CSS-градиентом**: браузерный print-движок растрирует \`repeating-radial-gradient\` в низком DPI — в PDF узор мыльный. Вектор печатается чётко.
- SVG: \`width/height 1400, viewBox 0 0 1400 1400\`, круги \`cx=700 cy=700\`, радиусы **16…672 с шагом 16** (42 шт.), \`stroke #0B5C6E\`, \`stroke-width 1\`, \`fill none\`.
- Затухание — убыванием непрозрачности: \`stroke-opacity(r) = 0.1 × (1 − r/680)\` (никаких CSS-масок — они тоже растрируются).
- Позиция: \`position:absolute; left:50%; top:38%; transform:translate(-50%,-50%)\` в decor-слое (\`z-index:-1\`, \`overflow:hidden\`, \`aria-hidden\`).

## 6. Данные

\`\`\`
author, article, volume ("Volume 1, Issue 2 (2026)"),
doi (полный URL), published, issued, year, selected (опц. строка отбора)
\`\`\`

В эталоне — дефолты + переопределение URL-параметрами; в продакшене подставлять из данных публикации. Строка \`selected\` опциональна — если статья не отобрана в Annual Review, элемент скрыть.

## 7. Печать

Как в наградном: \`@page { size: A4 landscape; margin: 0 }\`, \`print-color-adjust: exact\`, кнопка Save as PDF = \`window.print()\`, включённая «Background graphics», масштаб 100%. Проверить: один лист, рамка до низа, кольца чёткие.
