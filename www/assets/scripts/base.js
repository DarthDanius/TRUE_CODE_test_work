
/**
 * объект с методами форматирования чисел. Пример: Format.money.to(100)
 */
var Format = {}
if (typeof wNumb !== 'undefined') {
    Format.money = wNumb({
        mark: ',',
        decimals: 2,
        thousand: ' ',
        prefix: '',
        suffix: ''
    });
}

function delArrayItemByIndex( array, index ) {
    let clone = [...array]
    return [...clone.slice(0, index), ...clone.slice(index + 1)]
}

function delArrayItemByItem( array, item ) {
    if (!array.length) return false
    let index = array.findIndex( i => i === item)
    if ( index === -1) return array
    let clone = [...array]
    return [...clone.slice(0, index), ...clone.slice(index + 1)]
}

function setDelay(response, ms) {
    return new Promise((resolve) => {
        setTimeout((r) => resolve(r), ms, response);
    })
}

// пример: validator.submit.on('click', setEventDelay(null, handler, 1000, true) )
/**
 * Задержка для callback-функции
 * @param {*} arg 
 * @param {*} f 
 * @param {*} ms 
 * @param {*} init 
 * @param  {...any} args 
 * @returns 
 */
function setEventDelay(arg, f, ms, init = false, ...args) { // задержка для функции. init = true выполнить функцию до установки таймера.
    let timer = null;
    // console.log(arg, f, ms, init = false, ...args)

    function eventToArgs(e, args) {
        const argsLength = args.length
        if (argsLength <= args.length) {
            args[0] = e
        } else {
            args.unshift(e)
        }
    }

    function executor(e) {

        if (!timer) {
            if (init) {
                timer = setTimeout(() => {
                    clearTimeout(timer);
                    timer = null;
                }, ms, e);
                eventToArgs(e, args)
                f(arg, ...args);
            } else {
                timer = setTimeout(
                    function () {
                        clearTimeout(timer);
                        timer = null;
                        eventToArgs(e, args)
                        f(arg, ...args);
                    },
                    ms,
                    e
                )
            }
        }
    }

    return executor
}

/**
 * отправление ajax запроса, обработка ошибок и показ сообщений.
 * @param {string} url 
 * @param {FormDate} body
 * @param {bool} popup_open открыть popup с сообщением от сервера
 * @returns {Promise} Полученная с сервера информация
 */
function ajaxLoad(url, body, popup_open=true){
    let popup = new Popup
    Preloader(true)

    return fetch(url, {
        method: 'POST',
        body
    })
    .then( (response) => response.json() )
    .then( (response) => { 
        if ( response.status === true ) {
            if ( popup_open ) {
                popup.open(response.title, response.message)
            }

        } else {
            console.error(response.errors)
            popup.open( response.errors[0]['title'] || 'ошибка', response.errors[0]['message'])
        }
        Preloader(false)
        return response
    })
    .catch((err) => {
        Preloader(false)
        console.error(err)
        popup.open('', 'ошибка передачи данных с сервера')
    })
}

/**
 * находит и возвращает массив DOM-элементов по атрибуту
 * @param {string | string[] | HTMLElement} key значение атрибута data-handler.
 * Можно передать массив, где вторым аргументом является селектор уточняющего контекста.
 * Можно передавать HTMLElement.
 * @param {string} attribute 
 * @returns {HTMLElement []}
 */
function getHtmlElements( key, attribute='' ) {
    let selector = '';
    let elements = []

    if ( key instanceof HTMLElement ) {
        elements.push( key )

    } else {
        if ( ['string', 'number'].includes( typeof key ) ) {
            selector = `[${attribute}="${key}"]`

        } else if ( Array.isArray(key) && key.length ) {

            // проверка, есть ли контекст
            let context_selector = key[1]
            selector = ( context_selector ) ? `${context_selector} [${attribute}="${key}"]` : `[${attribute}="${key}"]`
        }

        if ( !selector ) {
            console.error('empty selector')
            return false
        }

        elements = Array.from( document.querySelectorAll( selector ) )
    }

    return elements
}

/**
 * возвращает смещение элемента относительно документа
 * @param {HTMLElement} element 
 * @returns 
 */
function getFullOffsetTop( element ) {
    if (!element) return false

    let offset = +element.offsetTop
    let parent = element.offsetParent

    do {
        if (parent === null ) break
        offset += parent.offsetTop

        if (parent.offsetParent === null) break
        parent = parent.offsetParent
    }
    while ( parent.offsetParent )

    return offset
}

/**
 * добавляет callback для элементов с атрибутами data-handler
 * @param {string | string[] | HTMLElement} key значение атрибута data-handler.
 * Можно передать массив, где вторым аргументом является селектор уточняющего контекста.
 * Можно передавать HTMLElement.
 * @param {string} event_type тип назначаемого события
 * @param {function} callback функция обратного вызова
 */
function addHandlersCallback( key, event_type, callback ) {
    let selector = '';
    let handlers = getHtmlElements( key, 'data-handler' )

    handlers.forEach( handler => {
        handler.addEventListener( event_type, callback )
    })
}

/**
 * склоняет существительное в зависимости от количества
 * пример: (7, "товар", "товара", "товаров") вернет 'товаров'
 * @param int count
 * @param string nominative именительный падеж
 * @param string genitive родительный падеж
 * @param string plural множественное число
 * @return string
 */
function declension(count, nominative, genitive, plural) {
    let m = count % 10;
    let j = count % 100;
    if (m == 0 || m >= 5 || (j >= 10 && j <= 20))
        return plural;
    if (m >= 2 && m <= 4)
        return  genitive;
    return nominative;
}

function is_hide(elem) {
    let width = elem.offsetWidth
    let height = elem.offsetHeight
    let styles = window.getComputedStyle(elem)

    return ( (width === 0 && height === 0) || (elem.style && elem.style.display) || (styles.display && styles.display === "none") )
}

function Preloader(show = false, element=null) {
    let preloader = document.querySelector('[data-element="preloader"]')
    if (!preloader) {
        preloader = document.createElement('div')
        preloader.classList.add('preloader')
        preloader.dataset.element = 'preloader'
    }

    if (element instanceof Element) {
        preloader.classList.add('element')
        element.append(preloader)
    } else {
        preloader.classList.remove('element')
        document.body.append(preloader)
    }

    if (show) {
        preloader.classList.add('show')
    } else {
        preloader.classList.remove('show')
    }

    return preloader
}

function smoothScrollByElement( href, topOffset=0 ) {

    let url = new URL( href, location.origin )
    if ( url.pathname !== location.pathname ) {
        location.href = url.href
        return false
    }

    try {
        element = document.querySelector(href)
    } catch (error) {
        // error_code
        return false
    }
    if (!element) return false
    console.log(element)
    
    let scrollTarget = element;
    let elementPosition = scrollTarget.getBoundingClientRect().top;
    let offsetPosition = elementPosition - topOffset;
    // console.log(element, elementPosition, offsetPosition)

    window.scrollBy({
        top: offsetPosition,
        behavior: 'smooth'
    });
}

/**
 * склоняет существительное в зависимости от количества
 * пример: (7, "товар", "товара", "товаров") вернет 'товаров'
 * @param int count
 * @param string nominative именительный падеж
 * @param string genitive родительный падеж
 * @param string plural множественное число
 * @return string
 */
function declension(count, nominative, genitive, plural) {
    let m = count % 10;
    let j = count % 100;
    if (m == 0 || m >= 5 || (j >= 10 && j <= 20))
        return plural;
    if (m >= 2 && m <= 4)
        return  genitive;
    return nominative;
}

class Handler {
    
    constructor ( key, options={} ) {

        let options_default = {
            'before_init': null,
        }
        this.options = { ...options_default, ...options };
        this.element = document.querySelector( `[data-handler="${key}"]` )
        if ( !this.element ) {
            // console.error('empty handler element')
        }

        if ( this.element && this.options.before_init ) {
            this.options.before_init( this.element )
        }
    }

    /**
     * навешивает обработчик события
     * @param {string} event_type тип события
     * @param {function} callback 
     */
    on( event_type, callback ) {
        if (this.element) {
            this.element.addEventListener( event_type, callback )
        } else {
            // console.error('empty handler element')
        }
    }

    /**
     * переключить css классы элемента
     * @param {string | string[]} classList 
     */
    toggle( classList ) {
        if ( !Array.isArray() ) {
            classList = [classList]
        }
        classList.forEach( className => {
            this.element.classList.toggle( className )
        })
    }
}

/**
 * Надстройка над dom елементами с атрибутом data-interface. Класс может иметь несколько таких элементов, но у всех них будет единое значение
 */
class Interface {

    /**
     * при инициализации получает значение из первого элемента
    * @param {string | string[] | HTMLElement} key значение атрибута data-handler.
    * Можно передать массив, где вторым аргументом является селектор уточняющего контекста.
    * Можно передавать HTMLElement.
     */
    constructor( key ) {
        this.elements = []
        this.value = null
        this.elements = getHtmlElements( key, 'data-interface' )

        if ( this.elements.length ) {
            if ( typeof this.elements[0].value !== 'undefined' ) {
                this.value = this.elements[0].value
            } else {
                this.value = this.elements[0].innerText
            }
        }
    }

    /**
     * получить массив элементов
     * @returns []
     */
    getElements() {
        return this.elements
    }

    /**
     * получить значение объекта
     * @returns mixed
     */
    get() {
        return this.value
    }

    /**
     * задать значение объекта
     * @param {mixed} value 
     */
    set( value ) {
        this.value = value
        this.elements.forEach( element => {
            if ( typeof element.value !== 'undefined' ) {
                element.value = this.value
            } else {
                element.innerText = this.value
            }
        })
    }

    /**
     * переключить css классы элементов
     * @param {string | string[]} classList 
     */
    toggle( classList ) {
        if ( typeof classList !== 'object' ) {
            classList = [classList]
        }
        this.elements.forEach( element => {
            classList.forEach( className => {
                element.classList.toggle( className )
            })
        })
    }
}

/**
 * 1) отправка формы с помощью ajax
 * 2) валидация формы. параметры валидации задается следующим образом (в порядке приоритета от большего к меньшему)
 *  a) через объект options.fields[{name: имя поля, func: (this)=>{}}], где name - имя поля, а func - функция валидации этого поля, принимающая аргументом HTMLElement этого поля
 *  b) через атрибут указанный в options.validate_type_attribute, значение которого должно совпадать с одним из списка (email, phone, required, list)
 * 3) обработка результата с помощью передаваемой callback функции
 * 
 * @param {HTMLElement} element - DOM-элемент формы
 * @param {string} options.url 
 * @param {string} options.action
 * @param {string | HTMLElement} options.submit_btn - селектор или DOM элемент кнопки отправки формы. По умолчанию [type="submit"]
 * @param {string} options.validate_type_attribute - атрибут, содержащий значения типа 
 * @param {string} options.error_classname - css классы, которые будут присваиваться элементам ошибок
 * @param {function} options.callback_validate - функция срабатывает перед отправкой. 
 * @param {function} options.callback_success - функция обработки результата при успехе. 
 * @param {function} options.callback_error - функция обработки результата при провале. 
 * @param {function} options.fields - массив настроек для отдельных полей. 
 */
class Form {

    constructor(element, options) {

        this.exists = false

        let options_default = {
            url: null,
            action: null,
            submit_btn: '[type="submit"]',
            validate_type_attribute: 'data-type',
            error_classname: 'form-tooltip form-tooltip-top',
            callback_validate: null,
            callback_success: null,
            callback_error: null,
            fields: [
                {
                    name: '',
                    validate_function: null,
                    masked_function: null
                }
            ],
        }

        if (!element) {
            // console.error('Form: пустой DOM-элемент формы')
            return false
        }
        if (!options.url) {
            console.error('Form: не задан url')
            return false
        }
        if (!options) {
            console.error('Form: не заданы options')
            return false
        }
        if (!options.action) {
            options.action = element.dataset.action
        }
        if (!options.action) {
            console.error('Form: не задано действие action')
            return false
        }

        /* options */
        this.options = { ...options_default, ...options }

        /* element */
        this.element = element

        /* submit_btn */
        this.submit_btn = null
        if ( this.options.submit_btn ) {
            if ( typeof this.options.submit_btn !== 'string' ) {
                if ( this.options.submit_btn instanceof HTMLElement ) {
                    this.submit_btn = this.options.submit_btn
                } else {                    
                    console.error('Form: submit_btn не является объектом HTMLElement')
                    return false
                }
            } else {
                this.submit_btn = this.element.querySelector(this.options.submit_btn)
                if (!this.submit_btn) {      
                    console.error(`Form: не удалось найти submit_btn по селектору {this.options.submit_btn}`)
                    return false
                }
            }
        } else { 
            console.error(`Form: не задан options.submit_btn`)
            return false
        }

        /* popup */
        this.popup = (typeof Popup !== 'undefined') ? new Popup : null

        /* fields */
        if (this.element.dataset.type) {
            this.options.action = this.element.dataset.type
        }

        let field_selectors = ['textarea', 'input[type="checkbox"]', 'input[type="radio"]', 'input[type="password"]', 'input[type="text"]', 'input[type="date"]', 'input[type="hidden"]', 'select']
        let field_elements = Array.from(this.element.querySelectorAll(field_selectors.join(', '))) 
        this.fields = []
        this.addFields( field_elements )

        /* invalid_fields */
        this.invalid_fields = []
        
        /* event handlers */
        // submit
        if ( this.element.tagName === 'FORM' ) {
            this.element.addEventListener('submit', (e) => {
                e.preventDefault()
                if ( this.validation() ) {
                    this.submit()
                }
            })
        } else {
            this.submit_btn.addEventListener('click', (e) => {
                if ( this.validation() ) {
                    this.submit()
                }
            })
        }

        // change
        this.element.addEventListener('change', (e) => {
            let field = this.getFieldByElement(e.target)
            if (!field) return false
            this.validation(field)
        })

        // если инициализация прошла успешно - переключаем exists на true
        this.exists = true
    }

    addFields( field_elements ) {
        field_elements.forEach( (field_element, index) => {
            
            let field = {}

            // элемент поля
            field.element = field_element
            
            // пропускаем элементы без name
            if (!field_element.name) return
            field.name = field_element.name.trim()

            // если элемент с таким-же атрибутом name присутствует - пропустить
            if ( this.fields.findIndex( find_field => find_field.name === field.name ) !== -1 ) {
                return
            }

            // ищем опции для поля
            field.validate_function = null
            field.masked_function = null
            let current_field_options = this.options.fields.find( filed_options => filed_options.name === field.name)
            if (current_field_options) {
                field.validate_function = current_field_options.validate_function
                field.masked_function = current_field_options.masked_function
            }

            // тип поля
            field.type = ''
            switch (field_element.tagName) {                
                case 'TEXTAREA':
                    field.type = 'input'
                break

                case 'INPUT':

                    switch (field_element.getAttribute('type')) {
                        case 'checkbox':
                            field.type = 'checkbox'
                        break

                        case 'radio':
                            field.type = 'radio'
                        break

                        default:
                            field.type = 'input'
                        break
                    }
                break

                case 'SELECT':
                    field.type = 'select'
                break
            }

            // тип валидации
            field.validate_type = field_element.getAttribute(this.options.validate_type_attribute)

            // обязательно ли к заполнению
            if (field_element.required || field.validate_type === 'required') {
                field.required = true
                field_element.removeAttribute('required')
            } else {
                field.required = false
            }

            // индекс поля
            field.index = index

            // маскирование
            if ( typeof Inputmask !== 'undefined' ) {

                if ( field.validate_type === 'phone' ) {
                    console.info('field phone masked')
                    Inputmask({
                        "mask": '+7(999) 999-9999'
                    }).mask( field.element )
                }
            }

            this.fields.push(field)
        })
    }

    setFieldByName( name, key, value ) {
        let find_field = this.fields.find( field => field.name === name )
        if ( !find_field ) {
            return
        }

        find_field[key] = value
    }

    checkEmpty(field) {
        let is_not_empty = true
        switch ( field.type ) {
            case 'input':
            case 'textarea':
                let value = field.element.value.trim()
                if ( value === '' ) {
                    is_not_empty = false
                }
            break

            case 'checkbox':
                if ( !field.element.checked ) {
                    is_not_empty = false
                }
            break
        }

        return is_not_empty
    }

    showError( field, show=true ) {

        // конкретно эта реализация добавляет элемент с текстом ошибки сразу за элементом поля.
        let error_element = null
        if (field.element.nextElementSibling && field.element.nextElementSibling.classList.contains( ...this.options.error_classname.split(' ') )) {
            error_element = field.element.nextElementSibling
        }

        if ( show ) {
            let error = (field.error) ? field.error : 'Ошибка'
            
            if ( error_element ) {
                error_element.innerHTML = error
            } else {
                error_element = document.createElement('span')
                this.options.error_classname.split(' ').forEach( classname => error_element.classList.add(classname) )
                error_element.innerHTML = error
                field.element.after(error_element)
            }
        } else {
            if ( error_element ) {
                error_element.remove()
            }
        }
    }

    validation(fields=[]) {

        let invalid_fields = []

        if ( fields.length !== undefined && !fields.length ) {
            fields = [...this.fields]
            this.refresh_all();

        } else {
            if ( fields.length === undefined ) {
                fields = [fields]
            }

            this.refresh(fields);
        }

        let is_valid_all = true;

        for ( let field of fields ) {

            let is_valid = true

            // проверяем на пустоту
            if ( is_valid && field.required ) {
                if ( !this.checkEmpty(field) ) {
                    field.error = 'Обязательно для заполнения!'
                    invalid_fields.push(field)
                    is_valid = false
                }
            }

            // если у поля задана функция валидации - используем ее
            if ( is_valid && field.validate_function ) {
                let exec_status = field.validate_function(field.element)
                if (exec_status) {
                    is_valid = field.validate_function(field.element)
                    invalid_fields.push(field)
                }

            // иначе валидируем согласно атрибуту validate_type_attribute
            } else if ( is_valid && field.validate_type ) {

                switch ( field.validate_type ) {

                    case 'email':
                        if ( field.element.value.match(/^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/) === null ) {
                            field.error = 'некорректный email!'
                            invalid_fields.push(field)
                            is_valid = false
                        }
                    break;
        
                    case 'phone':
                        if ( field.element.value.length < 4 || field.element.value.match(/^[+0-9,. ()-]+$/) === null ) {
                            field.error = 'некорректный номер!'
                            invalid_fields.push(field)
                            is_valid = false
                        }
                    break;
                }
            }

            if ( !is_valid ) is_valid_all = false
        }

        // проходимся по всем невалидным полям и показываем их ошибки
        invalid_fields.forEach(field => {
            this.showError( field, true )
        });

        this.invalid_fields = [ ...this.invalid_fields, ...invalid_fields ]

        return is_valid_all;
    }

    getFieldValue( field ) {
        let value = null
        
        switch ( field.type ) {
            case 'input':
            case 'textarea':
            case 'checkbox':
            case 'select':
                value = field.element.value.trim()
            break
        }

        return value
    }

    getFieldByElement(element) {
        let find_field = this.fields.find( (field) => field.element === element)
        return find_field
    }

    refresh_all() {
        this.invalid_fields.forEach(field => {
            this.showError(field, false)
        });
        this.invalid_fields = [];
    }

    refresh(fields) {

        // клонируем, на случай, если передан this.invalid_fields
        let clone_arr = [...fields]
        
        clone_arr.forEach(field => {
            let find_index = this.invalid_fields.findIndex(invalid_field => invalid_field.index === field.index);
            this.showError(field, false)
            this.invalid_fields.splice(find_index, 1);

        });
    }

    submit() {
        let url = this.options.url

        if (!this.validation()) return false
        // если есть пользовательская функция валидации - применяем ее
        if ( this.options.callback_validate ) {
            if ( !this.options.callback_validate( this ) ) {
                return false
            }
        }

        let body = new FormData
        this.fields.forEach(field => {
            let name = field.name
            let value = this.getFieldValue(field)
            if (name) {
                body.append(name, value)
            }
        })

        body.append('action', this.options.action)

        Preloader(true)
        fetch(url, {
            method: 'POST',
            body
        })
        .then((response) => response.json())
        .then((response) => {

            let title = ''
            let message = ''
            if (response.status) {
                if ( this.options.callback_success ) {
                    this.options.callback_success(this.element, response)
                }

                title = (response.title) ? response.title : 'Успех'
                message = (response.message) ? response.message : 'Форма успешно отправлена'

            } else {
                if ( this.options.callback_error ) {
                    this.options.callback_error(this.element, response)
                }
                title = response.errors[0]['title'] || 'Ошибка'
                message = response.errors[0]['message']
            }

            if (this.popup) this.popup.open(title, message)
            Preloader(false)
        })
        .catch(err => {
            Preloader(false)
            if (this.popup) this.popup.open('Ошибка', err)

            let title = 'Ошибка'
            let message = err
            if (this.popup) this.popup.open(title, message)

            // console.error(err)
        })
    }
}

/**
 * content.title
 * content.message
 * content.element
 * options.classname
 */
class Popup {

    constructor() {

        this.element = document.querySelector('[data-element="layout-popup"]');
        this.popup = null
        this.inner = null
        this.title = ''
        this.message = ''
        // this.content = {}
        // this.options = {}

        if ( !this.element ) {
            let layout = document.createElement('div');
            layout.classList.add('layout', 'layout-popup');
            layout.dataset.element = 'layout-popup';
            this.element = layout;
            layout.addEventListener('click', e => {if (e.target === layout) this.close()} )

            let popup = document.createElement('div');
            popup.classList.add('popup');
            popup.dataset.element = 'popup';
            this.popup = popup

            let popup_content = document.createElement('div');
            popup_content.classList.add('popup__content');

            let popup_inner = document.createElement('div');
            popup_inner.classList.add('popup__inner');
            this.inner = popup_inner

            let popup_title = document.createElement('p');
            popup_title.classList.add('popup__title');
            this.title = popup_title;

            let popup_btn_close = document.createElement('div');
            popup_btn_close.classList.add('popup__btn-close');
            popup_btn_close.addEventListener('click', e => this.close());

            let popup_message = document.createElement('p');
            popup_message.classList.add('popup__message');
            this.message = popup_message;

            // сливаем в кучу
            popup_content.append( popup_title, popup_message );
            popup.append( popup_btn_close, popup_content, popup_inner );
            layout.append( popup );

            document.body.append(this.element)

        } else {
            this.popup = this.element.querySelector('.popup');
            this.title = this.element.querySelector('.popup__title');
            this.message = this.element.querySelector('.popup__message');
            this.inner = this.element.querySelector('.popup__inner');
        }

        // console.log(this)
    }

    _appendClone( element ) {
        let clone = element.cloneNode(true)
        clone.removeAttribute('id')
        this.inner.append( clone )
    }

    open(title = null, message = null) {
        if (title) {
            this.title.style.display = '';
            this.title.innerHTML = title;
        } else {

            this.title.style.display = 'none';
        }

        if (message) {
            this.message.innerHTML = message;
        }

        if (!this.element.classList.contains('show')) {
			if (this.options.scrollbar) {
				this.options.scrollbar.disabledScroll();
			}
            this.element.classList.remove('close');
            this.element.classList.add('show');
        }
    }

    close() {
        if (this.element.classList.contains('show')) {
			if (this.options.scrollbar) {
				this.options.scrollbar.enabledScroll();
			}
            this.element.classList.add('close');
            this.element.classList.remove('show');
        }
    }

    /**
     * @see Scrollbar
     * @param {string}      content.title
     * @param {string}      content.message
     * @param {HTMLElement} content.element
     * @param {Scrollbar}   options.scrollbar
     * @param {string}      options.className
     * @param {bool}        options.move
     */
    set(content = {}, options = {}) {
        this.content = content
        this.options = options
        if (content.title !== undefined)
            this.title.innerHTML = content.title;

        if (content.message !== undefined)
            this.message.innerHTML = content.message;

        if (content.element !== undefined) {

            if (options.move) {
                if (this.inner.contains( content.element )) {
                    // nothin
                } else {
                    if (this.putback) {
                        for (const child of this.inner.children) {
                            this.putback.append(child)
                        }
                    }
    
                    this.putback = content.element.parentElement
                    this.inner.append(content.element)                }

            } else {
    
                if (content.element !== null)
                    this._appendClone( content.element )
            }
        }

        if ( options.className )
            this.popup.classList.add(options.className)
    }
}

/**
 * структура меню
 * <ul data-menu="menu">
 *     <li data-menu="item">
 *         <a data-menu="link"></a>
 *         <button data-menu="btn"></button>
 *         <ul data-menu="submenu"></ul>
 *     </li>
 *     <li data-menu="item">
 *         <a data-menu="link"></a>
 *         <button data-menu="btn"></button>
 *     </li>
 * </ul>
 */
class Menu {

    /**
     * @param {HTMLElement} menu_element
     * @param {object} options
     */
    constructor( menu_element, options = {} ) {
        if ( !menu_element || menu_element.dataset.menu !== 'menu') {
            return false
        }

        this.menu_element = menu_element
        this.tree = this.buildTree()
        this.open_items_ids = []

        // поиск подменю среди прямых потомков

        // обработчики
        menu_element.addEventListener('mouseover', (e) => {
            return false
            if (!e.target) {
                return false
            }

            let item_element = this.closestItemElement(e.target)
            let current_item_address = getChain( +item_element.dataset.id)
            let current_item_chain = getChain( +item_element.dataset.id)
            let current_item = getFromTree( current_chain )

            console.log(current_chain, current_item)
            if ( !item_element) {
                return false
            }

            // let item_index = this.tree.findIndex(find_item => find_item.element === item_element)
            // console.log(item_index)
            return
            if (item_index !== -1) {
                this.open(item_index)
            }
        })

        menu_element.addEventListener('mouseout', (e) => {
            return false
            if ( !e.target || !e.relatedTarget ) {
                return false
            }
            let item_element = this.closestItemElement( e.relatedTarget )
            // console.log(item_index)
            return
            if (!item_element && this.open_now_index !== -1) {
                this.close( this.open_now_index )
                return false
            }
        })
    }
    
    open( item ) {
        item.element.classList.add('open')
    }

    close( item ) {
        item.element.classList.remove('open')
    }

    buildTree( menu_element=null ) {

        if ( !menu_element ) menu_element = this.menu_element
        // console.log(menu_element)
        let menu = []
        for ( let item_element of menu_element.children ) {
            if (item_element.dataset.menu !== 'item') {
                // console.log(item_element)
                break
            }

            let item = {}
            item.element = item_element
            item.id = +item_element.dataset.id
            
            for ( let child of item_element.children ) {

                switch ( child.dataset.menu ) {

                    case 'link':
                        item.link = child
                    break

                    case 'btn':
                        item.btn = child
                    break

                    case 'submenu':
                        item.submenu = this.buildTree( child )
                    break
                }
            }

            menu.push(item)
        }

        return menu
    }

    /**
     * получает из tree объект item по цепочке id
     * @param {array} chain 
     * @returns {object}
     */
    getFromTree( chain ) {
        
        let store = this.tree
        let find_item = null

        let i = 0
        for ( let id of chain ) {
            store = store[id]
            if ( i + 1 >= chain.length ) {
                find_item = store
            }

            i++
        }

        return find_item
    }

    /**
     * получить цепочку индексов от последнего предка до цели
     * @param {number} id 
     * @returns 
     */
    getAddress( id, store, address=[] ) {
        
        
        let index = 0
        let is_find = false
        let result_address = []
        for ( let item of store ) {
            let local_address = [...address, index]

            if ( item.id === id ) {
                is_find = true
                result_address = local_address
                break

            } else if ( item.submenu ) {
                let possible_address = this.getAddress( id, item.submenu, local_address )
                if ( possible_address.length ) {
                    is_find = true
                    result_address = [...possible_address]
                }
            }

            index++
            // console.log(local_address)
        }
        return result_address
    }

    findItemChain( element ) {
        let open_items_ids = []

        if ( !element || parent.dataset.menu === 'menu' ) {
            return open_items_ids
        }

        if ( element.dataset.menu === 'item' && element.dataset.id ) {
            open_items_ids.push( +element.dataset.id )
        }
        
        let parent = element.parentElement
        while ( parent && parent.dataset.menu !== 'menu' ) {
            if ( parent.dataset.menu === 'item' && parent.dataset.id ) {
                open_items_ids.push( +parent.dataset.id )
            }

            parent = parent.parentElement
        }

        return open_items_ids
    }

    /**
     * Находит в DOM первого родителя с атрибутом data-menu='item' или возвращает переданный элемент, если е него установлен data-menu='item'
     * @param {HTMLElement} element 
     * @returns {HTMLElement}
     */
    closestItemElement(element) {
        if (!element) {
            return false
        }
        let item_element = null
        if ( element.dataset.menu === 'item' ) {
            item_element = element
        } else if ( element.parentElement.dataset.menu === 'item' ) {
            item_element = element.parentElement
        } else {
            return false
        }

        return item_element
    }

    
}

class Dropdown {
    
    constructor(element, options={}) {
        this.size = {}
        this.items = []
        this.is_init = false
        this.open_item = {
            index: -1,
            element: null,
        }

        this.options_default = {
            selector_item: '[data-element="dropdown-item"]',
            duration: 300,
            opens: []
        }
        this.options = {...this.options_default, ...options}
        if (!element) {
            console.error('Dropdown: not found element')
            return false
        }
        this.element = element
        let items_elements = Array.from(element.querySelectorAll(this.options.selector_item))
        if (!items_elements.length) {
            console.error('Dropdown: not found items')
            return false
        }

        let _checkStatus = ( item_elem ) => {
            if (item_elem.classList.contains('opened') || item_elem.classList.contains('closed')) {
                return 'transform';
    
            } else if ( item_elem.classList.contains('open') ) {
                return 'open';
    
            } else {
    
                return 'close';
            }
        }

        items_elements.forEach( (item_elem, index) => {
            // задаем индексы
            item_elem.dataset.index = index

            // формируем объекты
            let header = item_elem.querySelector('[data-element="dropdown-header"]')
            let content = item_elem.querySelector('[data-element="dropdown-content"]')
            let item = {
                index: index,
                element: item_elem,
                header: {
                    element: header,
                    height: null
                },
                content: {
                    element: content,
                    height: null
                },
                header_height: null,
                content_height: null,
                status: _checkStatus( item_elem )
            }

            // назначаем обработчики
            item.element.addEventListener('mouseenter', e=>{
                this.hoverIn(e.target)
            })
            item.element.addEventListener('mouseleave', e=>{
                this.hoverOut(e.target)
            })

            this.items.push( item )
        })

        // задаем высоту элементов
        this.init()

        // назначаем обработчики
        this.element.addEventListener('click', e=>{
            let target_item = this._getItemByElement( e.target )
            if ( target_item ) {
                this.open( target_item )
            }
        })
        
        window.addEventListener('resize',
            setEventDelay(null, () => {
                this.init()
            }, 300, false)
        )

        this.options.opens.forEach( index => {
            this.open( this.items[index] )
        })

        // console.log(this)
    }

    init() {
        this.items.forEach(item => {
            let index = item.index
            let header_height = this._getHeight( item.header.element ) + 'px'
            let content_height = this._getHeight( item.content.element ) + 'px'

            this.items[index].header.height = header_height
            this.items[index].content.height = content_height

            if ( item.status === 'open' ) {
                item.element.style.height = item.content.height
                item.content.element.style.transform = `translateY(-${item.header.height})`

            } else {
                item.element.style.height = header_height
            }

        });
    }

    _getItemByElement( element ) {

        if ( element.dataset['data-element'] !== 'dropdown-item' ) {
            element = element.closest('[data-element="dropdown-item"]')
        }
        if (!element) return null

        let index = element.dataset.index

        return this.items[index]
    }

    getOpenItems() {
        return this.items.filter( item => item.status === 'open')
    }

    open( item ) {
        if ( !item ) return false        
        if ( item.index === this.open_item.index ) return false

        // remove clone
        if ( this.open_item.index !== -1 ) {
            let open_image = this.open_item.element.querySelector('[data-element="dropdown-image"]')
            if ( open_image ) {
                Array.from( open_image.parentElement.querySelectorAll('.clone') ).forEach( clone => {
                    clone.remove()
                })
            }

            this.close( this.open_item )
        }

        item.element.style.height = item.content.height
        item.content.element.style.transform = `translateY(-${item.header.height})`
        item.status = 'opened'
        this._setClassname( item.element, 'add', 'opened' )
            .then( (elem) => { elem.classList.add('open'); return elem; } )
            .then( (elem) => { elem.classList.remove('opened'); item.status = 'open' } )

        this.open_item = item
    }

    close( item ) {
        if ( !item ) return false

        item.content.element.style.transform = ''
        item.element.style.height = item.header.height
        item.status = 'closed'
        this._setClassname( item.element, 'add', 'closed' )
            .then( (elem) => { elem.classList.remove('open'); return elem; } )
            .then( (elem) => { elem.classList.remove('closed'); item.status = 'close' } )
    }

    hoverIn( item ) {
        if ( !item || this.open_item.index === -1 ) return false
        if ( item.index === this.open_item.index ) return false
        
        let image = item.querySelector('[data-element="dropdown-image"]')
        let open_image = this.open_item.element.querySelector('[data-element="dropdown-image"]')
        if ( image && open_image ) {
            let clone = image.cloneNode(true)
            clone.classList.add('clone')
            clone.removeAttribute('data-element')

            open_image.parentElement.append(clone)
            setTimeout(() => {
                clone.style.opacity = 1
            }, 100);
        }
    }

    hoverOut( item ) {
        if ( !item || this.open_item.index === -1 ) return false
        if ( item.index === this.open_item.index ) return false

        let open_image = this.open_item.element.querySelector('[data-element="dropdown-image"]')
        if ( open_image ) {
            this._delClones( this.open_item )
        }
    }

    _setClassname( element, action, classname, duration=null ) {
        if (!element) return false
        if (duration === null) duration = this.options.duration
        let allow = ['add', 'remove', 'contains']
        if ( !allow.includes( action ) ) return false
        
        return new Promise( (resolve, reject) => {
            element.classList[action](classname)
            setTimeout((r) => resolve(r), duration, element);
        })
    }

    _delClones( item, duration=this.options.duration ) {
        if ( !item ) {
            console.error('Dropdown: empty item_elem')
            return new Promise( function( resolve, reject ) {
                reject(new Error('Dropdown: empty item_elem'))
            } )
        }
        let clones = Array.from( item.element.querySelectorAll('.clone') )
        let promise_arr = clones.map( clone => {
            clone.style.opacity = 0
            return new Promise(
                resolve => {
                    setTimeout(() => {
                        return resolve( clone )
                    }, duration);}
                )
                .then( clone => clone.remove() )
        })

        return Promise.all( promise_arr )
    }

    _getHeight( element ) {
        let height = 0
        if ( !element ) return height

        let style = window.getComputedStyle( element )
        height = element.offsetHeight + parseInt(style.marginTop) + parseInt(style.marginBottom)
        
        return height
    }
}

/**
 * класс управления вертикальной полосой прокрутки элемента (по умолчанию - тега body)
 * scrollbar - здесь и далее - полоса прокрутки элемента
 * 
 * @version 1.0.1
 * 
 * @constructor
 * @param {object} options - объект опций
 * @returns {Scrollbar} экземпляр класса
 */
class Scrollbar {
	constructor(element = null, options = {}) {

		let default_options = {
			'cap_color': 'rgba(0,0,0,.3)',
			'cap_data_selector': '[data-element="cap"]'
		};
		this.options = { ...default_options, ...options };
		this.element = (element === null) ? document.body : element;
		this.cap = null;
	}

	/**
	 * отключить прокрутку элемента
	 *
	 * @param {boolean} cap - заменить полосу прокрутки заглушкой. При отсутствии заглушки меняется размер окна
	 */
	disabledScroll(cap = true) {
		if (!this.cap)
			this.cap = this.createCap();
		if (cap) {
			this.cap.show();
			this.element.style.width = `calc(100vw - ${this.cap.width}px)`;
		}
		this.element.style.overflow = 'hidden';
		// console.info('scroll disabled')
	};

	/**
	 * включить прокрутку элемента
	 */
	enabledScroll() {
		if (!this.cap)
			this.cap = this.createCap();
		this.cap.hide();
		this.element.style.width = '';
		this.element.style.overflow = '';
		// console.info('scroll enebled')
	};

	/**
	 * получить размер scrollbar в px.
	 *
	 * @param {boolean} hard - получить размер спрятанного scrollbar
	 * @returns {number} scrollbar_width - ширина scrollbar в пикселах
	 */
	getScrollbarWidth(hard = false) {
		let scrollbar_width = window.innerWidth - document.documentElement.clientWidth;
		if (scrollbar_width === 0 && hard) {
			let cap = document.createElement('div');
			cap.style.height = calc('100vh + 1px');
			document.body.append(cap);
			scrollbar_width = window.innerWidth - document.documentElement.clientWidth;
			cap.remove();
		}

		return scrollbar_width;
	};

	/**
	 * показывает, существует ли в данный момент вертикальная полоса прокрутки
	 *
	 * @returns {boolean} status - статус
	 */
	scrollExists() {
		return !!(window.innerWidth - document.documentElement.clientWidth);
	};

	/**
	 * создает и вставляет в DOM элемент заглушки
	 *
	 * @private
	 * @param {string} styleDisplay - значение css свойства display элемента
	 * @returns {object} cap - заглушка
	 */
	createCap(styleDisplay = 'none') {
		let cap = {};
		cap.element = document.querySelector(this.options.cap_data_selector);

		if (!cap.element) {

			// обработка data селектора
			let selector = this.options.cap_data_selector;
			let selector_arr = selector.replace(/['"\[\]]|data-/g, '').split('=');
			if (selector_arr.length !== 2) {
				console.info(`неверный селектор ${this.options.cap_data_selector}. Используется селектор по умолчанию ${default_options.cap_data_selector}`);
				selector = default_options.cap_data_selector;
				selector_arr = selector.replace(/['"\[\]]|data-/g, '').split('=');
			}

			cap.width = this.getScrollbarWidth();

			cap.element = document.createElement('div');
			cap.element.dataset[selector_arr[0]] = selector_arr[1];
			cap.element.style.backgroundColor = this.options.cap_color;
			cap.element.style.display = styleDisplay;
			cap.element.style.height = '100vh';
			cap.element.style.position = 'fixed';
			cap.element.style.top = '0px';
			cap.element.style.width = cap.width + 'px';
			cap.element.style.right = '0px';
			document.body.append(cap.element);

			cap.show = () => {
				cap.updateWidth();
				cap.element.style.display = 'block';
			};

			cap.hide = () => {
				cap.element.style.display = 'none';
			};

			cap.updateWidth = () => {
				cap.width = this.getScrollbarWidth();
				cap.element.style.width = cap.width + 'px';
			};
		}

		return cap;
	};
}

/**
 * 
 * @version 1.0.1
 * @see Scrollbar
 * 
 * @param {HTMLElement} element 
 * @param {object} options 
 * @returns {SlidePanel} slidepanel - экземпляр класса
 */
class SlidePanel {
	constructor(element, options = {}) {

		if (!element)
			return false;

		let options_default = {
			'scrollbar': null,
			'handlerSelector': '[data-element="sp-handler"]',
			'handlerObjects': [],
			'duration': 700,
			'status': 'close',
		};

		this.options = { ...options_default, ...options };

		let allowed_statuses = ['open', 'close'];
		this.element = element;
		options.status = (this.options.status && allowed_statuses.includes(this.options.status)) ? this.options.status : 'close';
		this.duration = this.options.duration;
		this.handlerObjects = [...this.options.handlerObjects, ...Array.from(document.querySelectorAll(this.options.handlerSelector))];

		let eventClickHandler = (e) => {
			if (this.status !== 'open') {
				this.handlerObjects.forEach(handlerObject => {
					if (handlerObject.open)
						handlerObject.open();
				});
				this.open();
			} else {
				this.handlerObjects.forEach(handlerObject => {
					if (handlerObject.close)
						handlerObject.close();
				});
				this.close();
			}
		};

		this.handlerObjects.forEach(handlerObject => {
			if (typeof handlerObject.open === 'function' && typeof handlerObject.close === 'function') {
				handlerObject[options.status]();
			}

			let handlerElement = (handlerObject.element) ? handlerObject.element : handlerObject;

			handlerElement.addEventListener('click', (e) => {
				eventClickHandler(e);
			})
		})

		if (false) {
		    window.addEventListener('resize',
    			setEventDelay(null, () => {
    				this.setHeight(true);
    			}, 300, false)
    		)
    		window.addEventListener('scroll', function () {
    			setEventDelay(null, () => {
    				console.log('scroll');
    				console.log(options.status);
    				if (options.status === 'open') {
    					this.setHeight(true);
    				}
    			}, 300, false);
    		})
        }

		// this[options.status]() // приводим состояние кнопки к заданному статусу
		// console.log(options.status)
	}

	open() {
		// console.log(this.status)
		// console.log(!['transform', 'open'].includes(this.status))
		if ( !['transform', 'open'].includes(this.status) ) {

			if (this.options.scrollbar) {
				this.options.scrollbar.disabledScroll();
			}
			// this.setHeight(true);
			
			this.status = 'transform'
			this.element.classList.add('opened');
			setTimeout(() => {
				this.status = 'open';
				this.element.classList.add('open');
				this.element.classList.remove('opened');
				this.status = 'open'
			}, this.duration);
		}
	};

	close() {			
		// console.log(this.status)
		// console.log(!['transform', 'open'].includes(this.status))
		if ( !['transform', 'close'].includes(this.status) ) {

			if (this.options.scrollbar) {
				this.options.scrollbar.enabledScroll();
			}
			// this.setHeight(false);

			this.status = 'transform'
			this.element.classList.add('closed');
			setTimeout(() => {
				this.status = 'close';
				this.element.classList.remove('open');
				this.element.classList.remove('closed');
				this.status = 'close'
			}, this.duration);
		}
	};

	toggle() {
		if ( this.status === 'open' ) this.close()
		if ( this.status === 'close' ) this.open()
	}

	setHeight(set = true) {
		if (set) {
			let document_styles = window.getComputedStyle(document.documentElement);
			if (!document_styles) {
				console.error('не удалось получить объект стилей элемента');
			}
			let margin_top = parseInt(document_styles['margin-top']);
			let height = document.body.offsetHeight - margin_top + 'px';
			this.element.style.height = height;
			// console.log(height);
		} else {
			this.element.style.height = '';
		}
	};
}

class ButtonBurger {
	constructor(element, options = {}) {

		if (!element)return false;

		this.statusses = ['open', 'close', 'transform']
		let allowed_statuses = ['open', 'close'];
		this.element = element;
		this.status = (options.status && allowed_statuses.includes(options.status)) ? options.status : 'close';
		this[this.status]() // приводим состояние кнопки к заданному статусу
		this.duration = options.duration ? options.duration : 300;
	}

	checkStatus() {
		if (this.element.classList.contains('opened') || this.element.classList.contains('closed')) {
			return 'transform';

		} else if ( this.element.classList.contains('open') ) {
			return 'open';

		} else {

			return 'close';
		}		
	}

	close() {
		if ( !['transform', 'close'].includes(this.status) ) {
			this.status = 'transform'
			this.element.classList.add('closed');
			setTimeout(() => {
				this.element.classList.remove('open');
				this.element.classList.remove('closed');
				this.status = 'close'
			}, this.duration);
		}
	};

	open() {
		if ( !['transform', 'open'].includes(this.status) ) {
			this.status = 'transform'
			this.element.classList.add('opened');
			setTimeout(() => {
				this.element.classList.add('open');
				this.element.classList.remove('opened');
				this.status = 'open'
			}, this.duration);
		}
	};

	toggle() {
		if ( this.status === 'open' ) this.close()
		if ( this.status === 'close' ) this.open()
	}
}

class ArrowUp {
    constructor(element, options) {
        if (!element) return false

		let options_default = {
			'topOffsetVisible': document.documentElement.clientHeight,
		};

		this.options = { ...options_default, ...options };
        this.topOffset = this.options.topOffsetVisible

        let headerChangeOnScroll = ( top_offset, element ) => {
            let current_top_offset = document.documentElement.scrollTop
            if ( current_top_offset > this.topOffset ) {
                element.classList.add('visible')
            } else {
                element.classList.remove('visible')
            }
        }

        let top_offset = 100
        // headerChangeOnScroll( top_offset, element )
        let handler = setEventDelay( null, e=>{headerChangeOnScroll( top_offset, element )}, 200, false)
        window.addEventListener('scroll', handler)

        element.addEventListener('click', ()=> window.scrollTo(0, 0))
    }
}

/**
 * @see getFullOffsetTop
 * @see delArrayItemByIndex
 * @see delArrayItemByItem
 */
class AnimLoad {

    constructor( options = {}) {
        let options_default = {
            tolerance: 100,
            delay: 1000,
        }
        this.options = {...options_default, ...options}
		this.default_item_vals = {
            resp: ['max', 'min'],
            type: 'Op',
            speed: 500,
            ord: 1,
		}
        this.allow_type = ['SwT', 'SwR', 'SwB', 'SwL', 'Op', 'CLS', ]

        this.init()

        // задаем обработчик
        window.addEventListener('scroll', 
            setEventDelay(null, () => {
                this.trigger()
            }, 100, false)
        )
        this.trigger()

        // console.log(this)
    }

    /**
     * ширина задержка тип
     * @param {*} data 
     */
    parse( data_str ) {
        /**
         * диапазон ширин экрана, при которых будет проигрываться анимация
         * resp: min, max, {integer}
         * 
         * типы анимации
         * type:
         * SwT-свайп сверху
         * SwR-свайп справа
         * SwB-свайп снизу
         * SwL-свайп слева
         * Op-проявление
         * CLS-someclass-подключает готовую анимацию
         * 
         * скорость анимации в милисекундах
         * speed: {integer}
         * 
         * порядок в котором будет воспроизводиться анимация элементов внутри системы. Начинается с 1
         * ord: {integer}
         */

        let vals = {}
        if (!data_str) return vals

        let raw_vals = data_str.split('_')
        for (const raw_val of raw_vals) {
            let [key, val] = raw_val.split(':')
            // if ( this.default_item_vals[key] === undefined ) continue

            switch (key) {
                case 'resp':
                    val = val.split('-').map( item => (['min', 'max'].includes(item)) ? item : +item )
                break;

                case 'type':
                    if ( !this.allow_type.includes(val) ) val = this.default_item_vals[key]
                break;

                case 'speed':
                case 'order':
                case 'delay':
                    val = +val
                break;
            
                default:
                break;
            }

            vals[key] = val
        }

        return vals
    }

    animate( item ) {
        // let allow_type = ['SwT', 'SwR', 'SwB', 'SwL', 'Op', 'CLS', ]
        // let offset = this.options['trans-offset']
        // this.type_style = {
        //     SwT: {
        //         start: {
        //             opacity: '0',
        //             transform: `translateY(-${offset}px)`,
        //         },
        //         end: {
        //             opacity: '',
        //             transform: '',
        //         }
        //     },
        //     SwR: {
        //         start: {
        //             opacity: '0',
        //             transform: `translateX(-${offset}px)`,
        //         },
        //         end: {
        //             opacity: '',
        //             transform: '',
        //         }
        //     },
        //     SwB: {
        //         start: {
        //             opacity: '0',
        //             transform: `translateY(${offset}px)`,
        //         },
        //         end: {
        //             opacity: '',
        //             transform: '',
        //         }
        //     },
        //     SwL: {
        //         start: {
        //             opacity: '0',
        //             transform: `translateX(${offset}px)`,
        //         },
        //         end: {
        //             opacity: '',
        //             transform: '',
        //         }
        //     },
        //     Op: {
        //         start: {
        //             opacity: '0',
        //         },
        //         end: {
        //             opacity: '',
        //         }
        //     },
        //     CLS: {
        //     }
        // }
        
        let classname = `anim_${item.type}`
        item.element.classList.add( classname )

        // let transition = []
        // if ( item.type !== 'CLS') {
        //     for (const css of Object.entries(this.type_style[item.type].start)) {
        //         // item.element.style[css[0]] = css[1]
        //         let speed = item.speed / 1000
        //         transition.push( `${[css[0]]} ${speed}s ${this.options['timeline-func']}` )
        //     }
        // }
        
        // item.element.style.transition = transition.join(', ')
        // item.element.style.transition = 'transition: opacity 0.5s linear 0s, transform 0.5s linear 0s;'
    }

    getSize( elem ) {
        let top = getFullOffsetTop(elem)
        let height = elem.offsetHeight
        let center = top + height / 2
        let size = {
            top,
            height,
            center
        }

        return size
    }

    init() {
        this.systems = {}
        this.noSystemItems = []
        //  находим все системы
        let systems_elements = Array.from( document.querySelectorAll( '[data-anim-cont]' ) )
        // проставляем им индексы
        systems_elements.forEach( (elem, index) => {
            elem.dataset.animSysId = index

            // получаем свойства из атрибута
            let vars = this.parse( elem.dataset.animCont )

            this.systems[index] = {
                element: elem,
                size: this.getSize( elem ),
                items: [],
                is_sys: true,
                delay: (vars['delay']) ? vars['delay'] : this.options.delay
            }
            // console.log(this.systems[index].delay)
        })

        // находим все элементы. Элемент может быть системой
        let items_elements = Array.from( document.querySelectorAll( '[data-anim]' ) )
        items_elements.forEach( (elem) => {

            // получаем свойства из атрибута
            let item = {...this.default_item_vals, ...this.parse( elem.dataset.anim )}
            item.element = elem
            item.is_sys = false

            let item_sys_elem = elem.closest('[data-anim-cont]')
            if (item_sys_elem === elem) item_sys_elem = elem.parentElement.closest('[data-anim-cont]')
            let sys_index = ( !item_sys_elem ) ? -1 : +item_sys_elem.dataset.animSysId
            let item_sys = this.systems[sys_index]

            if ( item_sys ) {
                item.sys_index = sys_index
                item.delay = ( item.delay ) ? this.getDelay( item, item.delay ) : this.getDelay( item, item_sys.delay )
                this.systems[sys_index].items.push(item)

            } else {
                // если безсистемные элементы
                item.size = this.getSize( elem )
                item.delay = ( item.delay ) ? this.getDelay( item, item.delay ) : this.getDelay( item, this.options.delay )
                this.noSystemItems.push(item)
            }
            // this.animate(item)

            let classname = `anim_${item.type}`
            item.element.classList.add( classname )

            item.element.dataset.anim = ''
            // item.element.removeAttribute('data-anim')
        })

        this.store = this.getItemsSortByTopOffset()

    }

    getItemsSortByTopOffset() {
        let arr = [...Object.values( this.systems ), ...this.noSystemItems]
        arr.sort( (a, b) => a.size.center - b.size.center )

        return arr
    }

    reInit() {
        systems_elements.forEach( (elem, index) => {
            elem.dataset.animSysId = index
        })
    }

    getDelay( item, delay ) {
        // console.log(delay)
        return (item.ord - 1) * delay
    }

    trigger() {
        let items_on_del = []
        let items_in_window = this.getItemsInWindow()
        for (const entity of items_in_window) {

            let items = (entity.is_sys) ? entity.items : [entity]
            items.sort((a, b) => a.ord - b.ord)

            items.forEach( item => {
                // console.log(item.delay)
                if ( item.type !== 'CLS' ) {
                    setTimeout(()=>{
                        item.element.classList.remove(`anim_${item.type}`)
                    }, item.delay)
                }
            })
            items_on_del.push( entity )
        }
        
        for (const entity of items_on_del) {
            this.store = delArrayItemByItem( this.store, entity )
        }
    }

    /**
     * метод будет возвращать еще не активированные системы, попадающие в окно браузера
     */
    getItemsInWindow() {
        let window_height = document.documentElement.clientHeight
        let window_offset = window.pageYOffset
        let window_center = window_offset + window_height / 2
        let tolerance = (window_height / 2) / 100 * this.options.tolerance

        let items_in_window = []

        let is_find = false
        for (const item of this.store) {
            let difference = Math.abs(item.size.center - window_center)

            // если элемент больше окна
            if ( item.size.height >= window_height ) {
                tolerance = (item.size.height / 2) / 100 * this.options.tolerance
            }
            if ( difference <= tolerance ) {
                is_find = true
                items_in_window.push( item )

            } else {
                // дальнейший перебор бессмысленен
                if (is_find) break
            }
        }

        return items_in_window
    }
}


let main_menu
document.addEventListener('DOMContentLoaded', () => {
    Preloader( false )
    main_menu = new Menu( document.querySelector('[data-menu="menu"]') )
})