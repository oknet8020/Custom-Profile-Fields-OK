'use strict';

const User = require.main.require('./src/user');
const Settings = require.main.require('./src/settings');
const Meta = require.main.require('./src/meta'); // נצטרך את Meta כדי לשמור הגדרות
const db = require.main.require('./src/database'); // גישה ישירה למסד הנתונים אם נצטרך
const winston = require.main.require('winston'); // לרישום לוגים
const nconf = require.main.require('nconf'); // לקריאת הגדרות NodeBB
const path = require('path');
const fs = require('fs');

const plugin = {};
let customFieldsSettings = []; // נשמור כאן את השדות המוגדרים

// --- פונקציית אתחול ---
plugin.init = async (params) => {
    const { router, middleware } = params;
    winston.info('[Custom-Profile-Fields-OK] Initializing...');

    // טעינת ההגדרות מהמסד נתונים
    await loadSettings();

    // הגדרת נתיב (route) לפאנל הניהול
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
    // נצטרך לממש את זה - לקרוא את הנתונים של המשתמש ולהציג אותם
    // זה ידרוש שינוי בתבנית הפרופיל או שימוש ב-hook מתאים יותר
    winston.info(`[Custom-Profile-Fields-OK] addFieldsToProfile hook called for uid: ${data.uid}`);
    // דוגמה (נצטרך לשפר):
    const userData = await User.getUserFields(data.uid, customFieldsSettings.map(f => `customField_${f.id}`));
    data.fields = customFieldsSettings
        .map(field => ({
            name: field.label,
            value: userData[`customField_${field.id}`] || '',
        }))
        .filter(field => field.value); // הצג רק שדות שמולאו

    return data;
};


module.exports = plugin;
