TemplateSubscriptions = {};
TemplateSubscriptions._blazeFireCallbacks = Blaze._fireCallbacks;

TemplateSubscriptions._calcHash = function( sub ){
  return EJSON.stringify(sub);
}

/*
 * Setup variables used in template
 */
TemplateSubscriptions.initTemplate = function(view){
  var self = this;
  if( view.template && view.template.subscriptions ){
    view.template._subscriptionsList = view.template.subscriptions();
    view.template._subscriptionState = {};
    view.template._subscriptions = [];
    view.template._subscriptionsReady = new ReactiveVar( false );
    _.forEach(view.template._subscriptionsList, function( sub ){
      view.template._subscriptionState[self._calcHash(sub)] = false;
    });
  }
}

/*
 * Call init and startup subscriptions for template
 */
TemplateSubscriptions._createdCallback = function(view){
  this.initTemplate( view );
  if( view.template && view.template.subscriptions ){
    _.forEach(view.template._subscriptionsList, function( sub ){
      var hash = EJSON.stringify(sub);
      var readyCallback = function( ){
        view.template._subscriptionState[hash] = true;
        _.forEach(view.template._subscriptionList, function(sub ){
          var hash = EJSON.stringify(args);
          if( !view.template._subscriptionState[hash] ){
            return false;
          }
        });
        view.template._subscriptionsReady.set( true );
      }
      
      // clone the sub args array
      sub = sub.slice(0);
      sub.push( readyCallback );
      view.template._subscriptions.push( Meteor.subscribe.apply( Meteor, sub ) );
    });
  }
}

/*
 * Stop subscriptions and add them to cache manager if present
 */
TemplateSubscriptions._destroyedCallback = function(view){
  var self = this;
  if( view.template && view.template._subscriptions ){
    if( self.cacheManager !== undefined ){
      _.forEach(view.template._subscriptionsList, function( sub ){
        self.cacheManager.subscribe.apply( TemplateSubscriptions.cacheManager, sub );
      });
    }
    view.template._subscriptions.forEach(function(sub){
      sub.stop();
    });
  }
}

/*
 * Add helper to determine when subscriptions are ready
 */
UI.registerHelper('subscriptionsReady', function( s){
  if( UI._templateInstance().view.template._subscriptionsReady !== undefined ){
    return UI._templateInstance().view.template._subscriptionsReady.get();
  }else{
    return true;
  }
});

Blaze._fireCallbacks = function(view, which){
  if( which === "created" ){
    TemplateSubscriptions._createdCallback(view);
  }
  if( which === "destroyed" ){
    TemplateSubscriptions._destroyedCallback(view);
  }
  TemplateSubscriptions._blazeFireCallbacks(view, which);
}
