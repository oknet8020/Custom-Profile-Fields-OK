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

        // Attach event listeners
        $('#add-field-btn').off('click').on('click', addField);
        $('#save-settings-btn').off('click').on('click', saveSettings);
        $('#fields-container').off('click', '.remove-field-btn').on('click', '.remove-field-btn', removeField);

        // Initial render in case there are no saved fields yet
        if (fields.length === 0) {
            // Optionally add a default field if the array is empty
            // addField(); // Uncomment to add a blank field on first load
        }
    };

    function addField() {
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
                <div class="card field-item mb-3" data-index="${index}">
                    <div class="card-body">
                        <div class="form-group row">
                            <label for="field-id-${index}" class="col-sm-3 col-form-label">[[custom_profile_fields:field_id]]</label>
                            <div class="col-sm-9">
                                <input type="text" class="form-control" id="field-id-${index}" value="${field.id}" data-property="id" placeholder="[[custom_profile_fields:field_id]]" />
                            </div>
                        </div>
                        <div class="form-group row">
                            <label for="field-label-${index}" class="col-sm-3 col-form-label">[[custom_profile_fields:field_label]]</label>
                            <div class="col-sm-9">
                                <input type="text" class="form-control" id="field-label-${index}" value="${field.label}" data-property="label" placeholder="[[custom_profile_fields:field_label]]" />
                            </div>
                        </div>
                        <div class="form-group row">
                            <label for="field-type-${index}" class="col-sm-3 col-form-label">[[custom_profile_fields:field_type]]</label>
                            <div class="col-sm-9">
                                <select class="form-control" id="field-type-${index}" data-property="type">
                                    <option value="text" ${field.type === 'text' ? 'selected' : ''}>[[custom_profile_fields:type_text]]</option>
                                    <option value="number" ${field.type === 'number' ? 'selected' : ''}>[[custom_profile_fields:type_number]]</option>
                                    <option value="tel" ${field.type === 'tel' ? 'selected' : ''}>[[custom_profile_fields:type_phone]]</option>
                                    <option value="url" ${field.type === 'url' ? 'selected' : ''}>[[custom_profile_fields:type_url]]</option>
                                    </select>
                            </div>
                        </div>
                        <div class="form-group row">
                            <label for="field-placeholder-${index}" class="col-sm-3 col-form-label">[[custom_profile_fields:placeholder]]</label>
                            <div class="col-sm-9">
                                <input type="text" class="form-control" id="field-placeholder-${index}" value="${field.placeholder}" data-property="placeholder" placeholder="[[custom_profile_fields:placeholder]]" />
                            </div>
                        </div>
                        <div class="form-check">
                            <input type="checkbox" class="form-check-input" id="field-required-${index}" ${field.required ? 'checked' : ''} data-property="required" />
                            <label class="form-check-label" for="field-required-${index}">[[custom_profile_fields:field_required]]</label>
                        </div>
                        <button class="btn btn-danger btn-sm remove-field-btn">[[custom_profile_fields:remove_field]]</button>
                    </div>
                </div>
            `;
            container.append(fieldHtml);
        });

        // Add event listeners for input changes to update 'fields' array
        container.find('input, select').on('change keyup', function () {
            const el = $(this);
            const index = parseInt(el.parents('.field-item').data('index'), 10);
            const property = el.data('property');
            let value;

            if (property === 'required') {
                value = el.is(':checked');
            } else {
                value = el.val();
            }

            if (fields[index]) {
                fields[index][property] = value;
            }
        });
    }

    function saveSettings() {
        console.log('[Custom-Profile-Fields-OK] Saving settings:', fields);
        socket.emit('admin.settings.set', {
            hash: 'custom-profile-fields-ok',
            settings: JSON.stringify({ fields: JSON.stringify(fields) })
        }, function (err) {
            if (err) {
                return app.alertError(err.message);
            }
            app.alertSuccess('[[custom_profile_fields:settings_saved_successfully]]');
        });
    }

    return ACP;
});
