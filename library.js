'use strict';
const User = require.main.require('./src/user');
const Settings = require.main.require('./src/settings');
const Meta = require.main.require('./src/meta');
const db = require.main.require('./src/database');
const winston = require.main.require('winston');
const nconf = require.main.require('nconf');
const path = require.main.require('path'); // וודא ש-path נטען נכון
const fs = require.main.require('fs').promises; // וודא ש-fs נטען כ-promises

const plugin = {};
let customFieldsSettings = []; // נשמור כאן את השדות המוגדרים

// --- פונקציית אתחול ---
plugin.init = async (params) => {
    const { router, middleware, app } = params; // וודא ש-router, middleware, app קיימים
    winston.info('[Custom-Profile-Fields-OK] Initializing...');

    // טעינת ההגדרות מהמסד נתונים
    await loadSettings();

    // הגדרת נתיב (route) לפאנל הניהול
    // וודא שהנתיב תואם ל-plugin.json
    router.get('/admin/plugins/custom-profile-fields-ok', middleware.admin.checkPrivileges, renderAdmin);
    router.post('/api/admin/plugins/custom-profile-fields-ok/save', middleware.admin.checkPrivileges, saveAdmin);

    winston.info('[Custom-Profile-Fields-OK] Initialization complete.');
};

// --- טעינת הגדרות ---
async function loadSettings() {
    const settings = await Meta.settings.get('custom-profile-fields-ok');
    customFieldsSettings = settings.fields ? JSON.parse(settings.fields) : [];
    winston.info(`[Custom-Profile-Fields-OK] Loaded ${customFieldsSettings.length} fields.`);
}

// --- פונקציות פאנל הניהול ---
function renderAdmin(req, res) {
    // וודא שה-res.render מצביע על הנתיב הנכון
    res.render('admin/plugins/custom-profile-fields-ok', {
        fields: customFieldsSettings,
        csrf_token: req.csrfToken(),
    });
}

async function saveAdmin(req, res) {
    try {
        const fields = req.body.fields ? JSON.parse(req.body.fields) : [];
        // כאן צריך להוסיף ולידציה לשדות לפני השמירה
        await Meta.settings.set('custom-profile-fields-ok', { fields: JSON.stringify(fields) });
        customFieldsSettings = fields; // עדכון ההגדרות בזיכרון
        winston.info('[Custom-Profile-Fields-OK] Settings saved.');
        res.status(200).json({ message: 'Settings saved successfully!' });
    } catch (err) {
        winston.error(`[Custom-Profile-Fields-OK] Error saving settings: ${err.message}`);
        res.status(500).json({ error: err.message });
    }
}

// --- הוספת קישור לניווט בממשק הניהול ---
plugin.addAdminNavigation = async (header) => {
    header.plugins.push({
        route: '/plugins/custom-profile-fields-ok',
        icon: 'fa-user-plus', // אפשר לבחור אייקון אחר מ-FontAwesome
        name: 'Custom Profile Fields OK',
    });
    return header;
};

// --- הוספת שדות לדף עריכת פרופיל ---
plugin.addFieldsToEdit = async (data) => {
    if (customFieldsSettings.length > 0) {
        const userData = await User.getUserFields(data.uid, customFieldsSettings.map(f => `customField_${f.id}`));

        data.customFields = customFieldsSettings.map(field => ({
            ...field,
            value: userData[`customField_${field.id}`] || '',
        }));
    } else {
        data.customFields = [];
    }
    return data;
};

// --- הוספת שדות לפרופיל הציבורי ---
plugin.addFieldsToProfile = async (data) => {
    winston.info(`[Custom-Profile-Fields-OK] addFieldsToProfile hook called for uid: ${data.uid}`);
    const userData = await User.getUserFields(data.uid, customFieldsSettings.map(f => `customField_${f.id}`));
    data.fields = customFieldsSettings
        .map(field => ({
            name: field.label,
            value: userData[`customField_${field.id}`] || '',
        }))
        .filter(field => field.value); // הצג רק שדות שמולאו

    return data;
};

// --- הוספת שדות לטופס הרישום (filter:register.build) ---
plugin.addFieldsToRegister = async (data) => {
    if (customFieldsSettings.length > 0) {
        data.customFields = customFieldsSettings.map(field => ({
            ...field,
            value: '', // השדות ריקים בהרשמה חדשה
        }));
    } else {
        data.customFields = [];
    }
    return data;
};

// --- שמירת שדות מותאמים אישית של משתמש לאחר רישום (filter:register.complete) ---
plugin.saveRegistrationFields = async (data) => {
    const { uid, userData } = data;
    winston.info(`[Custom-Profile-Fields-OK] Attempting to save custom fields after registration for uid: ${uid}`);

    const fieldsToSave = {};
    for (const field of customFieldsSettings) {
        const fieldKey = `customField_${field.id}`;
        if (userData && userData[fieldKey] !== undefined) {
            fieldsToSave[fieldKey] = userData[fieldKey];
            winston.verbose(`[Custom-Profile-Fields-OK] Saving registration field ${fieldKey}: ${userData[fieldKey]}`);
        }
    }

    if (Object.keys(fieldsToSave).length > 0) {
        try {
            await User.setUserFields(uid, fieldsToSave);
            winston.info(`[Custom-Profile-Fields-OK] Successfully saved custom registration fields for uid: ${uid}`);
        } catch (err) {
            winston.error(`[Custom-Profile-Fields-OK] Error saving custom registration fields for uid ${uid}: ${err.message}`);
        }
    }
    return data;
};

// --- שמירת שדות מותאמים אישית של משתמש (action:user.save) ---
plugin.saveCustomFields = async (data) => {
    const { uid, userData } = data;
    winston.info(`[Custom-Profile-Fields-OK] Attempting to save custom fields for uid: ${uid}`);

    const fieldsToSave = {};
    for (const field of customFieldsSettings) {
        const fieldKey = `customField_${field.id}`;
        if (userData && userData[fieldKey] !== undefined) {
            fieldsToSave[fieldKey] = userData[fieldKey];
            winston.verbose(`[Custom-Profile-Fields-OK] Saving ${fieldKey}: ${userData[fieldKey]}`);
        }
    }

    if (Object.keys(fieldsToSave).length > 0) {
        try {
            await User.setUserFields(uid, fieldsToSave);
            winston.info(`[Custom-Profile-Fields-OK] Successfully saved custom fields for uid: ${uid}`);
        } catch (err) {
            winston.error(`[Custom-Profile-Fields-OK] Error saving custom fields for uid ${uid}: ${err.message}`);
        }
    }
    return data;
};

// --- הוספת תבנית לווים קיימים (Template Hooks) ---
plugin.addTemplateToHook = async (payload) => {
    // payload מכיל את התוכן הקיים וכן את אובייקט ה-`data` מהתבנית
    // אנחנו מניחים שה-`data` כבר מכיל את `customFields` שנוצרו על ידי addFieldsToEdit/addFieldsToRegister

    // וודא ש-app זמין כאן. הוא אמור לעבור ב-init
    if (!app) {
        winston.error('[Custom-Profile-Fields-OK] Global app object not available for addTemplateToHook!');
        return payload;
    }

    const tplPath = path.join(__dirname, 'templates', 'partials', 'custom_profile_fields.tpl');

    try {
        const templateContent = await fs.readFile(tplPath, 'utf8');
        // renderContent יבצע את ההחלפות בתבנית (כמו {{{ each customFields }}})
        const renderedHtml = await app.render(templateContent, payload.data); // השתמש ב-payload.data עבור הנתונים

        payload.content += renderedHtml; // הוסף את ה-HTML המרונדר לתוכן הקיים ב-hook
    } catch (err) {
        winston.error(`[Custom-Profile-Fields-OK] Error rendering template hook: ${err.message}`);
        // Log the exact path for debugging
        winston.error(`[Custom-Profile-Fields-OK] Template path tried: ${tplPath}`);
    }
    return payload;
};

// פונקציית parsePost שצוינה ב-plugin.json, רלוונטית רק אם נרצה לפרסר שדות מותאמים אישית בפוסטים
plugin.parsePost = async (post) => {
    // זו פונקציה placeholder. כרגע לא נשתמש בה.
    return post;
};

module.exports = plugin;
