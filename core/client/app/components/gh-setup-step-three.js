import Ember from 'ember';

export default Ember.Component.extend({
    nextStep: 'fifty',

    actions: {
        nextStep: function () {
            this.attrs.nextStep();
        }
    }
});
