Add subscriptions per template, and integrate with a cache manager (subs-manager).

# Setup
In order to have a template automatically subscribe on creation, set subscriptions to a function that returns an array of subscriptions to request.

    Template.templateWithSubscriptions.subscriptions = function(){
      return [["TestSub"]];
    };

to view the subscription status from a template

    {{ subscriptionsReady }}

# Cache Manager
A cache manager isn't required, if set though it will add to the cache manager when the template is destroyed, or subscriptions changed. You can set it per template

    Template.templateWithSubscriptions.cacheManager = new SubsManager({
      cacheLimit: 10,
      expireIn: 5
    });

or globally.

    TemplateSubscriptions.cacheManager = new SubsManager({
      cacheLimit: 10,
      expireIn: 5
    });

# Small Demo
A small demo can be found [here](templatesubs.meteor.com), and it's code [here](https://github.com/ElevateDevelopmentAndDesign/meteor-template-subscriptions-demo).

# Issues
Stoping subscriptions on destroyed will result in stopping existing subscriptions before subs-manager picks it up.  This results in all subscriptions happening twice.
