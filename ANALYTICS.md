# CleanZone — измерение конверсии, 10.10.2026

Установлено 1 октября 2026. GA4: property 554592985, поток G-DD4EGC87V8.

С 10 октября дизайн фиксирован на 7–14 дней. Этот релиз меняет только измерение, guards против дублей, тесты и cache versions. CSS, изображения, сцены, цены, структура, SEO и доставка Telegram не меняются. В app.js и partners.js изменён только аргумент аналитического callback: передаётся уже существующий result.requestId.

Границы проверки: события проверены в коде и изолированном браузере с заглушками API/vendor transport. Получение новых событий кабинетами сегодня не подтверждено: управление браузером не запустилось, а запрос свежей GA4 статистики вернул TRIAL_EXPIRED. Платные сервисы не подключались.

Google Ads conversion inventory прочитан 10 октября: «Контакт», id 7733729010, WEBPAGE, ENABLED, ONE_PER_CLICK; event snippet совпадает с AW-17004498635/Ymz2CPKt3eccEMudsKw_. В возвращённом списке нет отдельного GA4-import действия для того же лида. WEBSITE_CALL id 7758876375 и AD_CALL id 7758876378 включены и ONE_PER_CLICK. Ответ не вернул Primary/Secondary, campaign goals или настройки длительности звонков — они не объявляются проверенными. Meta/Clarity settings UI сегодня не перечитаны.

## Где смотреть

[GA4](https://analytics.google.com/analytics/web/#/a408408077p554592985/reports/intelligenthome) → Отчёты → Просмотр данных о взаимодействиях → События. Выберите даты после установки. В отчёте добавьте второе измерение «Источник/канал сеанса», отфильтруйте instagram / paid_social. В детализации используйте специальные параметры CZ.

Историческая настройка 1 октября: generate_lead отмечен ключевым событием. Созданы параметры уровня события: section_id, action_location, service_id, form_id, field_name, error_type, page_type, filter_id, action_id, scroll_percent, item_index, option_selected, http_status. Названия в UI начинаются с CZ. Текущий статус этих настроек сегодня не перечитан.

## События

| Событие | Что означает | Детализация |
|---|---|---|
| section_view | Посетитель видел минимум 35% доступного в экране участка раздела 600 мс | section_id |
| view_pricing | Cennik виден 600 мс, один раз на загрузку; заменяет section_view для cennik | section_id |
| form_view | Форма видна 600 мс или действительно открыта в диалоге; повторное открытие не дублирует просмотр. Быстрый ввод гарантирует view до start | form_id, section_id |
| price_view | Видел карточку цены 600 мс | service_id |
| price_filter | Выбрал категорию прайса | filter_id |
| select_service / remove_service | Выбрал / убрал мебель или партнёрский тариф | service_id, action_location |
| navigation_click | Переход к разделу сайта | section_id, action_location |
| interaction_click | Меню, социальная ссылка, сброс выбора, партнёры, местная страница | action_id, action_location |
| booking_cta_click | Нажал запись / переход к форме | action_location |
| phone_click | Нажал телефон | action_location |
| booking_form_open / booking_form_close | Диалог действительно открылся / закрылся; это не лид | form_id |
| booking_form_start | Первый ввод/изменение поля или опции после согласия; checkbox без name тоже учитывается. Фокус и автоподстановка выбранной мебели не считаются началом | form_id |
| booking_field_complete | Оставил корректно заполненное поле, один раз на поле | field_name |
| booking_validation_error | Обязательное / невалидное поле мешает отправке | field_name, error_type |
| booking_submit_click | Нажал кнопку отправки, до проверки полей | form_id |
| booking_submit_attempt | Валидная форма поступила в обработчик, включая отказ при недоступной конфигурации; это попытка, не доказательство HTTP-запроса или доставки | form_id |
| booking_submit_error | Не подтверждена доставка | error_type, http_status |
| booking_submit_success | Сервер подтвердил доставку, один раз на попытку | form_id |
| generate_lead | Единственный GA4 бизнес-лид: после response.ok и result.ok:true, с requestId уже доставленной заявки. Повторное подтверждение того же receipt не повторяет конверсию | form_id, page_type, event_id |
| faq_open | Открыл вопрос FAQ | item_index |
| before_after_interaction | Первое движение конкретного slider; заменяет compare_interaction, автодемонстрация без input не учитывается | item_index |
| drying_option | Добавил / убрал сушку | option_selected |
| scroll_depth | Достиг 25/50/75/90% страницы | scroll_percent |
| site_error | Ошибка собственного скрипта или картинки основного контента | error_type |

service_id: sofa2 — диван 2 места; sofa3 — 3–4; cornerl / corneru — угловые L/U; pullout — раскладная часть; stool / chair / office — стулья; armchair — кресло; mattress1 / mattress2 — матрасы; headboard — изголовье; rug — ковёр; multiple / other — несколько / помощь. partner3/5/8/12/Other — партнёрские тарифы.

section_id: home — первый экран, cleaning-story — чистка, drying-story — сушка, cennik — цены, efekty — результаты, opinie — отзывы, jak-dzialamy — процесс, faq — вопросы, rezerwacja — контактный раздел, bookingForm — сама форма, warunki — партнёрские условия.

FAQ item_index: 1 цена дивана; 2 выезд; 3 одно кресло/стул; 4 время высыхания; 5 экспресс сушка; 6 удаление пятен; 7 подготовка; 8 подтверждение записи.

## Как оценивать

Основная воронка: Landing → CTA (или сразу inline-форма) → form_view → booking_form_start → booking_submit_attempt → generate_lead. /dziekujemy — проверка перехода, не самостоятельный триггер GA4/Ads-лида. GA4 и Ads получают лид после серверной доставки до redirect; Meta — на thank-you по одноразовому receipt. Если переход не состоялся, подтверждённая доставка всё равно является лидом.

Названия из задания form_start и form_submit соответствуют существующим booking_form_start и booking_submit_attempt. Сохраняем ручные имена: GA4 Enhanced Measurement может сам создавать form_start/form_submit, и добавление второго ручного события с таким названием рискует дать дубль. Текущую настройку Enhanced Measurement не удалось прочитать; автоматические события не использовать в качестве подтверждения лида. Название lead — бизнес-метрика, фактический GA4 event остаётся рекомендованным generate_lead; отдельный параллельный GA4 lead не создаём.

Миграция с 10 октября: compare_interaction → before_after_interaction, section_view + cennik → view_pricing, section_view + bookingForm → form_view. Старое и новое события для одного действия одновременно не отправляются. Для истории использовать OR старого/нового определения с учётом даты релиза, не суммировать все события. Остальные section_view сохранены.

Не требуйте выбора мебели от всех: часть посетителей сразу звонит или заполняет форму. В исследовании воронки сравнивайте пользователей/сеансы в последовательности; простое деление количества всех событий не измеряет точный процент отказов. События шагов дают место потери, а не мысли клиента.

Если есть booking_submit_click без attempt — смотрите validation_error. Если attempt без generate_lead — submit_error. Видимость формы без начала — возможное сомнение или неудобство; это гипотеза. Если ошибка network/timeout — проверяйте сеть и сервер; http_error — ответ обработчика; config_unavailable — форма недоступна. site_error не содержит текст исключения и не заменяет мониторинг серверных логов.

## Ограничения и безопасность

- Сбор только после opt-in. Пропущенные до согласия действия не восстанавливаются. Отказ не блокирует форму; отозванное согласие прекращает события.
- Имя, телефон, город, сроки, свободный текст, ошибки сервера и произвольные URL не включаются в параметры наших событий. Только фиксированные коды; field_name — название поля, не его значение.
- Измерение всех посетителей на 100% невозможно из-за согласия, блокировок и отключённого JS.
- Клик телефона не равен состоявшемуся звонку. generate_lead не равен принятому/оплаченному заказу. Сверяйте с Telegram и своей записью клиентов.
- Бизнес конверсия одна — generate_lead. Не делайте все шаги ключевыми событиями и не импортируйте их как основные конверсии рекламы.
- Подтверждённый лид здесь — доставленная заявка, а не подтверждённый/оплаченный заказ. server requestId используется как event_id GA4, transaction_id Google Ads и eventID Meta. GA4 защищает наш локальный guard, не предположение об автоматической дедупликации event_id. Не регистрировать высококардинальный event_id как обычное измерение dashboard. Не суммировать GA4/Ads/Meta как разных клиентов — это может быть одна заявка.
- Дополнительные параметры / исторические отчёты появятся после обработки новых событий; прошлые клики задним числом не доступны.
- Clarity подключён 1 октября 2026: проект yr0iqsk14t, https://clarity.microsoft.com/projects/view/yr0iqsk14t/dashboard. Скрипт загружается только по новому согласию v5, ad_Storage запрещён. Формы и их поля явно маскированы. При отзыве: consentv2 denied, очистка cookies, stop; повторное согласие возобновляет запись. Режим маскирования проекта Balanced, cookies по умолчанию выключены и включаются сигналом согласия. В Clarity поступают только названия одобренных этапов заявки, без параметров полей. Отказ не препятствует записи на услугу. Статистика прежних посещений задним числом не доступна.
- Проверка Meta Purchase/AddToCart и CAPI остаётся отдельной задачей: эти события нельзя приравнивать к продажам без проверки правил.
- Никаких новых изменений полей, географии или серверного валидатора в этом измерительном релизе.

## Проверка релиза

node --test tests/journey.test.cjs: opt-in/отказ/срок согласия, защита данных, ошибки и успех без дублей, высокие scroll секции, ошибки полей, устойчивость к недоступной аналитике.
В браузере локально проверены выбор дивана, переход к полям, HTTP 503 с сохранением введённых данных и успешная доставка на заглушку с переходом на /dziekujemy/. Реальные тестовые заявки в Telegram не отправлялись.

Справка: https://developers.google.com/analytics/devguides/collection/ga4/events

## Уточнения измерения — 03.10.2026

После подтверждения сервера переход на /dziekujemy/ ждёт callback и GA4, и Google Ads, максимум 800 мс суммарно. Ошибка очереди или блокировка аналитики не отменяют подтверждённую заявку. Callback означает отправку события SDK, а не доказательство получения/атрибуции кабинетом. Тесты выполняют эти сценарии в изолированном VM, без реальных лидов.

Обработчик site_error защищён от повторного входа во время отправки самого события. Для собственных скриптов добавлены безопасные script_file, error_line, error_column и tracking_version=20261003. Не передаются сообщения ошибок, stack trace, query string или данные формы. Источник ошибки Maximum call stack size exceeded из записи ChromeMobile 02.10 пока не установлен; защитная правка не доказывает устранение именно той ошибки.

Собственные просмотры для проверки отмечайте ссылкой ?utm_source=qa&utm_medium=internal и исключайте qa/internal при оценке рекламы. Чтобы вообще не записывать проверку в аналитике, нажмите «Ustawienia cookies» → «Odrzuć» на тестовом устройстве. Не отправляйте реальную форму для проверки событий: это создаёт заявку. Старые неидентифицированные визиты нельзя задним числом достоверно разделить на клиента и владельца. Клиентскую заявку проверяйте по фактическому контакту/Telegram, отдельно от generate_lead; phone_click — только нажатие номера.

Проверки: node --test tests/*.test.cjs (21 тест); node --check для JavaScript. Сайт статический, отдельного npm build нет; публикация через штатный Pages build/deployment.

## Проверка релиза 10.10.2026

Автотесты: 37 тестов, в том числе guards confirmed receipt, повторный callback, отказ/отзыв consent, ошибки отправки, Meta marker (прямой заход, reload/back, истечение, некорректный/будущий token), form view до быстрого ввода, checkbox без name. npm run build валидирует 13 HTML и 11 indexable URL.

Браузерная QA: 390×844, 430×932, 1440×900, 1920×1080 (Chromium с mobile/touch эмуляцией для телефона); основной/партнёрский сценарии; валидация, HTTP 502, ok:false, invalid JSON, network failure, успех с receipt, reload/direct thank-you. Booking API и SDK transport подменены: реальных заявок, звонков и рекламных конверсий тесты не создают. Это не подтверждение приёма события кабинетом или физический тест iPhone/Safari.

Clarity установлен: yr0iqsk14t. Добавлены custom events view_pricing, before_after_interaction, form_view и lead. Маскирование формы и consent не ослаблены. Meta marker не создаётся без действующего согласия или confirmed receipt; Lead получает тот же server UUID и не повторяется на reload. Google Ads использует тот же receipt вместо нового случайного transaction_id при каждом вызове.

## Dashboard plan — 7–14 дней без изменения дизайна

Все доли — по уникальным сеансам, а не по числу повторных кликов. Europe/Warsaw, только полные дни; тестовые/собственные визиты исключать там, где их можно доказательно определить. GA4 Funnel Exploration показывает пользователей: если используем его, подписывать user-based и не смешивать его проценты с session-based KPI. Для сеансов использовать session segments. Не суммировать distinct sessions/users из разных строк.

1. **Sessions:** измеренные сеансы, landing page, новые/вернувшиеся. Визиты без consent/ad blocker могут отсутствовать.
2. **CTA click rate:** сеансы с booking_cta_click / landing-сеансы; action_location отдельно. phone_click — отдельная метрика.
3. **Form start rate:** сеансы с booking_form_start / сеансы с form_view; дополнительно start / landing.
4. **Form completion rate:** сеансы с generate_lead / сеансы с booking_form_start. Рядом attempt/start, lead/attempt и категории ошибок.
5. **Lead conversion rate:** сеансы с generate_lead / landing-сеансы. Доставки сверять с Telegram, принятые/оплаченные заказы — отдельно.
6. **Mobile vs desktop:** все KPI выше по устройству; tablet отдельно. Особенно CTA→view, view→start и attempt→lead.
7. **Traffic source:** Session source / medium, campaign, landing page, page_type home/local/partner. Расход и стоимость заявки добавлять только при доступных подтверждённых данных.
8. **Top drop-off section:** section_view / view_pricing и последующие CTA/start/lead; before/after — необязательная ветка. Причины ухода — гипотезы, ошибки подтверждать событием и записью Clarity.
9. **Через 7 дней:** проверить совпадение доставок, ошибки/валидацию, UTM, дубли, direct/reload thank-you, устройства, CTA→form_view и view→start; посмотреть проблемные записи. Несколько лидов ещё не доказывают успех дизайна.
10. **Через 14 дней:** сравнить две полные недели, качество источников, стоимость доставленного/принятого лида, completion и повторяющиеся точки потери. Выбрать одну подтверждённую UX-гипотезу для следующего изменения.

Первый полный день после этого релиза — 11 октября. Окно 7 дней: 11–17 октября, просмотр 18 октября. Окно 14 дней: 11–24 октября, просмотр 25 октября. Сдвинуть даты, если публикация или поступление событий задержится.

## Что ещё подтвердить в кабинетах

- GA4 Events/DebugView: события дошли; generate_lead — form key event; нет Event create rule для лида на thank-you/native submit; текущие CZ dimensions и Enhanced Measurement.
- Ads Goals: «Контакт» — одно основное form-действие, нет второго Primary импорта того же GA4 lead. Данные inventory не подтвердили Primary/Secondary. Клики/маршруты не считать заказами.
- Meta Events Manager: Pixel совпадает, Lead приходит один раз; Event Setup Tool/URL/Button rules и внешняя CAPI не дублируют Lead. В репозитории CAPI нет, внешняя настройка сегодня не исключалась.
- Clarity: новые custom events доступны в фильтрах/funnel; текущий Masking проекта перечитать. Поля в коде уже маскированы.
- Сверять день доставки с Ads conversion-time: обычный Ads отчёт может относить конверсию ко дню рекламного клика.

Справка: [GA4 Enhanced Measurement](https://support.google.com/analytics/answer/9216061?hl=en), [generate_lead](https://developers.google.com/analytics/devguides/collection/ga4/reference/events#generate_lead), [Ads primary/secondary](https://support.google.com/google-ads/answer/11461796?hl=en), [Clarity consentv2](https://learn.microsoft.com/en-us/clarity/setup-and-installation/clarity-consent-api-v2).
