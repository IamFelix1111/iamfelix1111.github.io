// Reusable site components: <site-header>, <site-footer>, <lang-select>
// noinspection JSUnusedGlobalSymbols

// Apply translations to all [data-i18n] elements.
// Fallback chain: requested lang → zh-cn (for zh-tw) → en.
function applyI18n(lang) {
    const dict = window.I18N;
    if (!dict) return;
    const fallbacks = [lang];
    if (lang === 'zh-tw') fallbacks.push('zh-cn');
    fallbacks.push('en');
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.dataset.i18n;
        if (!dict[key]) return;
        for (const code of fallbacks) {
            if (dict[key][code] != null) {
                el.innerHTML = dict[key][code];
                return;
            }
        }
    });
}

// Language selector: <lang-select class="lang-select">
const LANGS = [
    { code: 'de',    name: 'Deutsch',   label: 'DE' },
    { code: 'en',    name: 'English',   label: 'EN' },
    { code: 'es',    name: 'Español',   label: 'ES' },
    { code: 'fr',    name: 'Français',  label: 'FR' },
    { code: 'it',    name: 'Italiano',  label: 'IT' },
    { code: 'ja',    name: '日本語',     label: '日' },
    { code: 'ko',    name: '한국어',     label: '한' },
    { code: 'pt',    name: 'Português', label: 'PT' },
    { code: 'ru',    name: 'Русский',   label: 'RU' },
    { code: 'zh-cn', name: '简体中文',   label: '中' },
    { code: 'zh-tw', name: '繁體中文',   label: '繁' },
];

class LangSelect extends HTMLElement {
    connectedCallback() {
        if (this._inited) return;
        this._inited = true;

        this.innerHTML = `
            <div class="lang-btn" aria-haspopup="listbox" aria-expanded="false">
                <img class="lang-icon" src="/lang.svg" alt="" aria-hidden="true">
                <span class="lang-label">EN</span>
                <img class="caret" src="/caret.svg" alt="" aria-hidden="true">
            </div>
            <ul class="lang-menu" role="listbox">
                ${LANGS.map(l => `<li data-lang="${l.code}" role="option">${l.name}</li>`).join('\n                ')}
            </ul>
        `;

        const html = document.documentElement;
        const btn = this.querySelector('.lang-btn');
        const label = this.querySelector('.lang-label');
        const menu = this.querySelector('.lang-menu');

        const apply = lang => {
            html.classList.remove(...LANGS.map(l => 'lang-' + l.code));
            html.classList.add('lang-' + lang);
            html.lang = lang;
            const entry = LANGS.find(l => l.code === lang);
            if (entry) label.textContent = entry.label;
            menu.querySelectorAll('li').forEach((li) =>
                li.classList.toggle('active', li.dataset.lang === lang)
            );
            applyI18n(lang);
            try {
                localStorage.setItem('lang', lang);
            } catch (err) {
                console.error(err);
            }
        };

        const close = () => {
            this.classList.remove('open');
            btn.setAttribute('aria-expanded', 'false');
        };

        let saved = 'en';
        try {
            const v = localStorage.getItem('lang');
            if (LANGS.some(l => l.code === v)) saved = v;
        } catch (err) {
            console.error(err);
        }

        // Wait for the rest of the DOM ([data-i18n] elements) before applying.
        const init = () => apply(saved);
        if (document.readyState === 'loading')
            document.addEventListener('DOMContentLoaded', init);
        else
            init();

        btn.addEventListener('click', e => {
            e.stopPropagation();
            const isOpen = this.classList.toggle('open');
            btn.setAttribute('aria-expanded', String(isOpen));
        });

        menu.addEventListener('click', e => {
            const li = e.target.closest('li');
            if (li) {
                apply(li.dataset.lang);
                close();
            }
        });

        document.addEventListener('click', close);
        document.addEventListener('keydown', e => {
            if (e.key === 'Escape') close();
        });
    }
}

customElements.define('lang-select', LangSelect);