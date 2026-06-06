//#region variables and classes

class LampData{
    constructor() {
        this.power = false;
        this.brightnessVal = 0;
        this.colorVal = 0;
        this.mod = null;
        this.extraMods = new Array();
    }
}

let mqttClient = null;
const mqttBroker = 'mqtt-dashboard.com';
const mqttTopic = '_smartLamp_';

let lampData = new LampData();

let extraModButtons = new Array();
let modButton = null;
//#endregion

//#region init

document.addEventListener('DOMContentLoaded', () => {
    // dark mode
    if (window.matchMedia('(prefers-color-scheme: dark)').matches)
        document.body.classList.toggle('dark-theme');

    initPortSelector();

    // menu buttons setup
    initModButtons(document.querySelectorAll('#mod-menu-dropdown button'), false);
    initModButtons(document.querySelectorAll('#extra-menu-dropdown button'), true);

    //sliders setup
    const brightnessSlider = document.getElementById('brightness-range');
    const updateBrightness = () => {
        lampData.brightnessVal = brightnessSlider.value;
        const percent = Math.floor((lampData.brightnessVal / brightnessSlider.max) * 100);
        document.getElementById('brightness-label').textContent = `${percent}%`;
    };
    brightnessSlider.addEventListener('input', () => updateBrightness());
    brightnessSlider.addEventListener('change', () => sendData());

    const colorSlider = document.getElementById('color-range');
    const updateColor = () => {
        lampData.colorVal = colorSlider.value;
        const rgb = valueToRgb(lampData.colorVal, colorSlider.max, 100);
        ['red', 'green', 'blue'].forEach((color, i) => {
            document.getElementById(`${color}-label`).textContent = `${Math.floor(rgb[i])}%`;
        });
    };
    colorSlider.addEventListener('input', () => updateColor());
    colorSlider.addEventListener('change', () => sendData());

    //init mqtt connection
    initMqttConnection();

    //setup labels
    updateBrightness();
    updateColor();
});

function initPortSelector(){
    const portSelect = document.getElementById("server-port");
    portSelect.addEventListener('change', (event) => changeMqttPort(event.target.value));

    const startPort = 0;
    const endPort = 99;
    const defaultPort = 0;

    for (let i = startPort; i <= endPort; i++) {
        let option = document.createElement("option");
        option.value = i;
        option.text = i;
        if (i === defaultPort)
            option.selected = true;
        portSelect.appendChild(option);
    }
}

function initModButtons(buttons, isExtra){
    buttons.forEach((button) => {
        let modName = button.textContent;
        modName.replace(" ", "_").toLowerCase(); 
        button.dataset.isExtra = isExtra;
        button.dataset.modName = modName;
        button.addEventListener('click', () => toggleMod(button))
        if (isExtra) extraModButtons.push(button);
    });
}

function initMqttConnection(port = 8000) {
    if (mqttClient && mqttClient.isConnected())
        mqttClient.disconnect();

    const clientId = 'lamp_web_' + Math.random().toString(16).substr(2, 8);
    mqttClient = new Paho.MQTT.Client(mqttBroker, Number(port), clientId);
    mqttClient.onConnectionLost = onConnectionLost;
    mqttClient.onMessageArrived = onMessageArrived;

    mqttClient.connect({
        onSuccess: () => {
            console.log(`Connected to MQTT Broker on port ${port}`);
            mqttClient.subscribe(mqttTopic);
        },
        onFailure: (message) => console.log('MQTT Connection failed: ' + message.errorMessage),
        useSSL: false
    });
}

//#endregion

//#region interaction

function toggleMenu(button, containerId) {
    container = document.getElementById(containerId),
    container.classList.toggle('is-open');
    button.classList.toggle('active-button');
}

function clearMods(isExtra, isSending){
    if (isExtra){
        extraModButtons.forEach(button => button.classList.remove('active-button'));
        lampData.extraMods.length = 0; 
    }
    else{
        if (modButton === null) return;
        modButton.classList.remove('active-button');
        modButton = null;
        lampData.mod = null;
    }
    if (isSending) sendData();
}

function toggleMod(button){
    const modName = button.dataset.modName;
    if (button.dataset.isExtra === 'true'){
        button.classList.toggle('active-button');
        if (lampData.extraMods.includes(modName))
            lampData.extraMods = lampData.extraMods.filter(item => item !== modName); 
        else lampData.extraMods.push(modName);
    }
    else{
        let isAlreadyActive = modButton === button;
        clearMods(false, false);
        if (!isAlreadyActive){
            button.classList.toggle('active-button');
            modButton = button;
            lampData.mod = modName;
        } 
    }
    sendData();
}

function toggleSwitch(switchImage){
    lampData.power = !lampData.power;
    switchImage.classList.toggle('no-invert');
    switchImage.classList.toggle('switch-on');
    sendData();
}

//#endregion

//#region mqqt

function sendData(){
    if (!mqttClient || !mqttClient.isConnected()) {
        console.warn('MQTT client is not connected. Data not sent.');
        return;
    }
    
    const payload = JSON.stringify(lampData);
    // console.log('Sending data:', payload);

    const message = new Paho.MQTT.Message(payload);
    message.destinationName = mqttTopic;
    message.qos = 1; 
    message.retained = true; 

    mqttClient.send(message);
}

function changeMqttPort(number){
    console.log(`Changing MQTT port to: ${number}`);
    const actualPort = 8000 + Number(number); 
    initMqttConnection(actualPort);
}

function onMessageArrived(message){
    try {
        // console.log("Message came: ", message);
        const receivedData = JSON.parse(message.payloadString);
        const targetData = {
            power: receivedData.power ?? lampData.power,
            brightnessVal: Number(receivedData.brightnessVal ?? lampData.brightnessVal),
            colorVal: Number(receivedData.colorVal ?? lampData.colorVal),
            mod: receivedData.mod ?? lampData.mod,
            extraMods: receivedData.extraMods ?? []
        };

        if (JSON.stringify(lampData) === JSON.stringify(targetData)) return; 
        lampData.power = targetData.power;
        lampData.brightnessVal = targetData.brightnessVal;
        lampData.colorVal = targetData.colorVal;
        lampData.mod = targetData.mod;
        lampData.extraMods = targetData.extraMods;

        updateUI();

    } catch (e) {
        console.error('Error parsing MQTT JSON payload.', e);
    }
}

function updateUI() {
    // console.log('Updating: ', JSON.stringify(lampData));

    const brightnessSlider = document.getElementById('brightness-range');
    brightnessSlider.value = lampData.brightnessVal;
    const percent = Math.floor((lampData.brightnessVal / brightnessSlider.max) * 100);
    document.getElementById('brightness-label').textContent = `${percent}%`;

    const colorSlider = document.getElementById('color-range');
    colorSlider.value = lampData.colorVal;
    const rgb = valueToRgb(lampData.colorVal, colorSlider.max, 100);
    ['red', 'green', 'blue'].forEach((color, i) => {
        document.getElementById(`${color}-label`).textContent = `${Math.floor(rgb[i])}%`;
    });

    const switchImg = document.querySelector('.switch-off');
    if (lampData.power) switchImg.classList.add('no-invert', 'switch-on');
    else switchImg.classList.remove('no-invert', 'switch-on');

    clearMods(false, false);
    if (lampData.mod) {
        const activeModBtn = document.querySelector(`button[data-mod-name="${lampData.mod}"]`);
        if (activeModBtn) {
            activeModBtn.classList.add('active-button');
            modButton = activeModBtn;
        }
    }

    const tempExtraMods = [...lampData.extraMods]; 
    clearMods(true, false);
    lampData.extraMods = tempExtraMods;
    lampData.extraMods.forEach(mod => {
        const extraBtn = document.querySelector(`button[data-mod-name="${mod}"]`);
        if (extraBtn) extraBtn.classList.add('active-button');
    });
}

function onConnectionLost(responseObject){
    if (responseObject.errorCode !== 0) {
        console.log('Connection lost:', responseObject.errorMessage);
        setTimeout(() => {
            console.log('Attempting to reconnect...');
            if (mqttClient) mqttClient.connect({ onSuccess: () => mqttClient.subscribe(mqttTopic) });
        }, 5000);
    }
}

//#endregion

//#region extras

const clamp = (num, min, max) => Math.max(min, Math.min(num, max));

function valueToRgb(colorRangeVal, maxRangeVal, maxVal) {
    const colorValP = colorRangeVal / (maxRangeVal / (3 * Math.PI / 2));
    let rColor = clamp((colorValP >= Math.PI / 2 
    ? Math.sin(colorValP + Math.PI) * maxVal 
    : Math.sin(colorValP + (Math.PI / 2)) * maxVal), 0 , maxVal);
    let gColor = clamp(Math.sin(colorValP) * maxVal, 0 , maxVal);
    let bColor = clamp(Math.sin(colorValP + 3 * Math.PI / 2) * maxVal, 0 , maxVal);
    return [rColor, gColor, bColor];
}

//#endregion