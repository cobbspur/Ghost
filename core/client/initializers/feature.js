import Feature from 'ghost/utils/feature';

var injectFeatureInitializer = {
    name: 'injectFeature',
    after: 'config',

    initialize: function (container, application) {

        application.register('feature:main', Feature);

        //Feature.setConfig(container.lookup('ghost:config'));

        application.inject('controller', 'feature', 'feature:main');
        application.inject('route', 'feature', 'feature:main');
    }
};

export default injectFeatureInitializer;
