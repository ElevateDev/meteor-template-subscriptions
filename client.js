TemplateSubscriptionsImpl = function(){
  
};

TemplateSubscriptionsImpl.prototype.init = function(){
  this._blazeFireCallbacks = Blaze._fireCallbacks;

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

  /*
   * Inject ourselves into blaze to get callbacks
   */
  Blaze._fireCallbacks = function(view, which){
    if( which === "created" ){
      TemplateSubscriptions._createdCallback(view);
    }
    if( which === "destroyed" ){
      TemplateSubscriptions._destroyedCallback(view);
    }
    TemplateSubscriptions._blazeFireCallbacks(view, which);
  };

  var self = this; 
  Blaze.TemplateInstance.prototype.subscriptionsChanged = function(){
    var view = this.view;
    var newSubsValue = view.template.subscriptions();
    self._cacheEach( view, _.map(view.template._subscriptionMap, function(sub){ return sub.args;}) );
    self._unsubscribeEach( view, _.map(view.template._subscriptionMap, function(sub){ return sub.args;}) );
    self._subscribeEach( view, newSubsValue );
  };
};

TemplateSubscriptionsImpl.prototype._calcHash = function( sub ){
  return EJSON.stringify(sub);
};

/*
 * Setup variables used in template
 */
TemplateSubscriptionsImpl.prototype._initTemplate = function(view){
  var self = this;
  if( view.template && view.template.subscriptions ){
    view.template._subscriptionList = view.template.subscriptions();
    view.template._subscriptionMap = {};
    view.template._subscriptionsReady = new ReactiveVar( view.template._subscriptionList.length === 0 );
  }
};

TemplateSubscriptionsImpl.prototype._setSubscriptionState = function( view, sub, state ){
  var hash = this._calcHash( sub );
  var template = view.template;
  if( template._subscriptionMap[hash] ){
    template._subscriptionMap[hash].state = state;
    template._subscriptionMap[hash].args = sub;
  }else{
    template._subscriptionMap[hash] = {state: state, args: sub};
  }

  var allTrue = true;
  _.forEach(view.template._subscriptionMap, function(sub ){
    if( !view.template._subscriptionMap[hash].state ){
      allTrue = false;
      return;
    }
  });
  view.template._subscriptionsReady.set( allTrue );
};

/*
 * Helpers for subscribe list of arg lists, unsubscribe list and add to cache manager
 */

TemplateSubscriptionsImpl.prototype._subscribeEach = function( view, subs ){
  var self = this;
  var template = view.template;
  _.forEach(subs, function( sub ){
    var hash = self._calcHash(sub);
    var subArray = sub;
    var readyCallback = function( ){ self._setSubscriptionState( view, subArray, true ); };
    
    // clone the sub args array
    sub = sub.slice(0);
    self._setSubscriptionState( view, sub, false );
    sub.push( readyCallback );
    template._subscriptionMap[hash].subscription = Meteor.subscribe.apply( Meteor, sub );
  });
};

TemplateSubscriptionsImpl.prototype._unsubscribeEach = function( view, subs ){
  var self = this;
  _.forEach(subs, function( sub ){
    var hash = self._calcHash( sub );
    if( view.template._subscriptionMap[hash] && view.template._subscriptionMap[hash].subscription ){
      view.template._subscriptionMap[hash].subscription.stop();
      delete view.template._subscriptionMap[hash];
    }
  });
};

TemplateSubscriptionsImpl.prototype._cacheEach = function( view, subs ){
  var cacheManager = view.template.cacheManager ? view.template.cacheManager : self.cacheManager;
  if( cacheManager !== undefined ){
    _.forEach(subs, function( sub ){
      cacheManager.subscribe.apply( cacheManager, sub );
    });
  }
};

/*
 * Callbacks on blaze templates
 */

/*
 * Call init and setup subscriptions for template
 */
TemplateSubscriptionsImpl.prototype._createdCallback = function(view){
  this._initTemplate( view );
  if( view.template && view.template.subscriptions ){
    this._subscribeEach(view,view.template._subscriptionList);
  }
};

TemplateSubscriptionsImpl.prototype._destroyedCallback = function(view){
  if( view.template && view.template._subscriptions ){
    this._cacheEach( view );
    this._unsubscribeEach(view, _.map(view.template._subscriptionMap,function(sub){return sub.args;}));
  }
};

TemplateSubscriptions = new TemplateSubscriptionsImpl();
TemplateSubscriptions.init();
