import { createI18n } from 'vue-i18n'
import ko from '@/locales/ko.json'
import en from '@/locales/en.json'

const messages = {
    ko: ko,
    en: en,
}

const i18n = createI18n({
    locale: 'ko', // 기본 언어
    fallbackLocale: 'en', // 기본 언어 표시에 문제가 있을 경우 대체할 언어
    messages,
});

export default i18n