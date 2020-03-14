const feedybackyScriptName = 'feedybacky.min.js';

const checkboxVisibleOption = 'visible';
const checkboxAutoEnableOption = 'autoEnable';
const checkboxAutoDisableOption = 'autoDisable';
const checkboxOptions = [checkboxVisibleOption, checkboxAutoEnableOption, checkboxAutoDisableOption];

class FeedybackyPayload {
	
	add(key, value) {
		this[key] = value;
	}
}

class Feedybacky {

    constructor(id, params) {
    	this.params = params;
        this.basePath = null;
        this.consoleErrors = [];
        this.importDependencies();
        this.container = document.getElementById(id);		
		this.extraInfoFunction = params.extraInfo || null;
		this.beforeSubmitFunction = params.beforeSubmit || null;
		this.prefix = params.prefix || null;
		this.onSubmitUrlSuccess = params.onSubmitUrlSuccess || null;
		this.onSubmitUrlError = params.onSubmitUrlError || null;
		this.eventHistory = [];
		this.historyLimit = params.historyLimit || null;
		
		if(!this.params.screenshotField || !checkboxOptions.includes(this.params.screenshotField)) {
        	this.params.screenshotField = checkboxVisibleOption;
        }
        
        if(!this.params.metadataField || !checkboxOptions.includes(this.params.metadataField)) {
        	this.params.metadataField = checkboxVisibleOption;
        }
		
		if(!this.params.historyField || !checkboxOptions.includes(this.params.historyField)) {
			this.params.historyField = checkboxVisibleOption;
		}
		
		if(typeof this.params.alertAfterRequest !== 'boolean') {
			this.params.alertAfterRequest = true;
		}
		
		this.params.emailField = this.params.emailField || false;
		
		if(typeof this.params.adBlockDetected === 'undefined') {
			let adBlockBait = document.createElement('div');
			adBlockBait.innerHTML = '&nbsp;';
			adBlockBait.className = 'adsbox';
			document.body.appendChild(adBlockBait);
			window.setTimeout(() => {
				if(adBlockBait.offsetHeight === 0) {
					this.params.adBlockDetected = true;
				}
				else {
					this.params.adBlockDetected = false;
				}
				document.body.removeChild(adBlockBait);
			}, 60);
		}
    	
    	this.loadMessages().then(() => {
            this.initMinifiedContainer();
            this.initExtendedContainer();
            this.initAlertContainer();

            document.getElementById('feedybacky-container-hide-button').addEventListener('click', e => {
                this.showMinimalContainer();
            });
    
            if(this.params.onSubmit) {
                document.getElementById('feedybacky-form').addEventListener('submit', this.params.onSubmit);
            }
            if(this.params.onSubmitUrl) {
                document.getElementById('feedybacky-form').addEventListener('submit', e => {
                    e.preventDefault();
                    
                    this.clearErrors();
                    if(this.validateForm()) {
                    	this.prepareAndSendRequest();
                    	this.showMinimalContainer();
                    }
                });
            }
    
            document.getElementById('feedybacky-form-description').addEventListener('keydown', e => {
                if(e.ctrlKey && e.keyCode === 13) {
                    e.preventDefault();
                    document.getElementById('feedybacky-form-submit-button').click();
                }
            });
    
            document.getElementById('feedybacky-alert-container').addEventListener('click', e => {
                document.getElementById(e.srcElement.id).style.display = 'none';
            });
    
            window.onerror = (err, url, line) => {
                this.consoleErrors.push(`${err} ${url} ${line}`);
                return false;
            };
			
			if([checkboxVisibleOption, checkboxAutoEnableOption].includes(this.params.historyField)) {
				this.initEventHistoryGathering();
			}
        });
    }
    
    async loadMessages() {
    	this.defaultVars = {
        	language: 'en',
        	texts: {}
        };
        
        this.params.language = this.params.language || this.defaultVars.language;

        this.defaultVars.texts = await (async () => {
            let json = null;
            if(this.basePath) {
                await this.loadJsonFile(`${this.basePath}/i18n/${this.params.language}.json`, (data) => {
                    json = data;
                }, async (err) => {
                    console.warn(`Feedybacky cannot load default language pack for ${this.params.language}. The default language pack will be loaded.`);
                    await this.loadJsonFile(`${this.basePath}/i18n/${this.defaultVars.language}.json`, data => {
                        json = data;
                    });
                });

            } 
			else {
                try {
                    json = require(`../i18n/${this.params.language}.json`);
                } catch (_) {
                    console.warn(`Feedybacky cannot load default language pack for ${this.params.language}. The default language pack will be loaded.`);
                    json = require(`../i18n/${this.defaultVars.language}.json`);
                }
            }
        	
        	return json;
        })();
        this.params.texts = this.params.texts || {};
        this.params.texts.powered = this.params.texts.hasOwnProperty('powered') 
    		? this.params.texts.powered 
    		: `${this.defaultVars.texts.powered} <a href="http://wildasoftware.pl/" target="_blank">Wilda Software</a>`;
        
        for(const [key, value] of Object.entries(this.defaultVars.texts)) {
        	this.params.texts[key] = this.params.texts[key] || value;
        }
    }
	
	open() {
		this.showExtendedContainer();
	}
	
	close() {
		this.showMinimalContainer();
	}
    
    initMinifiedContainer() {
    	this.minifiedContainer = document.createElement('div');
        this.minifiedContainer.id = 'feedybacky-container-minified';
        this.minifiedContainer.title = this.params.texts.tooltip;
        this.minifiedContainer.innerHTML = '<div></div>';
        this.minifiedContainer.setAttribute('data-html2canvas-ignore', true);
        this.container.appendChild(this.minifiedContainer);
        
        this.minifiedContainer.addEventListener('click', e => {
            this.showExtendedContainer();
        });
    }
    
    initExtendedContainer() {
    	this.extendedContainer = document.createElement('div');
        this.extendedContainer.id = 'feedybacky-container-extended';
        this.extendedContainer.setAttribute('data-html2canvas-ignore', true);
        this.container.appendChild(this.extendedContainer);
		
		let emailInputHtml = '';
        if(this.params.emailField) {
        	emailInputHtml = `
        		<div id="feedybacky-container-email-description">${this.params.texts.email}</div>
        		<input id="feedybacky-form-email" form="feedybacky-form" name="email" aria-required="true"/>
        		<div id="feedybacky-form-email-error-message" class="feedybacky-error-message"></div>
        	`;
        }
		
		let screenshotCheckboxHtml = '';
        if(this.params.screenshotField == checkboxVisibleOption) {
        	screenshotCheckboxHtml = `<label><input type="checkbox" id="feedybacky-form-screenshot-allowed" checked="true"/>${this.params.texts.screenshot}</label>`;
        }
        
        let metadataCheckboxHtml = '';
        if(this.params.metadataField == checkboxVisibleOption) {
        	metadataCheckboxHtml = `<label><input type="checkbox" id="feedybacky-form-metadata-allowed" checked="true"/>${this.params.texts.metadata}</label>`;
        }
		
		let historyCheckboxHtml = '';
		if(this.params.historyField == checkboxVisibleOption) {
			historyCheckboxHtml = `<label><input type="checkbox" id="feedybacky-form-history-allowed" checked="true"/>${this.params.texts.history}</label>`;
		}
        
        let additionalDataInformationHtml = '';
        if(screenshotCheckboxHtml || metadataCheckboxHtml || historyCheckboxHtml) {
        	additionalDataInformationHtml = `<div id="feedybacky-container-additional-description">${this.params.texts.additionalDataInformation}</div>`;
        }
		
		let noteHtml = '';
		if(this.params.texts.note) {
			noteHtml = `<div id="feedybacky-container-note">${this.params.texts.note}</div>`;
		}

        const html = `
			<div id="feedybacky-container-title">${this.params.texts.title}</div>
			<div id="feedybacky-container-hide-button" aria-label="Zamknij">
				<span aria-hidden="true">&times;</span>
			</div>
			<div id="feedybacky-description">
				${this.params.texts.description}
			</div>
			<form id="feedybacky-form">
				<textarea maxlength="1000" id="feedybacky-form-description" form="feedybacky-form" name="description" aria-required="true"></textarea>
				<div id="feedybacky-form-description-error-message" class="feedybacky-error-message"></div>
				${emailInputHtml}
				${additionalDataInformationHtml}
				${screenshotCheckboxHtml}
				${metadataCheckboxHtml}
				${historyCheckboxHtml}
				${noteHtml}
				<button id="feedybacky-form-submit-button" type="submit">${this.params.texts.send}</button>
			</form>
			<div id="feedybacky-container-powered">
				${this.params.texts.powered}
			</div>
		`;

        this.extendedContainer.innerHTML = html;
    }
    
    initAlertContainer() {
    	this.alertContainer = document.createElement('div');
        this.alertContainer.id = 'feedybacky-alert-container';
        this.alertContainer.setAttribute('data-html2canvas-ignore', true);
        this.container.appendChild(this.alertContainer);
    }
	
	clearErrors() {
    	let errorMessageContainers = document.getElementsByClassName('feedybacky-error-message');
    	
    	for(let i = 0; i < errorMessageContainers.length; ++i) {
    		errorMessageContainers[i].innerText = '';
    	}
    }
    
    validateForm() {
    	let descriptionInput = document.getElementById('feedybacky-form-description');
		let emailInput = document.getElementById('feedybacky-form-email');
		
    	let isValidated = true;
    	
    	if(!descriptionInput.value) {
    		document.getElementById('feedybacky-form-description-error-message').innerText = this.params.texts.descriptionErrorEmpty;
    		isValidated = false;
    	}
		
		if(emailInput && !emailInput.value) {
    		document.getElementById('feedybacky-form-email-error-message').innerText = this.params.texts.emailErrorEmpty;
    		isValidated = false;
    	}
    	
    	return isValidated;
    }
    
    prepareAndSendRequest() {
    	let descriptionInput = document.getElementById('feedybacky-form-description');
		let emailInput = document.getElementById('feedybacky-form-email');
    	
		let payload = new FeedybackyPayload();
		payload.message = descriptionInput.value;
		payload.timestamp = new Date();
		payload.url = window.location.href;
		payload.errors = this.consoleErrors;
		
		if(emailInput) {
        	payload.email = emailInput.value;
        }
		
		if(this.prefix) {
			payload.prefix = this.prefix;
		}
		
		let screenshotAllowedInput = document.getElementById('feedybacky-form-screenshot-allowed');
        let metadataAllowedInput = document.getElementById('feedybacky-form-metadata-allowed');
		let historyAllowedInput = document.getElementById('feedybacky-form-history-allowed');
        
        const screenshotAllowed = screenshotAllowedInput ? screenshotAllowedInput.checked : (this.params.screenshotField == checkboxAutoEnableOption);
        const metadataAllowed = metadataAllowedInput ? metadataAllowedInput.checked : (this.params.metadataField == checkboxAutoEnableOption);
		const historyAllowed = historyAllowedInput ? historyAllowedInput.checked : (this.params.historyField == checkboxAutoEnableOption);

        if(metadataAllowed) {
            payload.agent = navigator.userAgent;
            payload.cookies = document.cookie;
            payload.platform = navigator.platform;
			payload.adBlock = !!this.params.adBlockDetected;
            payload.screenSize = `${screen.width}x${screen.height}`;
            payload.availableScreenSize = `${screen.availWidth}x${screen.availHeight}`;
            payload.innerSize = `${window.innerWidth}x${window.innerHeight}`;
            payload.colorDepth = screen.colorDepth;
            
            if(screen.orientation) {
            	payload.orientation = screen.orientation.type;
        	}
        }
		
		if(historyAllowed) {
			if(this.historyLimit) {
				this.eventHistory = this.eventHistory.slice(Math.max(this.eventHistory.length - this.historyLimit, 0));
			}
			
			payload.history = this.eventHistory;
		}
		
		if(this.extraInfoFunction) {
			payload.extraInfo = this.extraInfoFunction();
		}
		
		if(screenshotAllowed) {
            html2canvas(document.body, {
				onrendered: canvas => {
					payload.image = canvas.toDataURL('image/png');
					this.handleBeforeSubmitCallback(payload);
					this.sendPostRequest(this.params.onSubmitUrl, payload);
				}
            });
        }
        else {
			this.handleBeforeSubmitCallback(payload);
            this.sendPostRequest(this.params.onSubmitUrl, payload);
        }
        
        descriptionInput.value = '';
    }

    sendPostRequest(url, payload) {
        fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        }).then(response => {
			if(response.status == 200 || response.status == 201) {
                this.showAlertContainer(true);
				
				if(this.onSubmitUrlSuccess) {
					response.text().then(res => {
						this.onSubmitUrlSuccess(response.status, res);
					});
				}
            }
            else {
                this.showAlertContainer(false);
				
				if(this.onSubmitUrlError) {
					response.text().then(res => {
						this.onSubmitUrlError(response.status, res);
					});
				}
            }
        }).catch(e => {
            this.showAlertContainer(false, e);
        })
    }
	
	initEventHistoryGathering() {
		let eventsToListen = ['change', 'click', 'focus', 'reset', 'submit'];
		
		for(let i = 0; i < eventsToListen.length; ++i) {
			document.addEventListener(eventsToListen[i], (e) => {
				if(e.target.id && !(/^feedybacky/.test(e.target.id))) {				
					let historyEntry = {
						eventType: e.type,
						tagName: e.target.tagName.toLowerCase()
					};
					
					if(e.target.id) {
						historyEntry['id'] = e.target.id;
					}
					
					if(e.target.className) {
						historyEntry['className'] = e.target.className;
					}
					
					if(e.target.getAttribute('name')) {
						historyEntry['name'] = e.target.getAttribute('name');
					}
					
					if(e.target.value) {
						historyEntry['value'] = e.target.value;
					}
					
					this.eventHistory.push(historyEntry);
				}
			});
		}
	}
	
	handleBeforeSubmitCallback(payload) {
		if(this.beforeSubmitFunction) {
			this.beforeSubmitFunction(payload);
		}
	}

    showMinimalContainer() {
        this.extendedContainer.style.display = 'none';
        this.minifiedContainer.style.display = 'block';
    }

    showExtendedContainer() {
        this.minifiedContainer.style.display = 'none';
        this.extendedContainer.style.display = 'block';
        document.getElementById('feedybacky-form-description').focus();
    }

    showAlertContainer(isSuccess, status) {
		if(!this.params.alertAfterRequest) {
			return;
		}
		
    	this.alertContainer.classList = '';
    	
        if(isSuccess) {
            this.alertContainer.innerHTML = this.params.texts.requestSuccess;
            this.alertContainer.classList = 'feedybacky-alert-container-success';
        } 
        else {
            this.alertContainer.innerHTML = this.params.texts.requestFail;
            this.alertContainer.innerHTML += ' ' + (this.defaultVars.texts['error' + status] || 'error ' + status);
            this.alertContainer.classList = 'feedybacky-alert-container-failure';
        }
        this.alertContainer.style.display = 'inline-block';
        
        setTimeout(() => {
            this.alertContainer.style.display = 'none';
        }, 3000);
    }

    importDependencies() {
        const scripts = document.getElementsByTagName('script');

        for(let i = scripts.length - 1; i >= 0; --i) {
            let src = scripts[i].src;
            let length = src.length;

            let parts = src.split('/');

            if(parts[parts.length - 1].includes(feedybackyScriptName)) {
                this.basePath = parts.slice(0, -2).join('/');
                break;
            }
        }
        if(this.basePath) {
            this.importCssFile(`${this.basePath}/css/feedybacky.min.css`);

            this.importJsFile(`${this.basePath}/dependencies/html2canvas/html2canvas.min.js`);
        }
    }

    importCssFile(url) {
        const head = document.getElementsByTagName('head')[0];
        let stylesheet = document.createElement('link');

        stylesheet.href = url;
        stylesheet.type = 'text/css';
        stylesheet.rel = 'stylesheet';
        head.append(stylesheet);
    }

    importJsFile(url) {
        const body = document.getElementsByTagName('body')[0];

        let script = document.createElement('script');
        script.src = url;
        script.type = 'text/javascript';
        body.append(script);
    }
    
    async loadJsonFile(filePath, success, error) {
        try {
            const res = await (await fetch(filePath)).json();
            success(res);
        } 
        catch (e) {
            if(error) {
                error(e);
            }
        }
    }
}

if(typeof module !== 'undefined') {
	module.exports.FeedybackyPayload = FeedybackyPayload;
	module.exports.Feedybacky = Feedybacky;
}