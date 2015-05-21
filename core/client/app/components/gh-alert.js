import Ember from 'ember';

var AlertComponent = Ember.Component.extend({
    tagName: 'article',
    classNames: ['gh-alert', 'gh-alert-blue'],

    actions: {
        closeNotification: function () {
            var self = this;
            self.notifications.closeNotification(self.get('message'));
        }
    }
});

export default AlertComponent;
