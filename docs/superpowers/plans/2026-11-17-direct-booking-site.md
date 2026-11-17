# Direct Booking — Site Changes Implementation Plan (план 1 из 3)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Перестроить `/apartments` вокруг прямого бронирования: поиск по датам, пять объектов с живой доступностью и ценой из Hostex, страницы `/book/<id>/` с расчётом цены.

**Architecture:** Сайт остаётся статическим (Astro). Две новые серверные функции Vercel в `api/booking/` только читают Hostex и считают цену; вся логика цен — в чистом модуле с тестами. Оплаты и создания броней в этом плане нет: кнопка «Reserve» работает в режиме заявки через существующую форму `/contact/`, пока план 2 не включит Stripe.

**Tech Stack:** Astro 7, серверные функции Vercel (Node, ESM, без фреймворка), Hostex Open API v3, встроенный `node --test`. Новых зависимостей нет.

**Spec:** `docs/superpowers/specs/2026-11-17-direct-booking-design.md` (разделы 5.1, 5.2, 5.4 «Сайт», 5.6). Макет раскладки: `output/mockups/apartments-direct-booking.html`.

**Разбивка на планы.** Спецификация покрывает три подсистемы, каждая даёт работающий результат:

1. **Этот план** — сайт и чтение Hostex. Не зависит от тестовой брони.
2. Бронь и оплата: удержания в Hostex, Stripe, вебхуки, письма, страницы подтверждения и управления бронью, база. Начинается после проверок из раздела 6 спецификации (Грег: после открытия лета).
3. Вкладка «Прямые брони» в Booking Manager.

## Global Constraints

- Репозиторий публичный: никаких ключей, токенов и идентификаторов аккаунтов в коде, тестах, фикстурах и логах. Токен Hostex — только в `HOSTEX_ACCESS_TOKEN` (Vercel и локальный `.env`).
- `output: 'static'` не меняется. Новые зависимости не добавляются.
- Цена, скидка, сроки и максимум гостей считаются только на сервере; параметрам из браузера доверять нельзя.
- Central (Hostex 12843802) нигде не показывается и не бронируется.
- Прямая бронь: `vintage`, `orange`, `solo`, `youth`, `awesome`. Максимум 2 гостя, у `solo` — 1. Минимум 2 ночи.
- Скидка 10% от цены Airbnb за ночь; недельные скидки и скидки последней минуты не переносятся.
- Городской налог 2,50 € с человека за ночь: показывается отдельно, в итог не входит.
- Бесплатная отмена до конца дня «заезд − 7»; списание в день «заезд − 9»; время — `Europe/Rome`.
- Тексты для гостя — английский. Стили — только токены из `src/styles/tokens.css`, с ночной темой (`[data-theme='night']`) и шириной телефона 375px.
- Работа ведётся в ветке `feature/direct-booking-site`; в `main` ничего не коммитится и не деплоится без команды Грега.
- Деньги в коде — целые центы.

## Review Focus

1. Hostex недоступен, отвечает медленно или 429 → обе точки отдают 503 с `Cache-Control: no-store`, верхний блок показывает ссылки на площадки (задачи 4, 6).
2. Диапазон открыт частично (часть ночей без цены или закрыта) → расчёт отказывает с `reason: 'unavailable'`, а не считает по открытым ночам (задача 2).
3. Выезд в первый закрытый день (ночи 7–8 января, выезд 9-го при закрытом 9-м) → разрешён (задача 2).
4. Мусор в параметрах: `guests=0|3|abc`, `from` позже `to`, дата в прошлом, неизвестный `unit`, `unit=central` → 400 или 404, без обращения к Hostex (задача 4).
5. «Сегодня» около полуночи: дата берётся по `Europe/Rome`, а не по UTC сервера (задача 2).

---

### Task 1: Реестр объектов прямой брони и тестовый запуск

**Files:**
- Create: `src/data/direct-units.mjs`, `tests/direct-units.test.mjs`
- Modify: `src/data/apartments.ts` (тип `Apartment` и вычисление `direct`), `package.json` (скрипт `test`)

**Interfaces:**
- Produces: `DIRECT_UNITS` — объект `{ [unitId]: { hostexPropertyId: number, airbnbListingId: string, maxGuests: number, label: string } }`; `getDirectUnit(id): unit | null`; `DIRECT_UNIT_IDS: string[]` в порядке `orange, vintage, youth, solo, awesome`. В `apartments.ts`: `Apartment.direct?: { maxGuests: number }`, экспорт `DIRECT_APARTMENTS` и `PLATFORM_APARTMENTS`.

- [ ] **Step 1:** Добавить в `package.json` скрипт `"test": "node --test tests/"`.
- [ ] **Step 2: Тест** `tests/direct-units.test.mjs`:

```js
import test from 'node:test'
import assert from 'node:assert/strict'
import { DIRECT_UNITS, DIRECT_UNIT_IDS, getDirectUnit } from '../src/data/direct-units.mjs'

test('five direct units, central excluded', () => {
  assert.deepEqual(DIRECT_UNIT_IDS, ['orange', 'vintage', 'youth', 'solo', 'awesome'])
  assert.equal(getDirectUnit('central'), null)
  assert.equal(getDirectUnit('__proto__'), null)
})
test('guest limits', () => {
  assert.equal(DIRECT_UNITS.solo.maxGuests, 1)
  for (const id of ['orange', 'vintage', 'youth', 'awesome']) assert.equal(DIRECT_UNITS[id].maxGuests, 2)
})
test('hostex mapping', () => {
  assert.equal(DIRECT_UNITS.orange.hostexPropertyId, 12843799)
  assert.equal(DIRECT_UNITS.awesome.airbnbListingId, '3456236')
  assert.ok(!Object.values(DIRECT_UNITS).some((u) => u.hostexPropertyId === 12843802))
})
```

- [ ] **Step 3:** `npm test` — FAIL (модуля нет).
- [ ] **Step 4:** Создать `src/data/direct-units.mjs`. Значения: vintage 12843798 / `1491803199632820467`; orange 12843799 / `1622640206186838346`; solo 12843800 / `1623848144637841636`; youth 12843801 / `1624089061068359230`; awesome 12843803 / `3456236`. `getDirectUnit` использует `Object.hasOwn`.
- [ ] **Step 5:** В `apartments.ts` импортировать реестр и вычислять `direct` по `id`; `DIRECT_APARTMENTS` — в порядке `DIRECT_UNIT_IDS`, `PLATFORM_APARTMENTS` — остальные в нынешнем порядке. `APARTMENT_SECTIONS` и `ALL_APARTMENTS` не менять.
- [ ] **Step 6:** `npm test` — PASS; `npm run build` — без ошибок.
- [ ] **Step 7:** Commit `feat: add direct booking unit registry`.

### Task 2: Чистый расчёт цены и правил

**Files:**
- Create: `scripts/lib/booking-quote.mjs`, `tests/booking-quote.test.mjs`

**Interfaces:**
- Consumes: ничего.
- Produces:
  - `romeToday(now = new Date()): string` — `YYYY-MM-DD` по `Europe/Rome`.
  - `addDays(date: string, n: number): string`.
  - `quoteStay({ nights, checkIn, checkOut, guests, maxGuests, discountPct, today })` где `nights: Array<{ date, bookable: boolean, priceCents: number|null, minStay: number, closedOnArrival: boolean, closedOnDeparture: boolean }>` (может содержать больше дат, чем нужно).
  - Успех: `{ ok: true, nights: number, perNight: Array<{date, priceCents}>, subtotalCents, discountCents, totalCents, cityTaxCents, freeCancellationUntil, chargeDate, payNow: boolean, refundable: boolean }`.
  - Отказ: `{ ok: false, reason: 'invalid_dates'|'past'|'too_many_guests'|'min_stay'|'unavailable'|'closed_arrival'|'closed_departure', minStay?: number }`.

Правила: минимум ночей = `max(2, minStay ночи заезда)`; ночь заезда не `closedOnArrival`; день выезда не `closedOnDeparture`, если он есть в `nights`; отсутствие дня выезда в `nights` или его `bookable: false` не мешает. `discountCents = Math.round(subtotalCents * discountPct / 100)`. `cityTaxCents = 250 * guests * nights`. `freeCancellationUntil = checkIn − 7`, `chargeDate = checkIn − 9`, `payNow = today >= chargeDate`, `refundable = today <= freeCancellationUntil`.

- [ ] **Step 1: Тесты** (фабрика `night(date, price, extra)` в файле теста):

```js
test('orange 20–22 Dec for 2 guests', () => {
  const q = quoteStay({ nights: [night('2026-12-20', 8300), night('2026-12-21', 8300), night('2026-12-22', 8300)],
    checkIn: '2026-12-20', checkOut: '2026-12-22', guests: 2, maxGuests: 2, discountPct: 10, today: '2026-11-17' })
  assert.deepEqual(
    [q.ok, q.nights, q.subtotalCents, q.discountCents, q.totalCents, q.cityTaxCents],
    [true, 2, 16600, 1660, 14940, 1000])
  assert.deepEqual([q.freeCancellationUntil, q.chargeDate, q.payNow, q.refundable],
    ['2026-12-13', '2026-12-11', false, true])
})
test('checkout on first closed day is allowed', () => { /* ночи 01-07, 01-08 открыты, 01-09 bookable:false → ok, nights 2 */ })
test('partially open range is refused', () => { /* 12-13 закрыта, 12-14..12-16 → reason 'unavailable' */ })
test('one night refused with min stay', () => { /* reason 'min_stay', minStay 2 */ })
test('min stay from arrival night wins when higher', () => { /* minStay 3 у ночи заезда, 2 ночи → 'min_stay', minStay 3 */ })
test('two guests in solo', () => { /* maxGuests 1 → 'too_many_guests' */ })
test('guests 0, 3, NaN', () => { /* все → 'too_many_guests' */ })
test('from after to, malformed date', () => { /* 'invalid_dates' */ })
test('check-in before today', () => { /* 'past' */ })
test('booking 8 days out: charged now, still refundable', () => { /* payNow true, refundable true */ })
test('booking 3 days out: charged now, not refundable', () => { /* payNow true, refundable false */ })
test('romeToday near midnight', () => {
  assert.equal(romeToday(new Date('2026-12-31T23:30:00Z')), '2027-01-01')
})
```

Каждый тест с комментарием-заглушкой исполнитель дописывает по описанию в комментарии; утверждения — точные значения.

- [ ] **Step 2:** `npm test` — FAIL.
- [ ] **Step 3:** Реализовать три функции. Даты — строки, арифметика через `Date.UTC`; `romeToday` через `Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Rome' })`.
- [ ] **Step 4:** `npm test` — PASS.
- [ ] **Step 5:** Commit `feat: add direct booking quote rules`.

### Task 3: Клиент Hostex (только чтение)

**Files:**
- Create: `scripts/lib/hostex-read.mjs`, `tests/hostex-read.test.mjs`, `tests/fixtures/hostex-availabilities.json`, `tests/fixtures/hostex-listing-calendar.json`

**Interfaces:**
- Consumes: `DIRECT_UNITS` (задача 1).
- Produces:
  - `class HostexError extends Error { status: number }`.
  - `loadNights({ unitIds, from, to, token, fetchImpl = fetch, timeoutMs = 8000 }): Promise<{ [unitId]: Night[] }>` — `Night` как в задаче 2. `bookable = available && price != null && inventory > 0`; `priceCents = price * 100`; `minStay = restrictions.min_stay_on_arrival || 0`.
- Запросы: `GET https://api.hostex.io/v3/availabilities?property_ids=<csv>&start_date&end_date` и `POST /v3/listings/calendar` с телом `{ start_date, end_date, listings: [{ channel_type: 'airbnb', listing_id }] }`; заголовок `Hostex-Access-Token`. Оба запроса параллельно. Ошибка: HTTP не 2xx, тайм-аут, или `error_code !== 200` в теле → `HostexError` (статус 429 сохраняется). Токен не попадает в сообщение ошибки.

- [ ] **Step 1:** Собрать фикстуры вручную по форме ответов (без `request_id` и без данных аккаунта): два объекта, даты 2026-12-19..2026-12-23, у одного 12-19 `available: false`, у другого на 12-23 `price: null`. Форма: `data.properties[].availabilities[{date, available}]` и `data.listings[].calendar[{date, price, inventory, restrictions{min_stay_on_arrival, closed_on_arrival, closed_on_departure}}]`.
- [ ] **Step 2: Тесты** с подставным `fetchImpl`: (а) ночи собраны по обоим ответам, `bookable` и `priceCents` верны для трёх граничных дат; (б) в запросах верные URL, метод, тело и заголовок; (в) `error_code: 400` в теле → `HostexError`; (г) HTTP 429 → `HostexError` со `status === 429`; (д) зависший `fetchImpl` при `timeoutMs: 20` → `HostexError`; (е) объявление отсутствует в ответе → все ночи объекта `bookable: false`.
- [ ] **Step 3:** `npm test` — FAIL. **Step 4:** Реализовать. **Step 5:** `npm test` — PASS.
- [ ] **Step 6:** Commit `feat: add read-only Hostex client`.

### Task 4: Точки `api/booking/calendar` и `api/booking/quote`

**Files:**
- Create: `api/booking/calendar.js`, `api/booking/quote.js`, `scripts/lib/booking-handlers.mjs`, `tests/booking-handlers.test.mjs`
- Modify: `scripts/contact-server.mjs` (локальная раздача двух путей), `.env.example`

**Interfaces:**
- Consumes: `loadNights`, `HostexError` (задача 3); `quoteStay`, `romeToday`, `addDays` (задача 2); `DIRECT_UNITS`, `getDirectUnit` (задача 1).
- Produces:
  - `handleCalendar({ env, now, loadNightsImpl }): Promise<{ status, headers, body }>` и `handleQuote({ query, env, now, loadNightsImpl })` в `booking-handlers.mjs`; файлы в `api/booking/` — тонкие обёртки в стиле `api/availability.js` (только GET/HEAD, иначе 405).
  - `GET /api/booking/calendar` → 200 `{ today, horizon, discountPct, units: { [id]: { maxGuests, nights: [{ d, b, p, m }] } } }` — `d` дата, `b` 0|1 bookable, `p` цена Airbnb за ночь **до скидки** в центах или `null` (скидку браузер считает от суммы тем же правилом, что сервер, иначе итог на карточке разойдётся с расчётом на цент), `m` минимум ночей (не меньше 2). Горизонт: сегодня (Рим) + 365 дней. `Cache-Control: public, s-maxage=60, stale-while-revalidate=300`.
  - `GET /api/booking/quote?unit&from&to&guests` → 200 `{ unit, checkIn, checkOut, guests, ...результат quoteStay }`, `Cache-Control: no-store`. Отказ `quoteStay` — тоже 200 с `ok: false`.
  - Ошибки: неизвестный `unit` → 404; плохие параметры → 400 без обращения к Hostex; нет `HOSTEX_ACCESS_TOKEN` или `HostexError` → 503 `{ error: 'unavailable' }`, `no-store`.
- Переменные: `HOSTEX_ACCESS_TOKEN`; `DIRECT_DISCOUNT_PCT` (по умолчанию 10; не число или вне 0..50 → 10).

- [ ] **Step 1: Тесты** с подставным `loadNightsImpl`: календарь отдаёт пять объектов, `discountPct: 10` и цену до скидки (`p: 8300`); расчёт orange 20–22 декабря возвращает `totalCents: 14940`; `unit=central` → 404 и `loadNightsImpl` не вызван; `guests=abc`, `from=2026-13-40`, `to` раньше `from` → 400 и не вызван; `HostexError` → 503 `no-store`; нет токена → 503; `DIRECT_DISCOUNT_PCT=abc` → скидка 10; расчёт запрашивает Hostex по `checkOut` включительно, чтобы видеть `closedOnDeparture`.
- [ ] **Step 2:** `npm test` — FAIL. **Step 3:** Реализовать. **Step 4:** `npm test` — PASS.
- [ ] **Step 5:** В `scripts/contact-server.mjs` добавить два маршрута, вызывающих те же обработчики. В `.env.example` — `HOSTEX_ACCESS_TOKEN=` и `DIRECT_DISCOUNT_PCT=10` с комментарием «server-only».
- [ ] **Step 6:** Ручная проверка с настоящим токеном в локальном `.env`: `npm run contact:api`, затем `curl 'localhost:8787/api/booking/quote?unit=orange&from=2026-12-20&to=2026-12-22&guests=2'` — ожидается `"ok":true` и `"totalCents":14940`, пока цена Airbnb 83 €. Вывод с токеном в лог не писать.
- [ ] **Step 7:** Commit `feat: add booking calendar and quote endpoints`.

### Task 5: Починка календаря объектов с площадок

**Files:**
- Modify: `scripts/lib/calendar-registry.mjs`, `api/availability.js`, `scripts/update-calendars.mjs`, `src/data/apartments.ts`, `src/components/AvailabilityCalendar.astro`
- Test: `tests/availability-range.test.mjs`

**Interfaces:**
- Produces: `availabilityRange(now = new Date()): { start: Date, end: Date, endLabel: string }` в `scripts/lib/calendar-registry.mjs` — начало: первый день текущего месяца, конец: последний день месяца через 12 месяцев. Константы `AVAILABILITY_END` и `AVAILABILITY_END_DATE` удаляются.

- [ ] **Step 1: Тест:** для `2026-11-17` — `start` 2026-11-01, `end` 2027-11-30; для `2027-01-31` — `end` 2028-01-31.
- [ ] **Step 2:** FAIL → реализовать → PASS.
- [ ] **Step 3:** `api/availability.js` и `scripts/update-calendars.mjs` берут диапазон из функции; в ответе `rangeEnd` — настоящая дата конца, а не строка `'2026-10-31'`.
- [ ] **Step 4:** В `AvailabilityCalendar.astro` заменить вписанный текст «through 30 November 2026» на значение из `rangeEnd` ответа (скрипт компонента уже получает этот JSON); месяцы строить до `rangeEnd`.
- [ ] **Step 5:** `npm run build` и `npm run preview`: у Suite Carina календарь листается до ноября 2027, подпись совпадает.
- [ ] **Step 6:** Commit `fix: roll availability calendar range forward 12 months`.

### Task 6: Перестройка `/apartments`

**Files:**
- Create: `src/components/DirectBooking.astro` (блок, строка поиска, скрипт), `src/components/DirectCard.astro`, `src/scripts/direct-booking-client.mjs` (чистые функции для браузера), `tests/direct-booking-client.test.mjs`
- Modify: `src/pages/apartments.astro`

**Interfaces:**
- Consumes: `DIRECT_APARTMENTS`, `PLATFORM_APARTMENTS` (задача 1); `GET /api/booking/calendar` (задача 4).
- Produces (в `direct-booking-client.mjs`):
  - `openWindows(nights): Array<{ from, to }>` — отрезки подряд идущих `b: 1`.
  - `unitState(unit, { from, to, guests, discountPct }): { state: 'idle'|'available'|'unavailable'|'guests'|'min_stay', totalCents?, fullCents?, fromCents?, nextWindow? }` — `idle` без дат (`nextWindow` — первое окно); `fullCents` — сумма `p` по ночам, `totalCents = fullCents − Math.round(fullCents * discountPct / 100)` — то же правило, что в `quoteStay`; `fromCents` — минимальная `p` после той же скидки.
  - `selectableDates(units): Set<string>` — даты, открытые хотя бы у одного объекта.
  - `bookUrl(id, { from, to, guests }): string` → `/book/<id>/?from=…&to=…&guests=…`.

Раскладка и состояния — по макету `output/mockups/apartments-direct-booking.html` и разделу 5.6 спецификации:

- Кнопка шапки «Book your stay» → `#direct`; «Browse apartments» → `#platforms`.
- Блок `#direct`: заголовок «Book direct», плашка «−10% vs Airbnb & Booking.com» (процент из ответа), строка условий, поиск (заезд, выезд, гости 1–2), пять `DirectCard`.
- До ответа сервера карточки отрисованы статически с фото, названием и кнопками площадок из `bookingLinks` — это же состояние остаётся при 503 и без JavaScript.
- После ответа: без дат — «from €X / night» и открытое окно; с датами — свободные первыми с итогом, зачёркнутой ценой площадок и строкой «+ €N city tax, paid on arrival»; занятые приглушены, «Not available for these dates»; `solo` при двух гостях — «1 guest only» и кнопка «Search for 1 guest».
- Ничего не свободно — сообщение со ссылками на `#platforms` и `/contact/`.
- Даты и гости живут в строке запроса страницы и восстанавливаются при загрузке.
- Выбор дат — два `<input type="date">` с `min`/`max` по горизонту; недоступность конкретных дат сообщается текстом под строкой поиска **[решение плана: свой календарь-попап не делаем в первой версии]**.
- Блок `#platforms` «Also on Airbnb & Booking.com»: `PLATFORM_APARTMENTS` через существующий `StayCard` (вариант `grid`), серый фон `--color-surface`. Прежние три секции по типам жилья удаляются; блоки «Adventure awaits» и отзывы остаются.
- В JSON-LD у пяти объектов `ReserveAction.target` → `${site.url}/book/<id>/`.

- [ ] **Step 1: Тесты** чистых функций: `openWindows` на ночах с разрывом даёт два отрезка; `unitState` — `idle` с `fromCents`, `available` с `totalCents: 14940` и `fullCents: 16600`, `unavailable` при одной закрытой ночи, `guests` для `solo` при 2 гостях, `min_stay` для одной ночи; выезд в первый закрытый день — `available`; `bookUrl('orange', …)` даёт точную строку.
- [ ] **Step 2:** FAIL → реализовать → PASS.
- [ ] **Step 3:** Сверстать компоненты и перестроить страницу.
- [ ] **Step 4:** Проверка в браузере (`npm run contact:api` + `npm run dev`): четыре состояния из макета; день и ночь; ширина 375px без горизонтальной прокрутки; с остановленным `contact:api` карточки показывают кнопки площадок; в консоли нет ошибок.
- [ ] **Step 5:** Commit `feat: rebuild apartments page around direct booking`.

### Task 7: Страницы `/book/<id>/`

**Files:**
- Create: `src/pages/book/[id].astro`, `src/components/BookingPanel.astro`
- Modify: `src/scripts/direct-booking-client.mjs`, `tests/direct-booking-client.test.mjs`, `src/pages/contact.astro`

**Interfaces:**
- Consumes: `DIRECT_APARTMENTS`; `GET /api/booking/calendar`, `GET /api/booking/quote`; `unitState`, `selectableDates`.
- Produces: `formatEuro(cents): string` (`14940` → `€149.40`, `1000` → `€10.00`); `requestUrl(apartmentName, quote): string` → `/contact/?service=…&dates=…&message=…`.

- `getStaticPaths` — по `DIRECT_APARTMENTS`. Страница: галерея и описание объекта, код CIN, панель брони.
- Панель: даты и гости (из строки запроса), блок цены по разделу 5.1 спецификации — ночи по ценам, строка скидки, Total, отдельная строка городского налога, затем условия. Тексты условий зависят от расчёта:
  - `payNow: false` → «Free cancellation until {freeCancellationUntil}. You pay nothing today: your card is charged on {chargeDate}.»
  - `payNow: true, refundable: true` → «Free cancellation until {freeCancellationUntil}. Payment is taken at booking.»
  - `refundable: false` → «This booking is non-refundable, except where the law provides otherwise.»
- `ok: false` → понятное сообщение по `reason` (для `min_stay` — с числом ночей), кнопка неактивна.
- Кнопка в этом плане — «Request to book» → `requestUrl(...)`. Под ней строка: «Instant online payment is coming soon. We confirm requests within a few hours.» Режим задаётся константой `BOOKING_MODE = 'request'` в `BookingPanel.astro`; план 2 переключит её на `'instant'`.
- `contact.astro`: `prefillFromUrl` дополнительно читает `message` и подставляет в пустое поле сообщения. Значение `service` взять из существующих вариантов поля в `contact.astro` (вариант для апартаментов).
- 503 или нет JavaScript → вместо панели ссылки объекта на площадки и на `/contact/`.

- [ ] **Step 1: Тесты:** `formatEuro` на трёх значениях; `requestUrl` кодирует даты «20 Dec – 22 Dec 2026», число гостей и итог в `message`, и результат разбирается обратно через `URLSearchParams`.
- [ ] **Step 2:** FAIL → реализовать → PASS.
- [ ] **Step 3:** Сверстать страницу и панель; дополнить `contact.astro`.
- [ ] **Step 4:** Проверка в браузере: переход с `/apartments` сохраняет даты; orange 20–22 декабря показывает Total €149.40 и налог €10.00; одна ночь даёт сообщение о минимуме; `/book/central/` и `/book/carina/` — 404; «Request to book» открывает форму с заполненными датами и сообщением; день, ночь, 375px.
- [ ] **Step 5:** Commit `feat: add direct booking pages`.

### Task 8: Главная, условия, документация

**Files:**
- Modify: `src/pages/index.astro`, `src/pages/terms.astro`, `src/pages/privacy.astro`, `CLAUDE.md`

- [ ] **Step 1:** На главной — блок-ссылка «Book your stay direct — 10% less than on the platforms» на `/apartments/#direct`, в стиле соседних блоков страницы.
- [ ] **Step 2:** `terms.astro` — раздел «Direct bookings»: цена и скидка; городской налог 2,50 € с человека за ночь, оплачивается по прибытии; минимум 2 ночи; максимум гостей; бесплатная отмена до 7 дней до заезда; списание за 9 дней; после срока бронь невозвратная, кроме случаев, предусмотренных законом, при чрезвычайных обстоятельствах — написать нам. Отдельной строкой: до запуска онлайн-оплаты бронь подтверждается по заявке.
- [ ] **Step 3:** `privacy.astro` — какие данные гостя собираются при заявке и что цены и доступность запрашиваются у Hostex без передачи данных гостя.
- [ ] **Step 4:** `CLAUDE.md` — команды (`npm test`), новые точки `api/booking/*`, переменные окружения, где лежит реестр объектов.
- [ ] **Step 5:** `npm test`, `npm run build` — без ошибок; `dist/sitemap-0.xml` содержит пять `/book/<id>/`.
- [ ] **Step 6:** Commit `docs: direct booking terms, privacy and project notes`.

### Task 9: Итоговая проверка

- [ ] **Step 1:** `npm test` — все тесты проходят; `npm run build` — без ошибок и предупреждений о битых ссылках.
- [ ] **Step 2:** `git grep -nE "Hostex-Access-Token: |HOSTEX_ACCESS_TOKEN=.+" -- . ':!.env.example'` — пусто; в `tests/fixtures/` нет `request_id` и идентификаторов аккаунта.
- [ ] **Step 3:** Превью-деплой ветки на Vercel с `HOSTEX_ACCESS_TOKEN` в переменных превью (ставит Грег). На превью: `/api/booking/calendar` отвечает 200 с пятью объектами; повторный запрос в течение минуты идёт из кэша; `/apartments` и `/book/orange/` работают как в задачах 6 и 7.
- [ ] **Step 4:** Сообщить Грегу результат и то, что не проверено. В `main` не сливать без его команды.

---

## Что нужно от Грега до запуска

- Новый токен Hostex (старый был в чате) и запись его в переменные Vercel проекта сайта.
- Решение, выкатывать ли план 1 в режиме заявки или держать на превью до плана 2.
- Летние цены в Hostex: без цены Airbnb на ночь объект в эту ночь не бронируется.
