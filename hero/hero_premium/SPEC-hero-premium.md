# ТЗ: Premium Hero — главная страница Curatone.art

Спецификация обновлённой hero-секции для реализации в продакшн-кодовой базе.
Эталонная разметка: `hero-premium.html` (в этой папке) — самодостаточный vanilla HTML/CSS/JS, открывается в браузере как есть. Исходник дизайна: `../../Homepage Premium.dc.html`.

---

## 1. Состав секции (сверху вниз, всё по центру)

1. **Бегущая строка категорий** (marquee)
2. **Заголовок H1** — две строки, вторая — акцентная курсивная
3. **Подзаголовок** (1 абзац)
4. **Ряд CTA** — основная кнопка + карточка открытого конкурса с live-счётчиком
5. **Kicker-строка** `INTERNATIONAL CURATORIAL PLATFORM · BERLIN`

Декор (за контентом): переливающиеся бирюзовые пятна по левому и правому краям + пульсирующие дуговые линии поверх пятен.

## 2. Токены

| Токен | Значение |
|---|---|
| Ink (текст) | `#24272A` |
| Teal (бренд) | `#0B5C6E` |
| Teal bright (градиент кнопки) | `#10809A` |
| Teal tint (пятна) | `#9FC3CC` |
| Oxblood (live-дот) | `#870000` |
| Text muted | `#5B6066` |
| Mono muted | `#8A9096` |
| Hairline | `#D7DADE` |

Фон секции: `radial-gradient(ellipse 90% 70% at 50% 30%, #FFFFFF 0%, #FDFDFE 55%, #F4F6F7 100%)`.

## 3. Типографика

Google Fonts: `Aboreto`, `Open Sans` (400/600/700), `IBM Plex Mono` (400/500), `Source Serif 4` (italic **400** — обязательно загрузить это начертание).

- **H1, строка 1** — Aboreto 400, `clamp(34px, 5.2vw, 62px)`, line-height 1.24, max-width 920px. Текст: `Juried recognition,`
- **H1, строка 2 (акцент)** — Source Serif 4, *italic*, **weight 400**, letter-spacing `-0.01em`, тот же кегль. Текст: `permanently on record.`
- **Подзаголовок** — Open Sans 400, **15px**, line-height 1.7, цвет `#5B6066`, max-width **560px**, margin-top 28px.
- **Kicker** — IBM Plex Mono, 11px, letter-spacing 0.2em, uppercase, цвет teal, margin-top 38px (стоит ПОД кнопками).
- **Элементы ticker** — IBM Plex Mono, 10.5px, letter-spacing 0.2em, uppercase, цвет `#8A9096`; разделители `·` цветом `#D7DADE`.

Углы НЕ скругляются нигде, кроме дуговых линий и live-дота (фирменный стиль — прямые углы).

## 4. Декор

### 4.1 Переливающиеся пятна (`ct-glow`)
- 3 слоя слева + 3 зеркальных справа, `position:absolute`, за контентом, `pointer-events:none`, контейнер с `overflow:hidden`.
- Каждый слой: radial-gradient в бирюзовых тонах (точные значения — в HTML), `filter: blur(48–56px)`.
- Анимация: `ct-glow` — дрейф opacity 0.4→0.8→0.45 + лёгкий translateY/scale; `ease-in-out infinite alternate`; периоды 8–13s, отрицательные delay для рассинхрона.
- Интенсивность утверждена приглушённой — не повышать альфы без согласования.
- Видимы на всех брейкпоинтах.

### 4.2 Дуговые линии (`ct-line`)
- 7 линий слева + 7 справа, поверх пятен, под контентом.
- Каждая: `border: 1px solid #0B5C6E`, без бордера со стороны края экрана, `border-radius: 0 999px 999px 0` (слева; справа зеркально), вертикально по центру.
- Ступени: width от 70px, +48px на линию; height от 36%, +7%; delay от 0s, +0.45s.
- Анимация `ct-line` 7s ease-in-out infinite: opacity 0 → 0.34 (20%) → 0.12 (70%) → 0.
- **Скрыть при `max-width: 900px`.**

## 5. Бегущая строка (ticker)

- Контейнер: `width: min(720px, 100%)`, `overflow: hidden`, mask по краям: `linear-gradient(90deg, transparent 0%, #000 14%, #000 86%, transparent 100%)` (+ `-webkit-mask-image`).
- Трек: flex, gap 36px, `width: max-content`, `animation: ct-marquee 34s linear infinite` (`translateX(0 → -50%)`).
- Контент дублируется ровно 2 раза для бесшовного цикла.
- Категории: Painting · Drawing · Modern Art · Photography · Digital Art · Mixed Media · Ceramics · Sculpture.
- `aria-hidden="true"` (декоративный элемент).

## 6. CTA

### 6.1 Основная кнопка «Enter the open call»
- Высота 56px, padding 0 38px, без скруглений. Open Sans 600, 14.5px, letter-spacing 0.04em, белый текст.
- Фон: `linear-gradient(180deg, #10809A 0%, #0B5C6E 100%)`; тень `0 8px 22px rgba(11,92,110,0.35)`.
- Hover: градиент чуть светлее (`#12899F → #0C6478`), `translateY(-1px)`, тень `0 12px 28px rgba(11,92,110,0.45)`.
- Active: возврат translateY(0), тень слабее.
- **Блик по hover**: псевдоэлемент `::after` — полоса `linear-gradient(105deg, transparent, rgba(255,255,255,0.45) 50%, transparent)`, `skewX(-20deg)`, ширина 55%, старт `left:-80%`; на hover уезжает в `left:135%` через `transition: left 0.65s ease`. Родителю — `overflow:hidden`.
- Focus-visible: `outline: 2px solid #0B5C6E; offset 2px`.
- Ссылка → форма подачи заявки.

### 6.2 Карточка открытого конкурса
- Высота 56px, `border: 1px solid #D7DADE`, белый фон, padding 0 26px, gap 14px. Hover: бордер `#24272A`.
- Слева пульсирующий дот 7px, `#870000`, `ct-pulse` 2s (opacity 1→0.3→1).
- Две строки: «Open Call: Colors» (13.5px, 600) и счётчик `{D}D {H}H REMAINING` (IBM Plex Mono 10px, letter-spacing 0.12em, `#6A6F75`).
- Ссылка → страница конкурса.

### 6.3 Live-счётчик
- Дедлайн: `2026-09-06T23:59:59` (должен приходить из данных конкурса, не хардкодом).
- Обновление раз в 30 секунд; при истечении показывать `0D 00H`.

## 7. Отступы и адаптив

- Внутренние отступы секции: `clamp(76px, 11vw, 132px)` сверху, `clamp(20px, 5.5vw, 64px)` по бокам, `clamp(60px, 9vw, 96px)` снизу.
- Ticker → H1: `clamp(36px, 5vw, 52px)`. H1 → подзаголовок: 28px. Подзаголовок → CTA: 46px. CTA → kicker: 38px.
- `< 900px`: дуговые линии скрыты, пятна остаются.
- `< 640px`: CTA складываются в колонку, ширина `min(320px, 100%)`, контент по центру.

## 8. Доступность и производительность

- Весь декор (пятна, дуги, ticker) — `aria-hidden="true"`, `pointer-events: none` (кроме ticker — он просто aria-hidden).
- Обе CTA — настоящие `<a>` с видимым focus-состоянием.
- Желательно уважать `prefers-reduced-motion: reduce` — останавливать marquee, glow и пульсацию, блик оставить статичным.
- Blur-слои — самая дорогая часть: не увеличивать количество, при жалобах на перфоманс добавить `will-change: transform, opacity`.

## 9. Что НЕ входит

Навбар, полоса статистики, пресс-строка и всё ниже — без изменений относительно текущего продакшена (см. `../html/Homepage.html`); в пресс-строке на премиум-версии логотипы также идут marquee-треком (28s, дублирование ×2, та же mask) — по желанию.
