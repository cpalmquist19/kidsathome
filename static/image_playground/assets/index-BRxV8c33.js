(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))e(s);new MutationObserver(s=>{for(const r of s)if(r.type==="childList")for(const l of r.addedNodes)l.tagName==="LINK"&&l.rel==="modulepreload"&&e(l)}).observe(document,{childList:!0,subtree:!0});function i(s){const r={};return s.integrity&&(r.integrity=s.integrity),s.referrerPolicy&&(r.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?r.credentials="include":s.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function e(s){if(s.ep)return;s.ep=!0;const r=i(s);fetch(s.href,r)}})();function tt(n){const t=n.getContext("webgl2",{antialias:!1,alpha:!1,preserveDrawingBuffer:!0});if(!t)throw new Error("WebGL2 is not available in this browser.");if(!t.getExtension("EXT_color_buffer_float"))throw new Error("Float render targets (EXT_color_buffer_float) are not supported.");return t}function y(n,t,i){const e=N(n,n.VERTEX_SHADER,t),s=N(n,n.FRAGMENT_SHADER,i),r=n.createProgram();if(!r)throw new Error("createProgram failed");if(n.attachShader(r,e),n.attachShader(r,s),n.bindAttribLocation(r,0,"aPos"),n.linkProgram(r),!n.getProgramParameter(r,n.LINK_STATUS))throw new Error("Program link failed: "+n.getProgramInfoLog(r));return n.deleteShader(e),n.deleteShader(s),r}function N(n,t,i){const e=n.createShader(t);if(!e)throw new Error("createShader failed");if(n.shaderSource(e,i),n.compileShader(e),!n.getShaderParameter(e,n.COMPILE_STATUS))throw new Error("Shader compile failed: "+n.getShaderInfoLog(e));return e}function et(n){const t=n.createVertexArray();if(!t)throw new Error("createVertexArray failed");n.bindVertexArray(t);const i=n.createBuffer();return n.bindBuffer(n.ARRAY_BUFFER,i),n.bufferData(n.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),n.STATIC_DRAW),n.enableVertexAttribArray(0),n.vertexAttribPointer(0,2,n.FLOAT,!1,0,0),n.bindVertexArray(null),n.bindBuffer(n.ARRAY_BUFFER,null),t}function T(n,t,i){const e={};for(const s of i)e[s]=n.getUniformLocation(t,s);return e}const C=`#version 300 es
layout(location = 0) in vec2 aPos;
out vec2 vUv;
void main() {
  vUv = aPos * 0.5 + 0.5;
  gl_Position = vec4(aPos, 0.0, 1.0);
}
`,it=`#version 300 es
precision highp float;
in vec2 vUv;
uniform vec2 uCenter;      // dab center, uv (y-up)
uniform vec2 uCanvasSize;  // px
uniform float uRadiusPx;
uniform vec2 uDelta;       // drag delta, uv (y-up)
out vec4 outColor;
void main() {
  vec2 pPx = (vUv - uCenter) * uCanvasSize;
  float d = length(pPx) / uRadiusPx;
  if (d > 1.0) discard;
  float f = 1.0 - smoothstep(0.15, 1.0, d);
  f = f * f * (3.0 - 2.0 * f); // smootherstep falloff
  outColor = vec4(uDelta * f, 0.0, 1.0);
}
`,st=`#version 300 es
precision highp float;
in vec2 vUv;
uniform vec2 uCenter;
uniform vec2 uCanvasSize;
uniform float uRadiusPx;
uniform int uMode;
uniform vec2 uVec;      // mode 0: drag delta, uv (y-up)
uniform float uAmount;  // modes 1,2,3: px per dab
uniform float uSwirl;   // mode 1: tangential px per dab
out vec4 outColor;
void main() {
  vec2 pPx = (vUv - uCenter) * uCanvasSize;
  float r = length(pPx);
  float d = r / uRadiusPx;
  if (d > 1.0) discard;
  float f = 1.0 - smoothstep(0.0, 1.0, d);
  f = f * f * (3.0 - 2.0 * f);
  vec2 n = r > 0.001 ? pPx / r : vec2(0.0);
  vec2 t = vec2(-n.y, n.x);
  vec2 deltaPx = vec2(0.0);
  if (uMode == 0) {
    vec2 dragPx = uVec * uCanvasSize;
    deltaPx = t * dot(dragPx, t) * f;
  } else if (uMode == 1) {
    deltaPx = (-n * uAmount + t * uSwirl) * f;
  } else if (uMode == 2) {
    float h = fract(sin(dot(floor(pPx), vec2(12.9898, 78.233))) * 43758.5453);
    vec2 j = (vec2(h, fract(h * 1.37)) - 0.5) * uAmount * 0.5;
    deltaPx = (n * uAmount + j) * f;
  } else {
    deltaPx = t * uAmount * f;
  }
  outColor = vec4(deltaPx / uCanvasSize, 0.0, 1.0);
}
`,nt=`#version 300 es
precision highp float;
in vec2 vUv;
uniform vec2 uCenter;
uniform vec2 uCanvasSize;
uniform float uRadiusPx;
out vec4 outColor;
void main() {
  vec2 pPx = (vUv - uCenter) * uCanvasSize;
  float d = length(pPx) / uRadiusPx;
  if (d > 1.0) discard;
  float f = 1.0 - smoothstep(0.6, 1.0, d);
  outColor = vec4(f, 0.0, 0.0, 1.0);
}
`,rt=`#version 300 es
precision highp float;
in vec2 vUv;
uniform sampler2D uSrc;
out vec4 outColor;
void main() { outColor = texture(uSrc, vUv); }
`,ot=`#version 300 es
precision highp float;
in vec2 vUv;
uniform sampler2D uImage;
uniform sampler2D uDisp;
uniform sampler2D uMask;
uniform float uWarpScale;
uniform float uPixelSize;
uniform vec2 uCanvasSize;
out vec4 outColor;
void main() {
  vec2 d = texture(uDisp, vUv).rg;
  vec2 uv = vUv + d * uWarpScale;
  if (texture(uMask, vUv).r > 0.003) {
    vec2 cells = uCanvasSize / max(uPixelSize, 1.0);
    uv = (floor(uv * cells) + 0.5) / cells;
  }
  outColor = vec4(texture(uImage, uv).rgb, 1.0);
}
`;class lt{constructor(t){this.warpScale=1,this.pixelSize=16,this.imageTex=null,this.dispTex=null,this.dispFBO=null,this.maskTex=null,this.maskFBO=null,this.undoDispTex=null,this.undoDispFBO=null,this.undoMaskTex=null,this.undoMaskFBO=null,this.w=1,this.h=1,this.canvas=t;const i=this.gl=tt(t);this.quad=et(i),this.dabProg=y(i,C,it),this.vecProg=y(i,C,st),this.maskProg=y(i,C,nt),this.copyProg=y(i,C,rt),this.compProg=y(i,C,ot),this.dabU=T(i,this.dabProg,["uCenter","uCanvasSize","uRadiusPx","uDelta"]),this.vecU=T(i,this.vecProg,["uCenter","uCanvasSize","uRadiusPx","uMode","uVec","uAmount","uSwirl"]),this.maskU=T(i,this.maskProg,["uCenter","uCanvasSize","uRadiusPx"]),this.copyU=T(i,this.copyProg,["uSrc"]),this.compU=T(i,this.compProg,["uImage","uDisp","uMask","uWarpScale","uPixelSize","uCanvasSize"])}get width(){return this.w}get height(){return this.h}setImage(t,i,e){const s=this.gl,l=Math.min(1,2048/Math.max(i,e)),o=Math.max(1,Math.round(i*l)),h=Math.max(1,Math.round(e*l)),a=document.createElement("canvas");a.width=o,a.height=h;const m=a.getContext("2d");if(!m)throw new Error("2D canvas unavailable");m.drawImage(t,0,0,o,h),this.w=o,this.h=h,this.canvas.width=o,this.canvas.height=h,this.imageTex&&s.deleteTexture(this.imageTex);const p=s.createTexture();if(!p)throw new Error("createTexture failed");this.imageTex=p,s.pixelStorei(s.UNPACK_FLIP_Y_WEBGL,1),s.bindTexture(s.TEXTURE_2D,p),s.texParameteri(s.TEXTURE_2D,s.TEXTURE_MIN_FILTER,s.LINEAR),s.texParameteri(s.TEXTURE_2D,s.TEXTURE_MAG_FILTER,s.LINEAR),s.texParameteri(s.TEXTURE_2D,s.TEXTURE_WRAP_S,s.CLAMP_TO_EDGE),s.texParameteri(s.TEXTURE_2D,s.TEXTURE_WRAP_T,s.CLAMP_TO_EDGE),s.texImage2D(s.TEXTURE_2D,0,s.RGBA8,s.RGBA,s.UNSIGNED_BYTE,a),s.pixelStorei(s.UNPACK_FLIP_Y_WEBGL,0);for(const g of[this.dispTex,this.maskTex,this.undoDispTex,this.undoMaskTex])g&&s.deleteTexture(g);for(const g of[this.dispFBO,this.maskFBO,this.undoDispFBO,this.undoMaskFBO])g&&s.deleteFramebuffer(g);this.dispTex=this.makeFloatTex(o,h),this.undoDispTex=this.makeFloatTex(o,h),this.dispFBO=this.makeFBO(this.dispTex),this.undoDispFBO=this.makeFBO(this.undoDispTex),this.maskTex=this.makeByteTex(o,h),this.undoMaskTex=this.makeByteTex(o,h),this.maskFBO=this.makeFBO(this.maskTex),this.undoMaskFBO=this.makeFBO(this.undoMaskTex),this.clearAll()}paintDab(t,i,e,s,r,l){if(!this.dispFBO)return;const o=this.gl;o.bindFramebuffer(o.FRAMEBUFFER,this.dispFBO),o.viewport(0,0,this.w,this.h),this.withScissor(t,i,e,()=>{o.useProgram(this.dabProg),o.bindVertexArray(this.quad),o.enable(o.BLEND),o.blendFunc(o.ONE,o.ONE),o.uniform2f(this.dabU.uCenter,(t+.5)/this.w,1-(i+.5)/this.h),o.uniform2f(this.dabU.uCanvasSize,this.w,this.h),o.uniform1f(this.dabU.uRadiusPx,Math.max(1,e)),o.uniform2f(this.dabU.uDelta,s/this.w*l,-r/this.h*l),o.drawArrays(o.TRIANGLES,0,3),o.disable(o.BLEND)}),o.bindVertexArray(null),o.bindFramebuffer(o.FRAMEBUFFER,null)}paintVectorDab(t,i,e,s,r,l,o,h){if(!this.dispFBO)return;const a=this.gl;a.bindFramebuffer(a.FRAMEBUFFER,this.dispFBO),a.viewport(0,0,this.w,this.h),this.withScissor(t,i,e,()=>{a.useProgram(this.vecProg),a.bindVertexArray(this.quad),a.enable(a.BLEND),a.blendFunc(a.ONE,a.ONE),a.uniform2f(this.vecU.uCenter,(t+.5)/this.w,1-(i+.5)/this.h),a.uniform2f(this.vecU.uCanvasSize,this.w,this.h),a.uniform1f(this.vecU.uRadiusPx,Math.max(1,e)),a.uniform1i(this.vecU.uMode,s),a.uniform2f(this.vecU.uVec,r,l),a.uniform1f(this.vecU.uAmount,o),a.uniform1f(this.vecU.uSwirl,h),a.drawArrays(a.TRIANGLES,0,3),a.disable(a.BLEND)}),a.bindVertexArray(null),a.bindFramebuffer(a.FRAMEBUFFER,null)}paintMaskDab(t,i,e){if(!this.maskFBO)return;const s=this.gl;s.bindFramebuffer(s.FRAMEBUFFER,this.maskFBO),s.viewport(0,0,this.w,this.h),this.withScissor(t,i,e,()=>{s.useProgram(this.maskProg),s.bindVertexArray(this.quad),s.enable(s.BLEND),s.blendFunc(s.ONE,s.ONE),s.uniform2f(this.maskU.uCenter,(t+.5)/this.w,1-(i+.5)/this.h),s.uniform2f(this.maskU.uCanvasSize,this.w,this.h),s.uniform1f(this.maskU.uRadiusPx,Math.max(1,e)),s.drawArrays(s.TRIANGLES,0,3),s.disable(s.BLEND)}),s.bindVertexArray(null),s.bindFramebuffer(s.FRAMEBUFFER,null)}snapshotUndo(){this.undoDispFBO&&this.dispTex&&this.blit(this.undoDispFBO,this.dispTex),this.undoMaskFBO&&this.maskTex&&this.blit(this.undoMaskFBO,this.maskTex)}undo(){this.dispFBO&&this.undoDispTex&&this.blit(this.dispFBO,this.undoDispTex),this.maskFBO&&this.undoMaskTex&&this.blit(this.maskFBO,this.undoMaskTex)}clearAll(){const t=this.gl;t.disable(t.BLEND),t.clearColor(0,0,0,0);for(const i of[this.dispFBO,this.maskFBO])i&&(t.bindFramebuffer(t.FRAMEBUFFER,i),t.viewport(0,0,this.w,this.h),t.clear(t.COLOR_BUFFER_BIT));t.bindFramebuffer(t.FRAMEBUFFER,null)}render(){const t=this.gl;t.bindFramebuffer(t.FRAMEBUFFER,null),t.viewport(0,0,this.w,this.h),t.disable(t.BLEND),t.useProgram(this.compProg),t.bindVertexArray(this.quad),t.activeTexture(t.TEXTURE0),t.bindTexture(t.TEXTURE_2D,this.imageTex),t.uniform1i(this.compU.uImage,0),t.activeTexture(t.TEXTURE1),t.bindTexture(t.TEXTURE_2D,this.dispTex),t.uniform1i(this.compU.uDisp,1),t.activeTexture(t.TEXTURE2),t.bindTexture(t.TEXTURE_2D,this.maskTex),t.uniform1i(this.compU.uMask,2),t.uniform1f(this.compU.uWarpScale,this.warpScale),t.uniform1f(this.compU.uPixelSize,this.pixelSize),t.uniform2f(this.compU.uCanvasSize,this.w,this.h),t.drawArrays(t.TRIANGLES,0,3),t.bindVertexArray(null)}savePNG(){this.render(),this.canvas.toBlob(t=>{if(!t)return;const i=document.createElement("a");i.href=URL.createObjectURL(t),i.download="image-playground.png",i.click(),setTimeout(()=>URL.revokeObjectURL(i.href),5e3)},"image/png")}withScissor(t,i,e,s){const r=this.gl,l=Math.max(0,Math.floor(t-e)),o=Math.min(this.w,Math.ceil(t+e)),h=Math.max(0,Math.floor(i-e)),a=Math.min(this.h,Math.ceil(i+e));r.enable(r.SCISSOR_TEST),r.scissor(l,this.h-a,Math.max(0,o-l),Math.max(0,a-h)),s(),r.disable(r.SCISSOR_TEST)}makeFloatTex(t,i){const e=this.gl,s=e.createTexture();if(!s)throw new Error("createTexture failed");return e.bindTexture(e.TEXTURE_2D,s),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),e.texImage2D(e.TEXTURE_2D,0,e.RGBA16F,t,i,0,e.RGBA,e.HALF_FLOAT,null),e.bindTexture(e.TEXTURE_2D,null),s}makeByteTex(t,i){const e=this.gl,s=e.createTexture();if(!s)throw new Error("createTexture failed");return e.bindTexture(e.TEXTURE_2D,s),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),e.texImage2D(e.TEXTURE_2D,0,e.RGBA8,t,i,0,e.RGBA,e.UNSIGNED_BYTE,null),e.bindTexture(e.TEXTURE_2D,null),s}makeFBO(t){const i=this.gl,e=i.createFramebuffer();if(!e)throw new Error("createFramebuffer failed");i.bindFramebuffer(i.FRAMEBUFFER,e),i.framebufferTexture2D(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,t,0);const s=i.checkFramebufferStatus(i.FRAMEBUFFER);if(i.bindFramebuffer(i.FRAMEBUFFER,null),s!==i.FRAMEBUFFER_COMPLETE)throw new Error("Framebuffer incomplete: 0x"+s.toString(16));return e}blit(t,i){const e=this.gl;e.bindFramebuffer(e.FRAMEBUFFER,t),e.viewport(0,0,this.w,this.h),e.disable(e.BLEND),e.useProgram(this.copyProg),e.bindVertexArray(this.quad),e.activeTexture(e.TEXTURE0),e.bindTexture(e.TEXTURE_2D,i),e.uniform1i(this.copyU.uSrc,0),e.drawArrays(e.TRIANGLES,0,3),e.bindVertexArray(null),e.bindFramebuffer(e.FRAMEBUFFER,null)}}/**
 * lil-gui
 * https://lil-gui.georgealways.com
 * @version 0.20.0
 * @author George Michael Brower
 * @license MIT
 */class x{constructor(t,i,e,s,r="div"){this.parent=t,this.object=i,this.property=e,this._disabled=!1,this._hidden=!1,this.initialValue=this.getValue(),this.domElement=document.createElement(r),this.domElement.classList.add("controller"),this.domElement.classList.add(s),this.$name=document.createElement("div"),this.$name.classList.add("name"),x.nextNameID=x.nextNameID||0,this.$name.id=`lil-gui-name-${++x.nextNameID}`,this.$widget=document.createElement("div"),this.$widget.classList.add("widget"),this.$disable=this.$widget,this.domElement.appendChild(this.$name),this.domElement.appendChild(this.$widget),this.domElement.addEventListener("keydown",l=>l.stopPropagation()),this.domElement.addEventListener("keyup",l=>l.stopPropagation()),this.parent.children.push(this),this.parent.controllers.push(this),this.parent.$children.appendChild(this.domElement),this._listenCallback=this._listenCallback.bind(this),this.name(e)}name(t){return this._name=t,this.$name.textContent=t,this}onChange(t){return this._onChange=t,this}_callOnChange(){this.parent._callOnChange(this),this._onChange!==void 0&&this._onChange.call(this,this.getValue()),this._changed=!0}onFinishChange(t){return this._onFinishChange=t,this}_callOnFinishChange(){this._changed&&(this.parent._callOnFinishChange(this),this._onFinishChange!==void 0&&this._onFinishChange.call(this,this.getValue())),this._changed=!1}reset(){return this.setValue(this.initialValue),this._callOnFinishChange(),this}enable(t=!0){return this.disable(!t)}disable(t=!0){return t===this._disabled?this:(this._disabled=t,this.domElement.classList.toggle("disabled",t),this.$disable.toggleAttribute("disabled",t),this)}show(t=!0){return this._hidden=!t,this.domElement.style.display=this._hidden?"none":"",this}hide(){return this.show(!1)}options(t){const i=this.parent.add(this.object,this.property,t);return i.name(this._name),this.destroy(),i}min(t){return this}max(t){return this}step(t){return this}decimals(t){return this}listen(t=!0){return this._listening=t,this._listenCallbackID!==void 0&&(cancelAnimationFrame(this._listenCallbackID),this._listenCallbackID=void 0),this._listening&&this._listenCallback(),this}_listenCallback(){this._listenCallbackID=requestAnimationFrame(this._listenCallback);const t=this.save();t!==this._listenPrevValue&&this.updateDisplay(),this._listenPrevValue=t}getValue(){return this.object[this.property]}setValue(t){return this.getValue()!==t&&(this.object[this.property]=t,this._callOnChange(),this.updateDisplay()),this}updateDisplay(){return this}load(t){return this.setValue(t),this._callOnFinishChange(),this}save(){return this.getValue()}destroy(){this.listen(!1),this.parent.children.splice(this.parent.children.indexOf(this),1),this.parent.controllers.splice(this.parent.controllers.indexOf(this),1),this.parent.$children.removeChild(this.domElement)}}class at extends x{constructor(t,i,e){super(t,i,e,"boolean","label"),this.$input=document.createElement("input"),this.$input.setAttribute("type","checkbox"),this.$input.setAttribute("aria-labelledby",this.$name.id),this.$widget.appendChild(this.$input),this.$input.addEventListener("change",()=>{this.setValue(this.$input.checked),this._callOnFinishChange()}),this.$disable=this.$input,this.updateDisplay()}updateDisplay(){return this.$input.checked=this.getValue(),this}}function z(n){let t,i;return(t=n.match(/(#|0x)?([a-f0-9]{6})/i))?i=t[2]:(t=n.match(/rgb\(\s*(\d*)\s*,\s*(\d*)\s*,\s*(\d*)\s*\)/))?i=parseInt(t[1]).toString(16).padStart(2,0)+parseInt(t[2]).toString(16).padStart(2,0)+parseInt(t[3]).toString(16).padStart(2,0):(t=n.match(/^#?([a-f0-9])([a-f0-9])([a-f0-9])$/i))&&(i=t[1]+t[1]+t[2]+t[2]+t[3]+t[3]),i?"#"+i:!1}const ht={isPrimitive:!0,match:n=>typeof n=="string",fromHexString:z,toHexString:z},F={isPrimitive:!0,match:n=>typeof n=="number",fromHexString:n=>parseInt(n.substring(1),16),toHexString:n=>"#"+n.toString(16).padStart(6,0)},dt={isPrimitive:!1,match:n=>Array.isArray(n),fromHexString(n,t,i=1){const e=F.fromHexString(n);t[0]=(e>>16&255)/255*i,t[1]=(e>>8&255)/255*i,t[2]=(e&255)/255*i},toHexString([n,t,i],e=1){e=255/e;const s=n*e<<16^t*e<<8^i*e<<0;return F.toHexString(s)}},ut={isPrimitive:!1,match:n=>Object(n)===n,fromHexString(n,t,i=1){const e=F.fromHexString(n);t.r=(e>>16&255)/255*i,t.g=(e>>8&255)/255*i,t.b=(e&255)/255*i},toHexString({r:n,g:t,b:i},e=1){e=255/e;const s=n*e<<16^t*e<<8^i*e<<0;return F.toHexString(s)}},ct=[ht,F,dt,ut];function pt(n){return ct.find(t=>t.match(n))}class mt extends x{constructor(t,i,e,s){super(t,i,e,"color"),this.$input=document.createElement("input"),this.$input.setAttribute("type","color"),this.$input.setAttribute("tabindex",-1),this.$input.setAttribute("aria-labelledby",this.$name.id),this.$text=document.createElement("input"),this.$text.setAttribute("type","text"),this.$text.setAttribute("spellcheck","false"),this.$text.setAttribute("aria-labelledby",this.$name.id),this.$display=document.createElement("div"),this.$display.classList.add("display"),this.$display.appendChild(this.$input),this.$widget.appendChild(this.$display),this.$widget.appendChild(this.$text),this._format=pt(this.initialValue),this._rgbScale=s,this._initialValueHexString=this.save(),this._textFocused=!1,this.$input.addEventListener("input",()=>{this._setValueFromHexString(this.$input.value)}),this.$input.addEventListener("blur",()=>{this._callOnFinishChange()}),this.$text.addEventListener("input",()=>{const r=z(this.$text.value);r&&this._setValueFromHexString(r)}),this.$text.addEventListener("focus",()=>{this._textFocused=!0,this.$text.select()}),this.$text.addEventListener("blur",()=>{this._textFocused=!1,this.updateDisplay(),this._callOnFinishChange()}),this.$disable=this.$text,this.updateDisplay()}reset(){return this._setValueFromHexString(this._initialValueHexString),this}_setValueFromHexString(t){if(this._format.isPrimitive){const i=this._format.fromHexString(t);this.setValue(i)}else this._format.fromHexString(t,this.getValue(),this._rgbScale),this._callOnChange(),this.updateDisplay()}save(){return this._format.toHexString(this.getValue(),this._rgbScale)}load(t){return this._setValueFromHexString(t),this._callOnFinishChange(),this}updateDisplay(){return this.$input.value=this._format.toHexString(this.getValue(),this._rgbScale),this._textFocused||(this.$text.value=this.$input.value.substring(1)),this.$display.style.backgroundColor=this.$input.value,this}}class P extends x{constructor(t,i,e){super(t,i,e,"function"),this.$button=document.createElement("button"),this.$button.appendChild(this.$name),this.$widget.appendChild(this.$button),this.$button.addEventListener("click",s=>{s.preventDefault(),this.getValue().call(this.object),this._callOnChange()}),this.$button.addEventListener("touchstart",()=>{},{passive:!0}),this.$disable=this.$button}}class ft extends x{constructor(t,i,e,s,r,l){super(t,i,e,"number"),this._initInput(),this.min(s),this.max(r);const o=l!==void 0;this.step(o?l:this._getImplicitStep(),o),this.updateDisplay()}decimals(t){return this._decimals=t,this.updateDisplay(),this}min(t){return this._min=t,this._onUpdateMinMax(),this}max(t){return this._max=t,this._onUpdateMinMax(),this}step(t,i=!0){return this._step=t,this._stepExplicit=i,this}updateDisplay(){const t=this.getValue();if(this._hasSlider){let i=(t-this._min)/(this._max-this._min);i=Math.max(0,Math.min(i,1)),this.$fill.style.width=i*100+"%"}return this._inputFocused||(this.$input.value=this._decimals===void 0?t:t.toFixed(this._decimals)),this}_initInput(){this.$input=document.createElement("input"),this.$input.setAttribute("type","text"),this.$input.setAttribute("aria-labelledby",this.$name.id),window.matchMedia("(pointer: coarse)").matches&&(this.$input.setAttribute("type","number"),this.$input.setAttribute("step","any")),this.$widget.appendChild(this.$input),this.$disable=this.$input;const i=()=>{let d=parseFloat(this.$input.value);isNaN(d)||(this._stepExplicit&&(d=this._snap(d)),this.setValue(this._clamp(d)))},e=d=>{const v=parseFloat(this.$input.value);isNaN(v)||(this._snapClampSetValue(v+d),this.$input.value=this.getValue())},s=d=>{d.key==="Enter"&&this.$input.blur(),d.code==="ArrowUp"&&(d.preventDefault(),e(this._step*this._arrowKeyMultiplier(d))),d.code==="ArrowDown"&&(d.preventDefault(),e(this._step*this._arrowKeyMultiplier(d)*-1))},r=d=>{this._inputFocused&&(d.preventDefault(),e(this._step*this._normalizeMouseWheel(d)))};let l=!1,o,h,a,m,p;const g=5,B=d=>{o=d.clientX,h=a=d.clientY,l=!0,m=this.getValue(),p=0,window.addEventListener("mousemove",R),window.addEventListener("mouseup",w)},R=d=>{if(l){const v=d.clientX-o,k=d.clientY-h;Math.abs(k)>g?(d.preventDefault(),this.$input.blur(),l=!1,this._setDraggingStyle(!0,"vertical")):Math.abs(v)>g&&w()}if(!l){const v=d.clientY-a;p-=v*this._step*this._arrowKeyMultiplier(d),m+p>this._max?p=this._max-m:m+p<this._min&&(p=this._min-m),this._snapClampSetValue(m+p)}a=d.clientY},w=()=>{this._setDraggingStyle(!1,"vertical"),this._callOnFinishChange(),window.removeEventListener("mousemove",R),window.removeEventListener("mouseup",w)},U=()=>{this._inputFocused=!0},u=()=>{this._inputFocused=!1,this.updateDisplay(),this._callOnFinishChange()};this.$input.addEventListener("input",i),this.$input.addEventListener("keydown",s),this.$input.addEventListener("wheel",r,{passive:!1}),this.$input.addEventListener("mousedown",B),this.$input.addEventListener("focus",U),this.$input.addEventListener("blur",u)}_initSlider(){this._hasSlider=!0,this.$slider=document.createElement("div"),this.$slider.classList.add("slider"),this.$fill=document.createElement("div"),this.$fill.classList.add("fill"),this.$slider.appendChild(this.$fill),this.$widget.insertBefore(this.$slider,this.$input),this.domElement.classList.add("hasSlider");const t=(u,d,v,k,Q)=>(u-d)/(v-d)*(Q-k)+k,i=u=>{const d=this.$slider.getBoundingClientRect();let v=t(u,d.left,d.right,this._min,this._max);this._snapClampSetValue(v)},e=u=>{this._setDraggingStyle(!0),i(u.clientX),window.addEventListener("mousemove",s),window.addEventListener("mouseup",r)},s=u=>{i(u.clientX)},r=()=>{this._callOnFinishChange(),this._setDraggingStyle(!1),window.removeEventListener("mousemove",s),window.removeEventListener("mouseup",r)};let l=!1,o,h;const a=u=>{u.preventDefault(),this._setDraggingStyle(!0),i(u.touches[0].clientX),l=!1},m=u=>{u.touches.length>1||(this._hasScrollBar?(o=u.touches[0].clientX,h=u.touches[0].clientY,l=!0):a(u),window.addEventListener("touchmove",p,{passive:!1}),window.addEventListener("touchend",g))},p=u=>{if(l){const d=u.touches[0].clientX-o,v=u.touches[0].clientY-h;Math.abs(d)>Math.abs(v)?a(u):(window.removeEventListener("touchmove",p),window.removeEventListener("touchend",g))}else u.preventDefault(),i(u.touches[0].clientX)},g=()=>{this._callOnFinishChange(),this._setDraggingStyle(!1),window.removeEventListener("touchmove",p),window.removeEventListener("touchend",g)},B=this._callOnFinishChange.bind(this),R=400;let w;const U=u=>{if(Math.abs(u.deltaX)<Math.abs(u.deltaY)&&this._hasScrollBar)return;u.preventDefault();const v=this._normalizeMouseWheel(u)*this._step;this._snapClampSetValue(this.getValue()+v),this.$input.value=this.getValue(),clearTimeout(w),w=setTimeout(B,R)};this.$slider.addEventListener("mousedown",e),this.$slider.addEventListener("touchstart",m,{passive:!1}),this.$slider.addEventListener("wheel",U,{passive:!1})}_setDraggingStyle(t,i="horizontal"){this.$slider&&this.$slider.classList.toggle("active",t),document.body.classList.toggle("lil-gui-dragging",t),document.body.classList.toggle(`lil-gui-${i}`,t)}_getImplicitStep(){return this._hasMin&&this._hasMax?(this._max-this._min)/1e3:.1}_onUpdateMinMax(){!this._hasSlider&&this._hasMin&&this._hasMax&&(this._stepExplicit||this.step(this._getImplicitStep(),!1),this._initSlider(),this.updateDisplay())}_normalizeMouseWheel(t){let{deltaX:i,deltaY:e}=t;return Math.floor(t.deltaY)!==t.deltaY&&t.wheelDelta&&(i=0,e=-t.wheelDelta/120,e*=this._stepExplicit?1:10),i+-e}_arrowKeyMultiplier(t){let i=this._stepExplicit?1:10;return t.shiftKey?i*=10:t.altKey&&(i/=10),i}_snap(t){let i=0;return this._hasMin?i=this._min:this._hasMax&&(i=this._max),t-=i,t=Math.round(t/this._step)*this._step,t+=i,t=parseFloat(t.toPrecision(15)),t}_clamp(t){return t<this._min&&(t=this._min),t>this._max&&(t=this._max),t}_snapClampSetValue(t){this.setValue(this._clamp(this._snap(t)))}get _hasScrollBar(){const t=this.parent.root.$children;return t.scrollHeight>t.clientHeight}get _hasMin(){return this._min!==void 0}get _hasMax(){return this._max!==void 0}}class gt extends x{constructor(t,i,e,s){super(t,i,e,"option"),this.$select=document.createElement("select"),this.$select.setAttribute("aria-labelledby",this.$name.id),this.$display=document.createElement("div"),this.$display.classList.add("display"),this.$select.addEventListener("change",()=>{this.setValue(this._values[this.$select.selectedIndex]),this._callOnFinishChange()}),this.$select.addEventListener("focus",()=>{this.$display.classList.add("focus")}),this.$select.addEventListener("blur",()=>{this.$display.classList.remove("focus")}),this.$widget.appendChild(this.$select),this.$widget.appendChild(this.$display),this.$disable=this.$select,this.options(s)}options(t){return this._values=Array.isArray(t)?t:Object.values(t),this._names=Array.isArray(t)?t:Object.keys(t),this.$select.replaceChildren(),this._names.forEach(i=>{const e=document.createElement("option");e.textContent=i,this.$select.appendChild(e)}),this.updateDisplay(),this}updateDisplay(){const t=this.getValue(),i=this._values.indexOf(t);return this.$select.selectedIndex=i,this.$display.textContent=i===-1?t:this._names[i],this}}class vt extends x{constructor(t,i,e){super(t,i,e,"string"),this.$input=document.createElement("input"),this.$input.setAttribute("type","text"),this.$input.setAttribute("spellcheck","false"),this.$input.setAttribute("aria-labelledby",this.$name.id),this.$input.addEventListener("input",()=>{this.setValue(this.$input.value)}),this.$input.addEventListener("keydown",s=>{s.code==="Enter"&&this.$input.blur()}),this.$input.addEventListener("blur",()=>{this._callOnFinishChange()}),this.$widget.appendChild(this.$input),this.$disable=this.$input,this.updateDisplay()}updateDisplay(){return this.$input.value=this.getValue(),this}}var bt=`.lil-gui {
  font-family: var(--font-family);
  font-size: var(--font-size);
  line-height: 1;
  font-weight: normal;
  font-style: normal;
  text-align: left;
  color: var(--text-color);
  user-select: none;
  -webkit-user-select: none;
  touch-action: manipulation;
  --background-color: #1f1f1f;
  --text-color: #ebebeb;
  --title-background-color: #111111;
  --title-text-color: #ebebeb;
  --widget-color: #424242;
  --hover-color: #4f4f4f;
  --focus-color: #595959;
  --number-color: #2cc9ff;
  --string-color: #a2db3c;
  --font-size: 11px;
  --input-font-size: 11px;
  --font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
  --font-family-mono: Menlo, Monaco, Consolas, "Droid Sans Mono", monospace;
  --padding: 4px;
  --spacing: 4px;
  --widget-height: 20px;
  --title-height: calc(var(--widget-height) + var(--spacing) * 1.25);
  --name-width: 45%;
  --slider-knob-width: 2px;
  --slider-input-width: 27%;
  --color-input-width: 27%;
  --slider-input-min-width: 45px;
  --color-input-min-width: 45px;
  --folder-indent: 7px;
  --widget-padding: 0 0 0 3px;
  --widget-border-radius: 2px;
  --checkbox-size: calc(0.75 * var(--widget-height));
  --scrollbar-width: 5px;
}
.lil-gui, .lil-gui * {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}
.lil-gui.root {
  width: var(--width, 245px);
  display: flex;
  flex-direction: column;
  background: var(--background-color);
}
.lil-gui.root > .title {
  background: var(--title-background-color);
  color: var(--title-text-color);
}
.lil-gui.root > .children {
  overflow-x: hidden;
  overflow-y: auto;
}
.lil-gui.root > .children::-webkit-scrollbar {
  width: var(--scrollbar-width);
  height: var(--scrollbar-width);
  background: var(--background-color);
}
.lil-gui.root > .children::-webkit-scrollbar-thumb {
  border-radius: var(--scrollbar-width);
  background: var(--focus-color);
}
@media (pointer: coarse) {
  .lil-gui.allow-touch-styles, .lil-gui.allow-touch-styles .lil-gui {
    --widget-height: 28px;
    --padding: 6px;
    --spacing: 6px;
    --font-size: 13px;
    --input-font-size: 16px;
    --folder-indent: 10px;
    --scrollbar-width: 7px;
    --slider-input-min-width: 50px;
    --color-input-min-width: 65px;
  }
}
.lil-gui.force-touch-styles, .lil-gui.force-touch-styles .lil-gui {
  --widget-height: 28px;
  --padding: 6px;
  --spacing: 6px;
  --font-size: 13px;
  --input-font-size: 16px;
  --folder-indent: 10px;
  --scrollbar-width: 7px;
  --slider-input-min-width: 50px;
  --color-input-min-width: 65px;
}
.lil-gui.autoPlace {
  max-height: 100%;
  position: fixed;
  top: 0;
  right: 15px;
  z-index: 1001;
}

.lil-gui .controller {
  display: flex;
  align-items: center;
  padding: 0 var(--padding);
  margin: var(--spacing) 0;
}
.lil-gui .controller.disabled {
  opacity: 0.5;
}
.lil-gui .controller.disabled, .lil-gui .controller.disabled * {
  pointer-events: none !important;
}
.lil-gui .controller > .name {
  min-width: var(--name-width);
  flex-shrink: 0;
  white-space: pre;
  padding-right: var(--spacing);
  line-height: var(--widget-height);
}
.lil-gui .controller .widget {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  min-height: var(--widget-height);
}
.lil-gui .controller.string input {
  color: var(--string-color);
}
.lil-gui .controller.boolean {
  cursor: pointer;
}
.lil-gui .controller.color .display {
  width: 100%;
  height: var(--widget-height);
  border-radius: var(--widget-border-radius);
  position: relative;
}
@media (hover: hover) {
  .lil-gui .controller.color .display:hover:before {
    content: " ";
    display: block;
    position: absolute;
    border-radius: var(--widget-border-radius);
    border: 1px solid #fff9;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
  }
}
.lil-gui .controller.color input[type=color] {
  opacity: 0;
  width: 100%;
  height: 100%;
  cursor: pointer;
}
.lil-gui .controller.color input[type=text] {
  margin-left: var(--spacing);
  font-family: var(--font-family-mono);
  min-width: var(--color-input-min-width);
  width: var(--color-input-width);
  flex-shrink: 0;
}
.lil-gui .controller.option select {
  opacity: 0;
  position: absolute;
  width: 100%;
  max-width: 100%;
}
.lil-gui .controller.option .display {
  position: relative;
  pointer-events: none;
  border-radius: var(--widget-border-radius);
  height: var(--widget-height);
  line-height: var(--widget-height);
  max-width: 100%;
  overflow: hidden;
  word-break: break-all;
  padding-left: 0.55em;
  padding-right: 1.75em;
  background: var(--widget-color);
}
@media (hover: hover) {
  .lil-gui .controller.option .display.focus {
    background: var(--focus-color);
  }
}
.lil-gui .controller.option .display.active {
  background: var(--focus-color);
}
.lil-gui .controller.option .display:after {
  font-family: "lil-gui";
  content: "↕";
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  padding-right: 0.375em;
}
.lil-gui .controller.option .widget,
.lil-gui .controller.option select {
  cursor: pointer;
}
@media (hover: hover) {
  .lil-gui .controller.option .widget:hover .display {
    background: var(--hover-color);
  }
}
.lil-gui .controller.number input {
  color: var(--number-color);
}
.lil-gui .controller.number.hasSlider input {
  margin-left: var(--spacing);
  width: var(--slider-input-width);
  min-width: var(--slider-input-min-width);
  flex-shrink: 0;
}
.lil-gui .controller.number .slider {
  width: 100%;
  height: var(--widget-height);
  background: var(--widget-color);
  border-radius: var(--widget-border-radius);
  padding-right: var(--slider-knob-width);
  overflow: hidden;
  cursor: ew-resize;
  touch-action: pan-y;
}
@media (hover: hover) {
  .lil-gui .controller.number .slider:hover {
    background: var(--hover-color);
  }
}
.lil-gui .controller.number .slider.active {
  background: var(--focus-color);
}
.lil-gui .controller.number .slider.active .fill {
  opacity: 0.95;
}
.lil-gui .controller.number .fill {
  height: 100%;
  border-right: var(--slider-knob-width) solid var(--number-color);
  box-sizing: content-box;
}

.lil-gui-dragging .lil-gui {
  --hover-color: var(--widget-color);
}
.lil-gui-dragging * {
  cursor: ew-resize !important;
}

.lil-gui-dragging.lil-gui-vertical * {
  cursor: ns-resize !important;
}

.lil-gui .title {
  height: var(--title-height);
  font-weight: 600;
  padding: 0 var(--padding);
  width: 100%;
  text-align: left;
  background: none;
  text-decoration-skip: objects;
}
.lil-gui .title:before {
  font-family: "lil-gui";
  content: "▾";
  padding-right: 2px;
  display: inline-block;
}
.lil-gui .title:active {
  background: var(--title-background-color);
  opacity: 0.75;
}
@media (hover: hover) {
  body:not(.lil-gui-dragging) .lil-gui .title:hover {
    background: var(--title-background-color);
    opacity: 0.85;
  }
  .lil-gui .title:focus {
    text-decoration: underline var(--focus-color);
  }
}
.lil-gui.root > .title:focus {
  text-decoration: none !important;
}
.lil-gui.closed > .title:before {
  content: "▸";
}
.lil-gui.closed > .children {
  transform: translateY(-7px);
  opacity: 0;
}
.lil-gui.closed:not(.transition) > .children {
  display: none;
}
.lil-gui.transition > .children {
  transition-duration: 300ms;
  transition-property: height, opacity, transform;
  transition-timing-function: cubic-bezier(0.2, 0.6, 0.35, 1);
  overflow: hidden;
  pointer-events: none;
}
.lil-gui .children:empty:before {
  content: "Empty";
  padding: 0 var(--padding);
  margin: var(--spacing) 0;
  display: block;
  height: var(--widget-height);
  font-style: italic;
  line-height: var(--widget-height);
  opacity: 0.5;
}
.lil-gui.root > .children > .lil-gui > .title {
  border: 0 solid var(--widget-color);
  border-width: 1px 0;
  transition: border-color 300ms;
}
.lil-gui.root > .children > .lil-gui.closed > .title {
  border-bottom-color: transparent;
}
.lil-gui + .controller {
  border-top: 1px solid var(--widget-color);
  margin-top: 0;
  padding-top: var(--spacing);
}
.lil-gui .lil-gui .lil-gui > .title {
  border: none;
}
.lil-gui .lil-gui .lil-gui > .children {
  border: none;
  margin-left: var(--folder-indent);
  border-left: 2px solid var(--widget-color);
}
.lil-gui .lil-gui .controller {
  border: none;
}

.lil-gui label, .lil-gui input, .lil-gui button {
  -webkit-tap-highlight-color: transparent;
}
.lil-gui input {
  border: 0;
  outline: none;
  font-family: var(--font-family);
  font-size: var(--input-font-size);
  border-radius: var(--widget-border-radius);
  height: var(--widget-height);
  background: var(--widget-color);
  color: var(--text-color);
  width: 100%;
}
@media (hover: hover) {
  .lil-gui input:hover {
    background: var(--hover-color);
  }
  .lil-gui input:active {
    background: var(--focus-color);
  }
}
.lil-gui input:disabled {
  opacity: 1;
}
.lil-gui input[type=text],
.lil-gui input[type=number] {
  padding: var(--widget-padding);
  -moz-appearance: textfield;
}
.lil-gui input[type=text]:focus,
.lil-gui input[type=number]:focus {
  background: var(--focus-color);
}
.lil-gui input[type=checkbox] {
  appearance: none;
  width: var(--checkbox-size);
  height: var(--checkbox-size);
  border-radius: var(--widget-border-radius);
  text-align: center;
  cursor: pointer;
}
.lil-gui input[type=checkbox]:checked:before {
  font-family: "lil-gui";
  content: "✓";
  font-size: var(--checkbox-size);
  line-height: var(--checkbox-size);
}
@media (hover: hover) {
  .lil-gui input[type=checkbox]:focus {
    box-shadow: inset 0 0 0 1px var(--focus-color);
  }
}
.lil-gui button {
  outline: none;
  cursor: pointer;
  font-family: var(--font-family);
  font-size: var(--font-size);
  color: var(--text-color);
  width: 100%;
  border: none;
}
.lil-gui .controller button {
  height: var(--widget-height);
  text-transform: none;
  background: var(--widget-color);
  border-radius: var(--widget-border-radius);
}
@media (hover: hover) {
  .lil-gui .controller button:hover {
    background: var(--hover-color);
  }
  .lil-gui .controller button:focus {
    box-shadow: inset 0 0 0 1px var(--focus-color);
  }
}
.lil-gui .controller button:active {
  background: var(--focus-color);
}

@font-face {
  font-family: "lil-gui";
  src: url("data:application/font-woff;charset=utf-8;base64,d09GRgABAAAAAAUsAAsAAAAACJwAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAABHU1VCAAABCAAAAH4AAADAImwmYE9TLzIAAAGIAAAAPwAAAGBKqH5SY21hcAAAAcgAAAD0AAACrukyyJBnbHlmAAACvAAAAF8AAACEIZpWH2hlYWQAAAMcAAAAJwAAADZfcj2zaGhlYQAAA0QAAAAYAAAAJAC5AHhobXR4AAADXAAAABAAAABMAZAAAGxvY2EAAANsAAAAFAAAACgCEgIybWF4cAAAA4AAAAAeAAAAIAEfABJuYW1lAAADoAAAASIAAAIK9SUU/XBvc3QAAATEAAAAZgAAAJCTcMc2eJxVjbEOgjAURU+hFRBK1dGRL+ALnAiToyMLEzFpnPz/eAshwSa97517c/MwwJmeB9kwPl+0cf5+uGPZXsqPu4nvZabcSZldZ6kfyWnomFY/eScKqZNWupKJO6kXN3K9uCVoL7iInPr1X5baXs3tjuMqCtzEuagm/AAlzQgPAAB4nGNgYRBlnMDAysDAYM/gBiT5oLQBAwuDJAMDEwMrMwNWEJDmmsJwgCFeXZghBcjlZMgFCzOiKOIFAB71Bb8AeJy1kjFuwkAQRZ+DwRAwBtNQRUGKQ8OdKCAWUhAgKLhIuAsVSpWz5Bbkj3dEgYiUIszqWdpZe+Z7/wB1oCYmIoboiwiLT2WjKl/jscrHfGg/pKdMkyklC5Zs2LEfHYpjcRoPzme9MWWmk3dWbK9ObkWkikOetJ554fWyoEsmdSlt+uR0pCJR34b6t/TVg1SY3sYvdf8vuiKrpyaDXDISiegp17p7579Gp3p++y7HPAiY9pmTibljrr85qSidtlg4+l25GLCaS8e6rRxNBmsnERunKbaOObRz7N72ju5vdAjYpBXHgJylOAVsMseDAPEP8LYoUHicY2BiAAEfhiAGJgZWBgZ7RnFRdnVJELCQlBSRlATJMoLV2DK4glSYs6ubq5vbKrJLSbGrgEmovDuDJVhe3VzcXFwNLCOILB/C4IuQ1xTn5FPilBTj5FPmBAB4WwoqAHicY2BkYGAA4sk1sR/j+W2+MnAzpDBgAyEMQUCSg4EJxAEAwUgFHgB4nGNgZGBgSGFggJMhDIwMqEAYAByHATJ4nGNgAIIUNEwmAABl3AGReJxjYAACIQYlBiMGJ3wQAEcQBEV4nGNgZGBgEGZgY2BiAAEQyQWEDAz/wXwGAAsPATIAAHicXdBNSsNAHAXwl35iA0UQXYnMShfS9GPZA7T7LgIu03SSpkwzYTIt1BN4Ak/gKTyAeCxfw39jZkjymzcvAwmAW/wgwHUEGDb36+jQQ3GXGot79L24jxCP4gHzF/EIr4jEIe7wxhOC3g2TMYy4Q7+Lu/SHuEd/ivt4wJd4wPxbPEKMX3GI5+DJFGaSn4qNzk8mcbKSR6xdXdhSzaOZJGtdapd4vVPbi6rP+cL7TGXOHtXKll4bY1Xl7EGnPtp7Xy2n00zyKLVHfkHBa4IcJ2oD3cgggWvt/V/FbDrUlEUJhTn/0azVWbNTNr0Ens8de1tceK9xZmfB1CPjOmPH4kitmvOubcNpmVTN3oFJyjzCvnmrwhJTzqzVj9jiSX911FjeAAB4nG3HMRKCMBBA0f0giiKi4DU8k0V2GWbIZDOh4PoWWvq6J5V8If9NVNQcaDhyouXMhY4rPTcG7jwYmXhKq8Wz+p762aNaeYXom2n3m2dLTVgsrCgFJ7OTmIkYbwIbC6vIB7WmFfAAAA==") format("woff");
}`;function Et(n){const t=document.createElement("style");t.innerHTML=n;const i=document.querySelector("head link[rel=stylesheet], head style");i?document.head.insertBefore(t,i):document.head.appendChild(t)}let G=!1;class V{constructor({parent:t,autoPlace:i=t===void 0,container:e,width:s,title:r="Controls",closeFolders:l=!1,injectStyles:o=!0,touchStyles:h=!0}={}){if(this.parent=t,this.root=t?t.root:this,this.children=[],this.controllers=[],this.folders=[],this._closed=!1,this._hidden=!1,this.domElement=document.createElement("div"),this.domElement.classList.add("lil-gui"),this.$title=document.createElement("button"),this.$title.classList.add("title"),this.$title.setAttribute("aria-expanded",!0),this.$title.addEventListener("click",()=>this.openAnimated(this._closed)),this.$title.addEventListener("touchstart",()=>{},{passive:!0}),this.$children=document.createElement("div"),this.$children.classList.add("children"),this.domElement.appendChild(this.$title),this.domElement.appendChild(this.$children),this.title(r),this.parent){this.parent.children.push(this),this.parent.folders.push(this),this.parent.$children.appendChild(this.domElement);return}this.domElement.classList.add("root"),h&&this.domElement.classList.add("allow-touch-styles"),!G&&o&&(Et(bt),G=!0),e?e.appendChild(this.domElement):i&&(this.domElement.classList.add("autoPlace"),document.body.appendChild(this.domElement)),s&&this.domElement.style.setProperty("--width",s+"px"),this._closeFolders=l}add(t,i,e,s,r){if(Object(e)===e)return new gt(this,t,i,e);const l=t[i];switch(typeof l){case"number":return new ft(this,t,i,e,s,r);case"boolean":return new at(this,t,i);case"string":return new vt(this,t,i);case"function":return new P(this,t,i)}console.error(`gui.add failed
	property:`,i,`
	object:`,t,`
	value:`,l)}addColor(t,i,e=1){return new mt(this,t,i,e)}addFolder(t){const i=new V({parent:this,title:t});return this.root._closeFolders&&i.close(),i}load(t,i=!0){return t.controllers&&this.controllers.forEach(e=>{e instanceof P||e._name in t.controllers&&e.load(t.controllers[e._name])}),i&&t.folders&&this.folders.forEach(e=>{e._title in t.folders&&e.load(t.folders[e._title])}),this}save(t=!0){const i={controllers:{},folders:{}};return this.controllers.forEach(e=>{if(!(e instanceof P)){if(e._name in i.controllers)throw new Error(`Cannot save GUI with duplicate property "${e._name}"`);i.controllers[e._name]=e.save()}}),t&&this.folders.forEach(e=>{if(e._title in i.folders)throw new Error(`Cannot save GUI with duplicate folder "${e._title}"`);i.folders[e._title]=e.save()}),i}open(t=!0){return this._setClosed(!t),this.$title.setAttribute("aria-expanded",!this._closed),this.domElement.classList.toggle("closed",this._closed),this}close(){return this.open(!1)}_setClosed(t){this._closed!==t&&(this._closed=t,this._callOnOpenClose(this))}show(t=!0){return this._hidden=!t,this.domElement.style.display=this._hidden?"none":"",this}hide(){return this.show(!1)}openAnimated(t=!0){return this._setClosed(!t),this.$title.setAttribute("aria-expanded",!this._closed),requestAnimationFrame(()=>{const i=this.$children.clientHeight;this.$children.style.height=i+"px",this.domElement.classList.add("transition");const e=r=>{r.target===this.$children&&(this.$children.style.height="",this.domElement.classList.remove("transition"),this.$children.removeEventListener("transitionend",e))};this.$children.addEventListener("transitionend",e);const s=t?this.$children.scrollHeight:0;this.domElement.classList.toggle("closed",!t),requestAnimationFrame(()=>{this.$children.style.height=s+"px"})}),this}title(t){return this._title=t,this.$title.textContent=t,this}reset(t=!0){return(t?this.controllersRecursive():this.controllers).forEach(e=>e.reset()),this}onChange(t){return this._onChange=t,this}_callOnChange(t){this.parent&&this.parent._callOnChange(t),this._onChange!==void 0&&this._onChange.call(this,{object:t.object,property:t.property,value:t.getValue(),controller:t})}onFinishChange(t){return this._onFinishChange=t,this}_callOnFinishChange(t){this.parent&&this.parent._callOnFinishChange(t),this._onFinishChange!==void 0&&this._onFinishChange.call(this,{object:t.object,property:t.property,value:t.getValue(),controller:t})}onOpenClose(t){return this._onOpenClose=t,this}_callOnOpenClose(t){this.parent&&this.parent._callOnOpenClose(t),this._onOpenClose!==void 0&&this._onOpenClose.call(this,t)}destroy(){this.parent&&(this.parent.children.splice(this.parent.children.indexOf(this),1),this.parent.folders.splice(this.parent.folders.indexOf(this),1)),this.domElement.parentElement&&this.domElement.parentElement.removeChild(this.domElement),Array.from(this.children).forEach(t=>t.destroy())}controllersRecursive(){let t=Array.from(this.controllers);return this.folders.forEach(i=>{t=t.concat(i.controllersRecursive())}),t}foldersRecursive(){let t=Array.from(this.folders);return this.folders.forEach(i=>{t=t.concat(i.foldersRecursive())}),t}}const H=[{id:"warp",label:"Warp",emoji:"🌊",hint:"drag on the image to warp · [ ] resizes the brush"},{id:"blackhole",label:"Black hole",emoji:"🕳️",hint:"click / hold to pull pixels inward"},{id:"explode",label:"Explode",emoji:"💥",hint:"click / hold to blast pixels outward"},{id:"twirl",label:"Twirl",emoji:"🌀",hint:"drag in circles to twirl · hold to spin"},{id:"pixelate",label:"Pixelate",emoji:"🧱",hint:"paint chunky pixels · tune size in the Brush panel"}];function At(n,t){const i={tool:"warp",brushSize:90,strength:1},e=document.getElementById("palette");if(!e)throw new Error("#palette missing");const s=document.createElement("div");s.className="hint";for(const h of H){const a=document.createElement("button");a.className="tool"+(h.id===i.tool?" active":"");const m=document.createElement("span");m.className="emoji",m.textContent=h.emoji;const p=document.createElement("span");p.textContent=h.label,a.append(m,p),a.addEventListener("click",()=>{i.tool=h.id,e.querySelectorAll(".tool").forEach(g=>g.classList.remove("active")),a.classList.add("active"),s.textContent=h.hint}),e.appendChild(a)}s.textContent=H[0].hint;const r=document.createElement("div");r.className="divider",e.appendChild(r);const l=(h,a,m)=>{const p=document.createElement("button");p.className="action",p.textContent=h,p.title=a,p.addEventListener("click",m),e.appendChild(p)};l("↩ Undo","Ctrl+Z",t.onUndo),l("🧹 Reset","Clear all effects",t.onReset),l("💾 Save PNG","Download the current image",t.onSave),e.appendChild(s);const o=new V({title:"Brush"});return o.add(i,"brushSize",2,400,1).name("Size (px)"),o.add(i,"strength",0,3,.05).name("Strength"),o.add(n,"warpScale",0,3,.05).name("Warp amount"),o.add(n,"pixelSize",4,64,1).name("Pixel size"),{state:i,gui:o}}function xt(n=1280,t=800){const i=document.createElement("canvas");i.width=n,i.height=t;const e=i.getContext("2d");if(!e)throw new Error("2D canvas unavailable");const s=e.createLinearGradient(0,0,n,t);s.addColorStop(0,"#1b2a6b"),s.addColorStop(.5,"#7b2d8b"),s.addColorStop(1,"#e8632c"),e.fillStyle=s,e.fillRect(0,0,n,t);const r=(l,o,h,a)=>{const m=e.createRadialGradient(l,o,0,l,o,h);m.addColorStop(0,a),m.addColorStop(1,"rgba(0,0,0,0)"),e.fillStyle=m,e.beginPath(),e.arc(l,o,h,0,7),e.fill()};r(n*.25,t*.3,260,"rgba(255,220,80,0.9)"),r(n*.7,t*.65,320,"rgba(60,220,255,0.85)"),r(n*.55,t*.25,180,"rgba(255,90,160,0.8)"),e.strokeStyle="rgba(255,255,255,0.25)",e.lineWidth=1;for(let l=0;l<=n;l+=40)e.beginPath(),e.moveTo(l,0),e.lineTo(l,t),e.stroke();for(let l=0;l<=t;l+=40)e.beginPath(),e.moveTo(0,l),e.lineTo(n,l),e.stroke();e.strokeStyle="rgba(255,255,255,0.7)",e.lineWidth=3;for(let l=40;l<300;l+=40)e.beginPath(),e.arc(n*.5,t*.5,l,0,7),e.stroke();return e.fillStyle="rgba(255,255,255,0.92)",e.font="bold 40px system-ui, sans-serif",e.textAlign="center",e.fillText("drop an image anywhere — or warp this one",n/2,t-56),i}const A=document.getElementById("view"),S=document.getElementById("ring"),Y=document.getElementById("error"),D=document.getElementById("fileInput"),wt=document.getElementById("loadBtn");function W(n){Y.textContent=n,Y.style.display="block"}let f;try{f=new lt(A)}catch(n){throw W("Could not start: "+n.message),n}const j=n=>{createImageBitmap(n).then(t=>{f.setImage(t,t.width,t.height),t.close(),$()}).catch(t=>W("Could not load that image: "+String(t)))},{state:c,gui:_t}=At(f,{onUndo:()=>f.undo(),onReset:()=>{f.snapshotUndo(),f.clearAll()},onSave:()=>f.savePNG()});wt.addEventListener("click",()=>D.click());D.addEventListener("change",()=>{var t;const n=(t=D.files)==null?void 0:t[0];n&&j(n),D.value=""});window.addEventListener("dragover",n=>n.preventDefault());window.addEventListener("drop",n=>{var i,e;n.preventDefault();const t=(e=(i=n.dataTransfer)==null?void 0:i.files)==null?void 0:e[0];t&&t.type.startsWith("image/")&&j(t)});const O=xt();f.setImage(O,O.width,O.height);let _=A.getBoundingClientRect();function $(){_=A.getBoundingClientRect()}window.addEventListener("resize",$);window.addEventListener("scroll",$,!0);$();const K=n=>[(n.clientX-_.left)*A.width/_.width,(n.clientY-_.top)*A.height/_.height];let M=!1,b=0,E=0;function X(n,t,i){const e=c.tool==="blackhole"?1:2,s=c.strength*c.brushSize*i,r=c.tool==="blackhole"?s*.5:0;f.paintVectorDab(n,t,c.brushSize,e,0,0,s,r)}function I(n,t,i,e,s){const r=Math.hypot(i,e);if(r<.5)return;const l=Math.max(2,c.brushSize*.25),o=Math.max(1,Math.ceil(r/l));for(let h=1;h<=o;h++){const a=h/o;s(n+i*a,t+e*a,i/o,e/o)}}A.addEventListener("pointerdown",n=>{n.button===0&&(f.snapshotUndo(),M=!0,A.setPointerCapture(n.pointerId),[b,E]=K(n),c.tool==="blackhole"||c.tool==="explode"?X(b,E,.1):c.tool==="pixelate"&&f.paintMaskDab(b,E,c.brushSize))});A.addEventListener("pointermove",n=>{if(yt(n),!M)return;const[t,i]=K(n),e=t-b,s=i-E,r=c.tool;r==="warp"?(I(b,E,e,s,(l,o,h,a)=>f.paintDab(l,o,c.brushSize,h,a,c.strength)),b=t,E=i):r==="twirl"?(I(b,E,e,s,(l,o,h,a)=>f.paintVectorDab(l,o,c.brushSize,0,h/f.width*c.strength,-a/f.height*c.strength,0,0)),b=t,E=i):r==="blackhole"||r==="explode"?Math.hypot(e,s)>=1&&(X(t,i,.1),b=t,E=i):r==="pixelate"&&(I(b,E,e,s,(l,o)=>f.paintMaskDab(l,o,c.brushSize)),b=t,E=i)});const J=()=>{M=!1};A.addEventListener("pointerup",J);A.addEventListener("pointercancel",J);A.addEventListener("pointerleave",()=>{S.style.display="none"});let L=-1;function q(){const n=c.brushSize*_.width/A.width;n!==L&&(L=n,S.style.width=`${n}px`,S.style.height=`${n}px`)}function yt(n){q(),S.style.transform=`translate(${n.clientX-L/2}px, ${n.clientY-L/2}px)`,S.style.display="block"}window.addEventListener("keydown",n=>{if((n.ctrlKey||n.metaKey)&&n.key.toLowerCase()==="z"){n.preventDefault(),f.undo();return}if(n.key==="["||n.key==="]"){const t=n.key==="["?-10:10;c.brushSize=Math.min(400,Math.max(2,c.brushSize+t)),_t.controllersRecursive().forEach(i=>i.updateDisplay()),q()}});const Z=()=>{M&&(c.tool==="blackhole"||c.tool==="explode"?X(b,E,.02):c.tool==="twirl"&&f.paintVectorDab(b,E,c.brushSize,3,0,0,c.strength*2.5,0)),f.render(),requestAnimationFrame(Z)};Z();
