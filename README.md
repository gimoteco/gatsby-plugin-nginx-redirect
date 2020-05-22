## Description

This plugin create a nginx conf file with the gatsby created redirects

### Dependencies

In order to work you have to use the output .conf file in your nginx server

## How to install

`npm install --save gatsby-plugin-nginx-redirect`

## Available options

### inputConfigFile (required)

The path for input nginx configuration file

### outputConfigFile (required)

The path of the outputted nginx configuration file with the redirects within.

## Examples of usage

### In gatsby-config.js

```javascript
plugins: [
  ...,
  {
    resolve: "gatsby-plugin-nginx-redirect",
    options: {
      inputConfigFile: `${__dirname}/nginx.conf`,
      outputConfigFile: `${__dirname}/nginx.out.conf`,
    },
  },
  ...
]
```

Now you can use gatsby\`s `createRedirect` action to generate your custom http redirects

## How to contribute

Feel free to open an issue with your doubt, bug or suggestion.
