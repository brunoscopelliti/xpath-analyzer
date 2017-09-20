# xpath-analyzer

Google Chrome extension that allows to evaluate xPath expressions against the XML available at a given URL. Direct link to the [Google Chrome store] [1].

## xPath Analyzer in a nutshell
Google Chrome extension that allows to evaluate xPath expressions against the XML available at a given URL.

**xPath Analyzer has not other dependencies.**

## Usage
It is really simple to use; write the url, and then type a new xPath expression in the input field, and simply press enter to evaluate it.

xPath Analyzer can evaluate each possible type of xPath (or XSLT expression).

```sh
<root country="us">
  <order total="215.00">
    <buyer name="Homer Simpson" city="Springfield"/>
    <shipping type="1" cost="15.00"/>
    <payment type="0" cost="0.00"/>
    <item value="75.00">TShirt</item>
    <item value="125.00">Jeans</item>
  </order>
</root>
```

```sh
 > count(//order/item)
 > 2
 
 > //buyer/@name
 > Homer Simpson
 
 > /root[@country='us']/order/@total
 > 215.00
```

## Changelog

- 11/28/2013 v. 1.1.0 First public release.
- 12/14/2013 v. 1.2.0 Added the possibility (using up/down arrow keys) to recall xPath searched in the past.

- **01/16/2016 v. 2.0.0** A complete rewrite.


[1]: https://chrome.google.com/webstore/detail/xpath-analyzer/abfcnmcmpfhkmhoapcplnafnecpofkci?utm_source=chrome-ntp-icon
[2]: http://bit.ly/Rink5Y
