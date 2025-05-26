'use strict';
/* globals define, app, socket, bootbox */

define('admin/plugins/custom-profile-fields-ok', ['translator'], function (translator) {
    const ACP = {};
    let fields = [];

    ACP.init = function () {
        console.log('[Custom-Profile-Fields-OK] Admin page initialized.');

        // Load existing settings
        socket.emit('admin.settings.get', { hash: 'custom-profile-fields-ok', cid: app.cid }, function (err, settings) {
            if (err) {
                return app.alertError(err.message);
            }
            if (settings && settings.fields) {
                try {
                    fields = JSON.parse(settings.fields);
                    renderFields();
                } catch (e) {
                    console.error('[Custom-Profile-Fields-OK] Error parsing fields from settings:', e);
                    app.alertError('Error loading settings: ' + e.message);
                }
            }
        });

        $('#add-field-btn').off('click').on('click', addField);
        $('#save-settings-btn').off('click').on('click', saveSettings);
        $('#fields-container').off('click', '.remove-field-btn').on('click', '.remove-field-btn', removeField);

        // Initial render in case there are no saved fields yet
        if (fields.length === 0) {
            // Optionally add a default field if the array is empty
            // addField();
        }
    };

    function addField() {
        const index = fields.length;
        fields.push({
            id: '',
            label: '',
            type: 'text', // Default type
            placeholder: '',
            required: false // New field for validation (default to false)
        });
        renderFields();
    }

    function removeField(e) {
        const index = parseInt($(e.target).parents('.field-item').data('index'), 10);
        if (!isNaN(index)) {
            fields.splice(index, 1);
            renderFields();
        }
    }

    function renderFields() {
        const container = $('#fields-container');
        container.empty(); // Clear existing fields

        fields.forEach(function (field, index) {
            const fieldHtml = `
                <div class="card field-item mb-3" data-index="<span class="math-inline">\{index\}"\>
