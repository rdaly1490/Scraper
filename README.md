Short and sweet for now.

The scrape results can be modified to do whatever you want with them through the use of any generic "Action controller" of your making.  For the sake of example, this repo includes an action controller that uses twilio to send texts upon successful scrapes.

The protocol for any action controller is
```
protocol ActionController {
    async onResultsAdded = () => void
    async onTestController = () => void
}
```
Action Controllers also get passed an instance of master control program to take advantage of error logging methods, config vars, etc.

If you'd like to change the action controller to your own custom one, create your own controller file in the controllers directory, update the const `const ACTION_CONTROLLER = "twilio";` in /config/index.js to the name of your file, and add your own specific config variables in a file called action-controller-config.js.

If you'd like to use the twilio controller example, the shape of action-controller-config.js is:
```
module.exports = {
  TWILIO_PHONE_NUMBER,
  MY_PHONE_NUMBER,
  ACCOUNT_SID,
  AUTH_TOKEN
}
```

Otherwise, just have your custom config settings follow 
```
module.exports = {
  ...CONFIG
}
```


Add your own scrapes-data-source.json file to the project's root to run the app in production, otherwise scrapes-test-data-source.json runs in other node environments and shows as an example of how the production file should be shaped.  The shape of the file is:

```
-- File Shape --

[
    {
        "site": string,
        "url": string,
        "target": string,target
        "itemDescriptionTarget": string,
        "rules": Array<RegexRule | ExistenceRule>
    }
]

-- Types Definitions For Above --

There should always be a child element when using this rule

RegexRule {
    "pattern": string,
    "flags": "gi",
    "textShouldExist": boolean
}

ExistenceRule {
    "child": string,
    "existence"?: boolean
}
```

```
"site": This should be unqique (i.e. Office Depot, Staples, etc.)
"url": string,
"target": querySelector pattern for the container you want to target
"itemDescriptionTarget": querySelector pattern for child of above target that has the items description text 
"rules": can be as many rules of the folowing 2 shapes as needed:

 -- RegexRule --

{
    "child": querySelector pattern for child of above target that the rule should perform the test on,
        "regex": {
            "pattern": regex pattern to match text on,
            "flags": flags for the regex pattern,
            "textShouldExist": determine if a regex match should yield a successful scrape or not, defaults to true
        }
}

-- ExistenceRule --

{
    "child": querySelector pattern for child of above target that the rule should perform the test on,
    "existence": check if the child element exists
}
```

Configurable Environment Variables
```
SCRAPE_DELAY: time in between scrapes, measured in milliseconds.  Defaults to 5000 (5 seconds),
DATE_FORMAT: the format the dates will show up in the UI.  Uses moment JS date format.  Default value is "MMM D - h:mm A".
ACTION_CONTROLLER: the filename of the controller you'd like to acknowledge successful scrape results.  Defaults to "twilio".
PASSWORD: A password for when you deploy the app to a production env.  This prevents other unauthorized users from toggling scrapes on or off.
AUTO_START: flag for auto starting the scrape process if the server restarts (for example, Heroku restarts hobby dynos once a day).
```