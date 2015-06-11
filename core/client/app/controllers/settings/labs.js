import Ember from 'ember';
import {request as ajax} from 'ic-ajax';

export default Ember.Controller.extend(Ember.Evented, {
    uploadButtonText: 'Import',
    importErrors: '',
    importDetails: '',
    importStatus: '',
    importProblemsPosts: '',
    importProblemsTags: '',
    ghostPaths: Ember.inject.service('ghost-paths'),
    notifications: Ember.inject.service(),
    labsJSON: Ember.computed('model.labs', function () {
        return JSON.parse(this.get('model.labs') || {});
    }),

    saveLabs: function (optionName, optionValue) {
        var self = this,
            labsJSON =  this.get('labsJSON');

        // Set new value in the JSON object
        labsJSON[optionName] = optionValue;

        this.set('model.labs', JSON.stringify(labsJSON));

        this.get('model').save().catch(function (errors) {
            self.showErrors(errors);
            self.get('model').rollback();
        });
    },

    actions: {
        onUpload: function (file) {
            var self = this,
                formData = new FormData();
            this.set('uploadButtonText', 'Importing');
            this.set('importErrors', '');
            this.set('importDetails', '');
            this.set('importStatus', '');
            this.set('importProblemsPosts', '');
            this.set('importProblemsTags', '');

            formData.append('importfile', file);

            ajax(this.get('ghostPaths.url').api('db'), {
                type: 'POST',
                data: formData,
                dataType: 'json',
                cache: false,
                contentType: false,
                processData: false
            }).then(function (response) {
                self.set('importStatus', 'Import Successful!');
                self.set('uploadButtonText', 'Import');
                self.set('importDetails', response.db[0].meta.details);
                self.set('importProblemsPosts', response.db[0].meta.problems.posts);
                self.set('importProblemsTags', response.db[0].meta.problems.tags);
                // Clear the store, so that all the new data gets fetched correctly.
                self.store.unloadAll('post');
                self.store.unloadAll('tag');
                self.store.unloadAll('user');
                self.store.unloadAll('role');
                self.store.unloadAll('setting');
            }).catch(function (response) {
                if (response && response.jqXHR && response.jqXHR.responseJSON && response.jqXHR.responseJSON.errors) {
                    self.set('importErrors', response.jqXHR.responseJSON.errors);
                }
                self.set('importStatus', 'Import failed!');
            }).finally(function () {
                self.set('uploadButtonText', 'Import');
                self.trigger('reset');
            });
        },

        exportData: function () {
            var iframe = $('#iframeDownload'),
                downloadURL = this.get('ghostPaths.url').api('db') +
                    '?access_token=' + this.get('session.secure.access_token');

            if (iframe.length === 0) {
                iframe = $('<iframe>', {id: 'iframeDownload'}).hide().appendTo('body');
            }

            iframe.attr('src', downloadURL);
        },

        sendTestEmail: function () {
            var notifications = this.get('notifications');

            ajax(this.get('ghostPaths.url').api('mail', 'test'), {
                type: 'POST'
            }).then(function () {
                notifications.showSuccess('Check your email for the test message.');
            }).catch(function (error) {
                if (typeof error.jqXHR !== 'undefined') {
                    notifications.showAPIError(error);
                } else {
                    notifications.showErrors(error);
                }
            });
        }
    }
});
