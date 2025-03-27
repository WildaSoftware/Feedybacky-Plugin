Feedybacky
==========

### What is Feedybacky? ###

Feedybacky is simple JS plugin for web pages which facilitates feedback system. It creates a sliding element on HTML page in which a user can provide a request (error, suggest, comment etc.) and send it in rapid and easy way. The special part of this process is the fact, that Feedybacky allows to attach a screenshot of the current page and additional information **automatically**. It includes i.a. current URL, user agent string and - of course - current datetime. In many situations, request's text provided by a user is not sufficient to reproduce e.g. an error - Feedybacky tries to solve that problem.

Feedybacky uses `html2canvas` library created by Niklas von Hertzen and `dom-to-image` library created by Anatolii Saienko and Paul Bakaus.

### Installation ###

If you just want to use Feedybacky, you can copy the ZIP archive from the repository and unzip to the destinated directory. It is important to have all subfolders (`css`, `js` etc.) next to each other in the same folder.

Of course, you can also install Feedybacky as NPM package:

	npm install --save feedybacky

If you want to modify or build Feedybacky by yourself, you should install NPM dependencies by running `npm install` command, install `gulp-cli` globally (`npm install -g gulp-cli`) and run `gulp` in Feedybacky directory (`npm install gulp`). Afterwards, you can copy following directories to the destinated folder: `css`, `dependencies`, `i18n`, `img`, `js`.

Lastly, you can also fetch Feedybacky via CDN - if you would like to use the plugin this way, please check example page `examples/09-cdn.html` to display an example.

### How to include Feedybacky in my web page? ###

#### Standard way ####

Firstly, you have to create a DOM element anywhere on your web page:
```html
<div id="feedybacky-container"></div>
```	
Secondly, Feedybacky script should be included and its object initialized:
```javascript
<script type="text/javascript" src="js/feedybacky.min.js"></script>
//...
var feedybacky = new Feedybacky('feedybacky-container', {
	onSubmitUrl: url
});
```

If you want to pair plugin with Feedybacky portal, you need to fetch your Feedybacky API key and create a project in the portal to retrieve its symbol. Then you can use it on your WWW site in order to send request to Feedybacky portal. You should also provide URLs to terms and conditions and privacy policy of site, on which you place the plugin. The "legal" checkboxes are not checked by default but if a user checks them, the information in local storage is saved so these checkboxes would be checked by default later.
```javascript
var feedybacky = new Feedybacky('feedybacky-container', {
	apiKey: 'your Feedybacky API key',
	projectSymbol: 'your Feedybacky project symbol',
	termsUrl: 'link to terms and conditions',
	privacyPolicyUrl: 'link t privacy policy'
});
```
#### Angular ####

1. Add a DOM element to your root `.html` template (outside `<app-root></app-root>`):
```html
<div id="feedybacky-container"></div>
```
2. Edit your `angular.json` file:
```json
//...
"build": {
	//...
	{
		"styles": [
			//...
			"node_modules/feedybacky/css/feedybacky.min.css"
		],
		"scripts": [
			//...
			"node_modules/feedybacky/dependencies/html2canvas/html2canvas.min.js",
			"node_modules/feedybacky/dependencies/domtoimage/dom-to-image.min.js"
		]
	}
}
```
3. In your `app.component.ts` add:
```typescript
import { Feedybacky } from 'feedybacky';

export class AppComponent {
	protected feedybacky = new Feedybacky('feedybacky-container', {
		onSubmitUrl: url
	});
	//...
}
```
#### Vue.js ####
1. Add a DOM element to `public/index.html`:
```html
<div id="feedybacky-container"></div>
```
2. Import Feedybacky into `App.vue`:
```ts
import { Feedybacky } from 'feedybacky'

const feedybacky = new Feedybacky('feedybacky-container', {
  onSubmitUrl: url
});
```
3. Import additional styles and dependencies in `main.js`:
```ts
import 'feedybacky/css/feedybacky.min.css';
import 'feedybacky/dependencies/html2canvas/html2canvas.min.js';
import 'feedybacky/dependencies/domtoimage/dom-to-image.min.js';
```

#### React ####
1. Add DOM element to `public/index.html`:
```html
<div id="feedybacky-container"></div>
```
2. Import and init Feedybacky and import dependencies into `App.js`
```ts
import { Feedybacky } from 'feedybacky';
import 'feedybacky/css/feedybacky.min.css';
import 'feedybacky/dependencies/html2canvas/html2canvas.min.js';
import 'feedybacky/dependencies/domtoimage/dom-to-image.min.js';

new Feedybacky('feedybacky-container', {
  onSubmitUrl: url
})
```

### Parameters ###

In Feedybacky constructor, next to ID of empty div, a JSON object with parameters should be provided. Below there are parameters accepted by Feedybacky.

`language` - language in which Feedybacky should display default messages. Can be omitted, especially if custom messages are provided. Available language packs with default messages can be found in `i18n` directory. Default value: `"en"`

`onSubmit` - callback function to invoke after sending a request. Either `onSubmit` or `onSubmitUrl` parameter must be set. This parameter is for advanced usage only - in most cases `onSubmitUrl` would be the better choice.

`onSubmitUrl` - URL with POST web service to receive information about a sent request. The resulted JSON object can consist of following fields:

* **message** - text or recording provided by the user.
* **messageType** - type of message (`text` or `voice`).
* **timestamp** - date and time of the request creation.
* **url** - URL on which the request is sent.
* **errors** - array with error messages from JavaScripts's console.
* **image** - screenshot of the current web page. Available only if the user accepted sending a screenshot.
* **agent** - user agent string. Available only if the user accepted sending metadata information.
* **cookies** - current user's cookie string. Available only if the user accepted sending metadata information.
* **platform** - platform symbol of the user's machine. Available only if the user accepted sending metadata information.
* **screenSize** - size of the screen (result of `screen.width` and `screen.height`). Available only if the user accepted sending metadata information.
* **availableScreenSize** - size of available part of the screen (result of `screen.availWidth` and `screen.availHeight`). Available only if the user accepted sending metadata information.
* **innerSize** - size of visible frame (result of `window.innerWidth` and `window.innerHeight`). Available only if the user accepted sending metadata information.
* **colorDepth** - depth of the pixel on the screen (result of `screen.colorDepth`). Available only if the user accepted sending metadata information.
* **orientation** - screen orientation (result of `screen.orientation.type;`). Available only if the user accepted sending metadata information.
* **cookieEnabled** - information about if a user enabled cookies (result of `navigator.cookieEnabled`). Available only if the user accepted sending metadata information.
* **browserLanguage** - language in which a browser displays the site (result of `navigator.language`). Available only if the user accepted sending metadata information.
* **referrer** - URL referrer from which the user comes to the site (result of `document.referrer`). Available only if the user accepted sending metadata information.
* **pixelRatio** - ratio of device physical pixels to CSS pixels (result of `window.devicePixelRatio`). Available only if the user accepted sending metadata information.
* **offsetX** - horizontally scrolled pixels (result of `window.pageXOffset`). Available only if the user accepted sending metadata information.
* **offsetY** - vertically scrolled pixels (result of `window.pageYOffset`). Available only if the user accepted sending metadata information.
* **history** - array of objects representing last N events called by the user (details below). Available only if the user accepted sending history information.
* **extraInfo** - JSON object with extra parameters passed by the callback function. Available only if extra data callback was defined.
* **email** - e-mail address provided by the user if available (the appropriate field is visible).
* **category** - value of the category selected by the user if available (the appropriate field is visible).
* **priority** - value of priority ("medium" or "high") selected by the user if available (the appropriate field is visible).
* **prefix** - prefix defined for the Feedybacky instance (if defined).
* **adBlock** - information if an enabled AdBlock browser plugin can be detected. It can have value 1 or 0.
* **visitedUrls** - array of objects with last N visited URLs withing the site. Available only if the parameter `urlTracking` is enabled.

`apiKey` - API key generated for your Feedybacky account in the portal. You can retrieve it from the portal on the edit account view under the "API key" section. Setting this parameter is obligatory if you want to send request to the Feedybacky portal. If this and `projectSymbol` are set, the value of `onSubmitUrl` is replaced by the official Feedybacky portal endpoint.

`projectSymbol` - the symbol of a project created in Feedybacky portal. You can fetch it from the portal on the project config view. Setting this parameter is obligatory if you want to send request to the Feedybacky portal. If this and `apiKey` are set, the value of `onSubmitUrl` is replaced by the official Feedybacky portal endpoint.

`termsUrl` - URL for terms and conditions document of a site. It is used when the plugin would send the request to official Feedybacky portal. Link would be opened in a new tab. Default value is `#`.

`privacyPolicyUrl` - URL for privacy policy document of a site. It is used when the plugin would send the request to official Feedybacky portal. Link would be opened in a new tab. Default value is `#`.

`texts` - JSON object with custom messages in different parts of the plugin. It can contain following keys:

* **tooltip** - information visible after placing the cursor on the minified div with the plugin.
* **title** - title on top of the plugin screen.
* **description** - description on the plugin screen (before textarea).
* **additionalDataInformation** - description on the plugin screen (after textarea, before checkboxes).
* **screenshot** - label for the checkbox to accept sending a screenshot.
* **metadata** - label for the checkbox to accept sending metadata.
* **history** - label for the checkbox to accept sending event history.
* **termsAccepted** - label for the checkbox to accept terms and conditions (visible when the plugin is paired with the Feedybacky portal).
* **personalDataAccepted** - label for the checkbox to confirm personal data processing (visible when the plugin is paired with the Feedybacky portal).
* **note** - label for the text between checkboxes and send button (empty by default and then not visible).
* **send** - label for the "Send" button.
* **requestSuccess** - message visible after successful POST request sending.
* **requestFail** - message visible after unsuccessful POST request sending.
* **requestPending** - message visible during sending a POST request.
* **powered** - message on bottom of the plugin screen.
* **error403** - message after a situation where an 403 error occurred.
* **error404** - message after a situation where an 404 error occurred.
* **error500** - message after a situation where an 500 error occurred.
* **descriptionErrorEmpty** - error message for the empty description field.
* **email** - label before the e-mail address field.
* **emailErrorEmpty** - error message for the empty e-mail address field.
* **termsAcceptedErrorNotChecked** - error message when terms and conditions have been not accepted while the plugin is paired with the Feedybacky portal.
* **personalDataAcceptedErrorNotChecked** - error message when user has not confirm information about personal data processing while the plugin is paired with the Feedybacky portal.
* **category** - label before the category field.
* **priority** - label before the priority field.
* **modifyScreenshot** - label for the link for screenshot modification.
* **working** - label displayed when work is in progress (during modified screenshot generation).
* **messageTypeText** - label for text message type.
* **messageTypeVoice** - label for voice message type.
* **voiceRecord** - label for record start button (for voice message type).
* **voiceStopRecord** - label for record stop button (for voice message type).
* **voicePlay** - label for record play button (for voice message type).
* **voiceRecordTitle** - label for record start button title (for voice message type).
* **voiceStopRecordTitle** - label for record stop button title (for voice message type).
* **voicePlayTitle** - label for record play button title (for voice message type).
* **descriptionErrorVoiceTooLong** - error message when recording for voice message type is too long.

`extraInfo` - optional callback function with no parameter which only returns JSON object. Keys and values of the object are merged with standard request information (next to "message", "timestamp" etc.). It can be used to pass extra data specific to the web application, such as user ID.

`emailField` - optional parameter indicating if e-mail address field should be visible. If it is visible, it is also required. Default value: `false`.

`categories` - optional parameter for array of category options presented for the user. If this parameter is omitted or no category is provided, the select with category is not visible and the value not be sent with a request. Each element of this array should be a JSON object with two keys: `label` and `value`, e.g.:

```ts
categories: [
	{ label: 'Suggestion', value: 'suggest' },
	{ label: 'Issue', value: 'error' },
],
```

`priorityField` - optional parameter indicating if priority select should be visible. Default value: `false`.

`screenshotField ` - optional parameter for defining behaviour of the plugin during processing a screenshot. The default value is `"visible"` and it means that the checkbox is visible and a user can select if they would like to send a screenshot or not. The other possible values are `"autoEnable"` (the checkbox is not visible and the screenshot is sent automatically) and `"autoDisable"` (the checkbox is not visible and the screenshot is ignored).

`metadataField` - optional parameter for defining behaviour of the plugin during processing metadata. The default value is `"visible"` and other possibilities are similar as for `screenshotField` above.

`historyField` - optional parameter for defining behaviour of the plugin during processing event history. The default value is `"visible"` and other possibilities are similar as for `screenshotField` above. Captured event types are: `change`, `click`, `focus`, `reset`, `submit` and there are omitted for Feedybacky form.

`historyLimit` - number of last event calls on the page which would be added to event history. The default value is not set what means that all captured operations would be sent.  

`urlTracking` - optional parameter for maintenance of visited URLs history in local storage for a domains of your site. If enabled, it also attaches last N entries of the history to request while it is sending. It is a boolean parameter and default value is `true`.

`urlTrackingLimit` - optional parameter for limitting a history of visited URLs. It is used only if `urlTracking` is enabled. It can be useful to find a compromise between depth of stack trace and memory usage of local storage. Default value is `15`.

`beforeSubmit` - optional callback function with one parameter - instance of `FeedybackyPayload` object containing whole payload ready to sent. This callback is invoked before sending a request to endpoint defined by `onSubmitUrl` parameter. It can be used to make some preparations before sending (for example, show loader animation) or add some additional fields to payload, such as authentication key. The last one can be achieved by `add` function invoked inside `beforeSubmit`, e.g.:

```ts
beforeSubmit: (payload) => {
	alert('We are in beforeSubmit function and we add some fields to payload.');

	payload.add('param1', 'Value of additional parameter 1');
	payload.add('param2', 'Value of additional parameter 2');
}
```

`onSubmitUrlSuccess` - optional callback function invoked after successful request sending to endpoint defined by `onSubmitUrl` parameter. It has two parameters: `statusCode` and `response` (the latter is textual representation of response body).

`onSubmitUrlError` - optional callback function invoked after failed request sending to endpoint defined by `onSubmitUrl` parameter. It has two parameters: `statusCode` and `response` (the latter is textual representation of response body).

`prefix` - optional parameter with text added to each request. It can be useful to distinct request sent from one site but in various sets of configuration - it can be used as tag, label.

`alertAfterRequest` - optional parameter which indicates if the alter after sending a request should be visible. Value should be of boolean type - the default value is `true`.

`adBlockDetected` - optional parameter to pass information about AdBlock detection from an external script or tool. This paramter can be useful in situations where basic detector in Feedybacky is not sufficient.

`side` - optional parameter for determining side of the Feedybacky. Default value is `right` and means that the plugin is visible on the right side of the website. Another possible value is `left`.

`order` - optional parameter passing an order of the form elements. It should contain specific element identifiers divided by commas and can be also use to hide some parts. Default value is `"description,message,email,category,priority,explanation,screenshot,metadata,history,termsAccepted,personalDataAccepted,note"`. 

`classes` - optional parameter which can be used to pass JSON object with keys as element identifiers and values with class names list for such element. Available keywords are `title, description, message, email, category, priority, explanation, screenshot, metadata, history, termsAccepted, personalDataAccepted, note, send, powered`.

`expandMessageLink` - optional parameter to make expand link visible. If it is correct, the link is present under message input and causes expanding the message area and the whole form. The default value is `false`.

`theme` - optional parameter which stores a name of UI theme which will be used for the extended form. There are two predefined themes - default and dark. It is possible to set theme in runtime by using `setTheme` method, as well as adding own theme names (look at `allowedThemes` parameter). If given theme is not allowed, the `default` will be used. The default value is `default`.

`allowedThemes` - optional parameter with array of possible themes which can be set at init of the form as well as in runtime. The default value is `['default', 'dark']`.

`screenshotMethod` is an optional parameter for setting the screenshot method. The default value is `html2canvas`, which uses the HTML2Canvas library to capture a screenshot of the entire page. There are situations where this method may cause errors, not work properly (e.g., in Safari), or when the user should have the choice of which part of the window to capture. In such cases, alternative methods can be set: `domtoimage`, which uses the `dom-to-image` library to capture HTML elements rather than the entire page, or `mediaDevice`, which leverages the browser’s media capture mechanism for more advanced screenshot functionality.

`allowScreenshotModification` - optional parameter for enabling a screenshot modification tool. If it is on and the screenshot checkbox is checked, the appropriate button is visible and allows to precapture a screenshot of an actual screen and mark interesting places on it. Then the resulted screenshot will be enhanced by these drawings. Default value is `true`.

`availableMessageTypes` - optional parameter with array of allowed message types for the requesting user. The message is not limited to text - available options are `text` and `voice`. There is possibility to select all of them or just some. Default value is `['text']`. The maximum length for `voice` message is set to 10 seconds.

`activeMessageType` - optional parameter for selecting a first, default message type. It has to be present in `availableMessageTypes` array. Otherwise or by default the value is set to first element of `availableMessageTypes` array (mostly `text`).

### Methods ###

After creating the Feedybacky object, some methods could be invoked on it:

`open` - immediate opening the container with Feedybacky form.

`close` - immediate closing the container with Feedybacky form.

`setTheme(themeSymbol)` - change the current theme. For example, calling `setTheme('dark')` changes the theme to dark in runtime. If given theme is not allowed, the current theme stays.

`setScreenshotMethod(screenshotMethod)` - change the current screenshot method, for example after detecting a user's browser type. For more information, please check description of `screenshotMethod` parameter.

### Wrappers ###

Feedybacky can be also useful in some systems which provide a module subsystem helping non-programmers to use various plugins. In `wrappers` directory there are wrappers with manuals for:

* Wordpress
* Drupal

They are very simple ports of the plugin to these systems (they can be developed if necessary) and can be used as well as standard form of Feedybacky.

### Authors ###

Feedybacky was created and is maintained by programmers of [Wilda Software](https://wildasoftware.pl/).

### Licence ###

Feedybacky is licenced under MIT licence.

