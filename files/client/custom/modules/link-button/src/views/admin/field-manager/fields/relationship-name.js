define('link-button:views/admin/field-manager/fields/relationship-name', ['views/fields/varchar'], (Dep) => {
    return class extends Dep {

        setup() {
            super.setup();
            this.listenTo(this.model, 'change:mode', this.toggleRelationshipName);
        }

        afterRender() {
            super.afterRender();
            this.toggleRelationshipName();
        }

        toggleRelationshipName() {
            if (this.model.get('mode') === 'quickCreate') {
                this.getParentView().showField('relationshipName');
            } else {
                this.getParentView().hideField('relationshipName');
            }
        }
    };
});
