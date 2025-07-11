define('link-button:views/fields/link-button', ['views/fields/url'], (Dep) => {
    return class extends Dep {

        type = 'link-button'
        editTemplate = 'link-button:fields/edit'
        listTemplate = 'link-button:fields/list'
        detailTemplate = 'link-button:fields/detail'
        searchTemplate = 'link-button:fields/edit'

        setup() {
            super.setup();

            // Ensure our custom templates are used
            this.editTemplate = 'link-button:fields/edit';
            this.listTemplate = 'link-button:fields/list';
            this.detailTemplate = 'link-button:fields/detail';
            this.searchTemplate = 'link-button:fields/edit';

            this.events['click button[data-action="open-modal"]'] = () => {
                this.actionOpenModal();
            };

            this.events['click button[data-action="espo-modal"]'] = () => {
                this.actionEspoModal();
            };

            this.events['click button[data-action="open-popup"]'] = () => {
                this.actionOpenPopup();
            };

            this.events['click button[data-action="quick-create"]'] = () => {
                this.actionQuickCreate();
            };

            this.events['click button[data-action="run-workflow"]'] = () => {
                this.actionCheckWorkFlow();
            };

        }

        afterRender() {
            super.afterRender();
            const superParent = this.getParentView().getParentView()._parentView;
            const url = this.model.get(this.name);
            const hideLabel = this.model.getFieldParam(this.name, 'hideLabel');
            const isDetailMode = this.isDetailMode();
            const hideOriginalWorkflowAction = this.model.getFieldParam(this.name, 'hideOriginalWorkflowAction');
            const mode = this.model.getFieldParam(this.name, 'mode');

            if (hideLabel === true) {
                this.getLabelElement().hide();
            }

            if (url && isDetailMode && hideOriginalWorkflowAction === true && mode === 'runEspoWorkflow') {
                let hashPart;
                if (url.startsWith('#')) {
                    hashPart = url.substring(1);
                } else {
                    hashPart = url.split('#')[1];
                }
                const workflowId = hashPart?.split('/').pop();
                if (workflowId) {
                    superParent.hideHeaderActionItem(`runWorkflow_${workflowId}`);
                }
            }

        }

        data() {
            const data = super.data();
            return {
                ...data,
                value: this.model.get(this.name),
                url: this.model.get(this.name),
                iconLeft: this.model.getFieldParam(this.name, 'iconLeft'),
                iconRight: this.model.getFieldParam(this.name, 'iconRight'),
                mode: this.model.getFieldParam(this.name, 'mode') || 'openNewTab',
                buttonLabel: this.model.getFieldParam(this.name, 'buttonLabel') || null,
                placeholder: this.model.getFieldParam(this.name, 'placeholder') || null,
                title: this.model.getFieldParam(this.name, 'title') || null,
                buttonSize: this.model.getFieldParam(this.name, 'buttonSize') || 'btn-md',
                style: this.model.getFieldParam(this.name, 'style') || 'default',
            };
        }

        actionOpenModal() {
            this.notify('Loading...');
            this.createView('dialog', 'link-button:views/modals/button-url', {
                buttonLabel: this.model.getFieldParam(this.name, 'buttonLabel') || null,
                url: this.model.get(this.name),
                closeButton: true,
                backdrop: true,
            }, function (view) {
                view.render();
                this.notify(false);
                this.listenToOnce(view, 'close', () => {
                    this.clearView('dialog');
                });
            }, this);
        }

        actionEspoModal() {
            let model = this.model;
            let url = this.model.get(this.name);

            // Handle URLs that start with # (e.g., #Contact/view/123)
            let hashPart;
            if (url.startsWith('#')) {
                hashPart = url.substring(1);
            } else {
                hashPart = url.split('#')[1];
            }

            if (!hashPart) {
                return Espo.Ui.error('Error: this is not a valid URL');
            }

            let parts = hashPart.split('/');
            let entityType = parts[0];
            if (!entityType) {
                return Espo.Ui.error('Error: no entity type found');
            }

            let recordId = parts[parts.length - 1];
            if (!recordId) {
                return Espo.Ui.error('Error: no record ID found');
            }

            this.notify('Loading...');
            this.createView('quickView', 'link-button:views/modals/espo-modal', {
                scope: entityType,
                id: recordId,
                removeDisabled: true,
            }, function (view) {
                view.render();
                this.notify(false);
                this.listenTo(view, 'after:save', () => {
                    model.fetch();
                });
                this.listenToOnce(view, 'close', () => {
                    this.clearView('quickView');
                });
            }, this);
        }

        actionQuickCreate() {
            let model = this.model;
            let url = this.model.get(this.name);

            // Handle URLs that start with # (e.g., #Notes)
            let hashPart;
            if (url.startsWith('#')) {
                hashPart = url.substring(1);
            } else {
                hashPart = url.split('#')[1];
            }

            if (!hashPart) {
                return Espo.Ui.error('Error: this is not a valid URL');
            }

            let parts = hashPart.split('/');
            let entityTypeModal = parts[0];
            if (!entityTypeModal) {
                return Espo.Ui.error('Error: no entity type found');
            }

            let viewName;
            if (entityTypeModal === 'Email') {
                viewName = 'views/modals/compose-email';
            } else {
                viewName = this.getMetadata().get('clientDefs.' + entityTypeModal + '.modalViews.edit') || 'views/modals/edit';
            }

            let attributes = {
                parentId: model.id,
                parentType: model.entityType,
                parentName: model.get('name'),
            };

            // Add relationship link if relationship name is specified
            let relationshipName = this.model.getFieldParam(this.name, 'relationshipName');
            if (relationshipName) {
                // Use the specified relationship name
                attributes[relationshipName + 'Id'] = model.id;
                attributes[relationshipName + 'Name'] = model.get('name');
            } else {
                // Fallback to entity type based relationship (backward compatibility)
                let entity = model.entityType;
                attributes[entity.toLowerCase() + 'Id'] = model.id;
                attributes[entity.toLowerCase() + 'Name'] = model.get('name');
            }

            if (
                entityTypeModal === 'Email' &&
                ['Contact', 'Lead', 'Account'].includes(model.entityType) &&
                model.get('emailAddress')
            ) {
                attributes.to = model.get('emailAddress');
                attributes.nameHash = {};
                attributes.nameHash[model.get('emailAddress')] = model.get('name');
            }

            this.notify('Loading...');
            this.createView('quickCreate', viewName, {
                scope: entityTypeModal,
                attributes: attributes,
            }, function (view) {
                view.render();
                this.notify(false);
                this.listenTo(view, 'after:save', () => {
                    model.fetch();
                });
                this.listenToOnce(view, 'close', () => {
                    this.clearView('quickCreate');
                    //model.collection.fetch();
                });
            }, this);
        }

        actionCheckWorkFlow() {
            let message = this.translate('confirmation', 'messages');
            let confirmationText = this.model.getFieldParam(this.name, 'confirmationText');
            let confirmation = this.model.getFieldParam(this.name, 'confirmationDialog');
            if (confirmationText) {
                message = this.getHelper().transformMarkdownText(confirmationText).toString();
            }

            if (!confirmation) {
                this.actionEspoWorkFlow();

                return;
            }

            Espo.Ui.confirm(message, {
                confirmText: this.translate('Yes', 'labels'),
                cancelText: this.translate('No', 'labels'),
                backdrop: true,
                isHtml: true,
            })
                .then(() => this.actionEspoWorkFlow());
        }


        actionEspoWorkFlow() {
            let model = this.model;
            let url = model.get(this.name);

            // Handle URLs that start with # (e.g., #Workflow/view/123)
            let hashPart;
            if (url.startsWith('#')) {
                hashPart = url.substring(1);
            } else {
                hashPart = url.split('#')[1];
            }

            if (!hashPart) {
                return Espo.Ui.error('Error: this is not a valid workflow URL');
            }
            let parts = hashPart.split('/');
            let entityType = parts[0];
            if (!entityType) {
                return Espo.Ui.error('Error: no entity type found');
            }
            let workflowId = parts[parts.length - 1];
            if (entityType !== 'Workflow') {
                return Espo.Ui.error(('Error: not a workflow'));
            }

            Espo.Ajax.getRequest('LinkButton/WorkflowCheck/' + workflowId)
                .then(response => {
                    if (response.isManual === false) {
                        return Espo.Ui.error(('Error: not a manual or active workflow'));
                    }

                    Espo.Ajax.postRequest('WorkflowManual/action/run', {
                        targetId: model.id,
                        id: workflowId,
                    }).then(() => {
                        model.fetch().then(() => {
                            Espo.Ui.success(('Done'));
                        });
                    });
                })
                .catch(error => {
                    console.error(error);
                    Espo.Ui.error(('Error checking workflow type'));
                });
        }

        actionOpenPopup() {
            const popupHeight = this.model.getFieldParam(this.name, 'popupHeight') || 800;
            const popupWidth = this.model.getFieldParam(this.name, 'popupWidth') || 600;
            window.open(this.model.get(this.name), '_blank', `scrollbars=yes,height=${popupHeight},width=${popupWidth}`);
        }
    };
});
