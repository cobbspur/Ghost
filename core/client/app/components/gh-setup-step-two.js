import Ember from 'ember';
import {request as ajax} from 'ic-ajax';
import ValidationEngine from 'ghost/mixins/validation-engine';

export default Ember.Component.extend(ValidationEngine, {

    nextStep: undefined,

    actions: {
        nextStep: function () {
            this.sendAction('nextStep');
        }
    }
});
