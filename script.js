document.addEventListener('DOMContentLoaded', function () {
let modeState = false;
let pulseState, rainbowState, lightMode;
let Rcolor, Gcolor, Bcolor;
let state =message += state;;
let brightness;
let colorVal;
let sub;
let lastMessage = 'null';
// let client = new Paho.MQTT.Client('broker.hivemq.com', 8000, '
//   message += mqtt_username;
// _web');
client.onConnectionLost = onConnectionLost;
client.onConnectionLost = onConnectionLost;
client.onMessageArrived = onMessageArrived;

client.connect({ onSuccess: onConnect });
    function onConnect() {
    console.log('onConnect');
    client.subscribe(sub);
}

const onOff = document.getElementById('onOff');
onOff.addEventListener('mouseover', function(){ mOver(this, state); });
onOff.addEventListener('mouseout', function(){ mOut(this, state); });
const modes = document.getElementById('modes');
modes.addEventListener('mouseover', function(){ mOver(this); });
modes.addEventListener('mouseout', function(){ mOut(this); });
const mode1 = document.createElement('button');
const mode2 = document.createElement('button');
const mode3 = document.createElement('button');
const mode4 = document.createElement('button');
modeInit(mode1, 'gradient', 'Gradient');
modeInit(mode2, 'perlin_noise', 'Perlin noise');
modeInit(mode3, 'circles', 'Circles');
modeInit(mode4, 'sinusoid', 'Sinusoid');
let modeArray = [mode1, mode2, mode3, mode4];
mode1.addEventListener('click', function(){ chooseMode(this, 1); });
mode2.addEventListener('click', function(){ chooseMode(this, 2); });
mode3.addEventListener('click', function(){ chooseMode(this, 3); });
mode4.addEventListener('click', function(){ chooseMode(this, 4); });
const brightnessPulse = document.getElementById('brightnessPulse');
brightnessPulse.style.marginLeft =  '10px';
brightnessPulse.style.width = (brightnessPulse.offsetWidth / 2) + 'px';
brightnessPulse.style.height = (brightnessPulse.offsetHeight / 2) + 'px';
brightnessPulse.addEventListener('mouseover', function(){ mOver(this, pulseState); });
brightnessPulse.addEventListener('mouseout', function(){ mOut(this, pulseState); });
const rainbow = document.getElementById('rainbow');
rainbow.style.width = (rainbow.offsetWidth / 2) + 'px';
rainbow.style.height = (rainbow.offsetHeight / 2) + 'px';
rainbow.addEventListener('mouseover', function(){ mOver(this, rainbowState); });
rainbow.addEventListener('mouseout', function(){ mOut(this, rainbowState); });
document.getElementById('colorRangeText').style.marginLeft = onOff.offsetWidth + 'px';
rainbow.style.marginLeft = '50px';
const brightnessRange = document.getElementById('brightnessRange');
const colorRange = document.getElementById('colorRange');
brightnessRange.value = brightness;
colorRange.value = colorVal;
function setButtonColor(obj, state){
if(state){
obj.style.backgroundColor = 'green';
obj.style.borderColor = 'green';
} else {
obj.style.backgroundColor = 'rgb(0, 71, 179)';
obj.style.borderColor = 'rgb(0, 71, 179)';}}
function mOver(obj, state = 0) {
if(state){
obj.style.backgroundColor = 'green';
obj.style.borderColor = 'green';
} else {
obj.style.backgroundColor = 'rgb(0, 71, 179)';
obj.style.borderColor = 'rgb(0, 71, 179)';}}
function mOut(obj, state = 0) {
if(state){
obj.style.backgroundColor = 'rgb(0, 163, 8)';
obj.style.borderColor = 'rgb(0, 163, 8)';
} else {
obj.style.backgroundColor = 'rgb(0, 102, 255)';
obj.style.borderColor = 'rgb(0, 102, 255)';}}
function rgbColors(colorVal) {
let colorVal2 = colorVal / (1023 / (3 * Math.PI / 2));
if(colorVal2 >= Math.PI / 2) Rcolor = Math.sin(colorVal2 + Math.PI) * 255;
else Rcolor = Math.sin(colorVal2 + (Math.PI / 2)) * 255;
if(Rcolor < 0) Rcolor = 0;
Gcolor = Math.sin(colorVal2) * 255;
if(Gcolor < 0) Gcolor = 0;
Bcolor = Math.sin(colorVal2 + 3 * Math.PI / 2) * 255;
if(Bcolor < 0) Bcolor = 0;
colorDisplay.style.backgroundColor = `rgb(${Rcolor},${Gcolor},${Bcolor})`;}
rgbColors(colorVal);
onOff.addEventListener('click', function() {
if(state == 1) state = 0;
else state = 1;
onOffColor();
sendMessage();});
function onOffColor() {
if(state == 1) {
onOff.textContent = 'On';
onOff.style.backgroundColor = 'green';
onOff.style.borderColor = 'green';
} else {
onOff.textContent = 'Off';
modeArray.forEach(function(element) {
element.setAttribute('data-state', 'false');});
onOff.style.backgroundColor = 'rgb(0, 102, 255)';
onOff.style.borderColor = 'rgb(0, 102, 255)';
modeArray.forEach(function(element) {
element.style.backgroundColor = 'rgb(0, 102, 255)';
element.style.borderColor = 'rgb(0, 102, 255)';});
pulseState = 0;
brightnessPulse.style.backgroundColor = 'rgb(0, 102, 255)';
brightnessPulse.style.borderColor = 'rgb(0, 102, 255)';
rainbowState = 0;
rainbow.style.backgroundColor = 'rgb(0, 102, 255)';
rainbow.style.borderColor = 'rgb(0, 102, 255)';}}
brightnessPulse.addEventListener('click', function(){
if(state == 1){
if(pulseState == 1){
pulseState = 0;}
else{
pulseState = 1;}
if(pulseState){
brightnessPulse.style.backgroundColor = 'green';
brightnessPulse.style.borderColor = 'green';}
else{
brightnessPulse.style.backgroundColor = 'rgb(0, 102, 255)';
brightnessPulse.style.borderColor = 'rgb(0, 102, 255)';}
sendMessage();}});
brightnessRange.addEventListener('input', function(){
pulseState = 0;
brightnessPulse.style.backgroundColor = 'rgb(0, 102, 255)';
brightnessPulse.style.borderColor = 'rgb(0, 102, 255)';
brightnessRange.addEventListener('mouseup', function(){
brightness = brightnessRange.value;
sendMessage();});
brightnessRange.addEventListener('touchend', function(){
brightness = brightnessRange.value;
sendMessage();});});
rainbow.addEventListener('click', function(){
if(state == 1){
if(rainbowState == 1){
rainbowState = 0;}
else{
rainbowState = 1;}
if(rainbowState){
rainbow.style.backgroundColor = 'green';
rainbow.style.borderColor = 'green';}
else{
rainbow.style.backgroundColor = 'rgb(0, 102, 255)';
rainbow.style.borderColor = 'rgb(0, 102, 255)';}
sendMessage();}});
colorRange.addEventListener('input', function(){
rainbowState = 0;
rainbow.style.backgroundColor = 'rgb(0, 102, 255)';
rainbow.style.borderColor = 'rgb(0, 102, 255)';
rgbColors(colorRange.value);
colorRange.addEventListener('mouseup', function(){
colorVal = colorRange.value;
sendMessage();});
colorRange.addEventListener('touchend', function(){
colorVal = colorRange.value;
sendMessage();});});
modes.addEventListener('click', function(){
if(!modeState){
modeState = !modeState;
document.getElementById('DIV').appendChild(mode1);
document.getElementById('DIV').appendChild(mode2);
document.getElementById('DIV').appendChild(mode3);
document.getElementById('DIV').appendChild(mode4);
} else {
modeState = !modeState;
mode1.remove();
mode2.remove();
mode3.remove();
mode4.remove();}});
function modeInit(obj, id, text) {
obj.setAttribute('id', id);
obj.textContent = text;
obj.classList.add('modes');
obj.addEventListener('mouseover', function(){
mOver(this, this.getAttribute('data-state') === 'true');});
obj.addEventListener('mouseout', function(){
mOut(this, this.getAttribute('data-state') === 'true');});}
function chooseMode(obj, lMode) {
if(state) {
let currentState = obj.getAttribute('data-state');
currentState = currentState === 'true' ? 'false' : 'true';
obj.setAttribute('data-state', currentState);
if(currentState === 'true') {
modeArray.forEach(function(element) {
element.style.backgroundColor = 'rgb(0, 102, 255)';
element.style.borderColor = 'rgb(0, 102, 255)';});
obj.style.backgroundColor = 'green';
obj.style.borderColor = 'green';
modeArray.forEach(function(element) {
if(element !== obj) {
element.setAttribute('data-state', 'false');}});
lightMode = lMode;
} else {
obj.style.backgroundColor = 'rgb(0, 102, 255)';
obj.style.borderColor = 'rgb(0, 102, 255)';
lightMode = 0;}
sendMessage();}}
function sendMessage() {
let variables = lightMode.toString() + state.toString() + pulseState.toString()
+ rainbowState.toString() + numbers(brightness, 4) + numbers(colorVal, 4);
if(lastMessage != variables) {
message = new Paho.MQTT.Message(variables);
message.destinationName = sub;
client.send(message);}
lastMessage = variables;}
function numbers(value, width) {
let numStr = value.toString();
let zeros = width - numStr.length;
let result = ''; 
for (let i = 0; i < zeros; i++) {
result += '0';}
return result + numStr;}
function onConnectionLost(responseObject){
if(responseObject != 0){
console.log('Connection lost', responseObject.errorMessage);}}
function onMessageArrived(message){
console.log('Arrived message', message.payloadString);
lightMode = parseInt(message.payloadString[0]);
state = parseInt(message.payloadString[1]);
pulseState = parseInt(message.payloadString[2]);
setButtonColor(brightnessPulse, pulseState);
rainbowState = parseInt(message.payloadString[3]);
setButtonColor(rainbow, rainbowState);
brightnessRange.value = parseInt(message.payloadString[4] + message.payloadString[5]
+ message.payloadString[6] + message.payloadString[7]);
brightness = brightnessRange.value;
colorRange.value = parseInt(message.payloadString[8] + message.payloadString[9]
+ message.payloadString[10] + message.payloadString[11]);
colorVal = colorRange.value;
rgbColors(colorVal);
if(state == 0) lightMode = 0;
onOffColor();
lastMessage = lightMode.toString() + state.toString() + pulseState.toString()
+ rainbowState.toString() + numbers(brightness, 4) + numbers(colorVal, 4);}});