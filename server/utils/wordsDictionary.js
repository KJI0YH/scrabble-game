import axios from 'axios';
import { config } from '../config.js';

const API_URL = 'https://dictionary.yandex.net/api/v1/dicservice.json/';

async function getLanguages() {
    const ENDPOINT = 'getLangs';

    try {
        const response = await axios.get(`${API_URL}${ENDPOINT}`, {
            params: {
                key: config.YANDEX_DICTIONARY_API_KEY,
            }
        });
        return { code: response.status, data: response.data };
    } catch (error) {
        console.error(error);
        return { data: null }
    }
}

async function validateLanguage(lang) {
    const languages = await getLanguages();
    if (languages.data) {
        const language = languages.data.find(l => l === `${lang}-${lang}`);
        if (language)
            return language;
    }
    return '';
}

export async function validateWord(word, language) {
    const ENDPOINT = 'lookup';

    const lang = await validateLanguage(language);
    if (lang) {
        try {
            const result = await axios.get(`${API_URL}${ENDPOINT}`, {
                params: {
                    key: config.YANDEX_DICTIONARY_API_KEY,
                    lang: lang,
                    text: word,
                    ui: 'en',
                }
            });

            if (result.status === 200) {
                if (result.data.def && result.data.def.find(word => word.pos === 'noun')) {
                    return { code: result.status, word: word };
                } else {
                    return null;
                }
            }
        } catch (error) {
            console.error(error.message);
            return null;
        }
    }
}