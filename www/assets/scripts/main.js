if ( typeof LOCAL_STORE === 'undefined' ) window.LOCAL_STORE = {}

document.addEventListener('DOMContentLoaded', (e) => {

    // popup
    LOCAL_STORE.popup = new Popup

    // изменяем хедер при скролле
    // let header = document.querySelector('[data-element="header"]')
    // if (header) {

    //     let headerChangeOnScroll = ( top_offset, element ) => {
    //         let current_top_offset = document.documentElement.scrollTop
    //         if ( current_top_offset > top_offset ) {
    //             element.classList.add('scroll')
    //         } else {
    //             element.classList.remove('scroll')
    //         }
    //     }

    //     let top_offset = 100
    //     headerChangeOnScroll( top_offset, header )
    //     let handler = setEventDelay( null, e=>{headerChangeOnScroll( top_offset, header )}, 200, false)
    //     window.addEventListener('scroll', handler)
        
    // }

    // btn-burger
    LOCAL_STORE.btn_burgers = []
    Array.from( document.querySelectorAll('[data-element="btn-burger"]') ).forEach( btn_burger => {
        LOCAL_STORE.btn_burgers.push( new ButtonBurger( btn_burger ) )
    })

    // scroll
    LOCAL_STORE.scroll = new Scrollbar()

    // sp-panel
    LOCAL_STORE.sp = new SlidePanel( document.querySelector('[data-element="sp-panel"]'), {handlerObjects: LOCAL_STORE.btn_burgers, scrollbar: LOCAL_STORE.scroll} )

    // smooth scroll
    let smooth_links = [
        ...Array.from( document.querySelectorAll('.nav-side__item [href]') ),
        ...Array.from( document.querySelectorAll('.nav-main__item [href]') ),
    ]
    smooth_links.forEach( link => {
        let href = link.getAttribute('href')
        if (!href) return

        link.addEventListener('click', (e)=>{
            e.preventDefault()
            smoothScrollByElement( href, 100 )
        })
    })
    
    // arrow-up
    // LOCAL_STORE.arrow_up = new ArrowUp( document.querySelector('[data-element="arrow-up"]') )

    // form
    LOCAL_STORE.forms = Array.from( document.querySelectorAll('[data-form]') ).map( form => new Form( form, {action: 'registration', url: '/ajax/'} ))

    // anim-load
    // LOCAL_STORE.anim_load = new AnimLoad()

    // video
    videos = Array.from( document.querySelectorAll('[data-element="video"]') )
    videos.forEach( video => {
        elem = video.querySelector('video')
        if (!elem) return
        elem.muted = true
        elem.play()
    })
    
    LOCAL_STORE.videos = videos

    // datepicker
    LOCAL_STORE.datepicker = Array.from( document.querySelectorAll('[data-field="date"]') ).map(field => {

        return new easepick.create({
            element: field,
            lang: 'ru-RU',
            inline: false,
            readonly: false,
            scrollToDate: false,
            format: 'DD.MM.YYYY',
            css: [
                '/assets/libs/easepick/easepick.css',
                '/assets/libs/easepick/custom.css'
            ]
        });

    });

    // modals
    let btn_bay = document.querySelector('[data-element="btn-bay"]')
    let modal = document.querySelector('[data-modal="ticket-booking"]')
    btn_bay.addEventListener('click', (e)=>{
        LOCAL_STORE.popup.set({element: modal}, {move: true, className: 'popup_modal', scrollbar: LOCAL_STORE.scroll})
        LOCAL_STORE.popup.open()
    })

    // amount field validation
    let amount_field = document.querySelector('#amount')
    if ( amount_field) {
        let amount_validate = (value) => {
            value = parseInt(value)
            if (isNaN(value)) value = ''

            if ( value ) {
                // пример: (7, "товар", "товара", "товаров") вернет 'товаров'
                value = value + ' ' + declension(value, "человек", "человека", "человек")
            }
            // console.log(value)
            return value
        }

        value = amount_validate(e.target.value)

        amount_field.addEventListener('focus', (e) => {
            if (!e.target) return false
            let value = e.target.value
            e.target.value = isNaN(parseInt(value)) ? '' : parseInt(value)
        })
        amount_field.addEventListener('change', (e) => {
            if (!e.target) return false
            e.target.value = amount_validate(e.target.value)
        })
        amount_field.addEventListener('blur', (e) => {
            if (!e.target) return false
            e.target.value = amount_validate(e.target.value)
        })
    }

})