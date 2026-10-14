(() => {
  'use strict';
  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
  const asset = name => (window.EDA_ASSETS && window.EDA_ASSETS[name]) || `assets/${name}`;
  const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const icon = name => `<svg class="icon" aria-hidden="true"><use href="#i-${name}"/></svg>`;

  const dishes = {
    syrniki: {
      name: 'Сырники с ягодами', image: 'syrniki.webp', meal: 'Завтрак', weight: '220 г',
      description: 'Румяные сырники с йогуртом и свежими ягодами.',
      calories: '430', protein: '22 г', fat: '18 г', carbs: '45 г',
      ingredients: 'Творог, яйцо, пшеничная мука, йогурт, клубника, малина, голубика, мята.',
      allergens: ['Молоко', 'Яйцо', 'Пшеница']
    },
    chicken: {
      name: 'Курица терияки', image: 'chicken.webp', meal: 'Обед', weight: '350 г',
      description: 'С рисом, брокколи, морковью и соусом терияки.',
      calories: '520', protein: '35 г', fat: '16 г', carbs: '59 г',
      ingredients: 'Курица, рис, брокколи, морковь, эдамаме, капуста, соус терияки, кунжут.',
      allergens: ['Соя', 'Пшеница', 'Кунжут']
    },
    salmon: {
      name: 'Лосось с булгуром', image: 'salmon.webp', meal: 'Ужин', weight: '380 г',
      description: 'Запечённый лосось с булгуром, цукини и томатами.',
      calories: '650', protein: '37 г', fat: '26 г', carbs: '67 г',
      ingredients: 'Лосось, булгур из пшеницы, цукини, томаты черри, зелень, оливковое масло.',
      allergens: ['Рыба', 'Пшеница']
    }
  };
  const screens = [
    {image:'screen-welcome.webp', label:'Знакомство', title:'Никакой готовки. Только есть.', description:'Первое знакомство с сервисом. Подбор питания — основное действие; посмотреть меню можно до оформления подписки.'},
    {image:'screen-plan.webp', label:'Выбор подписки', title:'Еда под твой ритм.', description:'Формат питания, калорийность, удобные дни и полная стоимость недели. Автопродление, пауза и отмена обозначены заранее.'},
    {image:'screen-menu.webp', label:'Меню дня', title:'На сегодня еда есть.', description:'Завтрак, обед и ужин — в одном месте. Календарь переключает дни, а карточки помогают узнать состав и пищевую ценность.'},
    {image:'screen-dish.webp', label:'Карточка блюда', title:'Знакомься со своим обедом.', description:'Крупная фотография, состав, масса порции, БЖУ и аллергены. Если хочется чего-то другого, рядом — действие замены блюда.'},
    {image:'screen-delivery.webp', label:'Подписка и доставка', title:'Твои планы важнее.', description:'Ближайшее окно доставки и следующее списание видны сразу. Перенос, пропуск дня, пауза и отмена не спрятаны в настройках.'}
  ];

  // Responsive navigation, with Escape and outside-click dismissal.
  const header = $('.site-header');
  const menuToggle = $('.menu-toggle');
  const setMenu = open => {
    header.classList.toggle('nav-open', open);
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
  };
  menuToggle.addEventListener('click', () => setMenu(menuToggle.getAttribute('aria-expanded') !== 'true'));
  $$('.header-nav a').forEach(link => link.addEventListener('click', () => setMenu(false)));
  document.addEventListener('click', event => {
    if (!header.contains(event.target)) setMenu(false);
  });
  window.matchMedia('(min-width:931px)').addEventListener('change', event => { if (event.matches) setMenu(false); });

  // Native tabs, including keyboard navigation and truthful result counts.
  function keyboardTabs(container, direction, select) {
    container.addEventListener('keydown', event => {
      const tabs = $$('[role="tab"]', container);
      const current = tabs.indexOf(event.target.closest('[role="tab"]'));
      if (current < 0) return;
      const backward = direction === 'vertical' ? 'ArrowUp' : 'ArrowLeft';
      const forward = direction === 'vertical' ? 'ArrowDown' : 'ArrowRight';
      let next;
      if (event.key === forward) next = (current + 1) % tabs.length;
      else if (event.key === backward) next = (current - 1 + tabs.length) % tabs.length;
      else if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = tabs.length - 1;
      else return;
      event.preventDefault();
      select(tabs[next]);
      tabs[next].focus();
    });
  }
  const filters = $$('.filter-tabs button');
  function selectFilter(button) {
    const value = button.dataset.filter;
    filters.forEach(tab => {
      const selected = tab === button;
      tab.setAttribute('aria-selected', String(selected));
      tab.tabIndex = selected ? 0 : -1;
    });
    let visible = 0;
    $$('.meal-card').forEach(card => {
      card.hidden = value !== 'all' && card.dataset.category !== value;
      if (!card.hidden) visible++;
    });
    const grid = $('#meal-grid');
    grid.setAttribute('aria-labelledby', button.id);
    grid.scrollLeft = 0;
    $('.meal-count').textContent = visible === 3 ? '3 блюда на день' : '1 блюдо в примере';
    $('.swipe-hint').hidden = visible < 2;
  }
  filters.forEach(button => button.addEventListener('click', () => selectFilter(button)));
  keyboardTabs($('.filter-tabs'), 'horizontal', selectFilter);

  const features = {
    menu:{screen:'screen-menu.webp',caption:'Меню на неделю',number:'01 / 03'},
    plan:{screen:'screen-plan.webp',caption:'Питание под тебя',number:'02 / 03'},
    delivery:{screen:'screen-delivery.webp',caption:'Доставка без суеты',number:'03 / 03'}
  };
  const featureTabs = $$('.feature-tab');
  function selectFeature(button) {
    const feature = features[button.dataset.feature];
    if (!feature) return;
    featureTabs.forEach(tab => {
      const selected = tab === button;
      tab.setAttribute('aria-selected', String(selected));
      tab.tabIndex = selected ? 0 : -1;
    });
    $('#feature-screen').src = asset(feature.screen);
    $('#feature-screen').alt = `Макет приложения: ${feature.caption.toLowerCase()}`;
    $('#feature-panel').setAttribute('aria-labelledby', button.id);
    $('#feature-caption').textContent = feature.caption;
    $('.app-screen-caption > span:last-child').textContent = feature.number;
  }
  featureTabs.forEach(button => button.addEventListener('click', () => selectFeature(button)));
  keyboardTabs($('.feature-tabs'), 'vertical', selectFeature);

  // Keep the FAQ compact, without replacing native details/summary semantics.
  const questions = $$('.faq-list details');
  questions.forEach(detail => detail.addEventListener('toggle', () => {
    if (detail.open) questions.forEach(other => { if (other !== detail) other.open = false; });
  }));

  const dialog = $('#site-dialog');
  const dialogContent = $('#dialog-content');
  const closeButton = $('.dialog-close');
  let focusBeforeDialog = null;
  let galleryIndex = 0;

  function showDialog(content, view) {
    if (!dialog.open) focusBeforeDialog = document.activeElement;
    dialogContent.innerHTML = content;
    dialogContent.scrollTop = 0;
    dialog.dataset.view = view;
    if (!dialog.open) {
      const scrollbar = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.paddingRight = scrollbar > 0 ? `${scrollbar}px` : '';
      document.body.classList.add('modal-open');
      dialog.showModal();
    }
    closeButton.focus({preventScroll:true});
  }
  const closeDialog = () => { if (dialog.open) dialog.close(); };
  closeButton.addEventListener('click', closeDialog);
  dialog.addEventListener('close', () => {
    document.body.classList.remove('modal-open');
    document.body.style.paddingRight = '';
    delete dialog.dataset.view;
    if (focusBeforeDialog && focusBeforeDialog.isConnected) focusBeforeDialog.focus({preventScroll:true});
  });
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const bounds = dialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) closeDialog();
  });

  function showDish(slug) {
    const d = dishes[slug];
    if (!d) return;
    const nutrition = [[d.calories,'ккал'],[d.protein,'белки'],[d.fat,'жиры'],[d.carbs,'углеводы']].map(([value,label]) => `<div><strong>${esc(value)}</strong><span>${label}</span></div>`).join('');
    showDialog(`<div class="dish-dialog"><div class="dish-dialog-art"><span class="meal-tag">${esc(d.meal)} · ${esc(d.weight)}</span><img src="${asset(d.image)}" alt="${esc(d.name)}" width="720" height="720"></div><div class="dish-dialog-info"><div class="eyebrow">Пример меню «Баланс»</div><h2 id="dialog-title">${esc(d.name)}</h2><p>${esc(d.description)}</p><div class="nutrition" aria-label="Пищевая ценность на порцию">${nutrition}</div><h3>Состав</h3><p>${esc(d.ingredients)}</p><div class="allergens"><b>Аллергены:</b>${d.allergens.map(x=>`<span>${esc(x)}</span>`).join('')}</div><button class="button" data-action="gallery" data-screen="2" type="button">Как выбирать блюда${icon('up-right')}</button><p class="micro">Данные и изображение — пример для дизайн-концепции, не предложение реального блюда.</p></div></div>`, 'dish');
  }

  function updateGallery() {
    const screen = screens[galleryIndex];
    $('#gallery-screen').src = asset(screen.image);
    $('#gallery-screen').alt = `Макет приложения: ${screen.label}`;
    $('#dialog-title').textContent = screen.title;
    $('#gallery-description').textContent = screen.description;
    $('#gallery-label').textContent = screen.label;
    $('.gallery-counter').textContent = `${galleryIndex + 1} / ${screens.length}`;
    $('[data-gallery-step="-1"]').disabled = galleryIndex === 0;
    $('[data-gallery-step="1"]').disabled = galleryIndex === screens.length - 1;
    $$('.gallery-dot').forEach((button, i) => button.setAttribute('aria-current', String(i === galleryIndex)));
  }
  function openGallery(index = 0) {
    galleryIndex = Number.isFinite(Number(index)) ? Math.max(0, Math.min(screens.length - 1, Number(index))) : 0;
    showDialog(`<div class="gallery-layout"><div class="gallery-art"><div class="gallery-device"><img id="gallery-screen" src="${asset(screens[galleryIndex].image)}" width="780" height="1688" alt="Макет приложения"></div></div><div class="gallery-info"><div class="eyebrow" id="gallery-label"></div><h2 id="dialog-title"></h2><p id="gallery-description"></p><p class="gallery-notice">Это просмотр пяти макетов. Кнопки внутри изображений не нажимаются; заказы и оплата недоступны.</p><div class="gallery-controls"><button class="round-button" type="button" data-gallery-step="-1" aria-label="Предыдущий экран">${icon('back')}</button><span class="gallery-counter" aria-live="polite" aria-atomic="true"></span><button class="round-button" type="button" data-gallery-step="1" aria-label="Следующий экран">${icon('arrow')}</button></div><div class="gallery-dots" aria-label="Выбор экрана">${screens.map((s,i)=>`<button class="gallery-dot" type="button" data-gallery-index="${i}" aria-label="Экран ${i+1}: ${esc(s.label)}" aria-current="false"></button>`).join('')}</div></div></div>`, 'gallery');
    updateGallery();
  }
  function comingSoon(store) {
    const selectedStore = store === 'Google Play' ? 'Google Play' : 'App Store';
    showDialog(`<div class="plain-dialog"><img class="dialog-smile" src="${asset('smile-flat-black.webp')}" alt="" width="269" height="279"><div class="eyebrow">${selectedStore} · пока без ссылки</div><h2 id="dialog-title">Сначала — концепция.<br>Потом — приложение.</h2><p>Еда.Есть ещё не опубликована в App Store и Google Play. Дата запуска не объявлена, поэтому кнопка не ведёт на выдуманную страницу магазина.</p><p>Пока можно рассмотреть интерфейс и познакомиться с идеей сервиса — без регистрации и списаний.</p><button class="button" type="button" data-action="gallery">Посмотреть макеты${icon('up-right')}</button><p class="micro">Метка «Скоро» — состояние промо-макета, а не обещание даты релиза.</p></div>`, 'store');
  }
  function aboutConcept() {
    showDialog(`<div class="plain-dialog"><div class="eyebrow">О проекте</div><h2 id="dialog-title">Настоящий сайт.<br>Демонстрационный сервис.</h2><p>Это работающий промо-сайт дизайн-концепции «Еда.Есть». Можно фильтровать меню, открывать состав блюд, переключать возможности приложения и просматривать макеты.</p><ul><li>Мобильное приложение не опубликовано. Заказы, доставка и оплата не подключены.</li><li>Блюда, фотографии, цены, порции, нутриенты и условия подписки показаны как примеры.</li><li>В коде демо нет аналитики, платёжных форм и отправки персональных данных.</li><li>Публикация реального сервиса потребует рабочих ссылок на магазины, подтверждённого меню, условий подписки и юридических документов.</li></ul><p class="micro">Логотип и палитра предоставлены владельцем проекта. Фотографии блюд сгенерированы для концепции. Шрифт Manrope — SIL Open Font License.</p><button class="button" type="button" data-action="close">Понятно${icon('check')}</button></div>`, 'about');
  }

  document.addEventListener('click', event => {
    const dish = event.target.closest('[data-dish]');
    if (dish) { showDish(dish.dataset.dish); return; }
    const step = event.target.closest('[data-gallery-step]');
    if (step && !step.disabled) {
      galleryIndex = Math.max(0, Math.min(screens.length - 1, galleryIndex + Number(step.dataset.galleryStep)));
      updateGallery(); return;
    }
    const dot = event.target.closest('[data-gallery-index]');
    if (dot) { galleryIndex = Number(dot.dataset.galleryIndex); updateGallery(); return; }
    const action = event.target.closest('[data-action]');
    if (!action) return;
    switch(action.dataset.action) {
      case 'gallery': openGallery(action.dataset.screen || 0); break;
      case 'store': comingSoon(action.dataset.store); break;
      case 'about': aboutConcept(); break;
      case 'close': closeDialog(); break;
    }
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && header.classList.contains('nav-open') && !dialog.open) {
      setMenu(false); menuToggle.focus();
    }
    if (dialog.open && dialog.dataset.view === 'gallery' && !event.altKey && !event.ctrlKey && !event.metaKey) {
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        event.preventDefault();
        const delta = event.key === 'ArrowRight' ? 1 : -1;
        galleryIndex = Math.max(0, Math.min(screens.length - 1, galleryIndex + delta));
        updateGallery();
      }
    }
  });
})();
