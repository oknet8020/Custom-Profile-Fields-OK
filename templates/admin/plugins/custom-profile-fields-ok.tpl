<div class="custom-profile-fields-ok">
    <div class="row">
        <div class="col-lg-12">
            <form class="form-horizontal" id="custom-fields-form">
                <input type="hidden" name="_csrf" value="{csrf_token}" />
                <div class="panel panel-default">
                    <div class="panel-heading">
                        <h3 class="panel-title"><i class="fa fa-user-plus"></i> Custom Profile Fields Configuration</h3>
                    </div>
                    <div class="panel-body">
                        <p>Configure the custom fields that users can add to their profiles.</p>
                        <div id="fields-container">
                            </div>
                        <button type="button" class="btn btn-info" id="add-field-btn"><i class="fa fa-plus"></i> Add Field</button>
                    </div>
                </div>

                <div class="form-actions">
                    <button type="submit" class="btn btn-primary">Save Settings</button>
                </div>
            </form>
        </div>
    </div>
</div>

<script type="text/template" id="field-template">
    <div class="field-entry well well-sm">
        <button type="button" class="btn btn-danger btn-xs pull-right remove-field-btn"><i class="fa fa-times"></i></button>
        <div class="form-group">
            <label class="col-sm-2 control-label">Field ID</label>
            <div class="col-sm-10">
                <input type="text" class="form-control field-id" placeholder="e.g., phoneNumber (unique, no spaces)" required>
            </div>
        </div>
        <div class="form-group">
            <label class="col-sm-2 control-label">Field Label</label>
            <div class="col-sm-10">
                <input type="text" class="form-control field-label" placeholder="e.g., Phone Number" required>
            </div>
        </div>
        <div class="form-group">
            <label class="col-sm-2 control-label">Field Type</label>
            <div class="col-sm-10">
                <select class="form-control field-type">
                    <option value="text">Text</option>
                    <option value="tel">Phone (tel)</option>
                    <option value="url">Link (url)</option>
                    <option value="textarea">Text Area</option>
                    <option value="number">Number</option>
                </select>
            </div>
        </div>
         <div class="form-group">
            <label class="col-sm-2 control-label">Placeholder</label>
            <div class="col-sm-10">
                <input type="text" class="form-control field-placeholder" placeholder="Optional hint text">
            </div>
        </div>
    </div>
</script>
