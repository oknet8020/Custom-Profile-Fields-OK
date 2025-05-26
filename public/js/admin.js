/* globals $, define, app, bootbox, socket */

define('admin/plugins/custom-profile-fields-ok', ['settings'], function (Settings) {
    'use strict';

    var ACP = {};
    var fieldTemplate = '';
    var fieldsData = [];

    ACP.init = function () {
        fieldTemplate = $('#field-template').html();
        loadSettingsAndRender();

        $('#add-field-btn').on('click', addField);
        $('#fields-container').on('click', '.remove-field-btn', removeField);
        $('#custom-fields-form').on('submit', saveSettings);
    };

    function loadSettingsAndRender() {
        // We get the initial fields from the template data passed by library.js
        fieldsData = Settings.load('custom-profile-fields-ok').fields || [];
        renderFields();
    }

    function renderFields() {
        var container = $('#fields-container');
        container.empty(); // Clear existing fields

        fieldsData.forEach(function(field) {
            var $fieldEl = $(fieldTemplate);
            $fieldEl.find('.field-id').val(field.id);
            $fieldEl.find('.field-label').val(field.label);
            $fieldEl.find('.field-type').val(field.type);
            $fieldEl.find('.field-placeholder').val(field.placeholder);
            container.append($fieldEl);
        });
    }


    function addField() {
        var container = $('#fields-container');
        var $fieldEl = $(fieldTemplate);
        container.append($fieldEl);
    }

    function removeField() {
        $(this).closest('.field-entry').remove();
    }

    function saveSettings(e) {
        e.preventDefault(); // Prevent default form submission

        var fields = [];
        var isValid = true;
        var usedIds = {};

        $('#fields-container .field-entry').each(function () {
            var $el = $(this);
            var id = $el.find('.field-id').val().trim();
            var label = $el.find('.field-label').val().trim();
            var type = $el.find('.field-type').val();
            var placeholder = $el.find('.field-placeholder').val().trim();

            if (!id || !label) {
                app.alertError('Field ID and Label are required for all fields.');
                isValid = false;
                return false; // Exit .each loop
            }

            if (!/^[a-zA-Z0-9_]+$/.test(id)) {
                 app.alertError('Field ID can only contain letters, numbers, and underscores.');
                 isValid = false;
                 return false;
            }

            if (usedIds[id]) {
                app.alertError('Field IDs must be unique. Found duplicate: ' + id);
                isValid = false;
                return false;
            }

            usedIds[id] = true;

            fields.push({
                id: id,
                label: label,
                type: type,
                placeholder: placeholder || ''
            });
        });

        if (!isValid) {
            return;
        }

        // Use Socket.IO or AJAX to save data
        socket.emit('admin.plugins.customProfileFieldsOK.save', {
            _csrf: config.csrf_token, // Make sure config.csrf_token is available or send it differently
            fields: JSON.stringify(fields)
        }, function(err, result) {
            if (err) {
                return app.alertError('Error saving settings: ' + err.message);
            }
            app.alertSuccess('Settings saved successfully!');
            fieldsData = fields; // Update local data
        });

        // Fallback or alternative: Use a POST request (requires handling in library.js)
        $.post('/api/admin/plugins/custom-profile-fields-ok/save', {
            _csrf: $('[name="_csrf"]').val(),
            fields: JSON.stringify(fields)
        })
        .done(function() {
            app.alertSuccess('Settings saved successfully!');
            fieldsData = fields; // Update local data
        })
        .fail(function() {
            app.alertError('Failed to save settings.');
        });
    }


    return ACP;
});
