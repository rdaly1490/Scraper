Short and sweet for now.

Need to add your own keys.js file inside /config in the shape of:

```
{
  TWILIO_PHONE_NUMBER,
  MY_PHONE_NUMBER,
  ACCOUNT_SID,
  AUTH_TOKEN
}
```

Add your own scrapes-data-source.json file to the project's root.  scrapes-test-data-source.json shows as an example.  The shape of the file is

```
[
  {
    "site": string,
    "url": string,
    "target": string,target
    "itemDescriptionTarget": string,
    "rules": [
      {
        "child": ".desc_text .med_txt",
        "regex"?: {
          "pattern": "lysol.*wipes",
          "flags": "gi"
        }
      },
      {
        "child": ".oos_label",
        "existence"?: boolean
      }
    ]
  }
]
```

"site": This should be unqique (i.e. Office Depot, Staples, etc.)
"url": string,
"target": querySelector pattern for the container you want to target
"itemDescriptionTarget": querySelector pattern for child of above target that has the items description text 
"rules": can be many rules of the folowing 2 shapes:
{
    "child": querySelector pattern for child of above target that the rule should perform the test on,
        "regex": {
            "pattern": regex pattern to match text on,
            "flags": flags for the regex pattern
        }
},
{
    "child": querySelector pattern for child of above target that the rule should perform the test on,
    "existence": check if the child element exists
}

