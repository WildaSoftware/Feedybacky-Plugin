const feedybackyScriptName = 'feedybacky.min.js';
const feedybackyPortalEndpoint = 'https://api.feedybacky.com/issue';

const checkboxVisibleOption = 'visible';
const checkboxAutoEnableOption = 'autoEnable';
const checkboxAutoDisableOption = 'autoDisable';
const checkboxOptions = [checkboxVisibleOption, checkboxAutoEnableOption, checkboxAutoDisableOption];

const orderDescriptionPart = 'description';
const orderMessagePart = 'message';
const orderEmailPart = 'email';
const orderExplanationPart = 'explanation';
const orderScreenshotCheckboxPart = 'screenshot';
const orderMetadataCheckboxPart = 'metadata';
const orderHistoryCheckboxPart = 'history';
const orderTermsAcceptedCheckboxPart = 'termsAccepted';
const orderPersonalDataAcceptedCheckboxPart = 'personalDataAccepted';
const orderNotePart = 'note';
const orderCategoryPart = 'category';
const orderPriorityPart = 'priority';
const orderParts = [orderDescriptionPart, orderMessagePart, orderEmailPart, orderCategoryPart, orderPriorityPart, orderExplanationPart, orderScreenshotCheckboxPart, orderMetadataCheckboxPart, orderHistoryCheckboxPart, orderTermsAcceptedCheckboxPart, orderPersonalDataAcceptedCheckboxPart, orderNotePart];

const orderTitlePart = 'title';
const orderSendPart = 'send';
const orderPoweredPart = 'powered';
const containerParts = [orderDescriptionPart, orderMessagePart, orderEmailPart, orderCategoryPart, orderPriorityPart, orderExplanationPart, orderScreenshotCheckboxPart, orderMetadataCheckboxPart, orderHistoryCheckboxPart, orderNotePart, orderTitlePart, orderSendPart, orderPoweredPart, orderTermsAcceptedCheckboxPart, orderPersonalDataAcceptedCheckboxPart];

const alertTypeSuccess = 'success';
const alertTypeFailure = 'error';
const alertTypePending = 'pending';

const termsAcceptedStorageItem = 'feedybacky_termsDataAccepted';
const personalDataAcceptedStorageItem = 'feedybacky_personalDataAccepted';
const visitedUrlsStorageItem = 'feedybacky_visitedUrls';

const defaultTheme = 'default';
const darkTheme = 'dark';
const standardThemes = [defaultTheme, darkTheme];

const screenshotMethodHtml2Canvas = 'html2canvas';
const screenshotMethodMediaDevice = 'mediaDevice';
const screenshotMethodDomToImage = 'domToImage';
const allowedScreenshotMethods = [screenshotMethodHtml2Canvas, screenshotMethodMediaDevice, screenshotMethodDomToImage];

const messageTypeText = 'text';
const messageTypeVoice = 'voice';
const allowedMessageTypes = [messageTypeText, messageTypeVoice];

const messageAudioMaxLength = 10000;

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

        this.theme = params.theme || defaultTheme;
        this.allowedThemes = params.allowedThemes || standardThemes;
        this.modifiedScreenshot = null;

        if (!this.allowedThemes.includes(this.theme)) {
            this.theme = defaultTheme;
        }

        this.screenshotMethod = params.screenshotMethod || screenshotMethodHtml2Canvas;
        if (!allowedScreenshotMethods.includes(this.screenshotMethod)) {
            this.screenshotMethod = screenshotMethodHtml2Canvas;
        }

        this.eventHistory = [];
        this.historyLimit = params.historyLimit || null;

        this.params.urlTracking = this.params.urlTracking;
        if (this.params.urlTracking === undefined) {
            this.params.urlTracking = true;
        } else if (this.params.urlTracking === 'false') {
            this.params.urlTracking = false;
        }

        if (this.params.urlTracking) {
            this.urlTrackingLimit = params.urlTrackingLimit || 15;
            this.initUrlTracking();
        }

        this.params.classes = this.params.classes || {};
        for (let i = 0; i < containerParts.length; ++i) {
            this.params.classes[containerParts[i]] = this.params.classes[containerParts[i]] || '';
        }

        if (!this.params.screenshotField || !checkboxOptions.includes(this.params.screenshotField)) {
            this.params.screenshotField = checkboxVisibleOption;
        }

        if (!this.params.metadataField || !checkboxOptions.includes(this.params.metadataField)) {
            this.params.metadataField = checkboxVisibleOption;
        }

        if (!this.params.historyField || !checkboxOptions.includes(this.params.historyField)) {
            this.params.historyField = checkboxVisibleOption;
        }

        if (!this.params.side || !['left', 'right'].includes(this.params.side)) {
            this.params.side = 'right';
        }

        this.params.closesAfterOutsideClick = !('closesAfterOutsideClick' in this.params) || this.params.closesAfterOutsideClick === true || this.params.closesAfterOutsideClick === 'true';

        if (this.params.order) {
            const orderSplit = this.params.order.replace(/\s/g, '').split(',');
            const newOrderSplit = [];
            const orderPartsToLowerCase = orderParts.map(function (o) { return o.toLowerCase(); });
            for (let i = 0; i < orderSplit.length; ++i) {
                if (orderPartsToLowerCase.includes(orderSplit[i].toLowerCase())) {
                    newOrderSplit.push(orderSplit[i]);
                }
            }
            this.params.order = newOrderSplit.join(',');
        } else {
            this.params.order = 'description,message,email,category,priority,explanation,screenshot,metadata,history,termsAccepted,personalDataAccepted,note';
        }

        if (typeof this.params.alertAfterRequest !== 'boolean') {
            this.params.alertAfterRequest = true;
        }

        this.params.emailField = this.params.emailField || false;
        this.params.expandMessageLink = this.params.expandMessageLink || false;
        this.params.priorityField = this.params.priorityField || false;

        if (this.params.emailField !== true) {
            this.params.emailField = false;
        }
        if (this.params.expandMessageLink !== true) {
            this.params.expandMessageLink = false;
        }
        if (this.params.priorityField !== true) {
            this.params.priorityField = false;
        }

        this.params.categories = params.categories || [];

        if (typeof this.params.adBlockDetected === 'undefined') {
            let adBlockBait = document.createElement('div');
            adBlockBait.innerHTML = '&nbsp;';
            adBlockBait.className = 'adsbox';
            document.body.appendChild(adBlockBait);
            window.setTimeout(() => {
                if (adBlockBait.offsetHeight === 0) {
                    this.params.adBlockDetected = true;
                } else {
                    this.params.adBlockDetected = false;
                }
                document.body.removeChild(adBlockBait);
            }, 60);
        }

        this.params.termsUrl = this.params.termsUrl || '#';
        this.params.privacyPolicyUrl = this.params.privacyPolicyUrl || '#';

        if (this.params.allowScreenshotModification !== false) {
            this.params.allowScreenshotModification = true;
        }

        if(this.params.allowScreenshotModification) {
            this.screenshotModification = {
                baseImage: null,
                canvas: null,
                ctx: null,
                flag: null,
                selectedColor: 'black',
                lineWidthPx: 2,
                prevX: 0,
                currX: 0,
                prevY: 0,
                currY: 0,
                dotFlag: false
            }
        }

        this.params.availableMessageTypes = (this.params.availableMessageTypes && this.params.availableMessageTypes.length > 0)
            ? this.params.availableMessageTypes.filter(value => allowedMessageTypes.includes(value))
            : [messageTypeText];
        this.params.activeMessageType = this.params.activeMessageType || this.params.availableMessageTypes[0];

        this.messageAudio = null;
        this.messageAudioLength = 0;

        this.loadMessages().then(() => {
            if (this.params.apiKey && this.params.projectSymbol && !this.params.onSubmitUrl) {
                this.params.onSubmitUrl = feedybackyPortalEndpoint;
            }

            this.initMinifiedContainer();
            this.initExtendedContainer();
            this.initAlertContainer();
            this.setTheme(this.theme);

            document.getElementById('feedybacky-container-hide-button').addEventListener('click', e => {
                this.close();
            });

            if(this.params.closesAfterOutsideClick) {
                window.addEventListener('click', (e) => {
                    if(!document.getElementById('feedybacky-container-extended').contains(e.target) 
                            && !document.getElementById('feedybacky-container-minified').contains(e.target)) {
                        this.close();
                    }
                });
            }

            if (this.params.onSubmit) {
                document.getElementById('feedybacky-form').addEventListener('submit', this.params.onSubmit);
            }
            if (this.params.onSubmitUrl) {
                document.getElementById('feedybacky-form').addEventListener('submit', e => {
                    e.preventDefault();

                    this.clearErrors();
                    if (this.validateForm()) {
                        this.prepareAndSendRequest();
                        this.showMinimalContainer();
                    }
                });
            }

            if(this.params.allowScreenshotModification) {
                document.getElementById('feedybacky-form-screenshot-allowed').addEventListener('change', (e) => {
                    if(e.target.checked) {
                        document.getElementById('feedybacky-form-screenshot-modify').style.display = 'inline';
                    }
                    else {
                        document.getElementById('feedybacky-form-screenshot-modify').style.display = 'none';
                    }
                });
                document.getElementById('feedybacky-form-screenshot-allowed').dispatchEvent(new Event('change'));

                document.getElementById('feedybacky-form-screenshot-modify').addEventListener('click', (e) => {
                    e.preventDefault();
                    
                    if(!this.screenshotModification.canvas) {
                        let scrMdfyLabel = e.target.innerHTML;
                        e.target.innerHTML = this.params.texts.working;

                        this.getScreenshot().then((image) => {
                            this.initializeDrawing(image);
                            document.getElementById('feedybacky-screen-modification-modal').style.display = 'block';
    
                            e.target.innerHTML = scrMdfyLabel;
                        });
                    }
                    else {
                        document.getElementById('feedybacky-screen-modification-modal').style.display = 'block';
                    }
                });

                document.getElementById('feedybacky-screen-modification-modal-close').addEventListener('click', (e) => {
                    e.preventDefault();
                    document.getElementById('feedybacky-screen-modification-modal').style.display = 'none';
                });

                document.getElementById('feedybacky-screen-modification-modal-save').addEventListener('click', (e) => {
                    e.preventDefault();
                    this.saveScreenshotModification();
                });

                document.getElementById('feedybacky-screen-modification-modal-clear').addEventListener('click', (e) => {
                    e.preventDefault();
                    this.clearScreenshotModification();
                });

                document.getElementById('feedybacky-screen-modification-modal-rescreen').addEventListener('click', (e) => {
                    e.preventDefault();

                    const saveBtn = document.getElementById('feedybacky-screen-modification-modal-save');
                    const clearBtn = document.getElementById('feedybacky-screen-modification-modal-clear');
                    const rescreenBtn = e.target;

                    saveBtn.setAttribute('disabled', 'disabled');
                    clearBtn.setAttribute('disabled', 'disabled');
                    rescreenBtn.setAttribute('disabled', 'disabled');
                    rescreenBtn.value = this.params.texts.working;

                    this.getScreenshot().then((image) => {
                        this.initializeDrawing(image);     
                        
                        saveBtn.removeAttribute('disabled');
                        clearBtn.removeAttribute('disabled');
                        rescreenBtn.removeAttribute('disabled');
                        rescreenBtn.value = this.params.texts.restartScreen;
                    });
                });

                let colorElements = document.getElementsByClassName('feedybacky-color-change');

                for (let i = 0; i < colorElements.length; i++) {
                    colorElements[i].addEventListener('click', (e) => {
                        e.preventDefault();
                        this.screenshotModification.selectedColor = window.getComputedStyle(document.getElementById(e.target.id), null).getPropertyValue('background-color');
                    }, false);
                }
            }

            const descriptionInput = document.getElementById('feedybacky-form-description');
            if(descriptionInput) {
                descriptionInput.addEventListener('keydown', e => {
                    if (e.ctrlKey && e.keyCode === 13) {
                        e.preventDefault();
                        document.getElementById('feedybacky-form-submit-button').click();
                    }
                });
            }

            document.getElementById('feedybacky-alert-container').addEventListener('click', e => {
                document.getElementById(e.srcElement.id).style.display = 'none';
            });

            window.onerror = (err, url, line) => {
                this.consoleErrors.push(`${err} ${url} ${line}`);
                return false;
            };

            if ([checkboxVisibleOption, checkboxAutoEnableOption].includes(this.params.historyField)) {
                this.initEventHistoryGathering();
            }

            const descriptionExpandLink = document.getElementById('feedybacky-form-description-expand');
            if (descriptionExpandLink) {
                descriptionExpandLink.addEventListener('click', e => {
                    e.preventDefault();
                    document.getElementById('feedybacky-container-extended').className += ' expanded';
                    e.target.parentNode.removeChild(e.target);
                });
            }

            const messageTabButtons = document.getElementsByClassName('feedybacky-message-type-button');
            const messageTypes = document.getElementsByClassName('feedybacky-form-message-type');
            
            const messageTextTypeButton = document.getElementById('feedybacky-form-message-text');
            if(messageTextTypeButton) {
                messageTextTypeButton.addEventListener('click', e => {
                    e.preventDefault();
                    for(let i = 0; i < messageTabButtons.length; ++i) {
                        messageTabButtons[i].classList = 'feedybacky-message-type-button';
                    }
                    for(let i = 0; i< messageTypes.length; ++i) {
                        messageTypes[i].style.display = 'none';
                    }

                    e.target.classList = 'feedybacky-message-type-button feedybacky-button-active';
                    document.getElementById('feedybacky-form-message-type-text').style.display = 'block';
                    this.params.activeMessageType = messageTypeText;
                });
            }

            const messageVoiceTypeButton = document.getElementById('feedybacky-form-message-voice');
            if(messageVoiceTypeButton) {
                messageVoiceTypeButton.addEventListener('click', e => {
                    e.preventDefault();
                    for(let i = 0; i < messageTabButtons.length; ++i) {
                        messageTabButtons[i].classList = 'feedybacky-message-type-button';
                    }
                    for(let i = 0; i< messageTypes.length; ++i) {
                        messageTypes[i].style.display = 'none';
                    }

                    e.target.classList = 'feedybacky-message-type-button feedybacky-button-active';
                    document.getElementById('feedybacky-form-message-type-voice').style.display = 'block';
                    this.params.activeMessageType = messageTypeVoice;
                });
            }

            const messageVoiceRecordButton = document.getElementById('feedybacky-voice-record');
            const messageVoiceStopButton = document.getElementById('feedybacky-voice-stop');
            const messageVoicePlayButton = document.getElementById('feedybacky-voice-play');

            let startTime = 0;

            if(messageVoiceRecordButton && messageVoiceStopButton && messageVoicePlayButton) {
                messageVoiceRecordButton.addEventListener('click', (e) => {
                    e.preventDefault();
                    navigator.mediaDevices.getUserMedia({ audio: true })
                    .then(stream => {
                        messageVoiceRecordButton.style.display = 'none';
                        messageVoiceStopButton.style.display = 'inline';

                        const mediaRecorder = new MediaRecorder(stream);
                        mediaRecorder.start();
                        startTime = (new Date()).getTime();

                        const audioChunks = [];
                        mediaRecorder.addEventListener('dataavailable', event => {
                            audioChunks.push(event.data);
                        });

                        mediaRecorder.addEventListener('stop', () => {
                            messageVoiceRecordButton.style.display = 'inline';
                            messageVoiceStopButton.style.display = 'none';
                            messageVoicePlayButton.style.display = 'inline';

                            const audioBlob = new Blob(audioChunks);
                            
                            let reader = new window.FileReader();
                            reader.readAsDataURL(audioBlob); 
                            reader.onloadend = () => {
                                let base64 = reader.result;
                                base64 = base64.split(',')[1];
                                this.messageAudio = 'data:audio/wav;base64,' + base64;
                            }
                        });
                        
                        messageVoiceStopButton.addEventListener('click', (e) => {
                            e.preventDefault();
                            this.messageAudioLength = (new Date()).getTime() - startTime;
                            mediaRecorder.stop();
                        });

                        messageVoicePlayButton.addEventListener('click', (e) => {
                            e.preventDefault();
                            (new Audio(this.messageAudio)).play();
                        })
                    });
                });
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
            if (this.basePath) {
                await this.loadJsonFile(`${this.basePath}/i18n/${this.params.language}.json`, (data) => {
                    json = data;
                }, async (err) => {
                    console.warn(`Feedybacky cannot load default language pack for ${this.params.language}. The default language pack will be loaded.`);
                    await this.loadJsonFile(`${this.basePath}/i18n/${this.defaultVars.language}.json`, data => {
                        json = data;
                    });
                });

            } else {
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
        this.params.texts.powered = this.params.texts.hasOwnProperty('powered') ?
            this.params.texts.powered :
            `${this.defaultVars.texts.powered} <a href="https://wildasoftware.pl/" target="_blank">Wilda Software</a>`;

        for (const [key, value] of Object.entries(this.defaultVars.texts)) {
            this.params.texts[key] = this.params.texts[key] || value;
        }
    }

    open() {
        this.showExtendedContainer();
    }

    close() {
        this.showMinimalContainer();
    }

    setTheme(themeSymbol) {
        if (!this.allowedThemes.includes(themeSymbol)) {
            return;
        }

        let oldClass = 'feedybacky-container-theme-' + this.theme;
        let newClass = 'feedybacky-container-theme-' + themeSymbol;

        this.theme = themeSymbol;
        this.minifiedContainer.classList.remove(oldClass);
        this.extendedContainer.classList.remove(oldClass);
        this.minifiedContainer.classList.add(newClass);
        this.extendedContainer.classList.add(newClass);
    }

    setScreenshotMethod(screenshotMethod) {
        if (!allowedScreenshotMethods.includes(screenshotMethod)) {
            return;
        }

        this.screenshotMethod = screenshotMethod;
    }

    initMinifiedContainer() {
        this.minifiedContainer = document.createElement('div');
        this.minifiedContainer.id = 'feedybacky-container-minified';
        this.minifiedContainer.classList = 'feedybacky-container-' + this.params.side;
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
        this.extendedContainer.classList = 'feedybacky-container-' + this.params.side;
        this.extendedContainer.setAttribute('data-html2canvas-ignore', true);
        this.container.appendChild(this.extendedContainer);

        let descriptionHtml = `
            <div id="feedybacky-description" class="${this.params.classes.description}">
                ${this.params.texts.description}
            </div>
        `;

        let messageTabHtml = '';
        if(this.params.availableMessageTypes.length > 1) {
            let tabs = '';
            for(let i = 0; i < this.params.availableMessageTypes.length; ++i) {
                const mt = this.params.availableMessageTypes[i];
                tabs += (`<button id="feedybacky-form-message-${mt}" class="feedybacky-message-type-button ${(mt == this.params.activeMessageType) ? ' feedybacky-button-active' : ''}">${this.params.texts['messageType' + (mt.charAt(0).toUpperCase() + mt.slice(1))]}</button>`);
            }

            messageTabHtml = `
                <div id="feedybacky-form-message-type-container">${tabs}</div>
            `;
        }

        let messageHtml = '';
        for(let i = 0; i < this.params.availableMessageTypes.length; ++i) {
            const mt = this.params.availableMessageTypes[i];

            messageHtml += `<div id="feedybacky-form-message-type-${mt}" class="feedybacky-form-message-type" style="display: ${mt == this.params.activeMessageType ? 'block' : 'none'}">`; 
            if(mt == messageTypeText) {
                messageHtml += `
                    <textarea maxlength="1000" id="feedybacky-form-description" form="feedybacky-form" name="description" aria-required="true" class="${this.params.classes.message}"></textarea>
                    <div id="feedybacky-form-description-error-message" class="feedybacky-error-message ${this.params.classes.message}"></div>
                `;

                if (this.params.expandMessageLink) {
                    messageHtml += `<a href="#" id="feedybacky-form-description-expand" class="${this.params.classes.message}">${this.params.texts.expand}</a>`;
                }
            }
            else if(mt == messageTypeVoice) {
                messageHtml += `
                    <button id="feedybacky-voice-record" class="feedybacky-voice-button ${this.params.classes.message}" title="${this.params.texts.voiceRecordTitle}">${this.params.texts.voiceRecord}</button>
                    <button id="feedybacky-voice-stop" class="feedybacky-voice-button ${this.params.classes.message}" title="${this.params.texts.voiceStopRecordTitle}" style="display: none">${this.params.texts.voiceStopRecord}</button>
                    <button id="feedybacky-voice-play" class="feedybacky-voice-button ${this.params.classes.message}" title="${this.params.texts.voicePlayTitle}" style="display: none">${this.params.texts.voicePlay}</button>
                    <div id="feedybacky-form-description-error-message-voice" class="feedybacky-error-message ${this.params.classes.message}"></div>
                `;
            }
            messageHtml += `</div>`;
        }

        let emailInputHtml = '';
        if (this.params.emailField) {
            emailInputHtml = `
                <div id="feedybacky-container-email-description" class="${this.params.classes.email}">${this.params.texts.email}</div>
                <input id="feedybacky-form-email" form="feedybacky-form" name="email" aria-required="true" class="${this.params.classes.email}"/>
                <div id="feedybacky-form-email-error-message" class="feedybacky-error-message ${this.params.classes.email}" ></div>
            `;
        }

        let categorySelectHtml = '';
        if (this.params.categories.length > 0) {
            let categoryOptions = '';
            for (const option of this.params.categories) {
                categoryOptions += `<option value="${option['value']}">${option['label']}</option>`;
            }

            categorySelectHtml = `
                <div id="feedybacky-container-category-description" class="${this.params.classes.category}">${this.params.texts.category}</div>
                <select name="category" id="feedybacky-form-category" form="feedybacky-form" aria-required="true" class="${this.params.classes.category}">
                    ${categoryOptions}
                </select>
            `;
        }

        let prioritySelectHtml = '';
        if (this.params.priorityField) {
            prioritySelectHtml = `
                <div id="feedybacky-container-priority-description" class="${this.params.classes.priority}">${this.params.texts.priority}</div>
                <select name="priority" id="feedybacky-form-priority" form="feedybacky-form" aria-required="true" class="${this.params.classes.priority}">
                    <option value="high">${this.params.texts.priorityHigh}</option>
                    <option selected="selected" value="medium">${this.params.texts.priorityMedium}</option>
                </select>
            `;
        }

        let screenshotCheckboxHtml = '';
        if (this.params.screenshotField == checkboxVisibleOption) {
            screenshotCheckboxHtml = `<label><input type="checkbox" id="feedybacky-form-screenshot-allowed" checked="true" class="${this.params.classes.screenshot}"/>${this.params.texts.screenshot}
                    ${this.params.allowScreenshotModification ? `<a href="#" id="feedybacky-form-screenshot-modify">${this.params.texts.modifyScreenshot}</a>` : ''}
                </label>`;
        }

        let metadataCheckboxHtml = '';
        if (this.params.metadataField == checkboxVisibleOption) {
            metadataCheckboxHtml = `<label><input type="checkbox" id="feedybacky-form-metadata-allowed" checked="true" class="${this.params.classes.metadata}"/>${this.params.texts.metadata}</label>`;
        }

        let historyCheckboxHtml = '';
        if (this.params.historyField == checkboxVisibleOption) {
            historyCheckboxHtml = `<label><input type="checkbox" id="feedybacky-form-history-allowed" checked="true" class="${this.params.classes.history}"/>${this.params.texts.history}</label>`;
        }

        let additionalDataInformationHtml = '';
        if (screenshotCheckboxHtml || metadataCheckboxHtml || historyCheckboxHtml) {
            additionalDataInformationHtml = `<div id="feedybacky-container-additional-description" class="${this.params.classes.explanation}">${this.params.texts.additionalDataInformation}</div>`;
        }

        const loweredOnSubmitUrl = this.params.onSubmitUrl ? this.params.onSubmitUrl.toLowerCase() : '';
        const loweredFeedybackyPortalEndpoint = feedybackyPortalEndpoint.toLowerCase();
        let termsAgreementHtml = '';
        let personalDataAgreementHtml = '';
        if (loweredOnSubmitUrl.includes(loweredFeedybackyPortalEndpoint) && loweredFeedybackyPortalEndpoint.includes(loweredOnSubmitUrl)) {
            const termsCheckedPart = localStorage.getItem(termsAcceptedStorageItem) > 0 ? 'checked="true"' : '';
            const termsAcceptedText = this.params.texts.termsAccepted.replace('{termsUrl}', this.params.termsUrl);

            termsAgreementHtml = `
                <label><input type="checkbox" id="feedybacky-form-terms-accepted" ${termsCheckedPart} class="${this.params.classes.termsAccepted}"/>${termsAcceptedText}</label>
                <div id="feedybacky-form-terms-accepted-error-message" class="feedybacky-error-message ${this.params.classes.termsAccepted}" ></div>
            `;

            const personalDataCheckedPart = localStorage.getItem(personalDataAcceptedStorageItem) > 0 ? 'checked="true"' : '';
            const personalDataAcceptedText = this.params.texts.personalDataAccepted.replace('{privacyPolicyUrl}', this.params.privacyPolicyUrl);

            personalDataAgreementHtml = `
                <label><input type="checkbox" id="feedybacky-form-personal-data-accepted" ${personalDataCheckedPart} class="${this.params.classes.personalDataAccepted}"/>${personalDataAcceptedText}</label>
                <div id="feedybacky-form-personal-data-accepted-error-message" class="feedybacky-error-message ${this.params.classes.personalDataAccepted}" ></div>
            `;
        }

        let noteHtml = '';
        if (this.params.texts.note) {
            noteHtml = `<div id="feedybacky-container-note" class="${this.params.classes.note}">${this.params.texts.note}</div>`;
        }

        const extendedParts = {};
        extendedParts[orderDescriptionPart] = `${descriptionHtml}`;
        extendedParts[orderMessagePart] = `${messageTabHtml}${messageHtml}`;
        extendedParts[orderExplanationPart] = `${additionalDataInformationHtml}`;
        extendedParts[orderEmailPart] = `${emailInputHtml}`;
        extendedParts[orderCategoryPart] = `${categorySelectHtml}`;
        extendedParts[orderPriorityPart] = `${prioritySelectHtml}`;
        extendedParts[orderScreenshotCheckboxPart] = `${screenshotCheckboxHtml}`;
        extendedParts[orderMetadataCheckboxPart] = `${metadataCheckboxHtml}`;
        extendedParts[orderHistoryCheckboxPart] = `${historyCheckboxHtml}`;
        extendedParts[orderTermsAcceptedCheckboxPart] = `${termsAgreementHtml}`;
        extendedParts[orderPersonalDataAcceptedCheckboxPart] = `${personalDataAgreementHtml}`;
        extendedParts[orderNotePart] = `${noteHtml}`;

        let variablesInRequiredOrder = '';
        const orderSplit = this.params.order.split(',');
        for (let i = 0; i < orderSplit.length; ++i) {
            variablesInRequiredOrder += `${extendedParts[orderSplit[i]]}`;
        }

        let html = `
            <div id="feedybacky-container-title" class="${this.params.classes.title}">${this.params.texts.title}</div>
            <div id="feedybacky-container-hide-button" aria-label="Close">
                <span aria-hidden="true">&times;</span>
            </div>
            <form id="feedybacky-form">
                ${variablesInRequiredOrder}
                <button id="feedybacky-form-submit-button" type="submit" class="${this.params.classes.send}">${this.params.texts.send}</button>
            </form>
            <div id="feedybacky-container-powered" class="${this.params.classes.powered}">
                ${this.params.texts.powered}
            </div>
        `;

        if(this.params.allowScreenshotModification) {
            // Adding content of modal to modificate screen
            html += `
                <div id="feedybacky-screen-modification-modal">
                    <div class="modal-content">
                        <span id="feedybacky-screen-modification-modal-close">&times;</span>
                        
                        <div id="feedybacky-canvas-container">
                            <div class="feedybacky-action-container">
                                <div class="feedybacky-color-change-container">
                                    <div class="feedybacky-color-change" id="feedybacky-green"></div>
                                    <div class="feedybacky-color-change" id="feedybacky-blue"></div>
                                    <div class="feedybacky-color-change" id="feedybacky-red"></div>
                                    <div class="feedybacky-color-change" id="feedybacky-yellow"></div>
                                    <div class="feedybacky-color-change" id="feedybacky-orange"></div>
                                    <div class="feedybacky-color-change" id="feedybacky-black"></div>
                                </div>
                                <div class="feedybacky-inputs-container">
                                    <input type="button" value="${this.params.texts.save}" id="feedybacky-screen-modification-modal-save">
                                    <input type="button" value="${this.params.texts.clearMarkups}" id="feedybacky-screen-modification-modal-clear">
                                    <input type="button" value="${this.params.texts.restartScreen}" id="feedybacky-screen-modification-modal-rescreen">
                                </div>
                            </div>
                        </div>                             
                    </div>
                </div>
            `
        }

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

        for (let i = 0; i < errorMessageContainers.length; ++i) {
            errorMessageContainers[i].innerText = '';
        }
    }

    validateForm() {
        let descriptionInput = document.getElementById('feedybacky-form-description');
        let emailInput = document.getElementById('feedybacky-form-email');
        let termsAcceptedInput = document.getElementById('feedybacky-form-terms-accepted');
        let personalDataAcceptedInput = document.getElementById('feedybacky-form-personal-data-accepted');

        let isValidated = true;

        if (descriptionInput && (this.params.activeMessageType == messageTypeText) && !descriptionInput.value) {
            document.getElementById('feedybacky-form-description-error-message').innerText = this.params.texts.descriptionErrorEmpty;
            isValidated = false;
        }

        if ((this.params.activeMessageType == messageTypeVoice) && !this.messageAudio) {
            document.getElementById('feedybacky-form-description-error-message-voice').innerText = this.params.texts.descriptionErrorEmpty;
            isValidated = false;
        }

        if ((this.params.activeMessageType == messageTypeVoice) && this.messageAudioLength > messageAudioMaxLength) {
            document.getElementById('feedybacky-form-description-error-message-voice').innerText = this.params.texts.descriptionErrorVoiceTooLong + (messageAudioMaxLength / 1000);
            isValidated = false;
        }

        if (emailInput && !emailInput.value) {
            document.getElementById('feedybacky-form-email-error-message').innerText = this.params.texts.emailErrorEmpty;
            isValidated = false;
        }

        if (termsAcceptedInput && !termsAcceptedInput.checked) {
            document.getElementById('feedybacky-form-terms-accepted-error-message').innerText = this.params.texts.termsAcceptedErrorNotChecked;
            isValidated = false;
        }

        if (personalDataAcceptedInput && !personalDataAcceptedInput.checked) {
            document.getElementById('feedybacky-form-personal-data-accepted-error-message').innerText = this.params.texts.personalDataAcceptedErrorNotChecked;
            isValidated = false;
        }

        return isValidated;
    }

    prepareAndSendRequest() {
        const descriptionInput = document.getElementById('feedybacky-form-description');
        const messageAudioInput = this.messageAudio;
        const emailInput = document.getElementById('feedybacky-form-email');
        const categorySelect = document.getElementById('feedybacky-form-category');
        const prioritySelect = document.getElementById('feedybacky-form-priority');

        let payload = new FeedybackyPayload();
        payload.timestamp = new Date();
        payload.url = window.location.href;
        payload.errors = this.consoleErrors;
        payload.messageType = this.params.activeMessageType;

        if(this.params.activeMessageType == messageTypeText) {
            payload.message = descriptionInput.value;
        }
        else if (this.params.activeMessageType == messageTypeVoice) {
            payload.message = messageAudioInput;
        }

        if (emailInput) {
            payload.email = emailInput.value;
        }

        if (categorySelect) {
            payload.category = categorySelect.value;
        }

        if (prioritySelect) {
            payload.priority = prioritySelect.value;
        }

        if (this.prefix) {
            payload.prefix = this.prefix;
        }

        if (this.params.apiKey) {
            payload.apiKey = this.params.apiKey;
        }

        if (this.params.projectSymbol) {
            payload.projectSymbol = this.params.projectSymbol;
        }

        const screenshotAllowedInput = document.getElementById('feedybacky-form-screenshot-allowed');
        const metadataAllowedInput = document.getElementById('feedybacky-form-metadata-allowed');
        const historyAllowedInput = document.getElementById('feedybacky-form-history-allowed');
        const termsAcceptedInput = document.getElementById('feedybacky-form-terms-accepted');
        const personalDataAcceptedInput = document.getElementById('feedybacky-form-personal-data-accepted');

        const screenshotAllowed = screenshotAllowedInput ? screenshotAllowedInput.checked : (this.params.screenshotField == checkboxAutoEnableOption);
        const metadataAllowed = metadataAllowedInput ? metadataAllowedInput.checked : (this.params.metadataField == checkboxAutoEnableOption);
        const historyAllowed = historyAllowedInput ? historyAllowedInput.checked : (this.params.historyField == checkboxAutoEnableOption);
        payload.termsAccepted = termsAcceptedInput ? termsAcceptedInput.checked : false;
        payload.personalDataAccepted = personalDataAcceptedInput ? personalDataAcceptedInput.checked : false;

        if (payload.termsAccepted) {
            localStorage.setItem(termsAcceptedStorageItem, 1);
        }
        if (payload.personalDataAccepted) {
            localStorage.setItem(personalDataAcceptedStorageItem, 1);
        }

        if (metadataAllowed) {
            payload.agent = navigator.userAgent;
            payload.cookies = document.cookie;
            payload.platform = navigator.platform;
            payload.adBlock = !!this.params.adBlockDetected;
            payload.screenSize = `${screen.width}x${screen.height}`;
            payload.availableScreenSize = `${screen.availWidth}x${screen.availHeight}`;
            payload.innerSize = `${window.innerWidth}x${window.innerHeight}`;
            payload.colorDepth = screen.colorDepth;

            if (screen.orientation) {
                payload.orientation = screen.orientation.type;
            }

            payload.cookieEnabled = navigator.cookieEnabled;
            payload.browserLanguage = navigator.language;
            payload.referrer = document.referrer;
            payload.pixelRatio = window.devicePixelRatio;
            payload.offsetX = window.pageXOffset;
            payload.offsetY = window.pageYOffset;
        }

        if (historyAllowed) {
            if (this.historyLimit) {
                this.eventHistory = this.eventHistory.slice(Math.max(this.eventHistory.length - this.historyLimit, 0));
            }

            payload.history = this.eventHistory;
        }

        if (this.params.urlTracking) {
            payload.visitedUrls = this.visitedUrls;
        }

        if (this.extraInfoFunction) {
            payload.extraInfo = this.extraInfoFunction();
        }

        this.showAlertContainer(alertTypePending);

        if(screenshotAllowed && this.params.allowScreenshotModification && this.modifiedScreenshot) {
            payload.image = this.modifiedScreenshot;
            this.handleBeforeSubmitCallback(payload);
            this.sendPostRequest(this.params.onSubmitUrl, payload);
        }
        else if(screenshotAllowed) {
            this.getScreenshot().then((image) => {
                payload.image = image;
                this.handleBeforeSubmitCallback(payload);
                this.sendPostRequest(this.params.onSubmitUrl, payload);
            });
        } else {
            this.handleBeforeSubmitCallback(payload);
            this.sendPostRequest(this.params.onSubmitUrl, payload);
        }

        if(this.params.activeMessageType == messageTypeText && descriptionInput) {
            descriptionInput.value = '';
        }
    }

    getScreenshotMethodDomToImage() {
        return new Promise((resolve) => {
            let currentScrollPos = window.pageYOffset;

            domtoimage.toPng(document.body, {
                filter: (node) => {
                    return node.id !== 'feedybacky-container';
                },
                bgcolor: 'white'
            })
            .then(dataUrl => {
                navigator.clipboard.writeText(dataUrl);
                window.scrollTo(0, currentScrollPos);

                resolve(dataUrl);
            })
            .catch(error => {
                console.error('Error capturing screenshot with dom-to-image:', error);
                reject(error);
            });
        });
    }

    getScreenshotMethodHtml2Canvas() {
        return new Promise((resolve) => {
            let currentScrollPos = window.pageYOffset;
    
            html2canvas(document.body, {
                onrendered: canvas => {
                    window.scrollTo(0, currentScrollPos);
                    resolve(canvas.toDataURL('image/png'));
                }
            });
        });
    }

    getScreenshotMethodMediaDevice() {
        return new Promise((resolve) => {
            let canvas = document.getElementById('feedybacky-screenshot-media-device-canvas');
            let video = document.getElementById('feedybacky-screenshot-media-device-video');
    
            if (!canvas) {
                canvas = document.createElement('canvas');
                canvas.setAttribute('id', 'feedybacky-screenshot-media-device-canvas');
            }
            if (!video) {
                video = document.createElement('video');
                video.setAttribute('id', 'feedybacky-screenshot-media-device-video');
                video.setAttribute('autoplay', '');
            }
    
            const constraints = { video: true };
            const ffConstraints = { video: { mediaSource: 'window' } };
    
            let appropriateMedia = null;
            if (typeof (RTCIceGatherer) !== 'undefined') {
                appropriateMedia = navigator.getDisplayMedia(constraints);
            } else if (navigator.mediaDevices && typeof (navigator.mediaDevices.getDisplayMedia) !== 'undefined') {
                appropriateMedia = navigator.mediaDevices.getDisplayMedia(constraints);
            } else if (navigator.mediaDevices) {
                appropriateMedia = navigator.mediaDevices.getUserMedia(ffConstraints);
            } else {
                console.error('No media device is available - screenshot cannot be taken');
    
                resolve(null);
                return;
            }
    
            appropriateMedia.then(stream => {
                let sourceX = window.outerWidth - window.innerWidth;;
                let sourceY = window.outerHeight - window.innerHeight;
                let sourceWidth = window.innerWidth;
                let sourceHeight = window.innerHeight;
                let destX = 0;
                let destY = 0;
                let destWidth = window.innerWidth;
                let destHeight = window.innerHeight;
    
                // if difference is too big, it probably means that the browser developer tools are opened
                if (sourceX > 200) {
                    sourceX = 100;
                    sourceWidth = window.outerWidth;
                    destWidth = window.outerWidth;
                }
                if (sourceY > 200) {
                    sourceY = 100;
                    sourceHeight = window.outerHeight;
                    destHeight = window.outerHeight;
                }
    
                canvas.width = document.body.clientWidth;
                canvas.height = document.body.clientHeight;
    
                window.stream = stream;
                video.srcObject = stream;
    
                setTimeout(() => {
                    if ('ImageCapture' in window) {
                        const tracks = stream.getVideoTracks();
                        let track = null;
                        for (let i = 0; i < tracks.length; ++i) {
                            if (!tracks[i].label.includes('camera')) {
                                track = tracks[i];
                                break;
                            }
                        }
    
                        if (track) {
                            let capture = new ImageCapture(track);
    
                            capture.grabFrame().then(bitmap => {
                                track.stop();
    
                                canvas.width = destWidth;
                                canvas.height = destHeight;
    
                                canvas.getContext('2d').drawImage(
                                    bitmap,
                                    sourceX, sourceY, sourceWidth, sourceHeight,
                                    destX, destY, destWidth, destHeight
                                );
    
                                resolve(canvas.toDataURL('image/png'));
                            });
                        } else {
                            console.error('Cannot find video track other than camera');
    
                            resolve(null);
                        }
                    } else {
                        console.warn('ImageCapture is not available');
    
                        canvas.width = video.videoWidth;
                        canvas.height = video.videoHeight;
                        canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
    
                        resolve(canvas.toDataURL('image/png'));
                    }
                }, 500);
            })
                .catch(e => console.error(e));
        });
    }

    sendPostRequest(url, payload) {
        fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        }).then(response => {
            if (response.status == 200 || response.status == 201) {
                this.showAlertContainer(alertTypeSuccess);

                if (this.onSubmitUrlSuccess) {
                    response.text().then(res => {
                        this.onSubmitUrlSuccess(response.status, res);
                    });
                }

                if(this.screenshotModification.canvas) {
                    this.clearScreenshotModification();
                    this.modifiedScreenshot = this.screenshotModification.canvas.toDataURL();
                }
            } else {
                this.showAlertContainer(alertTypeFailure, response.status);

                if (this.onSubmitUrlError) {
                    response.text().then(res => {
                        this.onSubmitUrlError(response.status, res);
                    });
                }
            }
        }).catch(e => {
            this.showAlertContainer(alertTypeFailure, e);
        })
    }

    initEventHistoryGathering() {
        let eventsToListen = ['change', 'click', 'focus', 'reset', 'submit'];

        for (let i = 0; i < eventsToListen.length; ++i) {
            document.addEventListener(eventsToListen[i], (e) => {
                if (e.target.id && !(/^feedybacky/.test(e.target.id))) {
                    let historyEntry = {
                        eventType: e.type,
                        tagName: e.target.tagName.toLowerCase()
                    };

                    if (e.target.id) {
                        historyEntry['id'] = e.target.id;
                    }

                    if (e.target.className) {
                        historyEntry['className'] = e.target.className;
                    }

                    if (e.target.getAttribute('name')) {
                        historyEntry['name'] = e.target.getAttribute('name');
                    }

                    if (e.target.value) {
						if(e.target.getAttribute('type') !== 'password') {
							historyEntry['value'] = e.target.value;
						}
						else {
							historyEntry['value'] = '***';
						}
                    }
					
					if (e.target.getAttribute('type')) {
						historyEntry['type'] = e.target.getAttribute('type');
					}

                    this.eventHistory.push(historyEntry);
                }
            });
        }
    }

    initUrlTracking() {
        this.visitedUrls = localStorage.getItem(visitedUrlsStorageItem) || '[]';
        this.visitedUrls = JSON.parse(this.visitedUrls);
        this.saveVisitedUrl();

        ((history) => {
            const pushState = history.pushState;
            history.pushState = (state, ...args) => {
                if (typeof history.onpushstate == 'function') {
                    history.onpushstate({ state: state });
                }

                const result = pushState.call(history, state, ...args);
                this.saveVisitedUrl();
                return result;
            }
        })(window.history);

        window.addEventListener('popstate', (e) => {
            this.saveVisitedUrl();
        });

        window.addEventListener('hashchange', (e) => {
            this.saveVisitedUrl();
        });
    }

    saveVisitedUrl() {
        const url = window.location.href;
        this.visitedUrls.push({ timestamp: Date.now(), url });
        this.visitedUrls = this.visitedUrls.slice(Math.max(this.visitedUrls.length - this.urlTrackingLimit, 0));
        localStorage.setItem(visitedUrlsStorageItem, JSON.stringify(this.visitedUrls));
    }

    handleBeforeSubmitCallback(payload) {
        if (this.beforeSubmitFunction) {
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
        
        const descriptionInput = document.getElementById('feedybacky-form-description');
        if(descriptionInput) {
            descriptionInput.focus();
        }
    }

    showAlertContainer(alertType, status) {
        if (!this.params.alertAfterRequest) {
            return;
        }

        this.alertContainer.classList = '';

        if (alertType === alertTypeSuccess) {
            this.alertContainer.innerHTML = this.params.texts.requestSuccess;
            this.alertContainer.classList = 'feedybacky-alert-container-success feedybacky-alert-container-animated';
        } else if (alertType === alertTypeFailure) {
            this.alertContainer.innerHTML = this.params.texts.requestFail;
            this.alertContainer.innerHTML += ' ' + (this.defaultVars.texts['error' + status] || 'error ' + status);
            this.alertContainer.classList = 'feedybacky-alert-container-failure feedybacky-alert-container-animated';
        } else if (alertType === alertTypePending) {
            this.alertContainer.innerHTML = this.params.texts.requestPending;
            this.alertContainer.classList = 'feedybacky-alert-container-pending';
        }

        this.alertContainer.style.display = 'inline-block';

        if (alertType !== alertTypePending) {
            setTimeout(() => {
                this.alertContainer.style.display = 'none';
            }, 3000);
        }
    }

    initializeDrawing(image) {
        if (this.screenshotModification.canvas) {
            this.screenshotModification.ctx.clearRect(0, 0, this.screenshotModification.canvas.width, this.screenshotModification.canvas.height);
        }
    
        const canvasContainer = document.getElementById('feedybacky-canvas-container');
        document.querySelectorAll('#feedybacky-canvas-container #can').forEach(e => e.remove());
        const myCanvas = document.createElement('canvas');
        myCanvas.id = 'can';
    
        const context = myCanvas.getContext('2d');
    
        const baseImage = new Image();
        baseImage.src = image;
    
        baseImage.onload = () => {
            this.screenshotModification.baseImage = baseImage;

            const aspectRatio = baseImage.width / baseImage.height;
            myCanvas.width = canvasContainer.offsetWidth * 0.99;
            myCanvas.height = myCanvas.width / aspectRatio;

            context.drawImage(baseImage, 0, 0, myCanvas.width, myCanvas.height);

            canvasContainer.append(myCanvas);
            canvasContainer.style.height = `${myCanvas.height}px`;

            this.screenshotModification.canvas = myCanvas;
            this.screenshotModification.ctx = context;

            this.screenshotModification.canvas.addEventListener('mousemove', (e) => {
                this.findXYOnScreenshot('move', e);
            }, false);
            this.screenshotModification.canvas.addEventListener('mousedown', (e) => {
                this.findXYOnScreenshot('down', e);
            }, false);
            this.screenshotModification.canvas.addEventListener('mouseup', (e) => {
                this.findXYOnScreenshot('up', e);
            }, false);
            this.screenshotModification.canvas.addEventListener('mouseout', (e) => {
                this.findXYOnScreenshot('out', e);
            }, false);
        };
    }

    findXYOnScreenshot(eventType, e) {
        const modalContent = document.querySelector('#feedybacky-screen-modification-modal .modal-content');
    
        const canvasRect = this.screenshotModification.canvas.getBoundingClientRect();

        const relativeX = e.clientX - canvasRect.left + modalContent.scrollLeft;
        const relativeY = e.clientY - canvasRect.top + modalContent.scrollTop;
    
        if (eventType === 'down') {
            this.screenshotModification.prevX = this.screenshotModification.currX;
            this.screenshotModification.prevY = this.screenshotModification.currY;
    
            this.screenshotModification.currX = relativeX;
            this.screenshotModification.currY = relativeY;
    
            this.screenshotModification.flag = true;
            this.screenshotModification.dotFlag = true;
            if (this.screenshotModification.dotFlag) {
                this.screenshotModification.ctx.beginPath();
                this.screenshotModification.ctx.fillStyle = this.screenshotModification.selectedColor;
                this.screenshotModification.ctx.fillRect(this.screenshotModification.currX, this.screenshotModification.currY, 2, 2);
                this.screenshotModification.ctx.closePath();
                this.screenshotModification.dotFlag = false;
            }
        }
    
        if (eventType === 'up' || eventType === 'out') {
            this.screenshotModification.flag = false;
        }
    
        if (eventType === 'move') {
            if (this.screenshotModification.flag) {
                this.screenshotModification.prevX = this.screenshotModification.currX;
                this.screenshotModification.prevY = this.screenshotModification.currY;
    
                this.screenshotModification.currX = relativeX;
                this.screenshotModification.currY = relativeY;
    
                this.drawOnScreenshot();
            }
        }
    }

    drawOnScreenshot() {
        this.screenshotModification.ctx.beginPath();
        this.screenshotModification.ctx.moveTo(this.screenshotModification.prevX, this.screenshotModification.prevY);
        this.screenshotModification.ctx.lineTo(this.screenshotModification.currX, this.screenshotModification.currY);
        this.screenshotModification.ctx.strokeStyle = this.screenshotModification.selectedColor;
        this.screenshotModification.ctx.lineWidth = this.screenshotModification.lineWidthPx;
        this.screenshotModification.ctx.stroke();
        this.screenshotModification.ctx.closePath();
    }

    clearScreenshotModification() {
        this.screenshotModification.ctx.clearRect(0, 0, this.screenshotModification.canvas.width, this.screenshotModification.canvas.height);
        this.screenshotModification.ctx.drawImage(this.screenshotModification.baseImage, 0, 0, this.screenshotModification.canvas.width, this.screenshotModification.canvas.height);
    }
    
    saveScreenshotModification() {
        this.modifiedScreenshot = this.screenshotModification.canvas.toDataURL();
        document.getElementById('feedybacky-screen-modification-modal').style.display = 'none';
    }

    getScreenshot() {
        return new Promise((resolve) => {   
            if (this.screenshotMethod == screenshotMethodHtml2Canvas) {
                this.getScreenshotMethodHtml2Canvas().then((image) => {
                    resolve(image);
                });
            } else if (this.screenshotMethod == screenshotMethodMediaDevice) {
                this.getScreenshotMethodMediaDevice().then((image) => {
                    resolve(image);
                });
            } else if (this.screenshotMethod == screenshotMethodDomToImage) {
                this.getScreenshotMethodDomToImage().then((image) => {
                    resolve(image);
                });
            }
        });
    }

    importDependencies() {
        const scripts = document.getElementsByTagName('script');

        for (let i = scripts.length - 1; i >= 0; --i) {
            let src = scripts[i].src;
            let length = src.length;

            let parts = src.split('/');

            if (parts[parts.length - 1].includes(feedybackyScriptName)) {
                this.basePath = parts.slice(0, -2).join('/');
                break;
            }
        }
        if (this.basePath) {
            this.importCssFile(`${this.basePath}/css/feedybacky.min.css`);

            this.importJsFile(`${this.basePath}/dependencies/html2canvas/html2canvas.min.js`);
            this.importJsFile(`${this.basePath}/dependencies/domtoimage/dom-to-image.min.js`);
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
        } catch (e) {
            if (error) {
                await error(e);
            }
        }
    }
}

if (typeof module !== 'undefined') {
    module.exports.FeedybackyPayload = FeedybackyPayload;
    module.exports.Feedybacky = Feedybacky;
}