module.exports = defineConfig({
    pluginOptions: {
      electronBuilder: {
        builderOptions: {
          extraResources: [
            { "from": "config.json", "to": "."}
          ]
        }
      }
    }
  })
  