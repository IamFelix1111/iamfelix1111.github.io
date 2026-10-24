// Reusable site components: <site-header>, <site-footer>, <lang-select>
// noinspection JSUnusedGlobalSymbols

// Fallback chain for a language: the language itself, then its `fallback`
// declared in window.LANGS, then English as the site-wide last resort.
function i18nChain(lang) {
    const chain = [lang];
    const entry = (window.LANGS || []).find(l => l.code === lang);
    if (entry && entry.fallback) chain.push(entry.fallback);
    if (!chain.includes('en')) chain.push('en');
    return chain;
}

// Apply translations to all [data-i18n] elements.
function applyI18n(lang) {
    const dict = window.I18N;
    if (!dict) return;
    const fallbacks = i18nChain(lang);
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

// Language list lives in /i18n.js (window.LANGS), loaded before this file
// on every page that has a <lang-select>. Pages without i18n.js (the home
// page) have no language picker, so an empty list is fine.
const LANGS = window.LANGS || [];

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

window.addEventListener('DOMContentLoaded', () => document.body.classList.add('with-script'));
