Package.describe({
  name: 'elevatedevdesign:template-subscriptions',
  summary: 'Template based subscriptions for meteor',
  version: '0.0.2',
  git: 'https://github.com/ElevateDevelopmentAndDesign/meteor-template-subscriptions'
});

Package.onUse(function(api) {
  api.versionsFrom('METEOR@1.0');
  api.use('blaze');
  api.use('reactive-var');

  api.addFiles('client.js','client');

  api.export("TemplateSubscriptions", 'client');
});
