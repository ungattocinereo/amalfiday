# Контакты: полная переделка (план)

Дата: 17 ноября 2026. Ветка-основа: `redesign/base`.

## Цель
Страница `/contact/` должна выглядеть как главная и новое меню: иллюстрации в стиле вырезанной бумаги, Libre Baskerville в заголовках, оранжевый акцент, на оранжевом только белый текст, скругления 20–26 px, мягкие тени, день/ночь.

## Структура страницы
1. **Hero.** Тёплая композиция на оранжевом фоне, как верх главной (оранжевый уходит под первый ряд карточек). Слева крупный заголовок, одна строка обещания («reply within 24 hours») и быстрые каналы: WhatsApp, Instagram, email, большие кнопки. Справа иллюстрация (`staticpages/contact/contact-us.webp` или карточки услуг). Шапка над hero светится белыми буквами, как на главной.
2. **Запрос — «Plan your day».** Форма-конструктор вместо простой формы:
   - шаг 1: «What do you need?» — крупные иллюстрированные плитки Photoshoot / Stay / Tour / Something else (можно выбрать несколько);
   - шаг 2: даты (диапазон) + гостей + место/номер (для Stay — выбор номера из `direct-units`);
   - шаг 3: имя + WhatsApp/email + сообщение;
   - рядом живая карточка-сводка запроса; после отправки — экран «Got it» с ожидаемым временем ответа и кнопкой WhatsApp.
   - Без JS — обычная форма со всеми полями. Отправка в `/api/contact` с теми же полями: `name`, `contact`, `dates`, `service`, `message` + honeypot `company_website`. Обязательны `contact`, `dates`, `service`. Гости, номер и выбранные услуги складываются в `service`/`message`. Автозаполнение `?service=&unit=&dates=` (`src/scripts/contact-prefill.mjs`) продолжает работать.
3. **Прямое бронирование.** Блок `DirectStay` со слайд-шоу фото номеров и видов Атрани, бейдж «Book direct −10%», три шага режима request (даты → запрос → подтверждение хоста сообщением, онлайн-оплаты нет; формулировки из `booking-mode.mjs`), кнопка «Check your dates» → `/apartments/#direct`, мелко «Also on Airbnb and Booking.com».
4. **How we can help.** Три иллюстрированные карточки: Photoshoot (`contact/photoshootings.webp`), Stay (`mainpage/rental-houses.webp`), Tour (`contact/transfers.webp` — сгенерированная, вместо живого фото). Строка «Transfers, porters, workshops — just ask».

## Тексты
Каждый текст проходит через скилл no-ai-slop (`~/.codex/skills/no-ai-slop/SKILL.md`): коротко, конкретно, без штампов.

## Агенты
- **contact-lead (Opus):** hero, конструктор запроса, сборка страницы, How we can help. Владеет `src/pages/contact.astro` и `src/components/contact/*`, кроме `DirectStay.astro`.
- **contact-stay (Sonnet):** `src/components/contact/DirectStay.astro` со слайд-шоу. Компонент без пропсов; contact-lead подключает его между запросом и How we can help.
- После обоих: слияние, затем **ревью (Opus)** всего редизайна: меню, главная, контакты.
