(function () {
  const root = document.querySelector("#case-root");
  if (!root) return;

  const A = "../assets/figma/";
  const img = (name, alt = "", cls = "") => `<img class="${cls}" src="${A}${name}" alt="${alt}" loading="lazy" />`;
  const closeIcon = () => `
    <svg class="home-header__close-icon" viewBox="0 0 15.5 15.5" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
      <path d="M15.2804 1.28033C15.5732 0.987437 15.5732 0.512563 15.2804 0.21967C14.9875 -0.0732233 14.5126 -0.0732233 14.2197 0.21967L7.75001 6.68935L1.28033 0.219673C0.987437 -0.0732203 0.512563 -0.0732203 0.21967 0.219673C-0.0732233 0.512566 -0.0732233 0.98744 0.21967 1.28033L6.68935 7.75001L0.219697 14.2197C-0.0731964 14.5126 -0.0731964 14.9874 0.219697 15.2803C0.51259 15.5732 0.987464 15.5732 1.28036 15.2803L7.75001 8.81067L14.2197 15.2803C14.5126 15.5732 14.9874 15.5732 15.2803 15.2803C15.5732 14.9874 15.5732 14.5126 15.2803 14.2197L8.81067 7.75002L15.2804 1.28033Z" fill="currentColor" />
    </svg>
  `;
  const card = (title, text, cls = "") => `<article class="info-card ${cls}"><h3>${title}</h3><p>${text}</p></article>`;
  const infoCard = (title, text) => card(title, text);
  const infoList = (title, items) => infoCard(title, items.join("<br />"));
  const chip = (text) => `<span class="chip">${text}</span>`;
  const toolChip = ([name, icon]) => `
    <span class="tool-chip">
      <span class="tool-chip__icon">${img(icon, "", "tool-chip__image")}</span>
      <span>${name}</span>
    </span>
  `;
  const bullet = (text) => `<li>${text}</li>`;

  const tools = [
    ["Figma / FigJam", "tool-figma.png"],
    ["Blender", "tool-blender.png"],
    ["Spline", "tool-spline.png"],
    ["MixAR", "tool-mixar.png"],
    ["Framer", "tool-framer.png"],
  ];

  const competitors = [
    {
      name: "Л'Этуаль",
      type: "электронная карта",
      image: "competitor-letual.png",
      items: ["последовательный сценарий оформления", "выбор дизайна и суммы", "указание данных получателя"],
    },
    {
      name: "Ozon",
      type: "электронная карта",
      image: "competitor-ozon.png",
      items: ["выбор или создание изображения", "настройка номинала", "добавление поздравления", "предпросмотр результата"],
    },
    {
      name: "Золотое Яблоко",
      type: "электронная и физическая карта",
      image: "competitor-goldapple.png",
      items: ["выбор дизайна и суммы", "настройка времени отправки", "разделение цифрового и физического форматов"],
    },
    {
      name: "ВкусВилл",
      type: "электронная карта",
      image: "competitor-vkusvill.png",
      items: ["базовая настройка параметров", "получение по электронной почте", "меньшая глубина сценария"],
    },
  ];

  root.innerHTML = `
    <header class="home-header home-header--case" aria-label="Основная навигация">
      <div class="home-header__panel">
        <a class="home-header__brand" href="../index.html" aria-label="Eldar Galiamov">
          <span class="home-header__avatar">${img("home-logo.png", "", "home-header__avatar-img")}</span>
          <span>Eldar Galiamov</span>
        </a>
        <nav class="home-header__nav">
          <a href="../assets/Files/Галямов Эльдар Резюме.pdf" target="_blank" rel="noopener noreferrer">Резюме</a>
          <a class="ui-button ui-button--m ui-button--black" href="https://t.me/eldarglmv" target="_blank" rel="noopener noreferrer">Telegram</a>
        </nav>
      </div>
      <a class="home-header__close" href="../index.html" aria-label="Закрыть кейс">
        <span class="home-header__close-button">${closeIcon()}</span>
      </a>
    </header>

    <main class="case-page">
      <section class="project-hero">
        <div class="project-hero__copy">
          <div>
            <p class="case-meta"><span>Универмаг «Цветной»</span><span>2025</span></p>
            <h1>Сервис подарочных карт<br />для универмага «Цветной»</h1>
          </div>
          <p class="lead">Проектирование собственного сервиса покупки, дарения и управления электронными и пластиковыми подарочными картами внутри сайта бренда.</p>
        </div>
        <div class="hero-visual">
          ${img("hero-bg.png", "", "hero-visual__bg")}
        </div>
      </section>

      <div class="case-stack">
        <section class="triple-grid">
          <article class="info-card">
            <h2>Команда</h2>
            <div class="chip-cloud">
              ${["Designer", "Frontend-разработчик", "Backend-разработчик", "Аналитик", "Project manager"].map(chip).join("")}
            </div>
          </article>
          <article class="info-card">
            <h2>Моя роль</h2>
            <p>Я отвечал за UX/UI-проектирование сервиса: пользовательские сценарии, структуру экранов, конфигураторы электронной и пластиковой карты, оформление заказа, личный кабинет, состояния интерфейса, адаптивы и подготовку макетов к разработке.</p>
          </article>
          <article class="info-card">
            <h2>Инструменты</h2>
            <div class="tools-list">${tools.map(toolChip).join("")}</div>
          </article>
        </section>

        <div class="case-video"><iframe src="https://kinescope.io/embed/vMXTz8tCwQ9igs77uiyvKn" title="Видео о сервисе подарочных карт" allow="autoplay; fullscreen; picture-in-picture; encrypted-media; gyroscope; accelerometer; clipboard-write; screen-wake-lock;" frameborder="0" allowfullscreen width="1920" height="1080" loading="lazy"></iframe></div>

        <section class="section-block project-summary">
          <h2>Краткое описание проекта</h2>
          <div class="two-columns">
            <div class="text-column">
              <p>«Цветной» отказался от стороннего сервиса подарочных карт и решил создать собственное решение внутри сайта.</p>
              <p>Нужно было спроектировать сервис, который поддерживает электронные и пластиковые карты, сценарии дарения, доставку, оплату, личный кабинет и управление картами после покупки.</p>
              <p>Главная задача — превратить подарочную карту из отдельного товара в полноценный цифровой продукт внутри сайта.</p>
            </div>
            <article class="gradient-card">
              <h3>Подарочная карта должна была стать не просто товаром, а сервисом с полным жизненным циклом:</h3>
              <p>выбор → настройка → оформление → получение → использование → управление</p>
            </article>
          </div>
        </section>

        <section class="section-block">
          <h2>Процесс работы</h2>
          <p class="section-text">Работа шла в несколько этапов:</p>
          <div class="stage-row">
            ${["Анализ", "Архитектура", "Сценарии", "UI", "Handoff", "Запуск"].map((stage) => `<span>${stage}</span>`).join("")}
          </div>
          <div class="two-columns">
            <p>Сначала я разобрал старое решение и бизнес-задачу, затем изучил похожие сервисы подарочных карт, спроектировал структуру нового сервиса и разделил сценарии электронной и пластиковой карты.</p>
            <p>После этого проработал конфигураторы, оформление заказа, личный кабинет, состояния интерфейса и адаптивные версии. На финальном этапе презентовал решения команде и подготовил макеты к разработке.</p>
          </div>
        </section>

        <section class="section-block">
          <h2>Что было не так со старым решением</h2>
          <div class="problem-grid problem-grid--top">
            ${card("Зависимость от стороннего сервиса", "Бизнес не полностью контролировал выпуск, оплату, уведомления и дальнейшее управление картами")}
            ${card("Разрыв пользовательского пути", "Покупка карты была отделена от основного сайта и личного кабинета")}
            ${card("Не было управления после покупки", "Пользователь не мог удобно посмотреть баланс, QR-код, архив и историю операций")}
          </div>
          <div class="problem-grid problem-grid--bottom">
            ${card("Электронная карта не раскрывалась как подарок", "Не хватало поздравления, получателя, времени отправки и предпросмотра")}
            ${card("Пластиковая карта работала как обычный товар", "Не было удобного сценария покупки нескольких карт с разными дизайнами и номиналами")}
          </div>
          <div class="old-solution">
            ${img("old-solution-exact.png", "Старое решение", "old-solution__image")}
            <p>Старое решение</p>
          </div>
        </section>

        <section class="section-block">
          <h2>Исследование и выводы</h2>
          <p class="section-text">Перед проектированием я изучил старое решение «Цветного», структуру основного сайта и сервисы подарочных карт у других компаний: Ozon, Л'Этуаль, Золотое Яблоко, ВкусВилл и vpodarok.</p>
          <div class="competitor-panel">
            ${competitors
              .map(
                (item) => `
                  <article class="competitor-card">
                    <div class="competitor-card__image">${img(item.image, item.name)}</div>
                    <h3>${item.name}</h3>
                    <span class="dark-tag">${item.type}</span>
                    <ul>${item.items.map(bullet).join("")}</ul>
                  </article>
                `,
              )
              .join("")}
          </div>
          <h3 class="subheading">Основные выводы</h3>
          <div class="triple-grid">
            ${card("Подарочная карта — это не обычный товар", "Для неё важны получатель, поздравление, момент отправки и дальнейшее использование")}
            ${card("Электронная и пластиковая карты требуют разных потоков", "Электронная карта — быстрый персональный подарок. Пластиковая — физический носитель с доставкой и количеством")}
            ${card("Сервис не должен заканчиваться после оплаты", "Пользователю нужны баланс, QR-код, архив, операции и статусы заказов")}
          </div>
        </section>

        <section class="section-block">
          <h2>Ключевые сценарии</h2>
          <p class="section-text">Вместо классических персон я выделил основные сценарии. Для этого проекта важнее не демография, а задача пользователя в конкретный момент.</p>
          <table class="scenario-table">
            <thead><tr><th>Сценарий</th><th>Цель пользователя</th><th>Что важно в интерфейсе</th></tr></thead>
            <tbody>
              <tr><td>Электронная карта в подарок</td><td>Быстро отправить подарок</td><td>Получатель, поздравление, время отправки</td></tr>
              <tr><td>Электронная карта для себя</td><td>Купить карту без лишних шагов</td><td>Короткая форма</td></tr>
              <tr><td>Пластиковая карта</td><td>Купить физический подарок</td><td>Количество, доставка, самовывоз</td></tr>
              <tr><td>Получатель карты</td><td>Использовать карту</td><td>QR, баланс, срок действия</td></tr>
              <tr><td>Личный кабинет</td><td>Управлять картами</td><td>Архив, операции, статусы</td></tr>
            </tbody>
          </table>
        </section>

        <section class="section-block">
          <h2>Ключевые инсайты</h2>
          <p class="section-text">В проекте не было отдельного этапа пользовательских интервью, поэтому я опирался на анализ старого решения, конкурентные сценарии и обсуждения с командой проекта. Эти выводы стали основой для структуры сервиса.</p>
          <div class="insight-grid">
            ${card("Пользователь покупает не карту, а подарок", "Поэтому важно дать возможность выбрать дизайн, добавить поздравление, указать получателя и выбрать время отправки")}
            ${card("Электронная и пластиковая карты решают разные задачи", "Электронная карта нужна для быстрой отправки. Пластиковая — для физического подарка, доставки и покупки нескольких карт")}
            ${card("Ошибки перед отправкой подарка особенно критичны", "Ошибка в телефоне, email или тексте поздравления критична, потому что подарок уйдет другому человеку.", "info-card--tall")}
            ${card("После покупки пользователю всё ещё нужен сервис", "Он должен видеть баланс, срок действия, QR-код, архив и операции")}
            ${card("Для бизнеса важен контроль", "Собственный сервис позволяет управлять выпуском, оплатой, уведомлениями и учетом операций внутри инфраструктуры сайта")}
          </div>
        </section>

        <section class="section-block">
          <h2>Архитектура пользовательского пути</h2>
          <p class="section-text section-text--wide">Я разделил сервис на два основных потока: электронную и пластиковую карту. Они начинаются с общего выбора типа карты, но дальше расходятся, потому что требуют разных данных и действий.</p>
          <figure class="flow-panel">
            <figcaption>Flow оформления карты</figcaption>
            ${img("design-flow-exact.png", "Flow оформления карты")}
          </figure>
          <figure class="flow-panel">
            <figcaption>Flow активации карты</figcaption>
            ${img("activation-flow-exact.png", "Flow активации карты")}
          </figure>
        </section>

        <section class="solution-block">
          <p class="solution-kicker">Решение</p>
          <h2>Выбор типа карты</h2>
          <div class="big-panel type-choice-panel">
            <div class="panel-text">
              <p>На первом экране пользователь выбирает электронную или пластиковую карту. Я вынес это решение в начало, потому что у карт разная логика.</p>
              <p>Электронная карта подходит для быстрого подарка по СМС.</p>
              <p>Пластиковая — для физического подарка в фирменной упаковке, с доставкой или самовывозом.</p>
            </div>
            ${img("type-choice.png", "Выбор типа карты", "panel-main-image")}
            ${img("arrow-choice-1.svg", "", "annotation annotation--choice-1")}
            ${img("arrow-choice-2.svg", "", "annotation annotation--choice-2")}
          </div>
        </section>

        <section class="solution-block">
          <p class="solution-kicker">Решение</p>
          <h2>Электронная карта</h2>
          <div class="big-panel ecard-panel">
            <div class="callout callout--left">
              <p>Для электронной карты спроектирован пошаговый конфигуратор</p>
              <p>Такой формат не перегружает пользователя большой формой и постепенно ведёт его от выбора суммы к проверке готового подарка.</p>
              <p>Выбор номинала и дизайна</p>
            </div>
            ${img("ecard-amount.png", "Выбор номинала и дизайна", "ecard-amount")}
            ${img("arrow-ecard-1.svg", "", "annotation arrow-ecard-1")}
            <p class="label label--recipient">На шаге получателя я разделил сценарии «В подарок» и «Для себя»:</p>
            <p class="label label--recipient-fields">Для подарка доступны поля телефон, email, имя получателя, имя отправителя и поздравление</p>
            ${img("arrow-ecard-2.svg", "", "annotation arrow-ecard-2")}
            ${img("ecard-recipient.png", "Сценарий подарка", "ecard-recipient")}
            <p class="label label--self">Для покупки карты себе сценарий короче</p>
            ${img("arrow-ecard-3.svg", "", "annotation arrow-ecard-3")}
            ${img("ecard-self.png", "Сценарий для себя", "ecard-self")}
            <p class="label label--schedule">Шаг выбора времени</p>
            <p class="label label--schedule-desc">Пользователь может отправить карту сразу после оплаты или выбрать дату и время отправки. Это помогает подготовить подарок заранее.</p>
            ${img("arrow-ecard-4.svg", "", "annotation arrow-ecard-4")}
            ${img("arrow-ecard-5.svg", "", "annotation arrow-ecard-5")}
            ${img("ecard-schedule-wide.png", "Выбор времени", "ecard-schedule-wide")}
            ${img("ecard-schedule-small.png", "Короткий выбор времени", "ecard-schedule-small")}
            <p class="label label--preview">Перед оформлением заказа пользователь видит предпросмотр: получателя, поздравление, отправителя, телефон, email и время отправки.</p>
            ${img("ecard-review.png", "Предпросмотр электронной карты", "ecard-review")}
            <article class="note-card note-card--ecard-1">${img("star.svg", "", "note-star")}<p>Электронная карта стала не просто сертификатом, а персонализированным подарком.</p></article>
            <article class="note-card note-card--ecard-2">${img("star.svg", "", "note-star")}<p>Пользователь контролирует момент вручения и может проверить данные до оплаты</p></article>
          </div>
        </section>

        <section class="solution-block">
          <p class="solution-kicker">Решение</p>
          <h2>Пластиковая карта</h2>
          <div class="big-panel plastic-panel">
            <p class="label label--plastic-main">Пластиковая карта имеет отдельный сценарий, потому что это физический носитель. Пользователь может выбрать номинал, дизайн, количество и добавить несколько карт в один заказ.</p>
            ${img("arrow-plastic-1.svg", "", "annotation arrow-plastic-1")}
            ${img("arrow-plastic-2.svg", "", "annotation arrow-plastic-2")}
            ${img("arrow-plastic-3.svg", "", "annotation arrow-plastic-3")}
            ${img("pcard-choice.png", "Пластиковая карта", "plastic-choice")}
            ${img("pcard-list.png", "Список пластиковых карт", "plastic-list")}
            <p class="label label--plastic-list">Для этого я добавил список пластиковых карт. В нём можно редактировать карты, удалять, менять количество, добавлять новые и видеть итоговую сумму</p>
            ${img("arrow-plastic-4.svg", "", "annotation arrow-plastic-4")}
            <article class="note-card note-card--plastic">${img("star.svg", "", "note-star")}<p>Пользователь может собрать заказ из нескольких карт и контролировать его состав до оплаты</p></article>
          </div>
        </section>

        <section class="solution-block">
          <p class="solution-kicker">Решение</p>
          <h2>Доставка и самовывоз</h2>
          <div class="big-panel delivery-panel">
            <p class="label label--checkout">На странице оформления пользователь видит данные покупателя, способ получения, способ оплаты, комментарий и итоговую информацию о заказе.</p>
            ${img("arrow-delivery-1.svg", "", "annotation arrow-delivery-1")}
            ${img("checkout.png", "Оформление заказа", "checkout-image")}
            <p class="label label--delivery-method">Для пластиковой карты доступны два способа получения:<br />самовывоз из универмага<br />и курьерская доставка.</p>
            ${img("delivery-method.png", "Способ получения", "delivery-method")}
            ${img("arrow-delivery-2.svg", "", "annotation arrow-delivery-2")}
            ${img("arrow-delivery-3.svg", "", "annotation arrow-delivery-3")}
            ${img("arrow-delivery-4.svg", "", "annotation arrow-delivery-4")}
            <p class="label label--pickup">При самовывозе пользователь видит адрес<br />и время работы.</p>
            <div class="address-chip">${img("address-chip.png", "Адрес самовывоза")}</div>
            <p class="label label--courier">При доставке —<br />уточняет адрес, подъезд, квартиру или офис, этаж, домофон и комментарий для курьера</p>
            ${img("courier-map.png", "Курьерская доставка", "courier-map")}
            ${img("delivery-total.png", "Итог доставки", "delivery-total")}
            <p class="label label--delivery-total">Стоимость доставки добавляется в общую информацию о заказе</p>
            ${img("arrow-delivery-5.svg", "", "annotation arrow-delivery-5")}
            ${img("arrow-delivery-6.svg", "", "annotation arrow-delivery-6")}
          </div>
        </section>

        <section class="solution-block">
          <p class="solution-kicker">Решение</p>
          <h2>Личный кабинет и заказы</h2>
          <div class="big-panel account-panel">
            <div class="callout callout--account">
              <p>Личный кабинет стал продолжением сервиса после покупки. В нём пользователь видит действующие карты, архив, баланс, срок действия, QR-код, поздравления и последние операции.</p>
              <p>Я разделил активные и архивные карты, чтобы пользователь видел актуальные карты в первую очередь, но не терял историю старых.</p>
            </div>
            ${img("account-main.png", "Личный кабинет", "account-main")}
            ${img("arrow-account-1.svg", "", "annotation arrow-account-1")}
            ${img("account-qr.png", "QR-код карты", "account-qr")}
            ${img("account-greeting.png", "Поздравление карты", "account-greeting")}
            ${img("arrow-account-2.svg", "", "annotation arrow-account-2")}
            ${img("arrow-account-3.svg", "", "annotation arrow-account-3")}
            ${img("orders-list.png", "Заказы", "orders-list")}
            <p class="label label--orders">В разделе заказов пользователь видит покупки, статусы, состав заказа, оплату и детали доставки<br /><br />Для заказов предусмотрены состояния: не оплачен, в пути, завершён, отменён.<br /><br />Для неоплаченного заказа доступны действия: оплатить или отменить</p>
            ${img("order-detail.png", "Детали заказа", "order-detail")}
            ${img("arrow-account-4.svg", "", "annotation arrow-account-4")}
            <article class="note-card note-card--account">${img("star-result.svg", "", "note-star")}<p>Пользователь может самостоятельно проверить баланс, открыть QR-код, посмотреть поздравление, историю операций и статус заказа без обращения в поддержку.</p></article>
          </div>
        </section>

        <section class="section-block handoff">
          <h2>Handoff</h2>
          <article class="handoff-row">
            <div><h3>Рабочий прототип</h3><p>Помощь разработчикам в понимании<br />процесса оформления</p></div>
            ${img("handoff-prototype.png", "Рабочий прототип", "handoff-prototype")}
          </article>
          <article class="handoff-row">
            <div><h3>Ошибочные состояния</h3><p>Проработка всех ошибочных состояний интерфейса</p></div>
            ${img("handoff-error-1.png", "Ошибочные состояния", "handoff-error handoff-error--one")}
            ${img("handoff-error-2.png", "Ошибочные состояния", "handoff-error handoff-error--two")}
          </article>
          <article class="handoff-row">
            <div><h3>Логика полей</h3><p>Проработка функционала полей ввода<br />для улучшения пользовательского опыта</p></div>
            ${img("handoff-dev.png", "Development", "handoff-dev handoff-dev--one")}
            ${img("handoff-dev.png", "Development", "handoff-dev handoff-dev--two")}
          </article>
        </section>

        <section class="section-block">
          <h2>Итоги</h2>
          <div class="triple-grid">
            ${infoCard("До", "Подарочные карты работали как витрина с базовой покупкой. Пользователь мог выбрать карту и номинал, но не получал полноценного сценария подарка и управления картой после покупки.")}
            ${infoCard("После", "Появился полноценный сервис: электронные и пластиковые карты, сценарий подарка, доставка, оплата, личный кабинет, баланс, QR-код, архив, операции и статусы заказов.")}
            <article class="gradient-card gradient-card--result"><h3>Результат</h3><p>Сервис был запущен на сайте «Цветного». Он объединил покупку, дарение, доставку, оплату и управление подарочными картами после покупки.</p></article>
          </div>
        </section>

        <section class="section-block">
          <h2>Рефлексия</h2>
          <p class="section-text">Этот проект был ценен тем, что я работал не с отдельным экраном, а с полноценным сервисом: выбор карты, конфигуратор, оформление заказа, доставка, личный кабинет, операции и статусы.</p>
          <div class="triple-grid reflection-grid">
            ${infoList("Что получилось хорошо", ["удалось собрать разные сценарии в единую структуру;", "электронная карта стала более персонализированной;", "пластиковая карта получила отдельную логику заказа;", "личный кабинет стал продолжением сервиса после покупки;", "макеты были подготовлены для разработки."])}
            ${infoList("Что можно было сделать лучше", ["провести полноценные пользовательские тесты до разработки;", "заложить отдельный этап дизайн-ревью после реализации;", "собрать метрики после запуска;", "проверить, на каких шагах пользователи чаще ошибаются или возвращаются назад;", "доработать визуальные детали после запуска."])}
            <article class="gradient-card gradient-card--result"><h3>Главный вывод</h3><p>Для продуктового дизайна важно проектировать не только момент покупки, но и весь жизненный цикл продукта. В случае подарочной карты это не только номинал и дизайн, но и момент вручения, получение, использование, баланс, история операций и доверие к сервису.</p></article>
          </div>
        </section>

        <section class="section-block future">
          <h2>Future vision</h2>
          <p class="section-text">После запуска основной версии сервиса я дополнительно проработал идеи, которые могут усилить подарочный опыт.</p>
          <h3>3D-поздравление</h3><p class="section-text">Получатель электронной карты может открыть короткую анимированную сцену с поздравлением.</p><div class="future-video"><iframe src="https://kinescope.io/embed/rWUg9mixLE1rW34gAsECrj" title="3D-поздравление" allow="autoplay; fullscreen; picture-in-picture; encrypted-media; gyroscope; accelerometer; clipboard-write; screen-wake-lock;" frameborder="0" allowfullscreen width="1920" height="1080" loading="lazy"></iframe></div>
          <h3>AR-сценарий для физической карты</h3><p class="section-text">Пользователь наводит камеру на пластиковую карту и видит цифровую анимацию, связанную с её дизайном.</p><div class="future-video"><iframe src="https://kinescope.io/embed/qSYMgidAM61i1eGemU8424" title="AR-сценарий для физической карты" allow="autoplay; fullscreen; picture-in-picture; encrypted-media; gyroscope; accelerometer; clipboard-write; screen-wake-lock;" frameborder="0" allowfullscreen width="1920" height="1080" loading="lazy"></iframe></div>
          <h3>Мини-игра «Лови скидки»</h3><p class="section-text">Игровая механика может вовлекать пользователей в бренд и выдавать промокоды через лидерборд.</p><div class="future-video"><iframe src="https://kinescope.io/embed/jcEW1nVT5Di7j8CYRzxdCF" title="Мини-игра Лови скидки" allow="autoplay; fullscreen; picture-in-picture; encrypted-media; gyroscope; accelerometer; clipboard-write; screen-wake-lock;" frameborder="0" allowfullscreen width="1920" height="1080" loading="lazy"></iframe></div>
          <h3>Сезонные дизайны карт</h3><p class="section-text">Коллекции карт можно развивать под праздники, события и персональные поводы</p>
          <div class="future-image">${img("future-seasonal-designs.png", "Сезонные дизайны карт")}</div>
          <p class="section-text">Эти идеи не входили в запущенную версию, поэтому в кейсе они показаны как направление дальнейшего развития продукта</p>
        </section>
      </div>
    </main>

    <footer id="contacts" class="site-footer">
      <div class="site-footer__top">
        <div class="site-footer__copyright">
          <p>© 2025 Eldar Galiamov</p>
          <a class="site-footer__button pill pill--light" href="https://t.me/eldarglmv" target="_blank" rel="noopener noreferrer">Telegram</a>
        </div>
        <div class="footer-contact">
          <div class="footer-contact__main">
            <p>@eldarglmv</p>
            <a href="mailto:eldargaliamov19@gmail.com" target="_blank" rel="noopener noreferrer">eldargaliamov19@gmail.com</a>
          </div>
          <nav class="footer-contact__links" aria-label="Социальные ссылки">
            <a href="../privacy.html">Конфиденциальность</a>
            <a href="https://t.me/eldarglmv" target="_blank" rel="noopener noreferrer">Telegram <span aria-hidden="true">↗</span></a>
          </nav>
        </div>
      </div>
      ${img("home-footer-mark.svg", "Eldar.GLMV", "footer-mark")}
    </footer>
  `;

  initCaseMotion(root);
  initCaseLightbox(root);

  function initCaseMotion(scope) {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const lowEndDevice =
      typeof navigator !== "undefined" &&
      ((navigator.deviceMemory !== undefined && navigator.deviceMemory <= 2) ||
        (navigator.deviceMemory === undefined && navigator.hardwareConcurrency <= 4));
    const shouldAnimate = !reduceMotion && !lowEndDevice;
    const header = scope.querySelector(".home-header");

    const updateHeader = () => {
      if (!header) return;
      header.classList.toggle("is-scrolled", window.scrollY > 8);
    };

    updateHeader();
    window.addEventListener("scroll", updateHeader, { passive: true });

    const revealSelectors = [
      ".back-link",
      ".project-hero__copy",
      ".hero-visual",
      ".section-block",
      ".solution-block",
      ".info-card",
      ".gradient-card",
      ".competitor-card",
      ".flow-panel",
      ".big-panel",
      ".old-solution",
      ".stage-row span",
      ".chip",
      ".tool-chip",
      ".handoff-row",
      ".case-video",
      ".future-video",
      ".future-image",
      ".site-footer__top > *",
      ".footer-mark",
    ];
    const revealItems = [...new Set(revealSelectors.flatMap((selector) => [...scope.querySelectorAll(selector)]))];

    revealItems.forEach((item, index) => {
      item.classList.add("motion-reveal");
      item.style.setProperty("--reveal-delay", `${Math.min((index % 6) * 45, 225)}ms`);
      if (item.matches(".hero-visual, .big-panel, .flow-panel, .old-solution, .case-video, .future-video, .future-image")) {
        item.classList.add("motion-reveal--image");
      }
      if (item.matches(".chip, .tool-chip, .stage-row span")) {
        item.classList.add("motion-reveal--pop");
      }
    });

    if (!shouldAnimate || !("IntersectionObserver" in window)) {
      revealItems.forEach((item) => item.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.12 },
    );

    revealItems.forEach((item) => observer.observe(item));
  }

  function initCaseLightbox(scope) {
    const images = [...scope.querySelectorAll('.case-page img[alt]:not([alt=""])')].filter(
      (image) => !image.classList.contains("brand__logo") && !image.classList.contains("tool-chip__image"),
    );

    if (!images.length) return;

    const modal = document.createElement("div");
    modal.className = "image-lightbox";
    modal.hidden = true;
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("aria-label", "Просмотр изображения");
    modal.innerHTML = `
      <button class="image-lightbox__close" type="button" aria-label="Закрыть">×</button>
      <button class="image-lightbox__nav image-lightbox__nav--prev" type="button" aria-label="Предыдущее изображение">‹</button>
      <figure class="image-lightbox__figure">
        <div class="image-lightbox__viewport">
          <img class="image-lightbox__image" alt="" />
        </div>
        <figcaption class="image-lightbox__caption"></figcaption>
      </figure>
      <button class="image-lightbox__zoom" type="button" aria-label="Увеличить изображение">+</button>
      <button class="image-lightbox__nav image-lightbox__nav--next" type="button" aria-label="Следующее изображение">›</button>
    `;
    document.body.appendChild(modal);

    const modalImage = modal.querySelector(".image-lightbox__image");
    const caption = modal.querySelector(".image-lightbox__caption");
    const closeButton = modal.querySelector(".image-lightbox__close");
    const prevButton = modal.querySelector(".image-lightbox__nav--prev");
    const nextButton = modal.querySelector(".image-lightbox__nav--next");
    const zoomButton = modal.querySelector(".image-lightbox__zoom");
    let activeIndex = 0;
    let previousFocus = null;

    const setZoom = (isZoomed) => {
      modal.classList.toggle("is-zoomed", isZoomed);
      zoomButton.textContent = isZoomed ? "−" : "+";
      zoomButton.setAttribute("aria-label", isZoomed ? "Вписать изображение" : "Увеличить изображение");
    };

    const showImage = (index) => {
      activeIndex = (index + images.length) % images.length;
      const image = images[activeIndex];
      modalImage.src = image.currentSrc || image.src;
      modalImage.alt = image.alt;
      caption.textContent = image.alt;
      setZoom(false);
    };

    const openModal = (index, trigger) => {
      previousFocus = trigger;
      showImage(index);
      modal.hidden = false;
      document.body.classList.add("is-lightbox-open");
      closeButton.focus();
    };

    const closeModal = () => {
      modal.hidden = true;
      document.body.classList.remove("is-lightbox-open");
      setZoom(false);
      if (previousFocus) previousFocus.focus();
    };

    images.forEach((image, index) => {
      image.classList.add("zoomable-image");
      image.setAttribute("role", "button");
      image.setAttribute("tabindex", "0");
      image.setAttribute("aria-label", `${image.alt}. Открыть крупнее`);
      image.addEventListener("click", () => openModal(index, image));
      image.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openModal(index, image);
        }
      });
    });

    closeButton.addEventListener("click", closeModal);
    prevButton.addEventListener("click", () => showImage(activeIndex - 1));
    nextButton.addEventListener("click", () => showImage(activeIndex + 1));
    zoomButton.addEventListener("click", () => setZoom(!modal.classList.contains("is-zoomed")));
    modalImage.addEventListener("click", () => setZoom(!modal.classList.contains("is-zoomed")));
    modal.addEventListener("click", (event) => {
      if (event.target === modal) closeModal();
    });
    document.addEventListener("keydown", (event) => {
      if (modal.hidden) return;
      if (event.key === "Escape") closeModal();
      if (event.key === "ArrowLeft") showImage(activeIndex - 1);
      if (event.key === "ArrowRight") showImage(activeIndex + 1);
    });
  }
})();
