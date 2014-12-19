/* global key */
import ShortcutsRoute from 'ghost/mixins/shortcuts-route';
import ctrlOrCmd from 'ghost/utils/ctrl-or-cmd';

var ApplicationRoute,
    shortcuts = {};

shortcuts.esc = {action: 'closePopups', scope: 'all'};
shortcuts.enter = {action: 'confirmModal', scope: 'modal'};
shortcuts[ctrlOrCmd + '+s'] = {action: 'save', scope: 'all'};

ApplicationRoute = Ember.Route.extend(SimpleAuth.ApplicationRouteMixin, ShortcutsRoute, {
    shortcuts: shortcuts,

    afterModel: function (model, transition) {
        if (this.get('session').isAuthenticated) {
            transition.send('loadAPIData');
        }
    },

    title: function (tokens) {
        return tokens.join(' - ') + ' - ' + this.get('config.blogTitle');
    },

    actions: {
        toggleGlobalMobileNav: function () {
            this.toggleProperty('controller.showGlobalMobileNav');
        },

        openSettingsMenu: function () {
            this.set('controller.showSettingsMenu', true);
        },

        closeSettingsMenu: function () {
            this.set('controller.showSettingsMenu', false);
        },

        toggleSettingsMenu: function () {
            this.toggleProperty('controller.showSettingsMenu');
        },

        closePopups: function () {
            this.get('dropdown').closeDropdowns();
            this.get('notifications').closeAll();

            // Close right outlet if open
            this.send('closeSettingsMenu');

            this.send('closeModal');
        },

        signedIn: function () {
            this.send('loadAPIData', true);
        },

        sessionAuthenticationFailed: function (error) {
            if (error.errors) {
                this.notifications.showErrors(error.errors);
            } else {
                // connection errors don't return proper status message, only req.body
                this.notifications.showError('There was a problem on the server.');
            }
        },

        sessionAuthenticationSucceeded: function () {
            var appController = this.controllerFor('application'),
                self = this;

            if (appController && appController.get('skipAuthSuccessHandler')) {
                return;
            }

            this.store.find('user', 'me').then(function (user) {
                self.send('signedIn', user);
                var attemptedTransition = self.get('session').get('attemptedTransition');
                if (attemptedTransition) {
                    attemptedTransition.retry();
                    self.get('session').set('attemptedTransition', null);
                } else {
                    self.transitionTo(SimpleAuth.Configuration.routeAfterAuthentication);
                }
            });
        },

        sessionInvalidationFailed: function (error) {
            this.notifications.showError(error.message);
        },

        openModal: function (modalName, model, type) {
            this.get('dropdown').closeDropdowns();
            key.setScope('modal');
            modalName = 'modals/' + modalName;
            this.set('modalName', modalName);

            // We don't always require a modal to have a controller
            // so we're skipping asserting if one exists
            if (this.controllerFor(modalName, true)) {
                this.controllerFor(modalName).set('model', model);

                if (type) {
                    this.controllerFor(modalName).set('imageType', type);
                    this.controllerFor(modalName).set('src', model.get(type));
                }
            }

            return this.render(modalName, {
                into: 'application',
                outlet: 'modal'
            });
        },

        confirmModal: function () {
            var modalName = this.get('modalName');

            this.send('closeModal');

            if (this.controllerFor(modalName, true)) {
                this.controllerFor(modalName).send('confirmAccept');
            }
        },

        closeModal: function () {
            this.disconnectOutlet({
                outlet: 'modal',
                parentView: 'application'
            });

            key.setScope('default');
        },

        loadAPIData: function (isDelayed) {
            var self = this;
            if (this.session.isAuthenticated) {
                this.store.findAll('notification').then(function (serverNotifications) {
                    serverNotifications.forEach(function (notification) {
                        self.notifications.handleNotification(notification, isDelayed);
                    });
                });
                this.store.find('setting', {type: 'blog,theme'}).then(function (records) {
                    var settings = records.get('firstObject');
                    self.feature.setSettings(settings.get('labs'));
                });
            }
        },

        handleErrors: function (errors) {
            var self = this;

            this.notifications.clear();
            errors.forEach(function (errorObj) {
                self.notifications.showError(errorObj.message || errorObj);

                if (errorObj.hasOwnProperty('el')) {
                    errorObj.el.addClass('input-error');
                }
            });
        },

        // noop default for unhandled save (used from shortcuts)
        save: Ember.K
    }
});

export default ApplicationRoute;
