
var  Feature;

Feature = Ember.ObjectProxy.extend({
    config: {},
    settings: {},
    //tagsUI: true,
    tagsUI: Ember.computed(function () {
        console.log('config', this.config, 'settings', this.settings);
        return false;
    }),
    codeInjectionUI: 'fred',
    setConfig: function(_config) {


        this.config = _config;
        console.log('jobby', this.config);
    },
    setSettings: function (_settings) {

        this.settings = JSON.parse(_settings);
        console.log('adding', this.settings, 'tag', this.settings.tagsUI, 'code', this.settings.codeInjectionUI);
    }
});

export default Feature;
