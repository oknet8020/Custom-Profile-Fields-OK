<div class="panel panel-default">
    <div class="panel-header">
        <h3 class="panel-title">[[custom_profile_fields:custom_fields]]</h3>
    </div>
    <div class="panel-body">
        <p>[[custom_profile_fields:description]]</p> <button id="add-field-btn" class="btn btn-primary">[[custom_profile_fields:add_field]]</button>
        <div id="fields-container" class="mt-3">
            </div>
        <button id="save-settings-btn" class="btn btn-success mt-3">[[custom_profile_fields:save_settings]]</button>
    </div>
</div>

<script>
    require(['admin/plugins/custom-profile-fields-ok'], function (ACP) {
        ACP.init();
    });
</script>
