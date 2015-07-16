import Ember from 'ember';

export default Ember.Route.extend({
    setupController: function (controller) {
        this._super(controller);
        this.controllerFor('setup').send('toStepThree');
    }
});
